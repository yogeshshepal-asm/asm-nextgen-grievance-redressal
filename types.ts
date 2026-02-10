
export enum GrievanceCategory {
  ACADEMIC = 'Academic',
  INFRASTRUCTURE = 'Infrastructure',
  FINANCIAL = 'Financial',
  ADMINISTRATIVE = 'Administrative',
  HOSTEL = 'Hostel',
  GENERAL = 'General'
}

export enum GrievanceStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected'
}

export enum UserRole {
  STUDENT = 'Student',
  FACULTY = 'Faculty', // Cell Lead
  HOD = 'HOD',
  DEAN = 'Dean',
  DEPT_ADMIN = 'Department Administrator',
  REGISTRAR = 'Registrar',
  PRINCIPAL = 'Principal',
  PRESIDENT = 'President',
  ADMIN = 'Admin' // IT/System Admin
}

export interface Attachment {
  name: string;
  type: string;
  data: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status_change' | 'reply' | 'new_submission';
  grievanceId?: string;
}

export interface Reply {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
  attachments?: Attachment[];
}

export interface Grievance {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  description: string;
  category: GrievanceCategory;
  priority: 'Low' | 'Medium' | 'High';
  status: GrievanceStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    email?: string;
  };
  replies?: Reply[];
  attachments?: Attachment[];
  rating?: number;
  feedback?: string;
  aiInsights?: {
    sentiment: string;
    summary: string;
    suggestedAction: string;
  };
  // Workflow automation fields
  workflowPhases?: WorkflowPhase[];
  escalationCount?: number;
  lastEscalatedAt?: string;
  appliedRules?: string[]; // IDs of rules that matched
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Changed from UserRole to string to support custom roles
  department: string;
  assignedCategory?: GrievanceCategory;
  studentClass?: string;
  password?: string;
  workloadCount?: number; // Track current workload for load balancing
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Workflow Automation Types
export type RuleConditionOperator = 'equals' | 'contains' | 'includes' | 'greaterThan' | 'lessThan';

export interface RuleCondition {
  field: 'category' | 'priority' | 'department' | 'userRole' | 'daysUnresolved';
  operator: RuleConditionOperator;
  value: string | string[];
}

export interface RuleAction {
  type: 'assign' | 'escalate' | 'notify' | 'setPriority' | 'addTag';
  targetUserId?: string;
  targetRole?: string;
  value?: string;
  notifyEmail?: boolean;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  conditions: RuleCondition[]; // All conditions must match (AND logic)
  actions: RuleAction[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  enabled: boolean;
  escalationChain: Array<{
    hoursBeforeEscalation: number;
    targetRole: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowPhase {
  assignedTo?: {
    id: string;
    name: string;
    email?: string;
  };
  assignedAt?: string;
  escalationCount?: number;
  lastEscalatedAt?: string;
}
