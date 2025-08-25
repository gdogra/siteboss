import React, { useState } from 'react';
import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'SiteBoss',
    siteDescription: 'Construction Management Platform',
    defaultUserRole: 'worker',
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,
    dataRetentionDays: 365,
    maxFileSize: 10,
    allowedFileTypes: '.pdf,.doc,.docx,.jpg,.png,.xlsx'
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default User Role
            </label>
            <select
              value={settings.defaultUserRole}
              onChange={(e) => handleSettingChange('defaultUserRole', e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="worker">Worker</option>
              <option value="foreman">Foreman</option>
              <option value="project_manager">Project Manager</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Require Email Verification
              </label>
              <p className="text-xs text-gray-500">
                New users must verify their email address before accessing the system
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('requireEmailVerification', !settings.requireEmailVerification)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.requireEmailVerification ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  settings.requireEmailVerification ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Maintenance Mode
              </label>
              <p className="text-xs text-gray-500">
                Temporarily disable access for all users except administrators
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <CircleStackIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Retention (Days)
              </label>
              <input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                min="30"
                max="3650"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long to keep audit logs and deleted records
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed File Types
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes}
              onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder=".pdf,.doc,.jpg,.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of allowed file extensions
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable System Notifications
              </label>
              <p className="text-xs text-gray-500">
                Send email notifications for important system events
              </p>
            </div>
            <button
              onClick={() => handleSettingChange('enableNotifications', !settings.enableNotifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.enableNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  settings.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;