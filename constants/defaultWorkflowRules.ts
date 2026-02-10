import { WorkflowRule } from '../types.ts';

/**
 * Default workflow automation rules for educational institutions
 * These can be modified through the UI after adding members to dedicated cells
 */
export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: 'rule-academic-general',
    name: 'Academic Cases - Auto Assign to Faculty',
    description: 'Automatically assign general academic grievances to academic cell leads',
    enabled: true,
    priority: 1,
    conditions: [
      {
        field: 'category',
        operator: 'equals',
        value: 'Academic'
      }
    ],
    actions: [
      {
        type: 'notify',
        notifyEmail: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },

  {
    id: 'rule-infrastructure-urgent',
    name: 'Infrastructure Cases - Priority Assignment',
    description: 'Escalate high-priority infrastructure issues for immediate action',
    enabled: true,
    priority: 2,
    conditions: [
      {
        field: 'category',
        operator: 'equals',
        value: 'Infrastructure'
      },
      {
        field: 'priority',
        operator: 'equals',
        value: 'High'
      }
    ],
    actions: [
      {
        type: 'setPriority',
        value: 'High'
      },
      {
        type: 'addTag',
        value: 'urgent-infrastructure'
      },
      {
        type: 'notify',
        notifyEmail: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },

  {
    id: 'rule-hostel-support',
    name: 'Hostel Cases - Support Team Assignment',
    description: 'Route hostel-related grievances to student support team',
    enabled: true,
    priority: 3,
    conditions: [
      {
        field: 'category',
        operator: 'equals',
        value: 'Hostel'
      }
    ],
    actions: [
      {
        type: 'addTag',
        value: 'hostel-support'
      },
      {
        type: 'notify',
        notifyEmail: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },

  {
    id: 'rule-financial-escalate',
    name: 'Financial Cases - Escalate to Admin',
    description: 'Financial grievances escalated to administrative staff for processing',
    enabled: true,
    priority: 4,
    conditions: [
      {
        field: 'category',
        operator: 'equals',
        value: 'Financial'
      }
    ],
    actions: [
      {
        type: 'escalate',
        targetRole: 'DEPT_ADMIN'
      },
      {
        type: 'notify',
        notifyEmail: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },

  {
    id: 'rule-escalate-unresolved',
    name: 'Escalate Stalled Cases',
    description: 'Auto-escalate grievances unresolved for 3+ days to HOD',
    enabled: true,
    priority: 5,
    conditions: [
      {
        field: 'daysUnresolved',
        operator: 'greaterThan',
        value: '3'
      }
    ],
    actions: [
      {
        type: 'escalate',
        targetRole: 'HOD'
      },
      {
        type: 'addTag',
        value: 'escalated-stalled'
      },
      {
        type: 'notify',
        notifyEmail: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },

  {
    id: 'rule-high-priority-all',
    name: 'High Priority Cases - Fast Track',
    description: 'All high-priority grievances tagged for priority handling',
    enabled: true,
    priority: 6,
    conditions: [
      {
        field: 'priority',
        operator: 'equals',
        value: 'High'
      }
    ],
    actions: [
      {
        type: 'addTag',
        value: 'priority-fast-track'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },

  {
    id: 'rule-administrative-tracking',
    name: 'Administrative Cases - Tracking',
    description: 'Administrative grievances tracked for quick resolution',
    enabled: true,
    priority: 7,
    conditions: [
      {
        field: 'category',
        operator: 'equals',
        value: 'Administrative'
      }
    ],
    actions: [
      {
        type: 'addTag',
        value: 'admin-case'
      },
      {
        type: 'notify',
        notifyEmail: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

export default DEFAULT_WORKFLOW_RULES;
