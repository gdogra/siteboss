import React, { useState, useEffect } from 'react';
import { 
  CalculatorIcon, 
  BanknotesIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface AccountingSoftware {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  version: string;
  lastSync: Date;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'manual';
  supportedFeatures: string[];
  dataMapping: {
    customers: boolean;
    vendors: boolean;
    items: boolean;
    invoices: boolean;
    expenses: boolean;
    payments: boolean;
    taxes: boolean;
    reports: boolean;
  };
  pricing: {
    setup: number;
    monthly: number;
    perTransaction: number;
  };
  connectionHealth: number;
}

interface SyncActivity {
  id: string;
  softwareId: string;
  type: 'invoice' | 'expense' | 'payment' | 'customer' | 'vendor' | 'report';
  action: 'create' | 'update' | 'sync' | 'error';
  description: string;
  timestamp: Date;
  recordsAffected: number;
  status: 'success' | 'error' | 'warning';
  errorMessage?: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  outstandingInvoices: number;
  overdueAmount: number;
  cashFlow: number;
  profitMargin: number;
  lastUpdated: Date;
}

export const AccountingSoftwareIntegrations: React.FC = () => {
  const [accountingSoftware, setAccountingSoftware] = useState<AccountingSoftware[]>([]);
  const [syncActivities, setSyncActivities] = useState<SyncActivity[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSoftware, setSelectedSoftware] = useState<AccountingSoftware | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadAccountingSoftware();
    loadSyncActivities();
    loadFinancialSummary();
  }, []);

  const loadAccountingSoftware = async () => {
    // Simulate API call to load accounting software integrations
    const mockSoftware: AccountingSoftware[] = [
      {
        id: 'quickbooks-online',
        name: 'QuickBooks Online',
        logo: '/api/logos/quickbooks.png',
        description: 'Cloud-based accounting and financial management',
        status: 'connected',
        version: 'v3.0',
        lastSync: new Date(Date.now() - 300000), // 5 minutes ago
        syncFrequency: 'hourly',
        supportedFeatures: [
          'Customer Management',
          'Invoice Generation',
          'Expense Tracking',
          'Payment Processing',
          'Tax Calculations',
          'Financial Reporting',
          'Bank Reconciliation'
        ],
        dataMapping: {
          customers: true,
          vendors: true,
          items: true,
          invoices: true,
          expenses: true,
          payments: true,
          taxes: true,
          reports: true
        },
        pricing: {
          setup: 0,
          monthly: 25.00,
          perTransaction: 0.05
        },
        connectionHealth: 98
      },
      {
        id: 'xero',
        name: 'Xero',
        logo: '/api/logos/xero.png',
        description: 'Beautiful business accounting software',
        status: 'connected',
        version: 'v2.1',
        lastSync: new Date(Date.now() - 180000), // 3 minutes ago
        syncFrequency: 'real-time',
        supportedFeatures: [
          'Multi-currency Support',
          'Project Tracking',
          'Inventory Management',
          'Time Tracking',
          'Payroll Integration',
          'Advanced Reporting',
          'Third-party Apps'
        ],
        dataMapping: {
          customers: true,
          vendors: true,
          items: true,
          invoices: true,
          expenses: true,
          payments: true,
          taxes: false,
          reports: true
        },
        pricing: {
          setup: 50.00,
          monthly: 35.00,
          perTransaction: 0.03
        },
        connectionHealth: 95
      },
      {
        id: 'sage-50',
        name: 'Sage 50cloud',
        logo: '/api/logos/sage.png',
        description: 'Desktop accounting with cloud features',
        status: 'pending',
        version: 'v27.1',
        lastSync: new Date(Date.now() - 7200000), // 2 hours ago
        syncFrequency: 'daily',
        supportedFeatures: [
          'Job Costing',
          'Advanced Inventory',
          'Fixed Assets',
          'Industry-specific Features',
          'Compliance Tools',
          'Audit Trail',
          'Multi-user Access'
        ],
        dataMapping: {
          customers: true,
          vendors: true,
          items: true,
          invoices: true,
          expenses: true,
          payments: false,
          taxes: true,
          reports: true
        },
        pricing: {
          setup: 199.99,
          monthly: 45.99,
          perTransaction: 0.10
        },
        connectionHealth: 0
      },
      {
        id: 'freshlooks',
        name: 'FreshBooks',
        logo: '/api/logos/freshbooks.png',
        description: 'Simple accounting for small businesses',
        status: 'error',
        version: 'v4.2',
        lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
        syncFrequency: 'hourly',
        supportedFeatures: [
          'Time Tracking',
          'Project Management',
          'Client Portal',
          'Automated Late Fees',
          'Mobile Receipt Capture',
          'Proposal Creation',
          'Team Collaboration'
        ],
        dataMapping: {
          customers: true,
          vendors: false,
          items: true,
          invoices: true,
          expenses: true,
          payments: true,
          taxes: false,
          reports: false
        },
        pricing: {
          setup: 0,
          monthly: 19.99,
          perTransaction: 0.02
        },
        connectionHealth: 0
      },
      {
        id: 'wave-accounting',
        name: 'Wave Accounting',
        logo: '/api/logos/wave.png',
        description: 'Free accounting software for small businesses',
        status: 'disconnected',
        version: 'v1.8',
        lastSync: new Date(Date.now() - 86400000), // 24 hours ago
        syncFrequency: 'daily',
        supportedFeatures: [
          'Free Core Features',
          'Receipt Scanning',
          'Bank Connections',
          'Sales Tax Tracking',
          'Customer Statements',
          'Basic Reporting'
        ],
        dataMapping: {
          customers: true,
          vendors: false,
          items: true,
          invoices: true,
          expenses: true,
          payments: false,
          taxes: true,
          reports: false
        },
        pricing: {
          setup: 0,
          monthly: 0,
          perTransaction: 0.00
        },
        connectionHealth: 0
      }
    ];

    setAccountingSoftware(mockSoftware);
    setLoading(false);
  };

  const loadSyncActivities = async () => {
    // Simulate sync activity data
    const mockActivities: SyncActivity[] = [
      {
        id: 'sync-001',
        softwareId: 'quickbooks-online',
        type: 'invoice',
        action: 'create',
        description: 'Created invoice #INV-2024-0847 for Project Alpha',
        timestamp: new Date(Date.now() - 300000),
        recordsAffected: 1,
        status: 'success'
      },
      {
        id: 'sync-002',
        softwareId: 'xero',
        type: 'expense',
        action: 'sync',
        description: 'Synchronized 15 expense records from last 24 hours',
        timestamp: new Date(Date.now() - 180000),
        recordsAffected: 15,
        status: 'success'
      },
      {
        id: 'sync-003',
        softwareId: 'quickbooks-online',
        type: 'payment',
        action: 'update',
        description: 'Updated payment status for invoice #INV-2024-0845',
        timestamp: new Date(Date.now() - 600000),
        recordsAffected: 1,
        status: 'success'
      },
      {
        id: 'sync-004',
        softwareId: 'freshlooks',
        type: 'customer',
        action: 'error',
        description: 'Failed to sync customer data - authentication expired',
        timestamp: new Date(Date.now() - 1800000),
        recordsAffected: 0,
        status: 'error',
        errorMessage: 'Authentication token expired. Please reconnect.'
      }
    ];

    setSyncActivities(mockActivities);
  };

  const loadFinancialSummary = async () => {
    // Simulate financial summary data
    const mockSummary: FinancialSummary = {
      totalRevenue: 1247500.00,
      totalExpenses: 892300.00,
      netIncome: 355200.00,
      outstandingInvoices: 12,
      overdueAmount: 45600.00,
      cashFlow: 187400.00,
      profitMargin: 28.5,
      lastUpdated: new Date(Date.now() - 300000)
    };

    setFinancialSummary(mockSummary);
  };

  const connectSoftware = async (softwareId: string) => {
    setConnecting(softwareId);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAccountingSoftware(prev => prev.map(software => 
      software.id === softwareId 
        ? { ...software, status: 'connected', connectionHealth: 95, lastSync: new Date() }
        : software
    ));
    
    setConnecting(null);
  };

  const disconnectSoftware = (softwareId: string) => {
    setAccountingSoftware(prev => prev.map(software => 
      software.id === softwareId 
        ? { ...software, status: 'disconnected', connectionHealth: 0 }
        : software
    ));
  };

  const syncSoftware = async (softwareId: string) => {
    setSyncing(softwareId);
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAccountingSoftware(prev => prev.map(software => 
      software.id === softwareId 
        ? { ...software, lastSync: new Date() }
        : software
    ));
    
    setSyncing(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />;
      case 'expense':
        return <ReceiptPercentIcon className="w-5 h-5 text-red-600" />;
      case 'payment':
        return <CreditCardIcon className="w-5 h-5 text-green-600" />;
      case 'customer':
      case 'vendor':
        return <BanknotesIcon className="w-5 h-5 text-purple-600" />;
      case 'report':
        return <ChartBarIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalculatorIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accounting Software Integrations</h2>
            <p className="text-gray-600">Seamless financial data synchronization</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add Integration
        </button>
      </div>

      {/* Financial Summary */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BanknotesIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  ${financialSummary.totalRevenue.toLocaleString()}
                </p>
                <p className="text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ReceiptPercentIcon className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  ${financialSummary.totalExpenses.toLocaleString()}
                </p>
                <p className="text-gray-600">Total Expenses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  ${financialSummary.netIncome.toLocaleString()}
                </p>
                <p className="text-gray-600">Net Income</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCardIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  ${financialSummary.cashFlow.toLocaleString()}
                </p>
                <p className="text-gray-600">Cash Flow</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Accounting Software</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {accountingSoftware.map((software) => (
            <div key={software.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CalculatorIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900">{software.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(software.status)}`}>
                        {software.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{software.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{software.version}</span>
                      <span>Sync: {software.syncFrequency}</span>
                      {software.status === 'connected' && (
                        <span>Health: {software.connectionHealth}%</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(software.status)}
                  {software.status === 'connected' && (
                    <button 
                      onClick={() => syncSoftware(software.id)}
                      disabled={syncing === software.id}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Sync data"
                    >
                      <ArrowPathIcon className={`w-5 h-5 ${syncing === software.id ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  {software.status === 'connected' ? (
                    <button 
                      onClick={() => disconnectSoftware(software.id)}
                      className="px-3 py-1 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={() => connectSoftware(software.id)}
                      disabled={connecting === software.id}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {connecting === software.id ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              {software.status === 'connected' && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Last Sync:</span>
                      <p className="font-medium">{software.lastSync.toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Cost:</span>
                      <p className="font-medium">${software.pricing.monthly}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Per Transaction:</span>
                      <p className="font-medium">${software.pricing.perTransaction}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Setup Fee:</span>
                      <p className="font-medium">${software.pricing.setup}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {Object.entries(software.dataMapping).map(([key, enabled]) => (
                      <div key={key} className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                        enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {enabled ? (
                          <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                          <XCircleIcon className="w-4 h-4" />
                        )}
                        <span className="capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {software.supportedFeatures.map((feature, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sync Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sync Activities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {syncActivities.map((activity) => {
            const software = accountingSoftware.find(s => s.id === activity.softwareId);
            return (
              <div key={activity.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'error' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{activity.description}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{software?.name}</span>
                        <span>{activity.recordsAffected} record{activity.recordsAffected !== 1 ? 's' : ''}</span>
                        <span>{activity.timestamp.toLocaleString()}</span>
                      </div>
                      {activity.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">{activity.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {activity.action}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Generate Invoice</div>
              <div className="text-sm text-gray-600">Create and sync new invoice</div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ReceiptPercentIcon className="w-6 h-6 text-red-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Record Expense</div>
              <div className="text-sm text-gray-600">Add project expense</div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Financial Report</div>
              <div className="text-sm text-gray-600">Generate P&L report</div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountingSoftwareIntegrations;