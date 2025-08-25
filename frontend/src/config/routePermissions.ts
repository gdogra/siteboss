import { Permission } from '../types/permissions';

// Define permissions required for each route
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard': [], // Available to all authenticated users
  
  '/projects': [Permission.PROJECT_VIEW],
  '/projects/create': [Permission.PROJECT_CREATE],
  '/projects/:id': [Permission.PROJECT_VIEW],
  '/projects/:id/edit': [Permission.PROJECT_EDIT],
  
  '/tasks': [Permission.TASK_VIEW],
  '/tasks/create': [Permission.TASK_CREATE],
  '/tasks/:id': [Permission.TASK_VIEW],
  '/tasks/:id/edit': [Permission.TASK_EDIT],
  
  '/budget': [Permission.BUDGET_VIEW],
  '/budget/create': [Permission.BUDGET_CREATE],
  '/budget/expenses': [Permission.BUDGET_VIEW],
  '/budget/expenses/approve': [Permission.BUDGET_APPROVE],
  
  '/team': [Permission.TEAM_VIEW],
  '/team/invite': [Permission.TEAM_INVITE],
  '/team/:id': [Permission.TEAM_VIEW],
  '/team/:id/edit': [Permission.TEAM_EDIT],
  
  '/contractors': [Permission.CONTRACTOR_VIEW],
  '/contractors/create': [Permission.CONTRACTOR_CREATE],
  '/contractors/:id': [Permission.CONTRACTOR_VIEW],
  '/contractors/:id/edit': [Permission.CONTRACTOR_EDIT],
  '/contractors/approve': [Permission.CONTRACTOR_APPROVE],
  
  '/documents': [Permission.DOCUMENT_VIEW],
  '/documents/upload': [Permission.DOCUMENT_UPLOAD],
  '/documents/:id': [Permission.DOCUMENT_VIEW],
  '/documents/:id/edit': [Permission.DOCUMENT_EDIT],
  
  '/time-tracking': [Permission.TIME_VIEW, Permission.TIME_TRACK],
  '/time-tracking/approve': [Permission.TIME_APPROVE],
  
  '/reports': [Permission.REPORT_VIEW],
  '/reports/advanced': [Permission.REPORT_ADVANCED],
  '/reports/export': [Permission.REPORT_EXPORT],
  
  '/settings': [Permission.SETTINGS_VIEW],
  '/settings/admin': [Permission.ADMIN_PANEL],
  '/settings/users': [Permission.USER_MANAGEMENT],
  '/settings/system': [Permission.SYSTEM_MONITOR],
  
  '/admin': [Permission.ADMIN_PANEL],
  '/admin/users': [Permission.USER_MANAGEMENT],
  '/admin/settings': [Permission.SETTINGS_EDIT],
  '/admin/audit': [Permission.AUDIT_LOG_VIEW],
};

// Helper function to get permissions for a route
export const getRoutePermissions = (pathname: string): Permission[] => {
  // Direct match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }
  
  // Pattern matching for dynamic routes
  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.includes(':')) {
      const routeRegex = new RegExp(
        '^' + route.replace(/:[\w-]+/g, '[^/]+') + '$'
      );
      if (routeRegex.test(pathname)) {
        return permissions;
      }
    }
  }
  
  return []; // No specific permissions required
};