// Define all possible permissions in the system
export enum Permission {
  // Project Management
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_EDIT = 'project:edit',
  PROJECT_DELETE = 'project:delete',
  
  // Task Management
  TASK_VIEW = 'task:view',
  TASK_CREATE = 'task:create',
  TASK_EDIT = 'task:edit',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  
  // Budget Management
  BUDGET_VIEW = 'budget:view',
  BUDGET_CREATE = 'budget:create',
  BUDGET_EDIT = 'budget:edit',
  BUDGET_DELETE = 'budget:delete',
  BUDGET_APPROVE = 'budget:approve',
  
  // Team Management
  TEAM_VIEW = 'team:view',
  TEAM_CREATE = 'team:create',
  TEAM_EDIT = 'team:edit',
  TEAM_DELETE = 'team:delete',
  TEAM_INVITE = 'team:invite',
  
  // Contractor Management
  CONTRACTOR_VIEW = 'contractor:view',
  CONTRACTOR_CREATE = 'contractor:create',
  CONTRACTOR_EDIT = 'contractor:edit',
  CONTRACTOR_DELETE = 'contractor:delete',
  CONTRACTOR_APPROVE = 'contractor:approve',
  
  // Document Management
  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_EDIT = 'document:edit',
  DOCUMENT_DELETE = 'document:delete',
  
  // Time Tracking
  TIME_VIEW = 'time:view',
  TIME_TRACK = 'time:track',
  TIME_EDIT = 'time:edit',
  TIME_APPROVE = 'time:approve',
  
  // Reports
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',
  REPORT_ADVANCED = 'report:advanced',
  
  // Settings & Administration
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  ADMIN_PANEL = 'admin:panel',
  USER_MANAGEMENT = 'user:management',
  
  // System Permissions
  SYSTEM_MONITOR = 'system:monitor',
  AUDIT_LOG_VIEW = 'audit:view',
}

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  company_admin: [
    // Full access to everything
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_EDIT,
    Permission.PROJECT_DELETE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.BUDGET_VIEW,
    Permission.BUDGET_CREATE,
    Permission.BUDGET_EDIT,
    Permission.BUDGET_DELETE,
    Permission.BUDGET_APPROVE,
    Permission.TEAM_VIEW,
    Permission.TEAM_CREATE,
    Permission.TEAM_EDIT,
    Permission.TEAM_DELETE,
    Permission.TEAM_INVITE,
    Permission.CONTRACTOR_VIEW,
    Permission.CONTRACTOR_CREATE,
    Permission.CONTRACTOR_EDIT,
    Permission.CONTRACTOR_DELETE,
    Permission.CONTRACTOR_APPROVE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_EDIT,
    Permission.DOCUMENT_DELETE,
    Permission.TIME_VIEW,
    Permission.TIME_TRACK,
    Permission.TIME_EDIT,
    Permission.TIME_APPROVE,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.REPORT_ADVANCED,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT,
    Permission.ADMIN_PANEL,
    Permission.USER_MANAGEMENT,
    Permission.SYSTEM_MONITOR,
    Permission.AUDIT_LOG_VIEW,
  ],
  
  project_manager: [
    // Project and team management focused
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_EDIT,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.BUDGET_VIEW,
    Permission.BUDGET_CREATE,
    Permission.BUDGET_EDIT,
    Permission.BUDGET_APPROVE,
    Permission.TEAM_VIEW,
    Permission.TEAM_CREATE,
    Permission.TEAM_EDIT,
    Permission.TEAM_INVITE,
    Permission.CONTRACTOR_VIEW,
    Permission.CONTRACTOR_CREATE,
    Permission.CONTRACTOR_EDIT,
    Permission.CONTRACTOR_APPROVE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_EDIT,
    Permission.TIME_VIEW,
    Permission.TIME_TRACK,
    Permission.TIME_EDIT,
    Permission.TIME_APPROVE,
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.SETTINGS_VIEW,
  ],
  
  foreman: [
    // Field operations focused
    Permission.PROJECT_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_ASSIGN,
    Permission.BUDGET_VIEW,
    Permission.TEAM_VIEW,
    Permission.CONTRACTOR_VIEW,
    Permission.CONTRACTOR_CREATE,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.TIME_VIEW,
    Permission.TIME_TRACK,
    Permission.TIME_EDIT,
    Permission.REPORT_VIEW,
  ],
  
  worker: [
    // Basic task and time tracking
    Permission.PROJECT_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_EDIT, // Own tasks only
    Permission.DOCUMENT_VIEW,
    Permission.TIME_VIEW,
    Permission.TIME_TRACK,
    Permission.REPORT_VIEW, // Own reports only
  ],
  
  client: [
    // Read-only access to project progress
    Permission.PROJECT_VIEW,
    Permission.TASK_VIEW,
    Permission.BUDGET_VIEW, // Limited budget view
    Permission.DOCUMENT_VIEW,
    Permission.REPORT_VIEW,
  ],
};

export interface RoleHierarchy {
  level: number;
  canManageRoles: string[];
}

// Define role hierarchy levels
export const ROLE_HIERARCHY: Record<string, RoleHierarchy> = {
  company_admin: {
    level: 5,
    canManageRoles: ['project_manager', 'foreman', 'worker', 'client'],
  },
  project_manager: {
    level: 4,
    canManageRoles: ['foreman', 'worker'],
  },
  foreman: {
    level: 3,
    canManageRoles: ['worker'],
  },
  worker: {
    level: 2,
    canManageRoles: [],
  },
  client: {
    level: 1,
    canManageRoles: [],
  },
};