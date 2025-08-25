import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    monthlyData: { month: string; value: number }[];
  };
  leads: {
    total: number;
    new: number;
    qualified: number;
    conversionRate: number;
    sourceBreakdown: { source: string; count: number; percentage: number }[];
  };
  deals: {
    total: number;
    won: number;
    lost: number;
    inProgress: number;
    avgDealSize: number;
    avgSalesCycle: number;
    winRate: number;
  };
  communications: {
    emails: number;
    calls: number;
    sms: number;
    meetings: number;
    responseRate: number;
    avgResponseTime: number;
  };
  performance: {
    teamStats: { name: string; deals: number; revenue: number; conversion: number }[];
    topPerformers: { name: string; metric: string; value: number }[];
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockData: AnalyticsData = {
      revenue: {
        total: 1247500,
        growth: 23.5,
        monthlyData: [
          { month: 'Jan', value: 980000 },
          { month: 'Feb', value: 1120000 },
          { month: 'Mar', value: 1247500 },
          { month: 'Apr', value: 1385000 },
          { month: 'May', value: 1450000 },
          { month: 'Jun', value: 1520000 }
        ]
      },
      leads: {
        total: 342,
        new: 87,
        qualified: 156,
        conversionRate: 68.5,
        sourceBreakdown: [
          { source: 'Website', count: 145, percentage: 42.4 },
          { source: 'Referrals', count: 89, percentage: 26.0 },
          { source: 'Social Media', count: 56, percentage: 16.4 },
          { source: 'Cold Outreach', count: 35, percentage: 10.2 },
          { source: 'Events', count: 17, percentage: 5.0 }
        ]
      },
      deals: {
        total: 156,
        won: 89,
        lost: 32,
        inProgress: 35,
        avgDealSize: 14250,
        avgSalesCycle: 45,
        winRate: 73.6
      },
      communications: {
        emails: 1248,
        calls: 456,
        sms: 789,
        meetings: 234,
        responseRate: 82.5,
        avgResponseTime: 4.2
      },
      performance: {
        teamStats: [
          { name: 'John Smith', deals: 23, revenue: 327500, conversion: 78.2 },
          { name: 'Sarah Wilson', deals: 19, revenue: 285000, conversion: 71.8 },
          { name: 'Mike Johnson', deals: 17, revenue: 242000, conversion: 69.3 },
          { name: 'Lisa Chen', deals: 15, revenue: 213000, conversion: 65.7 }
        ],
        topPerformers: [
          { name: 'John Smith', metric: 'Revenue', value: 327500 },
          { name: 'Sarah Wilson', metric: 'Conversion Rate', value: 78.2 },
          { name: 'Mike Johnson', metric: 'Deals Closed', value: 23 }
        ]
      }
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading || !analyticsData) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-64 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          {/* Export Button */}
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Revenue */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.total)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(analyticsData.revenue.growth)}
                <span className={`ml-1 text-sm font-medium ${getGrowthColor(analyticsData.revenue.growth)}`}>
                  {formatPercentage(Math.abs(analyticsData.revenue.growth))} from last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.leads.total}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{analyticsData.leads.new} new this period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.deals.winRate)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{analyticsData.deals.won} deals won</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Avg Deal Size */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.deals.avgDealSize)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{analyticsData.deals.avgSalesCycle} days avg cycle</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="space-y-3">
            {analyticsData.revenue.monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(month.value / Math.max(...analyticsData.revenue.monthlyData.map(m => m.value))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    {formatCurrency(month.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {analyticsData.leads.sourceBreakdown.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{source.source}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {source.count}
                  </span>
                  <span className="text-sm text-gray-500 w-10 text-right">
                    {formatPercentage(source.percentage)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Communication Stats */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-gray-600">Emails</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analyticsData.communications.emails}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">Calls</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analyticsData.communications.calls}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">SMS</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analyticsData.communications.sms}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <EyeIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">Meetings</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analyticsData.communications.meetings}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Response Rate</span>
                <span className="text-sm font-bold text-green-600">{formatPercentage(analyticsData.communications.responseRate)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                <span className="text-sm font-bold text-blue-600">{analyticsData.communications.avgResponseTime}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
          <div className="space-y-3">
            {analyticsData.performance.teamStats.map((member, index) => (
              <div key={member.name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{member.name}</span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Deals</span>
                    <p className="font-medium">{member.deals}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue</span>
                    <p className="font-medium">{formatCurrency(member.revenue)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Conv. Rate</span>
                    <p className="font-medium">{formatPercentage(member.conversion)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="bg-white rounded-lg p-6 shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Funnel</h3>
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Leads</span>
                <span className="text-sm font-medium">{analyticsData.leads.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full w-full"></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Qualified Leads</span>
                <span className="text-sm font-medium">{analyticsData.leads.qualified}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-yellow-600 h-3 rounded-full"
                  style={{ width: `${(analyticsData.leads.qualified / analyticsData.leads.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Deals</span>
                <span className="text-sm font-medium">{analyticsData.deals.inProgress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-600 h-3 rounded-full"
                  style={{ width: `${(analyticsData.deals.inProgress / analyticsData.leads.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Closed Won</span>
                <span className="text-sm font-medium">{analyticsData.deals.won}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${(analyticsData.deals.won / analyticsData.leads.total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {formatPercentage((analyticsData.deals.won / analyticsData.leads.total) * 100)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg p-6 shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI-Powered Insights & Recommendations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">🎯 Key Insights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Website leads have the highest conversion rate at 78.5%</li>
              <li>• Average deal size increased by 15% this quarter</li>
              <li>• Response time improved by 23% with new communication tools</li>
              <li>• John Smith is your top performer with 78.2% conversion rate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">🚀 Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Focus more marketing budget on website optimization</li>
              <li>• Implement lead scoring to prioritize high-value prospects</li>
              <li>• Schedule team training sessions to replicate John's success</li>
              <li>• Consider automating follow-up sequences for faster responses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;