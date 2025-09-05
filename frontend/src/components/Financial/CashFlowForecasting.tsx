import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  TruckIcon,
  BoltIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface CashFlowProjection {
  date: Date;
  inflows: CashInflow[];
  outflows: CashOutflow[];
  netCashFlow: number;
  cumulativeCashFlow: number;
  projectedBalance: number;
  confidence: number;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

interface CashInflow {
  id: string;
  source: 'progress_payment' | 'final_payment' | 'retention_release' | 'change_order' | 'other';
  projectId: string;
  projectName: string;
  amount: number;
  expectedDate: Date;
  actualDate?: Date;
  probability: number;
  status: 'pending' | 'confirmed' | 'received' | 'overdue';
  milestoneId?: string;
  invoiceId?: string;
}

interface CashOutflow {
  id: string;
  category: 'labor' | 'materials' | 'equipment' | 'overhead' | 'subcontractors' | 'insurance' | 'permits' | 'other';
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'scheduled' | 'paid' | 'overdue';
  recurring: boolean;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  projectId?: string;
  vendorId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface CashFlowAlert {
  id: string;
  type: 'cash_shortage' | 'payment_delay' | 'large_expense' | 'milestone_risk' | 'seasonal_impact';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  projectedDate: Date;
  impact: number;
  recommendations: string[];
  isActive: boolean;
}

interface ScenarioAnalysis {
  name: string;
  probability: number;
  assumptions: string[];
  netCashFlow: number;
  minimumBalance: number;
  maxDeficit: number;
  recovery: Date | null;
}

const CashFlowForecasting: React.FC = () => {
  const [projections, setProjections] = useState<CashFlowProjection[]>([]);
  const [inflows, setInflows] = useState<CashInflow[]>([]);
  const [outflows, setOutflows] = useState<CashOutflow[]>([]);
  const [alerts, setAlerts] = useState<CashFlowAlert[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('3m');
  const [scenario, setScenario] = useState('realistic');
  const [currentBalance] = useState(125000);

  useEffect(() => {
    // Generate mock data
    const generateProjections = (): CashFlowProjection[] => {
      const projections = [];
      let cumulativeFlow = currentBalance;
      
      for (let i = 0; i < 26; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (i * 7));
        
        const weeklyInflows: CashInflow[] = [];
        if (i % 4 === 0) {
          weeklyInflows.push({
            id: `inflow-${i}`,
            source: 'progress_payment',
            projectId: 'proj-1',
            projectName: 'Downtown Office Renovation',
            amount: 45000,
            expectedDate: date,
            probability: 0.85,
            status: 'pending'
          });
        }
        
        const weeklyOutflows: CashOutflow[] = [
          {
            id: `outflow-labor-${i}`,
            category: 'labor',
            description: 'Weekly payroll',
            amount: 25000,
            dueDate: date,
            status: 'pending',
            recurring: true,
            frequency: 'weekly',
            priority: 'high'
          }
        ];

        if (i % 2 === 0) {
          weeklyOutflows.push({
            id: `outflow-materials-${i}`,
            category: 'materials',
            description: 'Material delivery payment',
            amount: 15000,
            dueDate: date,
            status: 'pending',
            recurring: true,
            frequency: 'biweekly',
            priority: 'medium'
          });
        }

        const totalInflows = weeklyInflows.reduce((sum, inflow) => sum + inflow.amount, 0);
        const totalOutflows = weeklyOutflows.reduce((sum, outflow) => sum + outflow.amount, 0);
        const netFlow = totalInflows - totalOutflows;
        cumulativeFlow += netFlow;

        projections.push({
          date,
          inflows: weeklyInflows,
          outflows: weeklyOutflows,
          netCashFlow: netFlow,
          cumulativeCashFlow: cumulativeFlow,
          projectedBalance: cumulativeFlow,
          confidence: Math.max(0.5, 1 - (i * 0.02)),
          scenarios: {
            optimistic: cumulativeFlow * 1.2,
            realistic: cumulativeFlow,
            pessimistic: cumulativeFlow * 0.8
          }
        });
      }
      
      return projections;
    };

    const mockInflows: CashInflow[] = [
      {
        id: '1',
        source: 'progress_payment',
        projectId: 'proj-1',
        projectName: 'Downtown Office Renovation',
        amount: 75000,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        probability: 0.9,
        status: 'confirmed',
        milestoneId: 'milestone-1',
        invoiceId: 'inv-001'
      },
      {
        id: '2',
        source: 'retention_release',
        projectId: 'proj-2',
        projectName: 'Residential Complex Phase 1',
        amount: 25000,
        expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        probability: 0.95,
        status: 'pending'
      }
    ];

    const mockOutflows: CashOutflow[] = [
      {
        id: '1',
        category: 'labor',
        description: 'Weekly payroll - All projects',
        amount: 85000,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        recurring: true,
        frequency: 'weekly',
        priority: 'critical'
      },
      {
        id: '2',
        category: 'materials',
        description: 'Steel delivery - Downtown project',
        amount: 35000,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        recurring: false,
        projectId: 'proj-1',
        priority: 'high'
      }
    ];

    const mockAlerts: CashFlowAlert[] = [
      {
        id: '1',
        type: 'cash_shortage',
        severity: 'high',
        title: 'Potential Cash Shortage',
        description: 'Projected cash balance may drop below $50k in week 8 due to delayed progress payment.',
        projectedDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
        impact: -45000,
        recommendations: [
          'Expedite invoice processing for Downtown project',
          'Consider short-term line of credit',
          'Negotiate payment terms with key vendors'
        ],
        isActive: true
      }
    ];

    const mockScenarios: ScenarioAnalysis[] = [
      {
        name: 'Optimistic',
        probability: 0.2,
        assumptions: ['All payments received on time', '10% bonus on key projects', 'No weather delays'],
        netCashFlow: 250000,
        minimumBalance: 75000,
        maxDeficit: 0,
        recovery: null
      },
      {
        name: 'Realistic',
        probability: 0.6,
        assumptions: ['Standard payment delays of 7-10 days', 'Normal operating expenses', 'Minor weather impacts'],
        netCashFlow: 185000,
        minimumBalance: 35000,
        maxDeficit: -15000,
        recovery: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Pessimistic',
        probability: 0.2,
        assumptions: ['30+ day payment delays', 'Material cost increases of 15%', 'Major weather delays'],
        netCashFlow: 95000,
        minimumBalance: -25000,
        maxDeficit: -65000,
        recovery: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
      }
    ];

    setProjections(generateProjections());
    setInflows(mockInflows);
    setOutflows(mockOutflows);
    setAlerts(mockAlerts);
    setScenarios(mockScenarios);
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'confirmed':
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpectedInflows = inflows.reduce((sum, inflow) => sum + inflow.amount, 0);
  const totalPendingOutflows = outflows.filter(o => o.status === 'pending' || o.status === 'scheduled').reduce((sum, outflow) => sum + outflow.amount, 0);
  const activeAlerts = alerts.filter(alert => alert.isActive);
  const minimumProjectedBalance = Math.min(...projections.map(p => p.projectedBalance));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Cash Flow Forecasting</h1>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="12m">12 Months</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Current Balance</dt>
                  <dd className="text-lg font-medium text-gray-900">${currentBalance.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expected Inflows</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalExpectedInflows.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Outflows</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalPendingOutflows.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {minimumProjectedBalance >= 0 ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Min Projected Balance</dt>
                  <dd className={`text-lg font-medium ${minimumProjectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${minimumProjectedBalance.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-yellow-800">{alert.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">{alert.description}</p>
                  <div className="text-sm text-yellow-600 mt-1">
                    <span>Projected Impact: {alert.impact >= 0 ? '+' : ''}${alert.impact.toLocaleString()}</span>
                    <span className="ml-4">Date: {alert.projectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800">Recommendations:</p>
                    <ul className="text-sm text-yellow-700 mt-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'projections', 'inflows', 'outflows', 'scenarios'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'dashboard' ? 'Dashboard' : 
               tab === 'projections' ? 'Projections' : 
               tab === 'inflows' ? 'Inflows' : 
               tab === 'outflows' ? 'Outflows' : 'Scenarios'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Chart Placeholder */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Cash Flow Projection</h3>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="optimistic">Optimistic</option>
                  <option value="realistic">Realistic</option>
                  <option value="pessimistic">Pessimistic</option>
                </select>
              </div>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would appear here</p>
              </div>
            </div>
          </div>

          {/* Upcoming Critical Payments */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Critical Payments</h3>
              <div className="space-y-3">
                {outflows
                  .filter(outflow => outflow.priority === 'critical' || outflow.priority === 'high')
                  .slice(0, 5)
                  .map((outflow) => (
                  <div key={outflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{outflow.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Due: {outflow.dueDate.toLocaleDateString()}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(outflow.priority)}`}>
                          {outflow.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${outflow.amount.toLocaleString()}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(outflow.status)}`}>
                        {outflow.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projections' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Detailed Cash Flow Projections</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflows</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outflows</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Flow</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projections.slice(0, 12).map((projection, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {projection.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        +${projection.inflows.reduce((sum, inflow) => sum + inflow.amount, 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -${projection.outflows.reduce((sum, outflow) => sum + outflow.amount, 0).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${projection.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {projection.netCashFlow >= 0 ? '+' : ''}${projection.netCashFlow.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${projection.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${projection.projectedBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${projection.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{(projection.confidence * 100).toFixed(0)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inflows' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Expected Cash Inflows</h3>
            <div className="space-y-4">
              {inflows.map((inflow) => (
                <div key={inflow.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">{inflow.projectName}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {inflow.source.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(inflow.status)}`}>
                          {inflow.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Expected: {inflow.expectedDate.toLocaleDateString()}</span>
                        <span>Probability: {(inflow.probability * 100).toFixed(0)}%</span>
                        {inflow.invoiceId && <span>Invoice: {inflow.invoiceId}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+${inflow.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'outflows' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Scheduled Cash Outflows</h3>
            <div className="space-y-4">
              {outflows.map((outflow) => (
                <div key={outflow.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">{outflow.description}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {outflow.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(outflow.priority)}`}>
                          {outflow.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(outflow.status)}`}>
                          {outflow.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Due: {outflow.dueDate.toLocaleDateString()}</span>
                        {outflow.recurring && (
                          <span>Recurring: {outflow.frequency}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">-${outflow.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Scenario Analysis</h3>
              <div className="space-y-4">
                {scenarios.map((scenarioData, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{scenarioData.name}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {(scenarioData.probability * 100).toFixed(0)}% probability
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Net Cash Flow</p>
                          <p className={`text-lg font-bold ${scenarioData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${scenarioData.netCashFlow.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Min Balance</p>
                          <p className={`text-lg font-bold ${scenarioData.minimumBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${scenarioData.minimumBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {scenarioData.maxDeficit < 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800">Max Deficit: ${Math.abs(scenarioData.maxDeficit).toLocaleString()}</p>
                          {scenarioData.recovery && (
                            <p className="text-xs text-red-600">Recovery by: {scenarioData.recovery.toLocaleDateString()}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-1">Key Assumptions:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {scenarioData.assumptions.map((assumption, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {assumption}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowForecasting;