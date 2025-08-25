import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UsersIcon,
  FolderOpenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  projects: {
    total: number;
    active: number;
    completed: number;
    onTime: number;
    delayed: number;
  };
  budget: {
    totalBudget: number;
    totalSpent: number;
    savings: number;
    overBudget: number;
  };
  time: {
    totalHours: number;
    billableHours: number;
    avgHoursPerProject: number;
  };
  team: {
    totalUsers: number;
    activeUsers: number;
    productivity: number;
  };
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockData: ReportData = {
      projects: {
        total: 12,
        active: 8,
        completed: 4,
        onTime: 3,
        delayed: 1
      },
      budget: {
        totalBudget: 1250000,
        totalSpent: 875000,
        savings: 375000,
        overBudget: 2
      },
      time: {
        totalHours: 2480,
        billableHours: 2200,
        avgHoursPerProject: 206
      },
      team: {
        totalUsers: 15,
        activeUsers: 12,
        productivity: 85
      }
    };

    setTimeout(() => {
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'projects', name: 'Project Performance', icon: FolderOpenIcon },
    { id: 'budget', name: 'Budget Analysis', icon: CurrencyDollarIcon },
    { id: 'time', name: 'Time Tracking', icon: ClockIcon },
    { id: 'team', name: 'Team Productivity', icon: UsersIcon }
  ];

  const handleExportReport = () => {
    // In a real app, this would generate and download the report
    alert('Report export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights into your construction projects
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3">
          <nav className="flex space-x-8" aria-label="Tabs">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`${
                  selectedReport === report.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <report.icon className="h-4 w-4 mr-2" />
                {report.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Dashboard */}
      {selectedReport === 'overview' && reportData && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Projects Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderOpenIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reportData.projects.active}/{reportData.projects.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {reportData.projects.onTime} on time
                </span>
                <span className="text-gray-500 mx-2">•</span>
                <span className="text-red-600 font-medium">
                  {reportData.projects.delayed} delayed
                </span>
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Budget Utilization
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round((reportData.budget.totalSpent / reportData.budget.totalBudget) * 100)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-gray-600">
                  {formatCurrency(reportData.budget.totalSpent)} of {formatCurrency(reportData.budget.totalBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Hours
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reportData.time.totalHours.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {reportData.time.billableHours.toLocaleString()} billable
                </span>
              </div>
            </div>
          </div>

          {/* Team Productivity */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Team Productivity
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reportData.team.productivity}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-gray-600">
                  {reportData.team.activeUsers}/{reportData.team.totalUsers} active users
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Reports */}
      {selectedReport !== 'overview' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {reportTypes.find(r => r.id === selectedReport)?.name} Report
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Detailed {selectedReport} analytics and charts would be displayed here.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleExportReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
                  Export {reportTypes.find(r => r.id === selectedReport)?.name} Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Insights
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Projects Completed On Time
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {reportData && Math.round((reportData.projects.onTime / reportData.projects.completed) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Average Cost Savings
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {reportData && formatCurrency(reportData.budget.savings / reportData.projects.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">
                    Avg Hours per Project
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {reportData && Math.round(reportData.time.avgHoursPerProject)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;