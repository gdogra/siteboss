import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  HardDrive,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  description: string;
  trend: number[];
}

const TenantMetricsOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // In production, these would be loaded from the database
      const mockMetrics: MetricCard[] = [
        {
          title: 'Total Tenants',
          value: 247,
          change: 12.5,
          changeType: 'increase',
          icon: Building2,
          description: '+15 this month',
          trend: [45, 52, 48, 61, 55, 67, 71, 76, 82, 89, 92, 98]
        },
        {
          title: 'Active Users',
          value: '12.4K',
          change: 8.2,
          changeType: 'increase',
          icon: Users,
          description: '892 new this week',
          trend: [120, 132, 128, 145, 138, 156, 164, 171, 179, 186, 192, 198]
        },
        {
          title: 'Monthly Revenue',
          value: '$45,230',
          change: 15.3,
          changeType: 'increase',
          icon: DollarSign,
          description: 'ARR: $542K',
          trend: [35000, 37500, 36800, 41200, 39800, 43500, 44200, 45100, 45230]
        },
        {
          title: 'System Uptime',
          value: '99.98%',
          change: 0.02,
          changeType: 'increase',
          icon: Activity,
          description: '< 2min downtime',
          trend: [99.95, 99.97, 99.96, 99.98, 99.98, 99.99, 99.97, 99.98]
        },
        {
          title: 'Storage Used',
          value: '2.8TB',
          change: 22.1,
          changeType: 'increase',
          icon: HardDrive,
          description: 'of 10TB capacity',
          trend: [1.2, 1.4, 1.6, 1.8, 2.1, 2.3, 2.5, 2.6, 2.7, 2.8]
        },
        {
          title: 'Security Events',
          value: 3,
          change: -25.0,
          changeType: 'decrease',
          icon: Shield,
          description: 'All resolved',
          trend: [12, 8, 6, 4, 5, 3, 2, 1, 3, 2, 1, 3]
        }
      ];

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTenantStatusBreakdown = () => {
    return {
      active: 198,
      suspended: 12,
      pending: 24,
      maintenance: 13
    };
  };

  const getTopTenantsByUsage = () => {
    return [
      { name: 'ABC Construction', users: 89, storage: 4.2, plan: 'enterprise' },
      { name: 'Metro Builders', users: 76, storage: 3.8, plan: 'enterprise' },
      { name: 'Elite Contractors', users: 65, storage: 2.9, plan: 'professional' },
      { name: 'Quality Homes', users: 54, storage: 2.1, plan: 'professional' },
      { name: 'Rapid Build Co', users: 43, storage: 1.8, plan: 'professional' }
    ];
  };

  const statusBreakdown = getTenantStatusBreakdown();
  const topTenants = getTopTenantsByUsage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                <div className="flex items-center mt-2">
                  {metric.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${
                    metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Tenant Status Breakdown</span>
            </CardTitle>
            <CardDescription>Current status of all tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{statusBreakdown.active}</span>
                <Badge variant="default">{((statusBreakdown.active / 247) * 100).toFixed(1)}%</Badge>
              </div>
            </div>
            <Progress value={(statusBreakdown.active / 247) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{statusBreakdown.pending}</span>
                <Badge variant="secondary">{((statusBreakdown.pending / 247) * 100).toFixed(1)}%</Badge>
              </div>
            </div>
            <Progress value={(statusBreakdown.pending / 247) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Suspended</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{statusBreakdown.suspended}</span>
                <Badge variant="destructive">{((statusBreakdown.suspended / 247) * 100).toFixed(1)}%</Badge>
              </div>
            </div>
            <Progress value={(statusBreakdown.suspended / 247) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{statusBreakdown.maintenance}</span>
                <Badge variant="outline">{((statusBreakdown.maintenance / 247) * 100).toFixed(1)}%</Badge>
              </div>
            </div>
            <Progress value={(statusBreakdown.maintenance / 247) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Top Tenants by Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Tenants by Usage</span>
            </CardTitle>
            <CardDescription>Highest resource consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTenants.map((tenant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{tenant.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{tenant.plan} plan</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{tenant.users} users</div>
                    <div className="text-xs text-gray-500">{tenant.storage}GB storage</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Create Tenant</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Bulk Operations</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security Scan</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>System Health</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4" />
              <span>Storage Cleanup</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantMetricsOverview;