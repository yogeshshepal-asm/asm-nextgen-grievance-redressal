import { Grievance, WorkflowRule, User, RuleCondition, RuleAction, UserRole, AppNotification } from '../types.ts';

export class WorkflowAutomationEngine {
  /**
   * Evaluates all conditions in a rule against a grievance
   */
  private static evaluateCondition(
    condition: RuleCondition,
    grievance: Grievance,
    members: User[]
  ): boolean {
    const { field, operator, value } = condition;

    switch (field) {
      case 'category':
        return operator === 'equals' && grievance.category === value;

      case 'priority':
        return operator === 'equals' && grievance.priority === value;

      case 'department': {
        const submitter = members.find(m => m.id === grievance.userId);
        if (operator === 'equals' && submitter) {
          return submitter.department === value;
        }
        return false;
      }

      case 'userRole': {
        const submitter = members.find(m => m.id === grievance.userId);
        if (submitter) {
          if (operator === 'equals') return submitter.role === value;
          if (operator === 'includes') {
            const roles = Array.isArray(value) ? value : [value];
            return roles.includes(submitter.role);
          }
        }
        return false;
      }

      case 'daysUnresolved': {
        const createdDate = new Date(grievance.createdAt);
        const now = new Date();
        const daysUnresolved = Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (operator === 'greaterThan') {
          return daysUnresolved > parseInt(value as string);
        }
        if (operator === 'lessThan') {
          return daysUnresolved < parseInt(value as string);
        }
        if (operator === 'equals') {
          return daysUnresolved === parseInt(value as string);
        }
        return false;
      }

      default:
        return false;
    }
  }

  /**
   * Checks if all conditions of a rule match a grievance
   */
  static ruleMatches(
    rule: WorkflowRule,
    grievance: Grievance,
    members: User[]
  ): boolean {
    if (!rule.enabled) return false;

    return rule.conditions.every(condition =>
      this.evaluateCondition(condition, grievance, members)
    );
  }

  /**
   * Finds all matching rules for a grievance, sorted by priority
   */
  static findMatchingRules(
    rules: WorkflowRule[],
    grievance: Grievance,
    members: User[]
  ): WorkflowRule[] {
    return rules
      .filter(rule => this.ruleMatches(rule, grievance, members))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Executes all actions from matching rules
   */
  static executeRuleActions(
    rule: WorkflowRule,
    grievance: Grievance,
    members: User[],
    currentAssignedTo?: { id: string; name: string; email?: string }
  ): {
    updatedGrievance: Grievance;
    assignedTo?: { id: string; name: string; email?: string };
    notifications: AppNotification[];
  } {
    const notifications: AppNotification[] = [];
    let updatedGrievance = {
      ...grievance,
      appliedRules: [...(grievance.appliedRules || []), rule.id]
    };
    let assignedTo = currentAssignedTo;

    for (const action of rule.actions) {
      switch (action.type) {
        case 'assign': {
          if (action.targetUserId) {
            const targetUser = members.find(m => m.id === action.targetUserId);
            if (targetUser) {
              assignedTo = {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email
              };
              updatedGrievance.assignedTo = assignedTo;
            }
          }
          break;
        }

        case 'escalate': {
          const escalationTarget = members.find(
            m => m.role === action.targetRole && m.role !== UserRole.STUDENT
          );
          if (escalationTarget) {
            assignedTo = {
              id: escalationTarget.id,
              name: escalationTarget.name,
              email: escalationTarget.email
            };
            updatedGrievance.assignedTo = assignedTo;
            updatedGrievance.escalationCount = (updatedGrievance.escalationCount || 0) + 1;
            updatedGrievance.lastEscalatedAt = new Date().toISOString();

            // Create escalation notification
            notifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: escalationTarget.id,
              message: `Grievance "${grievance.subject}" has been escalated to you`,
              timestamp: new Date().toISOString(),
              read: false,
              type: 'status_change',
              grievanceId: grievance.id
            });
          }
          break;
        }

        case 'notify': {
          if (assignedTo) {
            notifications.push({
              id: Math.random().toString(36).substr(2, 9),
              userId: assignedTo.id,
              message: `Rule "${rule.name}" triggered for grievance "${grievance.subject}"`,
              timestamp: new Date().toISOString(),
              read: false,
              type: 'status_change',
              grievanceId: grievance.id
            });
          }
          break;
        }

        case 'setPriority': {
          if (action.value) {
            updatedGrievance.priority = action.value as 'Low' | 'Medium' | 'High';
          }
          break;
        }

        case 'addTag': {
          if (action.value) {
            updatedGrievance.tags = [...(updatedGrievance.tags || []), action.value];
          }
          break;
        }
      }
    }

