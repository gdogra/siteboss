import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ProjectProfitability {
  id: string;
  name: string;
  client: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'on_hold';
  contractValue: number;
  actualCosts: number;
  projectedCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  laborCosts: number;
  materialCosts: number;
  equipmentCosts: number;
  overheadCosts: number;
  changeOrders: number;
  hoursWorked: number;
  budgetVariance: number;
  scheduleVariance: number;
  profitTrend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ProfitabilityMetrics {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  averageProjectMargin: number;
  profitPerEmployee: number;
  profitPerHour: number;
  costBreakdown: {
    labor: number;
    materials: number;
    equipment: number;
    overhead: number;
  };
  monthlyTrends: MonthlyTrend[];
  quarterlyComparison: QuarterlyData[];
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  costs: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
  projectsCompleted: number;
}

interface QuarterlyData {
  quarter: string;
  revenue: number;
  profit: number;
  margin: number;
  projects: number;
}

interface ClientProfitability {
  clientName: string;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  projectCount: number;
  averageProjectSize: number;
  riskScore: number;
}

interface ProfitabilityAlert {
  id: string;
  type: 'margin_decline' | 'cost_overrun' | 'revenue_risk' | 'profit_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  projectId?: string;
  impact: number;
  recommendation: string;
  isActive: boolean;
  createdDate: Date;
}

const ProfitabilityAnalyticsDashboard: React.FC = () => {
  const [projects, setProjects] = useState<ProjectProfitability[]>([]);
  const [metrics, setMetrics] = useState<ProfitabilityMetrics | null>(null);
  const [clientProfitability, setClientProfitability] = useState<ClientProfitability[]>([]);
  const [alerts, setAlerts] = useState<ProfitabilityAlert[]>([]);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedProject, setSelectedProject] = useState<ProjectProfitability | null>(null);

  useEffect(() => {
    // Generate mock data
    const mockProjects: ProjectProfitability[] = [
      {
        id: '1',
        name: 'Downtown Office Renovation',
        client: 'Metro Properties LLC',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        status: 'active',
        contractValue: 850000,
        actualCosts: 620000,
        projectedCosts: 680000,
        grossProfit: 230000,
        grossProfitMargin: 27.1,
        netProfit: 170000,
        netProfitMargin: 20.0,
        laborCosts: 380000,
        materialCosts: 180000,
        equipmentCosts: 60000,
        overheadCosts: 60000,
        changeOrders: 25000,
        hoursWorked: 3200,
        budgetVariance: -40000,
        scheduleVariance: 5,
        profitTrend: 'stable',
        riskLevel: 'medium'
      },
      {
        id: '2',
        name: 'Residential Complex Phase 1',
        client: 'Sunshine Developments',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-15'),
        status: 'active',
        contractValue: 1200000,
        actualCosts: 780000,
        projectedCosts: 950000,
        grossProfit: 420000,
        grossProfitMargin: 35.0,
        netProfit: 250000,
        netProfitMargin: 20.8,
        laborCosts: 480000,
        materialCosts: 280000,
        equipmentCosts: 120000,
        overheadCosts: 70000,
        changeOrders: 50000,
        hoursWorked: 4800,
        budgetVariance: 20000,
        scheduleVariance: -10,
        profitTrend: 'increasing',
        riskLevel: 'low'
      },
      {
        id: '3',
        name: 'Warehouse Expansion',
        client: 'Industrial Solutions Inc',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-03-30'),
        status: 'completed',
        contractValue: 650000,
        actualCosts: 520000,
        projectedCosts: 520000,
        grossProfit: 130000,
        grossProfitMargin: 20.0,
        netProfit: 85000,
        netProfitMargin: 13.1,
        laborCosts: 320000,
        materialCosts: 150000,
        equipmentCosts: 50000,
        overheadCosts: 45000,
        changeOrders: 0,
        hoursWorked: 2600,
        budgetVariance: 0,
        scheduleVariance: 0,
        profitTrend: 'stable',
        riskLevel: 'low'
      }
    ];

    const mockMetrics: ProfitabilityMetrics = {
      totalRevenue: 2700000,
      totalCosts: 1920000,
      grossProfit: 780000,
      netProfit: 505000,
      grossMargin: 28.9,
      netMargin: 18.7,
      averageProjectMargin: 22.8,
      profitPerEmployee: 25250,
      profitPerHour: 47.8,
      costBreakdown: {
        labor: 58.5,
        materials: 22.8,
        equipment: 11.5,
        overhead: 7.2
      },
      monthlyTrends: [
        { month: 'Jan', revenue: 220000, costs: 165000, grossProfit: 55000, netProfit: 38500, margin: 17.5, projectsCompleted: 2 },
        { month: 'Feb', revenue: 240000, costs: 175000, grossProfit: 65000, netProfit: 45500, margin: 19.0, projectsCompleted: 1 },
        { month: 'Mar', revenue: 280000, costs: 190000, grossProfit: 90000, netProfit: 63000, margin: 22.5, projectsCompleted: 3 },
        { month: 'Apr', revenue: 260000, costs: 180000, grossProfit: 80000, netProfit: 56000, margin: 21.5, projectsCompleted: 2 },
        { month: 'May', revenue: 290000, costs: 195000, grossProfit: 95000, netProfit: 66500, margin: 22.9, projectsCompleted: 2 },
        { month: 'Jun', revenue: 310000, costs: 205000, grossProfit: 105000, netProfit: 73500, margin: 23.7, projectsCompleted: 3 }
      ],
      quarterlyComparison: [
        { quarter: 'Q1 2023', revenue: 680000, profit: 119000, margin: 17.5, projects: 5 },
        { quarter: 'Q2 2023', revenue: 720000, profit: 144000, margin: 20.0, projects: 6 },
        { quarter: 'Q3 2023', revenue: 780000, profit: 156000, margin: 20.0, projects: 7 },
        { quarter: 'Q4 2023', revenue: 820000, profit: 172200, margin: 21.0, projects: 8 },
        { quarter: 'Q1 2024', revenue: 740000, profit: 147000, margin: 19.9, projects: 6 },
        { quarter: 'Q2 2024', revenue: 860000, profit: 196000, margin: 22.8, projects: 7 }
      ]
    };

    const mockClientProfitability: ClientProfitability[] = [
      {
        clientName: 'Metro Properties LLC',
        totalRevenue: 1250000,
        totalProfit: 237500,
        profitMargin: 19.0,
        projectCount: 3,
        averageProjectSize: 416667,
        riskScore: 2.1
      },
      {
        clientName: 'Sunshine Developments',
        totalRevenue: 2400000,
        totalProfit: 504000,
        profitMargin: 21.0,
        projectCount: 5,
        averageProjectSize: 480000,
        riskScore: 1.8
      },
      {
        clientName: 'Industrial Solutions Inc',
        totalRevenue: 980000,
        totalProfit: 147000,
        profitMargin: 15.0,
        projectCount: 2,
        averageProjectSize: 490000,
        riskScore: 2.5
      }
    ];

    const mockAlerts: ProfitabilityAlert[] = [
      {
        id: '1',
        type: 'margin_decline',
        severity: 'medium',
        title: 'Declining Profit Margin',
        description: 'Downtown Office Renovation project showing 5% margin decline over past month due to material cost increases.',
        projectId: '1',
        impact: -42500,
        recommendation: 'Review material suppliers and negotiate change orders for cost increases.',
        isActive: true,
        createdDate: new Date('2024-02-20')
      },
      {
        id: '2',
        type: 'cost_overrun',
        severity: 'high',
        title: 'Labor Cost Overrun',
        description: 'Warehouse Expansion exceeded labor budget by 15% due to overtime and weather delays.',
        projectId: '3',
        impact: -48000,
        recommendation: 'Implement stricter labor tracking and weather contingency planning.',
        isActive: true,
        createdDate: new Date('2024-02-18')
      }
    ];

    setProjects(mockProjects);
    setMetrics(mockMetrics);
    setClientProfitability(mockClientProfitability);
    setAlerts(mockAlerts);
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      case 'stable': return <div className="w-4 h-4 border-t-2 border-gray-400"></div>;
      default: return null;
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

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const averageMargin = projects.reduce((acc, p) => acc + p.netProfitMargin, 0) / projects.length;
  const totalActiveValue = projects.filter(p => p.status === 'active').reduce((acc, p) => acc + p.contractValue, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profitability Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="12m">12 Months</option>
            <option value="24m">24 Months</option>
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
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${metrics?.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Profit</dt>
                  <dd className="text-lg font-medium text-gray-900">${metrics?.netProfit.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Net Margin</dt>
                  <dd className="text-lg font-medium text-gray-900">{metrics?.netMargin.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                  <dd className="text-lg font-medium text-gray-900">{activeProjects}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(alert => alert.isActive).length > 0 && (
        <div className="space-y-3">
          {alerts.filter(alert => alert.isActive).map((alert) => (
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
                    <span>Financial Impact: {alert.impact >= 0 ? '+' : ''}${alert.impact.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800">Recommendation:</p>
                    <p className="text-sm text-yellow-700">{alert.recommendation}</p>
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
          {['overview', 'projects', 'clients', 'trends', 'costs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' ? 'Overview' : 
               tab === 'projects' ? 'Project Analysis' : 
               tab === 'clients' ? 'Client Profitability' : 
               tab === 'trends' ? 'Performance Trends' : 'Cost Analysis'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Profit Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Gross Profit</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">${metrics.grossProfit.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">({metrics.grossMargin.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Net Profit</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">${metrics.netProfit.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">({metrics.netMargin.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Profit per Employee</span>
                  <span className="text-lg font-bold text-purple-600">${metrics.profitPerEmployee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Profit per Hour</span>
                  <span className="text-lg font-bold text-indigo-600">${metrics.profitPerHour.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Labor</span>
                    <span className="text-sm font-bold">{metrics.costBreakdown.labor}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.costBreakdown.labor}%` }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Materials</span>
                    <span className="text-sm font-bold">{metrics.costBreakdown.materials}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics.costBreakdown.materials}%` }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Equipment</span>
                    <span className="text-sm font-bold">{metrics.costBreakdown.equipment}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${metrics.costBreakdown.equipment}%` }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Overhead</span>
                    <span className="text-sm font-bold">{metrics.costBreakdown.overhead}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: `${metrics.costBreakdown.overhead}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends Chart Placeholder */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Profit Trends</h3>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Chart visualization showing monthly revenue, costs, and profit trends</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Project Profitability Analysis</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Costs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Profit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Margin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.client}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${project.contractValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${project.actualCosts.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          ${project.grossProfit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className={`font-medium ${project.netProfitMargin >= 20 ? 'text-green-600' : project.netProfitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {project.netProfitMargin.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTrendIcon(project.profitTrend)}
                            <span className="ml-1 text-xs text-gray-500 capitalize">{project.profitTrend}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                            {project.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Client Profitability Analysis</h3>
            <div className="space-y-4">
              {clientProfitability.map((client, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg">{client.clientName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{client.projectCount} projects</span>
                        <span>Avg project size: ${client.averageProjectSize.toLocaleString()}</span>
                        <span>Risk score: {client.riskScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold">${client.totalRevenue.toLocaleString()}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">${client.totalProfit.toLocaleString()}</span>
                        <span className={`text-sm font-medium ${client.profitMargin >= 20 ? 'text-green-600' : client.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          ({client.profitMargin.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${client.profitMargin >= 20 ? 'bg-green-600' : client.profitMargin >= 15 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${Math.min(client.profitMargin * 4, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Performance</h3>
              <div className="space-y-3">
                {metrics.monthlyTrends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{month.month}</div>
                      <div className="text-sm text-gray-500">{month.projectsCompleted} projects completed</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${month.revenue.toLocaleString()}</div>
                      <div className={`text-sm font-medium ${month.margin >= 20 ? 'text-green-600' : month.margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {month.margin.toFixed(1)}% margin
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quarterly Comparison</h3>
              <div className="space-y-3">
                {metrics.quarterlyComparison.map((quarter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{quarter.quarter}</div>
                      <div className="text-sm text-gray-500">{quarter.projects} projects</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${quarter.revenue.toLocaleString()}</div>
                      <div className={`text-sm font-medium ${quarter.margin >= 20 ? 'text-green-600' : quarter.margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {quarter.margin.toFixed(1)}% margin
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cost Analysis by Project</h3>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <span className={`text-sm ${project.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {project.budgetVariance >= 0 ? '+' : ''}${project.budgetVariance.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Labor: ${project.laborCosts.toLocaleString()}</div>
                      <div>Materials: ${project.materialCosts.toLocaleString()}</div>
                      <div>Equipment: ${project.equipmentCosts.toLocaleString()}</div>
                      <div>Overhead: ${project.overheadCosts.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cost Optimization Opportunities</h3>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <h5 className="font-medium text-yellow-800">Labor Efficiency</h5>
                  <p className="text-sm text-yellow-700">Optimize crew scheduling to reduce overtime costs by 12%</p>
                  <p className="text-xs text-yellow-600">Potential savings: $45,000/month</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <h5 className="font-medium text-blue-800">Material Procurement</h5>
                  <p className="text-sm text-blue-700">Bulk purchasing agreements could reduce material costs by 8%</p>
                  <p className="text-xs text-blue-600">Potential savings: $28,000/month</p>
                </div>
                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <h5 className="font-medium text-green-800">Equipment Utilization</h5>
                  <p className="text-sm text-green-700">Better equipment sharing between projects could save 15%</p>
                  <p className="text-xs text-green-600">Potential savings: $18,000/month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-gray-600">{selectedProject.client}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Financial Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Contract Value:</span>
                        <span className="font-medium">${selectedProject.contractValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual Costs:</span>
                        <span className="font-medium">${selectedProject.actualCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected Costs:</span>
                        <span className="font-medium">${selectedProject.projectedCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Net Profit:</span>
                        <span className="font-bold text-green-600">${selectedProject.netProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Margin:</span>
                        <span className="font-bold">{selectedProject.netProfitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Project Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span>{selectedProject.startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span>{selectedProject.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hours Worked:</span>
                        <span>{selectedProject.hoursWorked.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change Orders:</span>
                        <span>${selectedProject.changeOrders.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Cost Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Labor:</span>
                        <span className="font-medium">${selectedProject.laborCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Materials:</span>
                        <span className="font-medium">${selectedProject.materialCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment:</span>
                        <span className="font-medium">${selectedProject.equipmentCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overhead:</span>
                        <span className="font-medium">${selectedProject.overheadCosts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Performance Indicators</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Budget Variance:</span>
                        <span className={`font-medium ${selectedProject.budgetVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProject.budgetVariance >= 0 ? '+' : ''}${selectedProject.budgetVariance.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Schedule Variance:</span>
                        <span className={`font-medium ${selectedProject.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProject.scheduleVariance >= 0 ? '+' : ''}{selectedProject.scheduleVariance} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(selectedProject.riskLevel)}`}>
                          {selectedProject.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitabilityAnalyticsDashboard;