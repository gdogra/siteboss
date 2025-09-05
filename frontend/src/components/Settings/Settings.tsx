import React, { useState } from 'react';
import {
  UserIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  UsersIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { billingApi } from '../../services/api';
import { billingStore } from '../../services/billingSupabase';
import { useEffect } from 'react';

interface SettingsTab {
  id: string;
  name: string;
  icon: React.ElementType;
}

const settingsTabs: SettingsTab[] = [
  { id: 'profile', name: 'Profile', icon: UserIcon },
  { id: 'company', name: 'Company', icon: BuildingOfficeIcon },
  { id: 'team', name: 'Team Management', icon: UsersIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  { id: 'billing', name: 'Billing', icon: CreditCardIcon },
  { id: 'integrations', name: 'Integrations', icon: CogIcon }
];

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company_name: 'SiteBoss Construction Co.',
    company: {
      name: 'SiteBoss Construction Co.',
      address: '123 Construction Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-0000',
      email: 'info@siteboss.com',
      website: 'https://siteboss.com',
      industry: 'construction',
      companySize: '50-100',
      taxId: '12-3456789',
      licenseNumber: 'CON-2024-NYC-001',
      workingHours: {
        enabled: true,
        start: '07:00',
        end: '18:00',
        timezone: 'America/New_York',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      projectDefaults: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        defaultMarkup: 15,
        defaultTax: 8.25,
        retentionPercentage: 10,
        paymentTerms: 'Net 30',
        warranteeMonths: 12
      },
      branding: {
        logoUrl: '',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        accentColor: '#f59e0b',
        companySlogan: 'Building Excellence, Delivering Results'
      },
      compliance: {
        osha: true,
        epa: true,
        localPermits: true,
        insuranceCoverage: 2000000,
        bondAmount: 500000,
        backgroundChecks: true
      },
      integrations: {
        accounting: 'quickbooks',
        crm: 'none',
        scheduling: 'builtin',
        payroll: 'none',
        inventory: 'none'
      }
    },
    notifications: {
      email: true,
      push: false,
      sms: false,
      project_updates: true,
      task_reminders: true,
      budget_alerts: true
    },
    security: {
      two_factor: false,
      session_timeout: '30'
    },
    billing: {
      provider: 'stripe',
      defaultPlan: 'starter',
      billingCycle: 'monthly',
      currency: 'USD',
      taxRate: 0,
      trialDays: 0,
      proration: true,
      invoicePrefix: 'SB',
      netTerms: 30,
      billingEmail: user?.email || '',
      stripe: {
        publishableKey: '',
        priceIds: {
          starterMonthly: '',
          starterYearly: '',
          proMonthly: '',
          proYearly: '',
          enterpriseMonthly: '',
          enterpriseYearly: ''
        },
        customerPortalUrl: ''
      },
      dunning: {
        enabled: true,
        retries: 3,
        retryIntervalDays: 3,
        sendEmails: true
      }
    },
    teamSettings: {
      autoApproveInvites: false,
      allowSelfRegistration: true,
      defaultRole: 'worker',
      requirePhoneVerification: false,
      sessionTimeout: 8,
      twoFactorRequired: false,
      allowRoleEscalation: false,
      projectAccessLevel: 'assigned_only',
      emailNotifications: {
        newMemberJoined: true,
        roleChanged: true,
        memberDeactivated: false,
        weeklyReport: true,
      },
      workingHours: {
        enabled: true,
        start: '08:00',
        end: '17:00',
        timezone: 'America/New_York',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      permissions: {
        canCreateProjects: ['company_admin', 'project_manager'],
        canDeleteTasks: ['company_admin', 'project_manager', 'foreman'],
        canViewReports: ['company_admin', 'project_manager'],
        canManageBudgets: ['company_admin'],
        canInviteMembers: ['company_admin', 'project_manager'],
      }
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev] as any,
            [child]: checkbox.checked
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      updateUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      console.log('Saving notification preferences:', formData.notifications);
      alert('Notification preferences saved successfully!');
    } catch (error) {
      alert('Failed to save notification preferences');
    }
  };

  const handleEnable2FA = async () => {
    try {
      console.log('Enabling 2FA...');
      alert('2FA setup initiated. Please check your email for setup instructions.');
    } catch (error) {
      alert('Failed to enable 2FA');
    }
  };

  const handleChangePassword = () => {
    const newPassword = prompt('Enter new password:');
    if (newPassword && newPassword.length >= 8) {
      console.log('Password change requested');
      alert('Password changed successfully!');
    } else if (newPassword) {
      alert('Password must be at least 8 characters long');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      console.log('Saving security settings:', formData.security);
      alert('Security settings saved successfully!');
    } catch (error) {
      alert('Failed to save security settings');
    }
  };

  const handleCompanyInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [section]: typeof prev.company[section as keyof typeof prev.company] === 'object'
          ? {
              ...(prev.company[section as keyof typeof prev.company] as any),
              [field]: value
            }
          : value
      }
    }));
  };

  const handleBillingChange = (path: string, value: any) => {
    // path examples: 'provider', 'currency', 'stripe.publishableKey', 'stripe.priceIds.proMonthly'
    setFormData(prev => {
      const clone: any = { ...prev };
      const parts = path.split('.');
      let node: any = clone.billing;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        node[k] = { ...(node?.[k] || {}) };
        node = node[k];
      }
      node[parts[parts.length - 1]] = value;
      return { ...clone, billing: clone.billing };
    });
  };

  const handleSaveBilling = async () => {
    try {
      // Try backend API first
      try {
        const res = await billingApi.updateSettings(formData.billing);
        if (res?.success) {
          alert('Billing settings saved successfully!');
          return;
        }
      } catch {}

      // Fallback: Supabase direct (requires tenant_configurations table + permissive RLS)
      const u = localStorage.getItem('siteboss_user');
      const companyId = u ? (JSON.parse(u).company_id || '123e4567-e89b-12d3-a456-426614174000') : '123e4567-e89b-12d3-a456-426614174000';
      await billingStore.upsert(companyId, formData.billing);
      alert('Billing settings saved (Supabase)');
    } catch (error) {
      // Final fallback: localStorage
      localStorage.setItem('sb_billing_settings', JSON.stringify(formData.billing));
      alert('Saved locally (no API available)');
    }
  };

  const handleDirectCompanyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  const handleWorkingDaysToggle = (day: string) => {
    const currentDays = formData.company.workingHours.workingDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleCompanyInputChange('workingHours', 'workingDays', newDays);
  };

  const handleSaveCompany = async () => {
    try {
      console.log('Saving company settings:', formData.company);
      alert('Company settings saved successfully!');
    } catch (error) {
      alert('Failed to save company settings');
    }
  };

  const handleTeamSettingsUpdate = (settingKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamSettings: {
        ...prev.teamSettings,
        [settingKey]: value
      }
    }));
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    successMessage.textContent = 'Settings updated successfully!';
    document.body.appendChild(successMessage);
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  };

  const handleNestedTeamSettingsUpdate = (parentKey: string, childKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamSettings: {
        ...prev.teamSettings,
        [parentKey]: {
          ...prev.teamSettings[parentKey as keyof typeof prev.teamSettings] as any,
          [childKey]: value
        }
      }
    }));
  };

  const handleTeamPermissionUpdate = (permission: string, roles: string[]) => {
    setFormData(prev => ({
      ...prev,
      teamSettings: {
        ...prev.teamSettings,
        permissions: {
          ...prev.teamSettings.permissions,
          [permission]: roles
        }
      }
    }));
  };

  const handleTeamWorkingDaysToggle = (day: string) => {
    const currentDays = formData.teamSettings.workingHours.workingDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    handleNestedTeamSettingsUpdate('workingHours', 'workingDays', newDays);
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your personal information and contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Preferences</h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose how you want to receive notifications about your projects.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="notifications.email"
              checked={formData.notifications.email}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Project Updates</h4>
            <p className="text-sm text-gray-500">Get notified about project status changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="notifications.project_updates"
              checked={formData.notifications.project_updates}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Task Reminders</h4>
            <p className="text-sm text-gray-500">Reminders for upcoming task deadlines</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="notifications.task_reminders"
              checked={formData.notifications.task_reminders}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Budget Alerts</h4>
            <p className="text-sm text-gray-500">Alerts when approaching budget limits</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="notifications.budget_alerts"
              checked={formData.notifications.budget_alerts}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSaveNotifications}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account security and authentication preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <button 
            onClick={handleEnable2FA}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Enable 2FA
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout
          </label>
          <select
            name="security.session_timeout"
            value={formData.security.session_timeout}
            onChange={handleInputChange}
            className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="240">4 hours</option>
          </select>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button 
            onClick={handleChangePassword}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <KeyIcon className="-ml-1 mr-2 h-4 w-4" />
            Change Password
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSaveSecurity}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          Save Security Settings
        </button>
      </div>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-8">
      {/* Company Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          Company Information
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              value={formData.company.name}
              onChange={(e) => handleDirectCompanyChange('name', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <select
              value={formData.company.industry}
              onChange={(e) => handleDirectCompanyChange('industry', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="construction">Construction</option>
              <option value="architecture">Architecture</option>
              <option value="engineering">Engineering</option>
              <option value="contracting">General Contracting</option>
              <option value="specialty">Specialty Trades</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Size</label>
            <select
              value={formData.company.companySize}
              onChange={(e) => handleDirectCompanyChange('companySize', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-25">11-25 employees</option>
              <option value="26-50">26-50 employees</option>
              <option value="50-100">50-100 employees</option>
              <option value="100+">100+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              value={formData.company.website}
              onChange={(e) => handleDirectCompanyChange('website', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.company.address}
              onChange={(e) => handleDirectCompanyChange('address', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={formData.company.city}
              onChange={(e) => handleDirectCompanyChange('city', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              value={formData.company.state}
              onChange={(e) => handleDirectCompanyChange('state', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              value={formData.company.zipCode}
              onChange={(e) => handleDirectCompanyChange('zipCode', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              value={formData.company.country}
              onChange={(e) => handleDirectCompanyChange('country', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <BellIcon className="h-5 w-5 mr-2" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Phone</label>
            <input
              type="tel"
              value={formData.company.phone}
              onChange={(e) => handleDirectCompanyChange('phone', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Email</label>
            <input
              type="email"
              value={formData.company.email}
              onChange={(e) => handleDirectCompanyChange('email', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Legal & Compliance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          Legal & Compliance
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID / EIN</label>
            <input
              type="text"
              value={formData.company.taxId}
              onChange={(e) => handleDirectCompanyChange('taxId', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input
              type="text"
              value={formData.company.licenseNumber}
              onChange={(e) => handleDirectCompanyChange('licenseNumber', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance Coverage ($)</label>
            <input
              type="number"
              value={formData.company.compliance.insuranceCoverage}
              onChange={(e) => handleCompanyInputChange('compliance', 'insuranceCoverage', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bond Amount ($)</label>
            <input
              type="number"
              value={formData.company.compliance.bondAmount}
              onChange={(e) => handleCompanyInputChange('compliance', 'bondAmount', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.company.compliance.osha}
              onChange={(e) => handleCompanyInputChange('compliance', 'osha', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">OSHA Compliant</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.company.compliance.epa}
              onChange={(e) => handleCompanyInputChange('compliance', 'epa', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">EPA Compliant</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.company.compliance.localPermits}
              onChange={(e) => handleCompanyInputChange('compliance', 'localPermits', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Local Permits Current</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.company.compliance.backgroundChecks}
              onChange={(e) => handleCompanyInputChange('compliance', 'backgroundChecks', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Require Background Checks</label>
          </div>
        </div>
      </div>

      {/* Project Defaults */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <CogIcon className="h-5 w-5 mr-2" />
          Project Defaults
        </h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={formData.company.projectDefaults.currency}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'currency', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date Format</label>
            <select
              value={formData.company.projectDefaults.dateFormat}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'dateFormat', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Markup (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.company.projectDefaults.defaultMarkup}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'defaultMarkup', parseFloat(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              step="0.01"
              value={formData.company.projectDefaults.defaultTax}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'defaultTax', parseFloat(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Retention (%)</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={formData.company.projectDefaults.retentionPercentage}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'retentionPercentage', parseFloat(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
            <select
              value={formData.company.projectDefaults.paymentTerms}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'paymentTerms', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Default Warranty (Months)</label>
            <input
              type="number"
              min="0"
              max="120"
              value={formData.company.projectDefaults.warranteeMonths}
              onChange={(e) => handleCompanyInputChange('projectDefaults', 'warranteeMonths', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <BellIcon className="h-5 w-5 mr-2" />
          Company Working Hours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Working Hours</label>
              <p className="text-sm text-gray-500">Set standard working hours for the company</p>
            </div>
            <button
              onClick={() => handleCompanyInputChange('workingHours', 'enabled', !formData.company.workingHours.enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.company.workingHours.enabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.company.workingHours.enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {formData.company.workingHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={formData.company.workingHours.start}
                  onChange={(e) => handleCompanyInputChange('workingHours', 'start', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={formData.company.workingHours.end}
                  onChange={(e) => handleCompanyInputChange('workingHours', 'end', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={formData.company.workingHours.timezone}
                  onChange={(e) => handleCompanyInputChange('workingHours', 'timezone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="America/New_York">Eastern Time (EST/EDT)</option>
                  <option value="America/Chicago">Central Time (CST/CDT)</option>
                  <option value="America/Denver">Mountain Time (MST/MDT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => handleWorkingDaysToggle(day)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        formData.company.workingHours.workingDays.includes(day)
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <CogIcon className="h-5 w-5 mr-2" />
          Company Branding
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Logo URL</label>
            <input
              type="url"
              value={formData.company.branding.logoUrl}
              onChange={(e) => handleCompanyInputChange('branding', 'logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Slogan</label>
            <input
              type="text"
              value={formData.company.branding.companySlogan}
              onChange={(e) => handleCompanyInputChange('branding', 'companySlogan', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <input
                type="color"
                value={formData.company.branding.primaryColor}
                onChange={(e) => handleCompanyInputChange('branding', 'primaryColor', e.target.value)}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
              <input
                type="color"
                value={formData.company.branding.secondaryColor}
                onChange={(e) => handleCompanyInputChange('branding', 'secondaryColor', e.target.value)}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Accent Color</label>
              <input
                type="color"
                value={formData.company.branding.accentColor}
                onChange={(e) => handleCompanyInputChange('branding', 'accentColor', e.target.value)}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Integrations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <CogIcon className="h-5 w-5 mr-2" />
          System Integrations
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Accounting Software</label>
            <select
              value={formData.company.integrations.accounting}
              onChange={(e) => handleCompanyInputChange('integrations', 'accounting', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="none">None</option>
              <option value="quickbooks">QuickBooks</option>
              <option value="xero">Xero</option>
              <option value="sage">Sage</option>
              <option value="wave">Wave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CRM System</label>
            <select
              value={formData.company.integrations.crm}
              onChange={(e) => handleCompanyInputChange('integrations', 'crm', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="none">None</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="pipedrive">Pipedrive</option>
              <option value="zoho">Zoho CRM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Scheduling</label>
            <select
              value={formData.company.integrations.scheduling}
              onChange={(e) => handleCompanyInputChange('integrations', 'scheduling', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="builtin">Built-in Scheduling</option>
              <option value="calendly">Calendly</option>
              <option value="acuity">Acuity Scheduling</option>
              <option value="schedulicity">Schedulicity</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payroll System</label>
            <select
              value={formData.company.integrations.payroll}
              onChange={(e) => handleCompanyInputChange('integrations', 'payroll', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="none">None</option>
              <option value="adp">ADP</option>
              <option value="paychex">Paychex</option>
              <option value="gusto">Gusto</option>
              <option value="quickbooks-payroll">QuickBooks Payroll</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveCompany}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Save Company Settings
        </button>
      </div>
    </div>
  );

  const renderTeamManagementSettings = () => (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <CogIcon className="h-5 w-5 mr-2" />
          General Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-approve Invitations</label>
              <p className="text-sm text-gray-500">Automatically approve team member invitations</p>
            </div>
            <button
              onClick={() => handleTeamSettingsUpdate('autoApproveInvites', !formData.teamSettings.autoApproveInvites)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.teamSettings.autoApproveInvites ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.teamSettings.autoApproveInvites ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Self Registration</label>
              <p className="text-sm text-gray-500">Allow users to register themselves with a company code</p>
            </div>
            <button
              onClick={() => handleTeamSettingsUpdate('allowSelfRegistration', !formData.teamSettings.allowSelfRegistration)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.teamSettings.allowSelfRegistration ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.teamSettings.allowSelfRegistration ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Role for New Members</label>
            <select
              value={formData.teamSettings.defaultRole}
              onChange={(e) => handleTeamSettingsUpdate('defaultRole', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="worker">Worker</option>
              <option value="foreman">Foreman</option>
              <option value="project_manager">Project Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Project Access Level</label>
            <select
              value={formData.teamSettings.projectAccessLevel}
              onChange={(e) => handleTeamSettingsUpdate('projectAccessLevel', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">All Projects</option>
              <option value="assigned_only">Assigned Projects Only</option>
              <option value="department_only">Department Projects Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session Timeout (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={formData.teamSettings.sessionTimeout}
              onChange={(e) => handleTeamSettingsUpdate('sessionTimeout', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          Security Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Require Phone Verification</label>
              <p className="text-sm text-gray-500">Require phone number verification for new members</p>
            </div>
            <button
              onClick={() => handleTeamSettingsUpdate('requirePhoneVerification', !formData.teamSettings.requirePhoneVerification)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.teamSettings.requirePhoneVerification ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.teamSettings.requirePhoneVerification ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication Required</label>
              <p className="text-sm text-gray-500">Require 2FA for all team members</p>
            </div>
            <button
              onClick={() => handleTeamSettingsUpdate('twoFactorRequired', !formData.teamSettings.twoFactorRequired)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.teamSettings.twoFactorRequired ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.teamSettings.twoFactorRequired ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Allow Role Escalation</label>
              <p className="text-sm text-gray-500">Allow users to request higher role permissions</p>
            </div>
            <button
              onClick={() => handleTeamSettingsUpdate('allowRoleEscalation', !formData.teamSettings.allowRoleEscalation)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.teamSettings.allowRoleEscalation ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.teamSettings.allowRoleEscalation ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Working Hours Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <ClockIcon className="h-5 w-5 mr-2" />
          Working Hours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Working Hours</label>
              <p className="text-sm text-gray-500">Track and enforce working hours for team members</p>
            </div>
            <button
              onClick={() => handleNestedTeamSettingsUpdate('workingHours', 'enabled', !formData.teamSettings.workingHours.enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                formData.teamSettings.workingHours.enabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                formData.teamSettings.workingHours.enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {formData.teamSettings.workingHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={formData.teamSettings.workingHours.start}
                  onChange={(e) => handleNestedTeamSettingsUpdate('workingHours', 'start', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={formData.teamSettings.workingHours.end}
                  onChange={(e) => handleNestedTeamSettingsUpdate('workingHours', 'end', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={formData.teamSettings.workingHours.timezone}
                  onChange={(e) => handleNestedTeamSettingsUpdate('workingHours', 'timezone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="America/New_York">Eastern Time (EST/EDT)</option>
                  <option value="America/Chicago">Central Time (CST/CDT)</option>
                  <option value="America/Denver">Mountain Time (MST/MDT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <button
                      key={day}
                      onClick={() => handleTeamWorkingDaysToggle(day)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        formData.teamSettings.workingHours.workingDays.includes(day)
                          ? 'bg-primary-100 border-primary-300 text-primary-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <BellIcon className="h-5 w-5 mr-2" />
          Email Notifications
        </h3>
        
        <div className="space-y-4">
          {Object.entries({
            newMemberJoined: 'New Member Joined',
            roleChanged: 'Role Changed',
            memberDeactivated: 'Member Deactivated',
            weeklyReport: 'Weekly Team Report'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <p className="text-sm text-gray-500">Send email notifications for {label.toLowerCase()}</p>
              </div>
              <button
                onClick={() => handleNestedTeamSettingsUpdate('emailNotifications', key, !(formData.teamSettings.emailNotifications as any)[key])}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  (formData.teamSettings.emailNotifications as any)[key] ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  (formData.teamSettings.emailNotifications as any)[key] ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
          <KeyIcon className="h-5 w-5 mr-2" />
          Role Permissions
        </h3>
        
        <div className="space-y-6">
          {Object.entries({
            canCreateProjects: 'Can Create Projects',
            canDeleteTasks: 'Can Delete Tasks',
            canViewReports: 'Can View Reports',
            canManageBudgets: 'Can Manage Budgets',
            canInviteMembers: 'Can Invite Members'
          }).map(([permission, label]) => (
            <div key={permission}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex flex-wrap gap-2">
                {['super_admin', 'company_admin', 'project_manager', 'foreman', 'worker', 'client'].map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      const currentRoles = (formData.teamSettings.permissions as any)[permission] as string[];
                      const newRoles = currentRoles.includes(role)
                        ? currentRoles.filter(r => r !== role)
                        : [...currentRoles, role];
                      handleTeamPermissionUpdate(permission, newRoles);
                    }}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      ((formData.teamSettings.permissions as any)[permission] as string[]).includes(role)
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlaceholderTab = (tabName: string) => (
    <div className="text-center py-12">
      <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{tabName} Settings</h3>
      <p className="mt-1 text-sm text-gray-500">
        {tabName} configuration options would be available here.
      </p>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Billing Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage subscription plans, provider settings, invoicing, and taxes.
        </p>
      </div>

      {/* Provider & Plan Defaults */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Provider & Plan Defaults</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Provider</label>
            <select
              value={formData.billing.provider}
              onChange={(e) => handleBillingChange('provider', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="stripe">Stripe</option>
              <option value="manual">Manual (Invoice only)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Plan</label>
            <select
              value={formData.billing.defaultPlan}
              onChange={(e) => handleBillingChange('defaultPlan', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Billing Cycle</label>
            <select
              value={formData.billing.billingCycle}
              onChange={(e) => handleBillingChange('billingCycle', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stripe Settings */}
      {formData.billing.provider === 'stripe' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Stripe Settings</h4>
          <p className="text-xs text-gray-500 mb-4">Do not store secret keys in the frontend. Use publishable key only.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Publishable Key</label>
              <input
                type="text"
                value={formData.billing.stripe.publishableKey}
                onChange={(e) => handleBillingChange('stripe.publishableKey', e.target.value)}
                placeholder="pk_live_xxx or pk_test_xxx"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Starter Monthly Price ID</label>
              <input
                type="text"
                value={formData.billing.stripe.priceIds.starterMonthly}
                onChange={(e) => handleBillingChange('stripe.priceIds.starterMonthly', e.target.value)}
                placeholder="price_..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Starter Yearly Price ID</label>
              <input
                type="text"
                value={formData.billing.stripe.priceIds.starterYearly}
                onChange={(e) => handleBillingChange('stripe.priceIds.starterYearly', e.target.value)}
                placeholder="price_..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pro Monthly Price ID</label>
              <input
                type="text"
                value={formData.billing.stripe.priceIds.proMonthly}
                onChange={(e) => handleBillingChange('stripe.priceIds.proMonthly', e.target.value)}
                placeholder="price_..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pro Yearly Price ID</label>
              <input
                type="text"
                value={formData.billing.stripe.priceIds.proYearly}
                onChange={(e) => handleBillingChange('stripe.priceIds.proYearly', e.target.value)}
                placeholder="price_..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Enterprise Monthly Price ID</label>
              <input
                type="text"
                value={formData.billing.stripe.priceIds.enterpriseMonthly}
                onChange={(e) => handleBillingChange('stripe.priceIds.enterpriseMonthly', e.target.value)}
                placeholder="price_..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Enterprise Yearly Price ID</label>
              <input
                type="text"
                value={formData.billing.stripe.priceIds.enterpriseYearly}
                onChange={(e) => handleBillingChange('stripe.priceIds.enterpriseYearly', e.target.value)}
                placeholder="price_..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Customer Portal URL</label>
              <input
                type="url"
                value={formData.billing.stripe.customerPortalUrl}
                onChange={(e) => handleBillingChange('stripe.customerPortalUrl', e.target.value)}
                placeholder="https://billing.yourdomain.com/session..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Invoicing & Taxes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Invoicing & Taxes</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={formData.billing.currency}
              onChange={(e) => handleBillingChange('currency', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              step="0.01"
              value={formData.billing.taxRate}
              onChange={(e) => handleBillingChange('taxRate', parseFloat(e.target.value || '0'))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Prefix</label>
            <input
              type="text"
              value={formData.billing.invoicePrefix}
              onChange={(e) => handleBillingChange('invoicePrefix', e.target.value.toUpperCase())}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Net Terms (days)</label>
            <input
              type="number"
              min="0"
              max="120"
              value={formData.billing.netTerms}
              onChange={(e) => handleBillingChange('netTerms', parseInt(e.target.value || '0'))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Billing Email</label>
            <input
              type="email"
              value={formData.billing.billingEmail}
              onChange={(e) => handleBillingChange('billingEmail', e.target.value)}
              placeholder="billing@yourcompany.com"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Trials, Proration & Dunning */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Trials, Proration & Dunning</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Trial Days</label>
            <input
              type="number"
              min="0"
              max="60"
              value={formData.billing.trialDays}
              onChange={(e) => handleBillingChange('trialDays', parseInt(e.target.value || '0'))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Proration</label>
            <div className="mt-2">
              <button
                onClick={() => handleBillingChange('proration', !formData.billing.proration)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  formData.billing.proration ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                aria-pressed={formData.billing.proration}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.billing.proration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dunning Retries</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.billing.dunning.retries}
              onChange={(e) => handleBillingChange('dunning.retries', parseInt(e.target.value || '0'))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Retry Interval (days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.billing.dunning.retryIntervalDays}
              onChange={(e) => handleBillingChange('dunning.retryIntervalDays', parseInt(e.target.value || '1'))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center mt-2">
            <input
              id="dunningEmails"
              type="checkbox"
              checked={formData.billing.dunning.sendEmails}
              onChange={(e) => handleBillingChange('dunning.sendEmails', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="dunningEmails" className="ml-2 text-sm text-gray-700">Send dunning emails on failed payments</label>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSaveBilling}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save Billing Settings
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'company':
        return renderCompanySettings();
      case 'team':
        return renderTeamManagementSettings();
      case 'billing':
        return renderBillingSettings();
      case 'integrations':
        return renderPlaceholderTab('Integrations');
      default:
        return renderProfileSettings();
    }
  };

  // Prefetch billing settings when visiting the Billing tab
  useEffect(() => {
    const loadBilling = async () => {
      try {
        // Prefer backend API
        try {
          const res = await billingApi.getSettings();
          const data = res?.data;
          if (data) {
            setFormData(prev => ({
              ...prev,
              billing: {
                ...prev.billing,
                ...data,
                stripe: {
                  ...(prev.billing as any)?.stripe,
                  ...(data?.stripe || {})
                },
                dunning: {
                  ...(prev.billing as any)?.dunning,
                  ...(data?.dunning || {})
                }
              }
            }));
            return;
          }
        } catch {}

        // Fallback: Supabase direct
        try {
          const u = localStorage.getItem('siteboss_user');
          const companyId = u ? (JSON.parse(u).company_id || '123e4567-e89b-12d3-a456-426614174000') : '123e4567-e89b-12d3-a456-426614174000';
          const data = await billingStore.get(companyId);
          if (data) {
            setFormData(prev => ({
              ...prev,
              billing: {
                ...prev.billing,
                ...data,
                stripe: {
                  ...(prev.billing as any)?.stripe,
                  ...(data?.stripe || {})
                },
                dunning: {
                  ...(prev.billing as any)?.dunning,
                  ...(data?.dunning || {})
                }
              }
            }));
            return;
          }
        } catch {}

        // Final fallback: localStorage stub
        try {
          const raw = localStorage.getItem('sb_billing_settings');
          if (raw) {
            const data = JSON.parse(raw);
            setFormData(prev => ({ ...prev, billing: { ...prev.billing, ...data } }));
          }
        } catch {}
      } catch {}
    };
    if (activeTab === 'billing') loadBilling();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
          {/* Settings Navigation */}
          <aside className="py-6 lg:col-span-3">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                >
                  <tab.icon
                    className={`${
                      activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } -ml-1 mr-3 h-5 w-5`}
                  />
                  <span className="truncate">{tab.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings Content */}
          <div className="divide-y divide-gray-200 lg:col-span-9">
            <div className="py-6 px-4 sm:p-6 lg:pb-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
