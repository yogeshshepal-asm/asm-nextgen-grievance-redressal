import {
  Grievance,
  GrievanceStatus,
  GrievanceCategory,
  AnalyticsSnapshot,
  CategoryTrend,
  ResolutionTimeMetric,
  SentimentTrend,
  PredictedResolutionTime,
  InsightAlert,
  User
} from '../types.ts';

export class AnalyticsEngine {
  /**
   * Generate comprehensive analytics snapshot from grievances
   */
  static generateSnapshot(grievances: Grievance[], users: User[]): AnalyticsSnapshot {
    const timestamp = new Date().toISOString();
    const totalGrievances = grievances.length;
    const resolvedCount = grievances.filter(g => g.status === GrievanceStatus.RESOLVED).length;
    const resolutionRate = totalGrievances > 0 ? (resolvedCount / totalGrievances) * 100 : 0;

    // Calculate average resolution time
    const resolvedGrievances = grievances.filter(g => g.status === GrievanceStatus.RESOLVED);
    const avgResolutionTime = this.calculateAverageResolutionTime(resolvedGrievances);

    // Status distribution
    const statusDistribution = {
      pending: grievances.filter(g => g.status === GrievanceStatus.PENDING).length,
      inProgress: grievances.filter(g => g.status === GrievanceStatus.IN_PROGRESS).length,
      resolved: resolvedCount,
      rejected: grievances.filter(g => g.status === GrievanceStatus.REJECTED).length
    };

    // Priority distribution
    const priorityDistribution = {
      low: grievances.filter(g => g.priority === 'Low').length,
      medium: grievances.filter(g => g.priority === 'Medium').length,
      high: grievances.filter(g => g.priority === 'High').length
    };

    // Sentiment distribution (from AI insights)
    const sentimentDistribution = {
      positive: grievances.filter(g => g.aiInsights?.sentiment === 'Positive').length,
      neutral: grievances.filter(g => g.aiInsights?.sentiment === 'Neutral').length,
      negative: grievances.filter(g => g.aiInsights?.sentiment === 'Negative').length
    };

    const totalWithSentiment = Object.values(sentimentDistribution).reduce((a, b) => a + b, 0);
    const averageSentimentScore = this.calculateAverageSentimentScore(grievances);

    // Category metrics
    const categoryMetrics = this.calculateCategoryTrends(grievances);

    // Top complainants
    const topComplainants = this.getTopComplainants(grievances, 5);

    // Top assignees
    const topAssignees = this.getTopAssignees(grievances, 5);

    return {
      timestamp,
      totalGrievances,
      resolvedCount,
      resolutionRate,
      avgResolutionTime,
      statusDistribution,
      priorityDistribution,
      sentimentDistribution,
      averageSentimentScore,
      categoryMetrics,
      topComplainants,
      topAssignees
    };
  }

