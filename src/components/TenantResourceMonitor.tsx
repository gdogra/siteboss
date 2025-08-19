import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Server,
  HardDrive,
  Cpu,
  Memory,
  Network,
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

interface TenantResource {
  tenantId: number;
  tenantName: string;
  cpu: ResourceMetric;
  memory: ResourceMetric;
  storage: ResourceMetric;
  bandwidth: ResourceMetric;
  database: ResourceMetric;
  requests: ResourceMetric;
}

const TenantResourceMonitor: React.FC = () => {
  const [resources, setResources] = useState<TenantResource[]>([]);
  const [systemResources, setSystemResources] = useState<ResourceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadResourceData();
    
    if (autoRefresh) {
      const interval = setInterval(loadResourceData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadResourceData = async () => {
    try {
      // In production, this would fetch real resource metrics
      setSystemResources(getMockSystemResources());
      setResources(getMockTenantResources());
    } catch (error) {
      console.error('Error loading resource data:', error);
      toast({
        title: "Error",
        description: "Failed to load resource metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockSystemResources = (): ResourceMetric[] => [
    {
      name: 'CPU Usage',
      current: 68,
      limit: 100,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      history: [45, 52, 48, 61, 55, 67, 71, 68]
    },
    {
      name: 'Memory Usage',
      current: 72,
      limit: 100,
      unit: '%',
      status: 'warning',
      trend: 'up',
      history: [55, 58, 62, 65, 68, 70, 71, 72]
    },
    {
      name: 'Disk Usage',
      current: 45,
      limit: 100,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      history: [35, 37, 39, 41, 42, 43, 44, 45]
    },
    {
      name: 'Network I/O',
      current: 234,
      limit: 1000,
      unit: 'Mbps',
      status: 'healthy',
      trend: 'stable',
      history: [180, 195, 210, 225, 240, 235, 230, 234]
    },
    {
      name: 'Database Connections',
      current: 89,
      limit: 200,
      unit: 'connections',
      status: 'healthy',
      trend: 'stable',
      history: [75, 78, 82, 85, 87, 88, 89, 89]
    },
    {
      name: 'API Requests',
      current: 1250,
      limit: 5000,
      unit: 'req/min',
      status: 'healthy',
      trend: 'up',
      history: [800, 900, 1000, 1100, 1150, 1200, 1220, 1250]
    }
  ];

  const getMockTenantResources = (): TenantResource[] => [
    {
      tenantId: 1,
      tenantName: 'ABC Construction',
      cpu: { name: 'CPU', current: 45, limit: 100, unit: '%', status: 'healthy', trend: 'stable', history: [40, 42, 44, 45] },
      memory: { name: 'Memory', current: 68, limit: 100, unit: '%', status: 'healthy', trend: 'up', history: [60, 62, 65, 68] },
      storage: { name: 'Storage', current: 4200, limit: 10000, unit: 'MB', status: 'healthy', trend: 'up', history: [3800, 3900, 4100, 4200] },
      bandwidth: { name: 'Bandwidth', current: 45, limit: 100, unit: 'Mbps', status: 'healthy', trend: 'stable', history: [40, 42, 44, 45] },
      database: { name: 'DB Queries', current: 230, limit: 1000, unit: 'q/min', status: 'healthy', trend: 'up', history: [200, 210, 220, 230] },
      requests: { name: 'API Requests', current: 180, limit: 500, unit: 'req/min', status: 'healthy', trend: 'stable', history: [170, 175, 178, 180] }
    },
    {
      tenantId: 2,
      tenantName: 'Metro Builders',
      cpu: { name: 'CPU', current: 78, limit: 100, unit: '%', status: 'warning', trend: 'up', history: [70, 72, 75, 78] },
      memory: { name: 'Memory', current: 85, limit: 100, unit: '%', status: 'warning', trend: 'up', history: [75, 80, 82, 85] },
      storage: { name: 'Storage', current: 8500, limit: 10000, unit: 'MB', status: 'warning', trend: 'up', history: [8000, 8200, 8300, 8500] },
      bandwidth: { name: 'Bandwidth', current: 85, limit: 100, unit: 'Mbps', status: 'warning', trend: 'up', history: [75, 78, 82, 85] },
      database: { name: 'DB Queries', current: 450, limit: 500, unit: 'q/min', status: 'warning', trend: 'up', history: [400, 420, 435, 450] },
      requests: { name: 'API Requests', current: 420, limit: 500, unit: 'req/min', status: 'warning', trend: 'up', history: [380, 390, 405, 420] }
    },
    {
      tenantId: 3,
      tenantName: 'Elite Contractors',
      cpu: { name: 'CPU', current: 92, limit: 100, unit: '%', status: 'critical', trend: 'up', history: [85, 88, 90, 92] },
      memory: { name: 'Memory', current: 95, limit: 100, unit: '%', status: 'critical', trend: 'up', history: [88, 90, 93, 95] },
      storage: { name: 'Storage', current: 9800, limit: 10000, unit: 'MB', status: 'critical', trend: 'up', history: [9500, 9600, 9700, 9800] },
      bandwidth: { name: 'Bandwidth', current: 95, limit: 100, unit: 'Mbps', status: 'critical', trend: 'up', history: [88, 90, 93, 95] },
      database: { name: 'DB Queries', current: 480, limit: 500, unit: 'q/min', status: 'critical', trend: 'up', history: [450, 460, 470, 480] },
      requests: { name: 'API Requests', current: 490, limit: 500, unit: 'req/min', status: 'critical', trend: 'up', history: [460, 470, 480, 490] }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <Activity className="h-3 w-3 text-gray-400" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resource Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Real-time system and tenant resource utilization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadResourceData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System Resources</TabsTrigger>
          <TabsTrigger value="tenants">Tenant Resources</TabsTrigger>
          <TabsTrigger value="alerts">Resource Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          {/* System Resource Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemResources.map((resource, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {resource.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(resource.status)}
                    {getTrendIcon(resource.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resource.current}{resource.unit === '%' ? '%' : ` ${resource.unit}`}
                  </div>
                  <div className="flex items-center justify-between mt-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      of {resource.limit}{resource.unit === '%' ? '%' : ` ${resource.unit}`}
                    </span>
                    <Badge variant={resource.status === 'healthy' ? 'default' : resource.status === 'warning' ? 'secondary' : 'destructive'}>
                      {resource.status}
                    </Badge>
                  </div>
                  <Progress 
                    value={(resource.current / resource.limit) * 100}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          {/* Tenant Resource Usage */}
          <div className="space-y-4">
            {resources.map((tenant) => (
              <Card key={tenant.tenantId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{tenant.tenantName}</span>
                    <Badge variant="outline">Tenant ID: {tenant.tenantId}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[tenant.cpu, tenant.memory, tenant.storage, tenant.bandwidth, tenant.database, tenant.requests].map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{metric.name}</span>
                          {getStatusIcon(metric.status)}
                        </div>
                        <div className="text-sm font-semibold">
                          {metric.current}{metric.unit === '%' ? '%' : ` ${metric.unit}`}
                        </div>
                        <Progress 
                          value={(metric.current / metric.limit) * 100}
                          className="h-1.5"
                        />
                        <div className="text-xs text-muted-foreground">
                          / {metric.limit}{metric.unit === '%' ? '%' : ` ${metric.unit}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* Resource Alerts */}
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Elite Contractors</strong> is approaching resource limits. CPU usage at 92%, Memory at 95%.
                Consider upgrading their plan or optimizing resource usage.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Metro Builders</strong> storage usage is at 85% of limit (8.5GB/10GB).
                Recommend storage cleanup or plan upgrade.
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                System-wide resource utilization is within normal parameters. All critical services are operational.
              </AlertDescription>
            </Alert>
          </div>

          {/* Resource Optimization Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Optimization Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Scale Database Connections</div>
                  <div className="text-xs text-gray-600">
                    Consider implementing connection pooling for high-usage tenants
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Storage Cleanup</div>
                  <div className="text-xs text-gray-600">
                    Identify and archive old files to free up space for growing tenants
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Server className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Load Balancing</div>
                  <div className="text-xs text-gray-600">
                    Distribute high-usage tenants across multiple servers
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantResourceMonitor;