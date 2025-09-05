import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface JobCost {
  id: string;
  projectId: string;
  projectName: string;
  budgetedCost: number;
  actualCost: number;
  costVariance: number;
  percentComplete: number;
  estimatedFinalCost: number;
  costCategories: CostCategory[];
  timeEntries: TimeEntry[];
  materialCosts: MaterialCost[];
  equipmentCosts: EquipmentCost[];
  lastUpdated: Date;
}

interface CostCategory {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  committed: number;
  forecast: number;
  variance: number;
  variancePercent: number;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  date: Date;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  taskDescription: string;
  approved: boolean;
}

interface MaterialCost {
  id: string;
  materialName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  invoiceNumber?: string;
  deliveryDate: Date;
  category: string;
}

interface EquipmentCost {
  id: string;
  equipmentName: string;
  type: 'rental' | 'owned' | 'subcontracted';
  dailyRate: number;
  daysUsed: number;
  totalCost: number;
  operator?: string;
  notes?: string;
}

interface CostAlert {
  id: string;
  type: 'budget-overrun' | 'cost-variance' | 'missing-time' | 'invoice-pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  amount?: number;
  threshold?: number;
  actionRequired: string;
  createdAt: Date;
}

const RealTimeJobCosting: React.FC = () => {
  const [jobCosts, setJobCosts] = useState<JobCost[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobCost | null>(null);
  const [costAlerts, setCostAlerts] = useState<CostAlert[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'details' | 'trends' | 'alerts'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadJobCostingData();
  }, []);

  const loadJobCostingData = async () => {
    try {
      setLoading(true);
      const [costData, alertsData] = await Promise.all([
        loadJobCosts(),
        loadCostAlerts()
      ]);
      setJobCosts(costData);
      setCostAlerts(alertsData);
      if (costData.length > 0 && !selectedJob) {
        setSelectedJob(costData[0]);
      }
    } catch (error) {
      console.error('Failed to load job costing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobCosts = async (): Promise<JobCost[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'job-001',
            projectId: 'proj-001',
            projectName: 'Downtown Office Complex',
            budgetedCost: 2850000,
            actualCost: 2456780,
            costVariance: -393220,
            percentComplete: 75,
            estimatedFinalCost: 2987500,
            costCategories: [
              {
                id: 'cat-1',
                name: 'Labor',
                budgeted: 1140000,
                actual: 945600,
                committed: 0,
                forecast: 1210000,
                variance: -194400,
                variancePercent: -17.1
              },
              {
                id: 'cat-2',
                name: 'Materials',
                budgeted: 1140000,
                actual: 1234500,
                committed: 156000,
                forecast: 1390500,
                variance: 94500,
                variancePercent: 8.3
              },
              {
                id: 'cat-3',
                name: 'Equipment',
                budgeted: 285000,
                actual: 156780,
                committed: 45000,
                forecast: 201780,
                variance: -128220,
                variancePercent: -45.0
              },
              {
                id: 'cat-4',
                name: 'Subcontractors',
                budgeted: 285000,
                actual: 119900,
                committed: 185000,
                forecast: 304900,
                variance: 19900,
                variancePercent: 7.0
              }
            ],
            timeEntries: [
              {
                id: 'time-001',
                employeeId: 'emp-001',
                employeeName: 'Mike Johnson',
                role: 'Site Supervisor',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                hours: 8,
                hourlyRate: 85,
                totalCost: 680,
                taskDescription: 'Site supervision and coordination',
                approved: true
              },
              {
                id: 'time-002',
                employeeId: 'emp-002',
                employeeName: 'Carlos Rodriguez',
                role: 'Crane Operator',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                hours: 10,
                hourlyRate: 95,
                totalCost: 950,
                taskDescription: 'Steel beam installation',
                approved: true
              }
            ],
            materialCosts: [
              {
                id: 'mat-001',
                materialName: 'Structural Steel Beams',
                quantity: 25,
                unitCost: 850,
                totalCost: 21250,
                supplier: 'Metro Steel Supply',
                invoiceNumber: 'INV-2024-1234',
                deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                category: 'Structural'
              },
              {
                id: 'mat-002',
                materialName: 'Ready Mix Concrete',
                quantity: 150,
                unitCost: 125,
                totalCost: 18750,
                supplier: 'City Concrete',
                invoiceNumber: 'INV-2024-5678',
                deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                category: 'Concrete'
              }
            ],
            equipmentCosts: [
              {
                id: 'eq-001',
                equipmentName: 'Tower Crane TC-500',
                type: 'rental',
                dailyRate: 1200,
                daysUsed: 45,
                totalCost: 54000,
                operator: 'Carlos Rodriguez',
                notes: 'Monthly rental with operator'
              }
            ],
            lastUpdated: new Date(Date.now() - 15 * 60 * 1000)
          },
          {
            id: 'job-002',
            projectId: 'proj-002',
            projectName: 'Residential Complex Phase 2',
            budgetedCost: 1650000,
            actualCost: 1234567,
            costVariance: -415433,
            percentComplete: 45,
            estimatedFinalCost: 1789000,
            costCategories: [
              {
                id: 'cat-5',
                name: 'Labor',
                budgeted: 660000,
                actual: 456789,
                committed: 0,
                forecast: 723000,
                variance: -203211,
                variancePercent: -30.8
              },
              {
                id: 'cat-6',
                name: 'Materials',
                budgeted: 660000,
                actual: 567890,
                committed: 123000,
                forecast: 690890,
                variance: -92110,
                variancePercent: -14.0
              }
            ],
            timeEntries: [],
            materialCosts: [],
            equipmentCosts: [],
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ]);
      }, 1000);
    });
  };

  const loadCostAlerts = async (): Promise<CostAlert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'alert-001',
            type: 'budget-overrun',
            severity: 'high',
            title: 'Material Costs Over Budget',
            description: 'Material costs are 8.3% over budget for Downtown Office Complex',
            amount: 94500,
            threshold: 5,
            actionRequired: 'Review material pricing and quantities with procurement team',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: 'alert-002',
            type: 'cost-variance',
            severity: 'medium',
            title: 'Equipment Utilization Below Forecast',
            description: 'Equipment costs are significantly under forecast',
            amount: -128220,
            threshold: 10,
            actionRequired: 'Verify equipment utilization and update forecasts',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          },
          {
            id: 'alert-003',
            type: 'missing-time',
            severity: 'medium',
            title: 'Pending Time Entry Approvals',
            description: '15 time entries pending approval from last week',
            actionRequired: 'Review and approve pending time entries',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]);
      }, 600);
    });
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadJobCostingData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
    if (variance < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Job Costing</h2>
            <p className="text-gray-600">Live cost tracking with budget variance analysis and forecasting</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedJob?.id || ''}
            onChange={(e) => {
              const job = jobCosts.find(j => j.id === e.target.value);
              setSelectedJob(job || null);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {jobCosts.map(job => (
              <option key={job.id} value={job.id}>
                {job.projectName}
              </option>
            ))}
          </select>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {selectedJob && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Actual Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedJob.actualCost)}
                  </p>
                  <p className="text-sm text-gray-600">
                    of {formatCurrency(selectedJob.budgetedCost)} budget
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Cost Variance</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${getVarianceColor(selectedJob.costVariance)}`}>
                      {formatCurrency(Math.abs(selectedJob.costVariance))}
                    </p>
                    {getVarianceIcon(selectedJob.costVariance)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {((selectedJob.costVariance / selectedJob.budgetedCost) * 100).toFixed(1)}% variance
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Forecast at Completion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedJob.estimatedFinalCost)}
                  </p>
                  <p className={`text-sm ${getVarianceColor(selectedJob.estimatedFinalCost - selectedJob.budgetedCost)}`}>
                    {formatCurrency(Math.abs(selectedJob.estimatedFinalCost - selectedJob.budgetedCost))} 
                    {selectedJob.estimatedFinalCost > selectedJob.budgetedCost ? ' over' : ' under'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedJob.percentComplete}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${selectedJob.percentComplete}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'overview', name: 'Cost Overview', icon: ChartBarIcon },
                  { id: 'details', name: 'Cost Details', icon: DocumentTextIcon },
                  { id: 'trends', name: 'Trends & Forecasting', icon: ArrowTrendingUpIcon },
                  { id: 'alerts', name: 'Cost Alerts', icon: ExclamationTriangleIcon, count: costAlerts.length }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedView(tab.id as any)}
                      className={`${
                        selectedView === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.name}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview */}
              {selectedView === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Cost Category Breakdown</h3>
                    <p className="text-sm text-gray-500">
                      Last updated: {selectedJob.lastUpdated.toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cost Categories Table */}
                    <div>
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Budget
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actual
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedJob.costCategories.map((category) => (
                              <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatCurrency(category.budgeted)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatCurrency(category.actual)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className={getVarianceColor(category.variance)}>
                                      {formatCurrency(Math.abs(category.variance))}
                                    </span>
                                    <span className={`text-xs ${getVarianceColor(category.variance)}`}>
                                      ({category.variancePercent.toFixed(1)}%)
                                    </span>
                                    {getVarianceIcon(category.variance)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Visual Progress */}
                    <div className="space-y-4">
                      {selectedJob.costCategories.map((category) => {
                        const percentSpent = (category.actual / category.budgeted) * 100;
                        return (
                          <div key={category.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">{category.name}</span>
                              <span className="text-sm text-gray-600">
                                {percentSpent.toFixed(1)}% of budget
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                              <div
                                className={`h-3 rounded-full ${
                                  percentSpent > 100 ? 'bg-red-500' :
                                  percentSpent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(percentSpent, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{formatCurrency(category.actual)}</span>
                              <span>{formatCurrency(category.budgeted)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Details */}
              {selectedView === 'details' && (
                <div className="space-y-8">
                  {/* Time Entries */}
                  {selectedJob.timeEntries.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <UserGroupIcon className="h-5 w-5 text-blue-500" />
                        <h4 className="text-lg font-medium text-gray-900">Recent Time Entries</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedJob.timeEntries.map((entry) => (
                              <tr key={entry.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {entry.employeeName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{entry.role}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {entry.date.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{entry.hours}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {formatCurrency(entry.hourlyRate)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {formatCurrency(entry.totalCost)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    entry.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {entry.approved ? 'Approved' : 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Material Costs */}
                  {selectedJob.materialCosts.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <BuildingStorefrontIcon className="h-5 w-5 text-green-500" />
                        <h4 className="text-lg font-medium text-gray-900">Material Costs</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedJob.materialCosts.map((material) => (
                              <tr key={material.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {material.materialName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{material.quantity}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {formatCurrency(material.unitCost)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {formatCurrency(material.totalCost)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{material.supplier}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {material.deliveryDate.toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Equipment Costs */}
                  {selectedJob.equipmentCosts.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <TruckIcon className="h-5 w-5 text-purple-500" />
                        <h4 className="text-lg font-medium text-gray-900">Equipment Costs</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Used</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedJob.equipmentCosts.map((equipment) => (
                              <tr key={equipment.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {equipment.equipmentName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                                  {equipment.type}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {formatCurrency(equipment.dailyRate)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{equipment.daysUsed}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {formatCurrency(equipment.totalCost)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {equipment.operator || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trends */}
              {selectedView === 'trends' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Cost Trends & Forecasting</h3>
                  
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Cost Trend Chart</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive cost trends and forecasting visualization would be displayed here
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Performance Indicators</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost Performance Index (CPI):</span>
                          <span className="font-medium text-green-600">1.16</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Schedule Performance Index (SPI):</span>
                          <span className="font-medium text-yellow-600">0.95</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimate at Completion (EAC):</span>
                          <span className="font-medium">{formatCurrency(selectedJob.estimatedFinalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Variance at Completion (VAC):</span>
                          <span className={`font-medium ${getVarianceColor(selectedJob.estimatedFinalCost - selectedJob.budgetedCost)}`}>
                            {formatCurrency(selectedJob.estimatedFinalCost - selectedJob.budgetedCost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Forecast Accuracy</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Historical Accuracy:</span>
                          <span className="font-medium">94.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence Level:</span>
                          <span className="font-medium">High</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Model Update:</span>
                          <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {selectedView === 'alerts' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Cost Alerts & Notifications</h3>
                  
                  {costAlerts.map((alert) => (
                    <div key={alert.id} className={`border-l-4 rounded-r-lg p-4 ${
                      alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ExclamationTriangleIcon className={`h-5 w-5 ${
                              alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'high' ? 'text-orange-500' :
                              alert.severity === 'medium' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{alert.description}</p>
                          
                          {alert.amount && (
                            <p className="text-sm font-medium mb-2">
                              Amount: {formatCurrency(Math.abs(alert.amount))}
                              {alert.threshold && ` (Threshold: ${alert.threshold}%)`}
                            </p>
                          )}
                          
                          <div className="bg-white bg-opacity-50 p-2 rounded">
                            <p className="text-sm font-medium text-gray-800">Action Required:</p>
                            <p className="text-sm text-gray-700">{alert.actionRequired}</p>
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-2">
                            Created: {alert.createdAt.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button className="p-2 text-gray-500 hover:text-gray-700" title="View Details">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RealTimeJobCosting;