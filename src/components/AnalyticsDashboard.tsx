
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  FolderOpen, 
  Clock,
  RefreshCw,
  Settings,
  Eye,
  Lightbulb,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import KPIWidget from './KPIWidget';
import AnalyticsChart from './AnalyticsChart';
import AlertsPanel from './AlertsPanel';
import InsightsPanel from './InsightsPanel';
import TrendsAnalyzer from './TrendsAnalyzer';

interface AnalyticsDashboardProps {
  userRole?: string;
  userId?: number;
  tenantId?: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userRole = 'Administrator',
  userId = 1,
  tenantId
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await window.ezsite.apis.run({
        path: 'getAnalyticsDashboardData',
        param: [userId, userRole, timeRange]
      });

      if (error) throw new Error(error);

      setDashboardData(data);
      setLastUpdate(new Date());
      
      // Show success toast only for manual refresh
      if (!loading) {
        toast({
          title: "Dashboard Updated",
          description: "Analytics data has been refreshed successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, userRole, timeRange, loading, toast]);

  const handleManualRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!dashboardData?.metadata?.refreshInterval) return;

    const interval = setInterval(() => {
      if (!refreshing) {
        setRefreshing(true);
        loadDashboardData().finally(() => setRefreshing(false));
      }
    }, dashboardData.metadata.refreshInterval);

    return () => clearInterval(interval);
  }, [dashboardData?.metadata?.refreshInterval, loadDashboardData, refreshing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please refresh the page or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights across all SiteBoss modules
            {lastUpdate && (
              <span className="ml-2">
                • Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.kpis?.map((kpi: any, index: number) => (
          <KPIWidget key={index} {...kpi} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.charts?.revenueOverTime && (
              <AnalyticsChart
                title={dashboardData.charts.revenueOverTime.title}
                type={dashboardData.charts.revenueOverTime.type}
                data={dashboardData.charts.revenueOverTime.data}
                height={300}
              />
            )}
            
            {dashboardData.charts?.leadsBySource && (
              <AnalyticsChart
                title={dashboardData.charts.leadsBySource.title}
                type={dashboardData.charts.leadsBySource.type}
                data={dashboardData.charts.leadsBySource.data}
                height={300}
              />
            )}
            
            {dashboardData.charts?.projectStatus && (
              <AnalyticsChart
                title={dashboardData.charts.projectStatus.title}
                type={dashboardData.charts.projectStatus.type}
                data={dashboardData.charts.projectStatus.data}
                height={300}
              />
            )}
            
            {dashboardData.charts?.timeTrackingTrend && (
              <AnalyticsChart
                title={dashboardData.charts.timeTrackingTrend.title}
                type={dashboardData.charts.timeTrackingTrend.type}
                data={dashboardData.charts.timeTrackingTrend.data}
                height={300}
              />
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      {activity.type === 'project' && <FolderOpen className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'lead' && <Users className="h-4 w-4 text-green-500" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendsAnalyzer timeRange={timeRange} category={selectedCategory} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel alerts={dashboardData.alerts || []} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel insights={dashboardData.insights || []} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Detailed timeline of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'project' && <FolderOpen className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'lead' && <Users className="h-5 w-5 text-green-500" />}
                      {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
