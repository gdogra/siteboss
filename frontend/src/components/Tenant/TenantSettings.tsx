import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  PaintBrushIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTenant } from '../../contexts/TenantContext';

interface SettingsForm {
  branding: {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  features: {
    aiAssistant: boolean;
    advancedAnalytics: boolean;
    customReports: boolean;
    apiAccess: boolean;
    whiteLabeling: boolean;
  };
}

const TenantSettings: React.FC = () => {
  const { tenant, updateTenantSettings, getTenantFeature, getTenantLimit } = useTenant();
  const [activeTab, setActiveTab] = useState<'branding' | 'features' | 'limits' | 'subscription'>('branding');
  const [formData, setFormData] = useState<SettingsForm>({
    branding: {
      companyName: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
    },
    features: {
      aiAssistant: false,
      advancedAnalytics: false,
      customReports: false,
      apiAccess: false,
      whiteLabeling: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFormData({
        branding: {
          companyName: tenant.settings.branding.companyName,
          primaryColor: tenant.settings.branding.primaryColor,
          secondaryColor: tenant.settings.branding.secondaryColor,
          logo: tenant.settings.branding.logo
        },
        features: { ...tenant.settings.features }
      });
    }
  }, [tenant]);

  const handleBrandingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value
      }
    }));
  };

  const handleFeatureToggle = (feature: keyof SettingsForm['features']) => {
    if (!getTenantFeature(feature)) {
      // Feature not available in current plan
      return;
    }

    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateTenantSettings({
        branding: formData.branding,
        features: formData.features
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLimit = (limit: number): string => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  };

  const handleUpgradePlan = () => {
    setShowUpgradeModal(true);
  };

  const handleViewBillingHistory = () => {
    setShowBillingModal(true);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      // Simulate cancellation API call
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert('Your subscription has been scheduled for cancellation at the end of your billing period.');
      }, 1500);
    }
  };

  const getSubscriptionBadgeColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-100 text-blue-800';
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-gold-100 text-gold-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading tenant settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Settings</h1>
          <p className="text-gray-600 mt-1">Manage your organization's configuration and preferences</p>
        </div>
        {showSuccess && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <CheckIcon className="h-5 w-5" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tenant Info Card */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{tenant.name}</h2>
            <p className="text-gray-600">{tenant.domain}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionBadgeColor(tenant.subscription.plan)}`}>
                {tenant.subscription.plan.charAt(0).toUpperCase() + tenant.subscription.plan.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Expires: {tenant.subscription.expiresAt.toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tenant ID</div>
            <div className="font-mono text-sm text-gray-900">{tenant.id}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'branding', label: 'Branding', icon: PaintBrushIcon },
            { key: 'features', label: 'Features', icon: BoltIcon },
            { key: 'limits', label: 'Usage Limits', icon: ChartBarIcon },
            { key: 'subscription', label: 'Subscription', icon: CurrencyDollarIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Identity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.branding.companyName}
                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.branding.secondaryColor}
                        onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.secondaryColor}
                        onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-lg p-4" style={{ 
                backgroundColor: formData.branding.primaryColor + '10',
                borderColor: formData.branding.primaryColor + '30'
              }}>
                <div className="text-center">
                  <h4 className="text-xl font-bold mb-2" style={{ color: formData.branding.primaryColor }}>
                    {formData.branding.companyName || 'Your Company'}
                  </h4>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: formData.branding.primaryColor }}
                    ></div>
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: formData.branding.secondaryColor }}
                    ></div>
                  </div>
                  <button 
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.branding.primaryColor }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Available Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries({
                aiAssistant: {
                  name: 'AI Assistant',
                  description: 'Intelligent business assistant with natural language processing',
                  icon: BoltIcon
                },
                advancedAnalytics: {
                  name: 'Advanced Analytics',
                  description: 'Detailed reports and business intelligence dashboards',
                  icon: ChartBarIcon
                },
                customReports: {
                  name: 'Custom Reports',
                  description: 'Create and customize your own reporting templates',
                  icon: CloudIcon
                },
                apiAccess: {
                  name: 'API Access',
                  description: 'RESTful API for integrations and custom applications',
                  icon: CogIcon
                },
                whiteLabeling: {
                  name: 'White Labeling',
                  description: 'Full brand customization and domain management',
                  icon: PaintBrushIcon
                }
              }).map(([feature, config]) => {
                const isAvailable = getTenantFeature(feature as any);
                const isEnabled = formData.features[feature as keyof SettingsForm['features']];
                
                return (
                  <div 
                    key={feature}
                    className={`border rounded-lg p-4 transition-colors ${
                      isAvailable 
                        ? 'border-gray-200 hover:border-primary-300' 
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <config.icon className={`h-6 w-6 ${isAvailable ? 'text-primary-600' : 'text-gray-400'}`} />
                      {isAvailable ? (
                        <button
                          onClick={() => handleFeatureToggle(feature as keyof SettingsForm['features'])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        >
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <h4 className={`font-medium mb-2 ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                      {config.name}
                    </h4>
                    <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                      {config.description}
                    </p>
                    {!isAvailable && (
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        Upgrade plan to enable
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'limits' && (
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Usage Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: 'maxUsers', label: 'Maximum Users', icon: UserGroupIcon, unit: '' },
                { key: 'maxLeads', label: 'Maximum Leads', icon: UserGroupIcon, unit: '' },
                { key: 'maxDeals', label: 'Maximum Deals', icon: CurrencyDollarIcon, unit: '' },
                { key: 'storageGB', label: 'Storage', icon: CloudIcon, unit: 'GB' }
              ].map((limit) => {
                const value = getTenantLimit(limit.key as any);
                return (
                  <div key={limit.key} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
                      <limit.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{limit.label}</h4>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatLimit(value)}{limit.unit && ` ${limit.unit}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionBadgeColor(tenant.subscription.plan)}`}>
                    {tenant.subscription.plan.charAt(0).toUpperCase() + tenant.subscription.plan.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.subscription.status.charAt(0).toUpperCase() + tenant.subscription.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                  <p className="text-gray-900">{tenant.subscription.billingCycle.charAt(0).toUpperCase() + tenant.subscription.billingCycle.slice(1)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Renewal</label>
                  <p className="text-gray-900">{tenant.subscription.expiresAt.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={handleUpgradePlan}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Upgrade Plan
                </button>
                <button 
                  onClick={handleViewBillingHistory}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  View Billing History
                </button>
                <button 
                  onClick={handleCancelSubscription}
                  className="w-full border border-red-300 hover:bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {(activeTab === 'branding' || activeTab === 'features') && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Upgrade Your Plan</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900">Starter</h4>
                  <p className="text-gray-600">Perfect for small teams</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">$29</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Up to 5 users
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    1,000 leads
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    5GB storage
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Basic support
                  </li>
                </ul>
                <button className="w-full mt-6 bg-gray-100 text-gray-600 py-2 px-4 rounded-md cursor-not-allowed">
                  Current Plan
                </button>
              </div>

              {/* Professional Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-medium py-1 px-3 rounded-full">
                    Popular
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900">Professional</h4>
                  <p className="text-gray-600">For growing businesses</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">$79</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Up to 25 users
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    10,000 leads
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    50GB storage
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Priority support
                  </li>
                </ul>
                <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  Upgrade to Professional
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900">Enterprise</h4>
                  <p className="text-gray-600">For large organizations</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">$199</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Unlimited users
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Unlimited leads
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    500GB storage
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    Custom reports
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    White labeling
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                    24/7 support
                  </li>
                </ul>
                <button className="w-full mt-6 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800">
                  Upgrade to Enterprise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing History Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
              <button
                onClick={() => setShowBillingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Aug 1, 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Professional Plan - Monthly
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $79.00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <a href="#" className="underline">Download</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Jul 1, 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Professional Plan - Monthly
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $79.00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <a href="#" className="underline">Download</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Jun 1, 2024
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Professional Plan - Monthly
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $79.00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <a href="#" className="underline">Download</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing billing history for the last 6 months
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                  Export all invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSettings;