import React from 'react';
import { useRBAC } from '../../contexts/RBACContext';
import { Permission } from '../../types/permissions';

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissions,
  requireAll = false,
  fallback = null,
  children,
  ...buttonProps
}) => {
  const { hasAllPermissions, hasAnyPermission } = useRBAC();

  const hasRequiredPermissions = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasRequiredPermissions) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <button {...buttonProps}>{children}</button>;
};

export default PermissionButton;