    return { updatedGrievance, assignedTo, notifications };
  }

  /**
   * Applies all matching rules to a grievance
   */
  static applyWorkflowRules(
    rules: WorkflowRule[],
    grievance: Grievance,
    members: User[]
  ): {
    grievance: Grievance;
    assignedTo?: { id: string; name: string; email?: string };
    notifications: AppNotification[];
  } {
    const matchingRules = this.findMatchingRules(rules, grievance, members);
    const allNotifications: AppNotification[] = [];
    let currentGrievance = grievance;
    let assignedTo: { id: string; name: string; email?: string } | undefined;

    for (const rule of matchingRules) {
      const { updatedGrievance, assignedTo: newAssignedTo, notifications } =
        this.executeRuleActions(rule, currentGrievance, members, assignedTo);

      currentGrievance = updatedGrievance;
      assignedTo = newAssignedTo;
      allNotifications.push(...notifications);
    }

    return {
      grievance: currentGrievance,
      assignedTo,
      notifications: allNotifications
    };
  }

  /**
   * Load balancing: Find team members with lowest workload
   */
  static findLeastBusyMember(
    candidates: User[],
    grievances: Grievance[]
  ): User | null {
    if (candidates.length === 0) return null;

    const workloads = candidates.map(member => ({
      member,
      count: grievances.filter(
        g => g.assignedTo?.id === member.id &&
        (g.status === 'Pending' || g.status === 'In Progress')
      ).length
    }));

    return workloads.reduce((min, current) =>
      current.count < min.count ? current : min
    ).member;
  }

  /**
   * Get eligible assignees for a grievance based on category/department
   */
  static getEligibleAssignees(
    grievance: Grievance,
    members: User[]
  ): User[] {
    // Prioritize by assigned category
    const byCategory = members.filter(
      m => m.assignedCategory === grievance.category &&
      m.role !== UserRole.STUDENT
    );

    if (byCategory.length > 0) return byCategory;

    // Fall back to same department
    const submitter = members.find(m => m.id === grievance.userId);
    if (submitter) {
      const byDepartment = members.filter(
        m => m.department === submitter.department &&
        m.role !== UserRole.STUDENT
      );
      if (byDepartment.length > 0) return byDepartment;
    }

    // Last resort: all staff
    return members.filter(m => m.role !== UserRole.STUDENT);
  }

  /**
   * Check if escalation is needed based on SLA
   */
  static checkEscalationNeeded(
    grievance: Grievance,
    slaHours: number = 24
  ): boolean {
    if (grievance.status === 'Resolved' || grievance.status === 'Rejected') {
      return false;
    }

    const createdDate = new Date(grievance.createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    return hoursElapsed > slaHours;
  }

  /**
   * Get escalation metrics for dashboard
   */
  static getEscalationMetrics(grievances: Grievance[]) {
    const escalatedCount = grievances.filter(g => (g.escalationCount || 0) > 0).length;
    const totalEscalations = grievances.reduce((sum, g) => sum + (g.escalationCount || 0), 0);
    const average = grievances.length > 0
      ? (totalEscalations / grievances.length).toFixed(2)
      : '0';

    return {
      escalatedCount,
      totalEscalations,
      averageEscalationsPerGrievance: parseFloat(average)
    };
  }
}

export default WorkflowAutomationEngine;
