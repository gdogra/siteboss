import React, { useState } from 'react';
import { 
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { WithPermissions } from '../../contexts/RBACContext';
import { Permission } from '../../types/permissions';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import AuditLog from './AuditLog';

interface AdminTab {
  id: string;
  name: string;
  icon: React.ElementType;
  permission: Permission;
  component: React.ComponentType;
}

const adminTabs: AdminTab[] = [
  {
    id: 'users',
    name: 'User Management',
    icon: UsersIcon,
    permission: Permission.USER_MANAGEMENT,
    component: UserManagement,
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: CogIcon,
    permission: Permission.SETTINGS_EDIT,
    component: SystemSettings,
  },
  {
    id: 'audit',
    name: 'Audit Log',
    icon: DocumentTextIcon,
    permission: Permission.AUDIT_LOG_VIEW,
    component: AuditLog,
  },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  const activeTabConfig = adminTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || UserManagement;

  return (
    <WithPermissions 
      permissions={[Permission.ADMIN_PANEL]}
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to access the admin panel.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Administration Panel
                </h1>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Manage users, system settings, and monitor application activity
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {adminTabs.map((tab) => (
                <WithPermissions
                  key={tab.id}
                  permissions={[tab.permission]}
                >
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                </WithPermissions>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ActiveComponent />
        </div>
      </div>
    </WithPermissions>
  );
};

export default AdminPanel;