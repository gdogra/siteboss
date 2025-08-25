import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useRBAC } from '../../contexts/RBACContext';
import { Permission } from '../../types/permissions';

interface PermissionLinkProps extends LinkProps {
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionLink: React.FC<PermissionLinkProps> = ({
  permissions,
  requireAll = false,
  fallback = null,
  children,
  ...linkProps
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

  return <Link {...linkProps}>{children}</Link>;
};

export default PermissionLink;