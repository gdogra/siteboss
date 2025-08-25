import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface RoleIndicatorProps {
  className?: string;
  showIcon?: boolean;
}

const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'company_admin':
      return 'bg-red-100 text-red-800';
    case 'project_manager':
      return 'bg-blue-100 text-blue-800';
    case 'foreman':
      return 'bg-green-100 text-green-800';
    case 'worker':
      return 'bg-yellow-100 text-yellow-800';
    case 'client':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'company_admin':
      return 'Admin';
    case 'project_manager':
      return 'Project Manager';
    case 'foreman':
      return 'Foreman';
    case 'worker':
      return 'Worker';
    case 'client':
      return 'Client';
    default:
      return 'Unknown';
  }
};

const RoleIndicator: React.FC<RoleIndicatorProps> = ({ 
  className = '',
  showIcon = true
}) => {
  const { user } = useAuth();

  if (!user?.role) {
    return null;
  }

  const roleColor = getRoleColor(user.role);
  const roleLabel = getRoleLabel(user.role);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor} ${className}`}>
      {showIcon && (
        <svg className="-ml-0.5 mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
          <circle cx={4} cy={4} r={3} />
        </svg>
      )}
      {roleLabel}
    </span>
  );
};

export default RoleIndicator;