  /**
   * Calculate average resolution time in days
   */
  static calculateAverageResolutionTime(resolvedGrievances: Grievance[]): number {
    if (resolvedGrievances.length === 0) return 0;

    const totalDays = resolvedGrievances.reduce((sum, g) => {
      const createdDate = new Date(g.createdAt);
      const updatedDate = new Date(g.updatedAt);
      const days = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round(totalDays / resolvedGrievances.length * 10) / 10;
  }

  /**
   * Calculate average sentiment score (0-1)
   */
  static calculateAverageSentimentScore(grievances: Grievance[]): number {
    const grievancesWithSentiment = grievances.filter(
      g => g.aiInsights?.sentiment
    );

    if (grievancesWithSentiment.length === 0) return 0.5;

    const score = grievancesWithSentiment.reduce((sum, g) => {
      const sentiment = g.aiInsights?.sentiment || 'Neutral';
      const value = sentiment === 'Positive' ? 1 : sentiment === 'Negative' ? 0 : 0.5;
      return sum + value;
    }, 0);

    return Math.round(score / grievancesWithSentiment.length * 100) / 100;
  }

  /**
   * Calculate trends for each category
   */
  static calculateCategoryTrends(grievances: Grievance[]): CategoryTrend[] {
    const categories = Object.values(GrievanceCategory);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return categories.map(category => {
      const categoryGrievances = grievances.filter(g => g.category === category);
      const currentCount = categoryGrievances.filter(
        g => new Date(g.createdAt) > thirtyDaysAgo
      ).length;
      const previousCount = categoryGrievances.filter(
        g => new Date(g.createdAt) <= thirtyDaysAgo
      ).length;

      const trend = currentCount > previousCount ? 'up' : currentCount < previousCount ? 'down' : 'stable';
      const percentChange = previousCount > 0
        ? Math.round(((currentCount - previousCount) / previousCount) * 100)
        : currentCount > 0 ? 100 : 0;

      const resolvedInCategory = categoryGrievances.filter(
        g => g.status === GrievanceStatus.RESOLVED
      );
      const avgResolutionTime = this.calculateAverageResolutionTime(resolvedInCategory);

      const activeCount = categoryGrievances.filter(
        g => g.status === GrievanceStatus.PENDING || g.status === GrievanceStatus.IN_PROGRESS
      ).length;

      return {
        category,
        count: categoryGrievances.length,
        trend,
        percentChange,
        avgResolutionTime,
        activeCount
      };
    });
  }

  /**
   * Get resolution time metrics per category
   */
  static getResolutionTimeMetrics(grievances: Grievance[]): ResolutionTimeMetric[] {
    const categories = Object.values(GrievanceCategory);

    return categories.map(category => {
      const resolvedInCategory = grievances.filter(
        g => g.category === category && g.status === GrievanceStatus.RESOLVED
      );

      if (resolvedInCategory.length === 0) {
        return {
          category,
          avgDays: 0,
          minDays: 0,
          maxDays: 0,
          medianDays: 0,
          totalResolved: 0
        };
      }

      const resolutionTimes = resolvedInCategory.map(g => {
        const createdDate = new Date(g.createdAt);
        const updatedDate = new Date(g.updatedAt);
        return (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      }).sort((a, b) => a - b);

      return {
        category,
        avgDays: Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length * 10) / 10,
        minDays: Math.round(Math.min(...resolutionTimes) * 10) / 10,
        maxDays: Math.round(Math.max(...resolutionTimes) * 10) / 10,
        medianDays: Math.round(resolutionTimes[Math.floor(resolutionTimes.length / 2)] * 10) / 10,
        totalResolved: resolvedInCategory.length
      };
    });
  }

  /**
   * Get sentiment trends over time (last 30 days)
   */
  static getSentimentTrends(grievances: Grievance[]): SentimentTrend[] {
    const trends: { [date: string]: { positive: number; neutral: number; negative: number; total: number } } = {};

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    grievances.forEach(g => {
      const createdDate = new Date(g.createdAt);
      if (createdDate < thirtyDaysAgo) return;

      const dateKey = createdDate.toISOString().split('T')[0];
      if (!trends[dateKey]) {
        trends[dateKey] = { positive: 0, neutral: 0, negative: 0, total: 0 };
      }

      const sentiment = g.aiInsights?.sentiment || 'Neutral';
      if (sentiment === 'Positive') trends[dateKey].positive++;
      else if (sentiment === 'Negative') trends[dateKey].negative++;
      else trends[dateKey].neutral++;

      trends[dateKey].total++;
    });

    return Object.entries(trends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Predict resolution time for a grievance
   */
  static predictResolutionTime(
    grievance: Grievance,
    allGrievances: Grievance[]
  ): PredictedResolutionTime {
    const metrics = this.getResolutionTimeMetrics(allGrievances);
    const categoryMetric = metrics.find(m => m.category === grievance.category);

    // Base time from category average
    const categoryAvg = categoryMetric?.avgDays || 5;

    // Priority factor (High priority = faster resolution)
    const priorityFactor = grievance.priority === 'High' ? 0.7 : grievance.priority === 'Medium' ? 0.9 : 1.1;

    // Workload factor (more pending cases = longer)
    const pendingCount = allGrievances.filter(
      g => g.status === GrievanceStatus.PENDING || g.status === GrievanceStatus.IN_PROGRESS
    ).length;
    const workloadFactor = Math.min(1 + (pendingCount / 100), 2);

    // Historical data confidence based on sample size
    const sampleSize = categoryMetric?.totalResolved || 0;
    const historicalData = Math.min(sampleSize / 50, 1); // Max 1.0 confidence at 50 samples

    // Calculate predicted days
    const estimatedDaysToResolve = Math.round(
      categoryAvg * priorityFactor * workloadFactor * 10
    ) / 10;

    // Confidence score based on data richness
    const confidenceScore = Math.round((
      (categoryMetric?.totalResolved || 0) > 10 ? 0.85 : (categoryMetric?.totalResolved || 0) > 5 ? 0.65 : 0.4
    ) * 100) / 100;

    return {
      grievanceId: grievance.id,
      category: grievance.category,
      priority: grievance.priority,
      estimatedDaysToResolve,
      confidenceScore,
      factors: {
        categoryAvg,
        priorityFactor,
        workloadFactor,
        historicalData
      }
    };
  }

  /**
   * Get top complainants (users with most grievances)
   */
  static getTopComplainants(
    grievances: Grievance[],
    limit: number = 5
  ): Array<{ userId: string; userName: string; grievanceCount: number }> {
    const complainantMap = new Map<string, { userId: string; userName: string; count: number }>();

    grievances.forEach(g => {
      const key = g.userId;
      if (complainantMap.has(key)) {
        const entry = complainantMap.get(key)!;
        entry.count++;
      } else {
        complainantMap.set(key, {
          userId: g.userId,
          userName: g.userName,
          count: 1
        });
      }
    });

    return Array.from(complainantMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ userId, userName, count }) => ({
        userId,
        userName,
        grievanceCount: count
      }));
  }

  /**
   * Get top assignees (staff handling most grievances)
   */
  static getTopAssignees(
    grievances: Grievance[],
    limit: number = 5
  ): Array<{
    userId: string;
    userName: string;
    resolvedCount: number;
    avgResolutionTime: number;
  }> {
    const assigneeMap = new Map<
      string,
      { userId: string; userName: string; grievances: Grievance[] }
    >();

    grievances.forEach(g => {
      if (g.assignedTo) {
        const key = g.assignedTo.id;
        if (assigneeMap.has(key)) {
          assigneeMap.get(key)!.grievances.push(g);
        } else {
          assigneeMap.set(key, {
            userId: g.assignedTo.id,
            userName: g.assignedTo.name,
            grievances: [g]
          });
        }
      }
    });

    return Array.from(assigneeMap.values())
      .map(({ userId, userName, grievances: gAssigned }) => {
        const resolved = gAssigned.filter(g => g.status === GrievanceStatus.RESOLVED);
        const avgTime = this.calculateAverageResolutionTime(resolved);
        return {
          userId,
          userName,
          resolvedCount: resolved.length,
          avgResolutionTime: avgTime
        };
      })
      .sort((a, b) => b.resolvedCount - a.resolvedCount)
      .slice(0, limit);
  }

  /**
   * Generate smart insights and alerts
   */
  static generateInsights(grievances: Grievance[], snapshot: AnalyticsSnapshot): InsightAlert[] {
    const alerts: InsightAlert[] = [];

    // High rejection rate alert
    if (snapshot.totalGrievances > 0) {
      const rejectionRate = (snapshot.statusDistribution.rejected / snapshot.totalGrievances) * 100;
      if (rejectionRate > 20) {
        alerts.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'anomaly',
          severity: 'high',
          title: 'High Rejection Rate Detected',
          description: `${rejectionRate.toFixed(1)}% of grievances are being rejected. Review rejection criteria.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Low resolution rate
    if (snapshot.resolutionRate < 30 && snapshot.totalGrievances > 10) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'trend',
        severity: 'high',
        title: 'Low Resolution Rate',
        description: `Only ${snapshot.resolutionRate.toFixed(1)}% of grievances are resolved. Increase team capacity or speed up process.`,
        timestamp: new Date().toISOString()
      });
    }

    // Negative sentiment trend
    const negativePercent = snapshot.totalGrievances > 0
      ? (snapshot.sentimentDistribution.negative / snapshot.totalGrievances) * 100
      : 0;
    if (negativePercent > 40) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'anomaly',
        severity: 'high',
        title: 'High Negative Sentiment',
        description: `${negativePercent.toFixed(1)}% of grievances show negative sentiment. Check for systemic issues.`,
        timestamp: new Date().toISOString()
      });
    }

    // Category spike
    snapshot.categoryMetrics.forEach(metric => {
      if (metric.trend === 'up' && metric.percentChange > 50) {
        alerts.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'trend',
          severity: 'medium',
          title: `${metric.category} Grievances Spiking`,
          description: `${metric.category} cases increased by ${metric.percentChange}% in last 30 days. Investigate root cause.`,
          metadata: { category: metric.category, percentChange: metric.percentChange },
          timestamp: new Date().toISOString()
        });
      }
    });

    // Long resolution times
    const longResolutionCategories = snapshot.categoryMetrics.filter(m => m.avgResolutionTime > 14);
    if (longResolutionCategories.length > 0) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'recommendation',
        severity: 'medium',
        title: 'Slow Resolution Categories Identified',
        description: `${longResolutionCategories.map(c => c.category).join(', ')} cases take >14 days on average. Consider process optimization.`,
        metadata: { categories: longResolutionCategories.map(c => c.category) },
        timestamp: new Date().toISOString()
      });
    }

    // Backlog warning
    const pendingPercentage = snapshot.totalGrievances > 0
      ? (snapshot.statusDistribution.pending / snapshot.totalGrievances) * 100
      : 0;
    if (pendingPercentage > 30) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'trend',
        severity: 'medium',
        title: 'Pending Cases Backlog',
        description: `${pendingPercentage.toFixed(1)}% of cases are still pending. Process may be understaffed.`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * Compare performance over time periods
   */
  static comparePerformance(
    before: AnalyticsSnapshot,
    after: AnalyticsSnapshot
  ): {
    resolutionRateChange: number;
    avgTimeChange: number;
    sentimentChange: number;
    totalGrievanceChange: number;
  } {
    return {
      resolutionRateChange: after.resolutionRate - before.resolutionRate,
      avgTimeChange: after.avgResolutionTime - before.avgResolutionTime,
      sentimentChange: after.averageSentimentScore - before.averageSentimentScore,
      totalGrievanceChange: after.totalGrievances - before.totalGrievances
    };
  }
}

export default AnalyticsEngine;
