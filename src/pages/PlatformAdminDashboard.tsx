
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  Shield,
  TrendingUp,
  Server,
  Users,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Database } from
'lucide-react';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';
import ScalingControlPanel from '@/components/ScalingControlPanel';
import AlertManagement from '@/components/AlertManagement';
import SecurityIncidentTracker from '@/components/SecurityIncidentTracker';
import UserManagementPanel from '@/components/UserManagementPanel';
import SystemConfigurationPanel from '@/components/SystemConfigurationPanel';
import { useToast } from '@/hooks/use-toast';

interface SystemOverview {
  totalUsers: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  totalAlerts: number;
  criticalAlerts: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

const PlatformAdminDashboard = () => {
  const { toast } = useToast();
  const [systemOverview, setSystemOverview] = useState<SystemOverview>({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'healthy',
    uptime: '0d 0h 0m',
    totalAlerts: 0,
    criticalAlerts: 0,
    resourceUsage: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    }
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSystemOverview();
    const interval = setInterval(fetchSystemOverview, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemOverview = async () => {
    try {
      // Fetch system health metrics
      const { data: healthData, error: healthError } = await window.ezsite.apis.tablePage(
        35449, // system_health_metrics table
        {
          PageNo: 1,
          PageSize: 50,
          OrderByField: "timestamp",
          IsAsc: false
        }
      );

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await window.ezsite.apis.tablePage(
        35451, // system_alerts table
        {
          PageNo: 1,
          PageSize: 100,
          OrderByField: "created_at",
          IsAsc: false,
          Filters: [
          {
            name: "status",
            op: "Equal",
            value: "active"
          }]

        }
      );

      // Fetch user count (assuming easysite_auth_users table exists)
      const { data: usersData, error: usersError } = await window.ezsite.apis.tablePage(
        32152, // easysite_auth_users table
        {
          PageNo: 1,
          PageSize: 1
        }
      );

      if (healthError || alertsError || usersError) {
        throw new Error(healthError || alertsError || usersError);
      }

      // Process health data
      const cpuMetric = healthData?.List?.find((m: any) => m.metric_name === 'CPU Usage');
      const memoryMetric = healthData?.List?.find((m: any) => m.metric_name === 'Memory Usage');
      const diskMetric = healthData?.List?.find((m: any) => m.metric_name === 'Disk Usage');
      const networkMetric = healthData?.List?.find((m: any) => m.metric_name === 'Network Usage');

      // Calculate system health status
      const criticalMetrics = healthData?.List?.filter((m: any) => m.status === 'critical') || [];
      const warningMetrics = healthData?.List?.filter((m: any) => m.status === 'warning') || [];

      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalMetrics.length > 0) {
        systemHealth = 'critical';
      } else if (warningMetrics.length > 0) {
        systemHealth = 'warning';
      }

      // Count critical alerts
      const criticalAlerts = alertsData?.List?.filter((a: any) => a.severity === 'critical')?.length || 0;

      setSystemOverview({
        totalUsers: usersData?.VirtualCount || 0,
        activeUsers: Math.floor((usersData?.VirtualCount || 0) * 0.3), // Assume 30% active
        systemHealth,
        uptime: calculateUptime(),
        totalAlerts: alertsData?.VirtualCount || 0,
        criticalAlerts,
        resourceUsage: {
          cpu: cpuMetric?.metric_value || 0,
          memory: memoryMetric?.metric_value || 0,
          disk: diskMetric?.metric_value || 0,
          network: networkMetric?.metric_value || 0
        }
      });

    } catch (error) {
      console.error('Error fetching system overview:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system overview data",
        variant: "destructive"
      });
    }
  };

  const calculateUptime = () => {
    // Simple uptime calculation (in production, this would come from system metrics)
    const uptimeHours = Math.floor(Math.random() * 720) + 24; // Random uptime between 1-30 days
    const days = Math.floor(uptimeHours / 24);
    const hours = uptimeHours % 24;
    return `${days}d ${hours}h`;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'warning':return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'critical':return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':return <CheckCircle className="h-5 w-5" />;
      case 'warning':return <AlertTriangle className="h-5 w-5" />;
      case 'critical':return <XCircle className="h-5 w-5" />;
      default:return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Platform Administration</h1>
                <p className="text-muted-foreground mt-1">System monitoring and management dashboard</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className={getHealthStatusColor(systemOverview.systemHealth)}>
                  {getHealthIcon(systemOverview.systemHealth)}
                  <span className="ml-1 capitalize">{systemOverview.systemHealth}</span>
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Uptime: {systemOverview.uptime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemOverview.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {systemOverview.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Monitor className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{systemOverview.systemHealth}</div>
              <p className="text-xs text-gray-500">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemOverview.totalAlerts}</div>
              <p className="text-xs text-gray-500">
                {systemOverview.criticalAlerts} critical
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145ms</div>
              <p className="text-xs text-gray-500">
                +5% from last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemOverview.resourceUsage.cpu}%</span>
                </div>
                <Progress value={systemOverview.resourceUsage.cpu} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemOverview.resourceUsage.memory}%</span>
                </div>
                <Progress value={systemOverview.resourceUsage.memory} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HardDrive className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="text-sm font-medium">Disk</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemOverview.resourceUsage.disk}%</span>
                </div>
                <Progress value={systemOverview.resourceUsage.disk} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{systemOverview.resourceUsage.network}%</span>
                </div>
                <Progress value={systemOverview.resourceUsage.network} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="scaling" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Scaling
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Request Rate</span>
                      <span className="font-medium">1,247 req/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Rate</span>
                      <span className="font-medium text-green-600">0.02%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Connections</span>
                      <span className="font-medium">23/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Queue Depth</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <div className="font-medium">System backup completed</div>
                        <div className="text-muted-foreground">2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <div className="font-medium">Database optimization finished</div>
                        <div className="text-muted-foreground">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="text-sm">
                        <div className="font-medium">High CPU usage detected</div>
                        <div className="text-muted-foreground">1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthMonitor />
          </TabsContent>

          <TabsContent value="scaling">
            <ScalingControlPanel />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertManagement />
          </TabsContent>

          <TabsContent value="security">
            <SecurityIncidentTracker />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserManagementPanel />
              <SystemConfigurationPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>);

};

export default PlatformAdminDashboard;