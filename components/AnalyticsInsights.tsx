import React, { useState, useMemo } from 'react';
import { Grievance, AnalyticsSnapshot, PredictedResolutionTime, InsightAlert } from '../types.ts';
import AnalyticsEngine from '../services/analyticsEngine.ts';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsInsightsProps {
  grievances: Grievance[];
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ grievances }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'predictions' | 'alerts'>('overview');

  // Generate analytics data
  const snapshot = useMemo(() => AnalyticsEngine.generateSnapshot(grievances, []), [grievances]);
  const resolutionMetrics = useMemo(() => AnalyticsEngine.getResolutionTimeMetrics(grievances), [grievances]);
  const sentimentTrends = useMemo(() => AnalyticsEngine.getSentimentTrends(grievances), [grievances]);
  const insights = useMemo(() => AnalyticsEngine.generateInsights(grievances, snapshot), [grievances, snapshot]);

  // Get predictions for active grievances
  const predictions = useMemo(
    () => grievances
      .filter(g => g.status === 'Pending' || g.status === 'In Progress')
      .slice(0, 10) // Top 10 for performance
      .map(g => AnalyticsEngine.predictResolutionTime(g, grievances)),
    [grievances]
  );

  const COLORS = ['#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'trends', label: '📈 Trends', icon: '📈' },
          { id: 'predictions', label: '🔮 Predictions', icon: '🔮' },
          { id: 'alerts', label: '⚠️ Insights', icon: '⚠️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'text-[#1a73b8] border-b-2 border-[#1a73b8]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">Total Cases</p>
              <p className="text-4xl font-black text-emerald-900 mt-2">{snapshot.totalGrievances}</p>
              <p className="text-xs text-emerald-600 mt-2">+{snapshot.totalGrievances > 0 ? '2.5%' : '0%'} this month</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Resolution Rate</p>
              <p className="text-4xl font-black text-blue-900 mt-2">{snapshot.resolutionRate.toFixed(1)}%</p>
              <p className="text-xs text-blue-600 mt-2">
                {snapshot.resolvedCount} of {snapshot.totalGrievances} resolved
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Avg Resolution Time</p>
              <p className="text-4xl font-black text-purple-900 mt-2">{snapshot.avgResolutionTime}</p>
              <p className="text-xs text-purple-600 mt-2">days average</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-sm text-amber-600 font-semibold uppercase tracking-wide">Sentiment Score</p>
              <p className="text-4xl font-black text-amber-900 mt-2">{(snapshot.averageSentimentScore * 100).toFixed(0)}%</p>
              <p className="text-xs text-amber-600 mt-2">
                {snapshot.averageSentimentScore > 0.6 ? '😊 Positive' : snapshot.averageSentimentScore > 0.4 ? '😐 Neutral' : '😞 Negative'}
              </p>
            </div>
          </div>

          {/* Status & Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-bold text-slate-900 mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: snapshot.statusDistribution.pending },
                      { name: 'In Progress', value: snapshot.statusDistribution.inProgress },
                      { name: 'Resolved', value: snapshot.statusDistribution.resolved },
                      { name: 'Rejected', value: snapshot.statusDistribution.rejected }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#fbbf24" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-bold text-slate-900 mb-4">Priority Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Low', count: snapshot.priorityDistribution.low },
                  { name: 'Medium', count: snapshot.priorityDistribution.medium },
                  { name: 'High', count: snapshot.priorityDistribution.high }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a73b8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4">Category Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-bold text-slate-700">Category</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-700">Cases</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-700">Active</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-700">Avg Time</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.categoryMetrics.map((metric) => (
                    <tr key={metric.category} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{metric.category}</td>
                      <td className="text-right py-3 px-4 text-slate-700">{metric.count}</td>
                      <td className="text-right py-3 px-4 text-slate-700">{metric.activeCount}</td>
                      <td className="text-right py-3 px-4 text-slate-700">{metric.avgResolutionTime} days</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          metric.trend === 'up' ? 'bg-red-100 text-red-700' :
                          metric.trend === 'down' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'} {Math.abs(metric.percentChange)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Complainants & Assignees */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-bold text-slate-900 mb-4">Top Complainants</h3>
              <div className="space-y-3">
                {snapshot.topComplainants.map((complainant, idx) => (
                  <div key={complainant.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1a73b8] text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{complainant.userName}</p>
                        <p className="text-xs text-slate-500">{complainant.grievanceCount} cases</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#1a73b8]">{complainant.grievanceCount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="font-bold text-slate-900 mb-4">Top Assignees</h3>
              <div className="space-y-3">
                {snapshot.topAssignees.map((assignee, idx) => (
                  <div key={assignee.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{assignee.userName}</p>
                        <p className="text-xs text-slate-500">{assignee.resolvedCount} resolved • {assignee.avgResolutionTime}d avg</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{assignee.resolvedCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRENDS TAB */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Sentiment Trends */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4">Sentiment Trends (30 Days)</h3>
            {sentimentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positive" dot={false} />
                  <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} name="Neutral" dot={false} />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-12 text-slate-500">No sentiment data available yet</p>
            )}
          </div>

          {/* Resolution Time by Category */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4">Resolution Time by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolutionMetrics.filter(m => m.totalResolved > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgDays" fill="#3b82f6" name="Average Days" radius={[8, 8, 0, 0]} />
                <Bar dataKey="medianDays" fill="#8b5cf6" name="Median Days" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PREDICTIONS TAB */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-bold text-slate-900 mb-4">Estimated Resolution Times</h3>
            {predictions.length > 0 ? (
              <div className="space-y-3">
                {predictions.map((pred) => (
                  <div key={pred.grievanceId} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-slate-900">{pred.category} - {pred.priority} Priority</p>
                        <p className="text-xs text-slate-500">Grievance ID: {pred.grievanceId.substring(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#1a73b8]">{pred.estimatedDaysToResolve}</p>
                        <p className="text-xs text-slate-500">estimated days</p>
                      </div>
                    </div>
                    <div className="mb-3 pb-3 border-b border-slate-200">
                      <div className="text-xs text-slate-600 mb-2">Confidence: {(pred.confidenceScore * 100).toFixed(0)}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-[#1a73b8] h-2 rounded-full transition-all"
                          style={{ width: `${pred.confidenceScore * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>Category Avg: <span className="font-semibold">{pred.factors.categoryAvg} days</span></div>
                      <div>Priority Factor: <span className="font-semibold">{pred.factors.priorityFactor.toFixed(2)}x</span></div>
                      <div>Workload Factor: <span className="font-semibold">{pred.factors.workloadFactor.toFixed(2)}x</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-slate-500">No active cases to predict</p>
            )}
          </div>
        </div>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 flex gap-4 ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-400'
                    : alert.severity === 'medium'
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="text-2xl pt-1">
                  {alert.type === 'anomaly' ? '🚨' : alert.type === 'trend' ? '📊' : alert.type === 'prediction' ? '🔮' : '💡'}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${
                    alert.severity === 'high' ? 'text-red-900' : alert.severity === 'medium' ? 'text-amber-900' : 'text-blue-900'
                  }`}>
                    {alert.title}
                  </p>
                  <p className={`text-sm mt-1 ${
                    alert.severity === 'high' ? 'text-red-800' : alert.severity === 'medium' ? 'text-amber-800' : 'text-blue-800'
                  }`}>
                    {alert.description}
                  </p>
                  {alert.action && (
                    <button className="mt-2 px-3 py-1 bg-white rounded hover:bg-slate-100 text-sm font-semibold text-slate-900">
                      {alert.action}
                    </button>
                  )}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                  alert.severity === 'high'
                    ? 'bg-red-200 text-red-900'
                    : alert.severity === 'medium'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-blue-200 text-blue-900'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
              <p className="text-slate-500 font-semibold">✓ All systems operating normally</p>
              <p className="text-sm text-slate-400 mt-1">No insights or alerts at this time</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsInsights;
