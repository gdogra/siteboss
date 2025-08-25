import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '../../types';
import { useRBAC } from '../../contexts/RBACContext';
import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../../types/permissions';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  level: number;
}

const roleOptions: RoleOption[] = [
  {
    value: 'company_admin',
    label: 'Company Administrator',
    description: 'Full access to all system features and user management',
    level: 5
  },
  {
    value: 'project_manager',
    label: 'Project Manager',
    description: 'Manage projects, tasks, budgets, and team members',
    level: 4
  },
  {
    value: 'foreman',
    label: 'Foreman',
    description: 'Oversee field operations, manage workers and contractors',
    level: 3
  },
  {
    value: 'worker',
    label: 'Worker',
    description: 'Track time, complete assigned tasks, view project information',
    level: 2
  },
  {
    value: 'client',
    label: 'Client',
    description: 'Read-only access to project progress and documents',
    level: 1
  }
];

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
  isOpen,
  onClose,
  user,
  onRoleChange
}) => {
  const { canManageRole, getRoleLevel } = useRBAC();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentUserLevel = getRoleLevel(user.role);
  const selectedRoleLevel = getRoleLevel(selectedRole);
  
  const availableRoles = roleOptions.filter(role => 
    canManageRole(role.value) && role.value !== user.role
  );

  const isUpgrade = selectedRoleLevel > currentUserLevel;
  const isDowngrade = selectedRoleLevel < currentUserLevel;

  const handleRoleChange = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the role change (in a real app, this would be sent to an audit API)
      console.log(`Role changed for user ${user.email}: ${user.role} → ${selectedRole}`);
      
      onRoleChange(user.id, selectedRole);
    } catch (error) {
      console.error('Failed to change role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissionCount = (role: UserRole) => {
    return ROLE_PERMISSIONS[role]?.length || 0;
  };

  const getRoleBadgeColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-red-100 text-red-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ConfirmationStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Confirm Role Change
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          You are about to change {user.first_name} {user.last_name}'s role.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Current Role:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(currentUserLevel)}`}>
            {roleOptions.find(r => r.value === user.role)?.label}
          </span>
        </div>
        
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">New Role:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedRoleLevel)}`}>
            {roleOptions.find(r => r.value === selectedRole)?.label}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium">
              {isUpgrade && "This will grant additional permissions"}
              {isDowngrade && "This will revoke some permissions"}
              {!isUpgrade && !isDowngrade && "This will change the user's role"}
            </p>
            <p className="text-blue-600 mt-1">
              New permission count: {getRolePermissionCount(selectedRole)} permissions
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setShowConfirmation(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleRoleChange}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Confirm Change'}
        </button>
      </div>
    </div>
  );

  const RoleSelectionStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 rounded-full">
        <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Change User Role
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Select a new role for {user.first_name} {user.last_name} ({user.email})
        </p>
      </div>

      <div className="space-y-3">
        {availableRoles.map((role) => (
          <label
            key={role.value}
            className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
              selectedRole === role.value
                ? 'border-primary-600 ring-2 ring-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              checked={selectedRole === role.value}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {role.label}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role.level)}`}>
                  Level {role.level}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {role.description}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {getRolePermissionCount(role.value)} permissions included
              </p>
            </div>
          </label>
        ))}
      </div>

      {availableRoles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            No other roles available for this user.
          </p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          disabled={selectedRole === user.role || availableRoles.length === 0}
          className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {showConfirmation ? <ConfirmationStep /> : <RoleSelectionStep />}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RoleChangeModal;