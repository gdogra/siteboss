import { useRBAC } from '../contexts/RBACContext';
import { Permission } from '../types/permissions';

// Custom hook for common permission checks
export const usePermissions = () => {
  const rbac = useRBAC();

  return {
    ...rbac,
    
    // Project permissions
    canViewProjects: () => rbac.hasPermission(Permission.PROJECT_VIEW),
    canCreateProjects: () => rbac.hasPermission(Permission.PROJECT_CREATE),
    canEditProjects: () => rbac.hasPermission(Permission.PROJECT_EDIT),
    canDeleteProjects: () => rbac.hasPermission(Permission.PROJECT_DELETE),
    
    // Task permissions
    canViewTasks: () => rbac.hasPermission(Permission.TASK_VIEW),
    canCreateTasks: () => rbac.hasPermission(Permission.TASK_CREATE),
    canEditTasks: () => rbac.hasPermission(Permission.TASK_EDIT),
    canDeleteTasks: () => rbac.hasPermission(Permission.TASK_DELETE),
    canAssignTasks: () => rbac.hasPermission(Permission.TASK_ASSIGN),
    
    // Budget permissions
    canViewBudget: () => rbac.hasPermission(Permission.BUDGET_VIEW),
    canCreateBudget: () => rbac.hasPermission(Permission.BUDGET_CREATE),
    canEditBudget: () => rbac.hasPermission(Permission.BUDGET_EDIT),
    canDeleteBudget: () => rbac.hasPermission(Permission.BUDGET_DELETE),
    canApproveBudget: () => rbac.hasPermission(Permission.BUDGET_APPROVE),
    
    // Team permissions
    canViewTeam: () => rbac.hasPermission(Permission.TEAM_VIEW),
    canCreateTeam: () => rbac.hasPermission(Permission.TEAM_CREATE),
    canEditTeam: () => rbac.hasPermission(Permission.TEAM_EDIT),
    canDeleteTeam: () => rbac.hasPermission(Permission.TEAM_DELETE),
    canInviteTeam: () => rbac.hasPermission(Permission.TEAM_INVITE),
    
    // Contractor permissions
    canViewContractors: () => rbac.hasPermission(Permission.CONTRACTOR_VIEW),
    canCreateContractors: () => rbac.hasPermission(Permission.CONTRACTOR_CREATE),
    canEditContractors: () => rbac.hasPermission(Permission.CONTRACTOR_EDIT),
    canDeleteContractors: () => rbac.hasPermission(Permission.CONTRACTOR_DELETE),
    canApproveContractors: () => rbac.hasPermission(Permission.CONTRACTOR_APPROVE),
    
    // Document permissions
    canViewDocuments: () => rbac.hasPermission(Permission.DOCUMENT_VIEW),
    canUploadDocuments: () => rbac.hasPermission(Permission.DOCUMENT_UPLOAD),
    canEditDocuments: () => rbac.hasPermission(Permission.DOCUMENT_EDIT),
    canDeleteDocuments: () => rbac.hasPermission(Permission.DOCUMENT_DELETE),
    
    // Time tracking permissions
    canViewTime: () => rbac.hasPermission(Permission.TIME_VIEW),
    canTrackTime: () => rbac.hasPermission(Permission.TIME_TRACK),
    canEditTime: () => rbac.hasPermission(Permission.TIME_EDIT),
    canApproveTime: () => rbac.hasPermission(Permission.TIME_APPROVE),
    
    // Report permissions
    canViewReports: () => rbac.hasPermission(Permission.REPORT_VIEW),
    canExportReports: () => rbac.hasPermission(Permission.REPORT_EXPORT),
    canViewAdvancedReports: () => rbac.hasPermission(Permission.REPORT_ADVANCED),
    
    // Admin permissions
    canViewSettings: () => rbac.hasPermission(Permission.SETTINGS_VIEW),
    canEditSettings: () => rbac.hasPermission(Permission.SETTINGS_EDIT),
    canAccessAdminPanel: () => rbac.hasPermission(Permission.ADMIN_PANEL),
    canManageUsers: () => rbac.hasPermission(Permission.USER_MANAGEMENT),
    canMonitorSystem: () => rbac.hasPermission(Permission.SYSTEM_MONITOR),
    canViewAuditLog: () => rbac.hasPermission(Permission.AUDIT_LOG_VIEW),
    
    // Role level checks
    isAdmin: () => rbac.userRole === 'company_admin',
    isProjectManager: () => rbac.userRole === 'project_manager',
    isForeman: () => rbac.userRole === 'foreman',
    isWorker: () => rbac.userRole === 'worker',
    isClient: () => rbac.userRole === 'client',
    
    // Combined permission checks
    canManageProject: () => rbac.hasAnyPermission([
      Permission.PROJECT_CREATE,
      Permission.PROJECT_EDIT,
      Permission.PROJECT_DELETE
    ]),
    
    canManageTasks: () => rbac.hasAnyPermission([
      Permission.TASK_CREATE,
      Permission.TASK_EDIT,
      Permission.TASK_DELETE,
      Permission.TASK_ASSIGN
    ]),
    
    canManageBudget: () => rbac.hasAnyPermission([
      Permission.BUDGET_CREATE,
      Permission.BUDGET_EDIT,
      Permission.BUDGET_DELETE,
      Permission.BUDGET_APPROVE
    ]),
  };
};

export default usePermissions;