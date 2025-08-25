import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Permission, ROLE_PERMISSIONS, ROLE_HIERARCHY, RoleHierarchy } from '../types/permissions';
import { UserRole } from '../types';

interface RBACContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessRoute: (routePermissions: Permission[]) => boolean;
  canManageRole: (targetRole: UserRole) => boolean;
  getRoleLevel: (role: UserRole) => number;
  isHigherRole: (role: UserRole) => boolean;
  permissions: Permission[];
  userRole: UserRole | null;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

interface RBACProviderProps {
  children: React.ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.role) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user?.role]);

  const userRole = user?.role || null;

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const canAccessRoute = (routePermissions: Permission[]): boolean => {
    if (routePermissions.length === 0) return true; // Public route
    return hasAnyPermission(routePermissions);
  };

  const canManageRole = (targetRole: UserRole): boolean => {
    if (!userRole) return false;
    
    const userHierarchy = ROLE_HIERARCHY[userRole];
    if (!userHierarchy) return false;
    
    return userHierarchy.canManageRoles.includes(targetRole);
  };

  const getRoleLevel = (role: UserRole): number => {
    return ROLE_HIERARCHY[role]?.level || 0;
  };

  const isHigherRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    return getRoleLevel(userRole) > getRoleLevel(role);
  };

  const value: RBACContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canManageRole,
    getRoleLevel,
    isHigherRole,
    permissions,
    userRole,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

// Higher-order component for permission-based rendering
interface WithPermissionsProps {
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const WithPermissions: React.FC<WithPermissionsProps> = ({
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasAllPermissions, hasAnyPermission } = useRBAC();

  const hasRequiredPermissions = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasRequiredPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};