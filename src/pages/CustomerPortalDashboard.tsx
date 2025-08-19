
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Users,
  BarChart3,
  Palette,
  Bell,
  Plug,
  ToggleLeft,
  ToggleRight,
  Plus,
  Move,
  Trash2,
  Edit,
  Activity,
  TrendingUp,
  UserCheck,
  Clock } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClientPortalLayout from '@/components/ClientPortalLayout';
import CustomerPortalUserManagement from '@/components/CustomerPortalUserManagement';
import CustomerPortalBranding from '@/components/CustomerPortalBranding';
import CustomerPortalFeatureFlags from '@/components/CustomerPortalFeatureFlags';
import CustomerPortalNotifications from '@/components/CustomerPortalNotifications';
import CustomerPortalIntegrations from '@/components/CustomerPortalIntegrations';

interface Widget {
  id: string;
  name: string;
  type: string;
  position: {x: number;y: number;width: number;height: number;};
  config: any;
  data?: any;
}

interface FeatureFlag {
  id: number;
  flag_key: string;
  flag_name: string;
  description: string;
  is_enabled: boolean;
  target_audience: string;
}

const CustomerPortalDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [portalConfig, setPortalConfig] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw new Error(userError);

      // Load portal configuration
      const { data: configData, error: configError } = await window.ezsite.apis.tablePage(35460, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });
      if (!configError && configData?.List?.length > 0) {
        setPortalConfig(configData.List[0]);
      }

      // Load user's dashboard layout
      const { data: layoutData, error: layoutError } = await window.ezsite.apis.tablePage(35462, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userInfo.ID },
        { name: 'is_default', op: 'Equal', value: true }]

      });

      if (!layoutError && layoutData?.List?.length > 0) {
        const layout = JSON.parse(layoutData.List[0].widget_layout || '[]');
        setWidgets(layout);
      } else {
        // Create default layout
        const defaultWidgets = await createDefaultLayout(userInfo.ID);
        setWidgets(defaultWidgets);
      }

      // Load feature flags
      const { data: flagsData, error: flagsError } = await window.ezsite.apis.tablePage(35455, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });
      if (!flagsError && flagsData?.List) {
        setFeatureFlags(flagsData.List);
      }

      // Load analytics summary
      await loadAnalytics();

    } catch (error: any) {
      toast({
        title: 'Error loading dashboard',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultLayout = async (userId: number) => {
    const defaultWidgets = [
    {
      id: 'usage-stats',
      name: 'Usage Statistics',
      type: 'analytics',
      position: { x: 0, y: 0, width: 6, height: 4 },
      config: { timeRange: '30d' }
    },
    {
      id: 'feature-status',
      name: 'Feature Status',
      type: 'features',
      position: { x: 6, y: 0, width: 6, height: 4 },
      config: { showDisabled: false }
    },
    {
      id: 'user-activity',
      name: 'User Activity',
      type: 'users',
      position: { x: 0, y: 4, width: 12, height: 4 },
      config: { limit: 10 }
    }];


    try {
      await window.ezsite.apis.tableCreate(35462, {
        user_id: userId,
        customer_id: portalConfig?.id || 1,
        layout_name: 'Default',
        widget_layout: JSON.stringify(defaultWidgets),
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to create default layout:', error);
    }

    return defaultWidgets;
  };

  const loadAnalytics = async () => {
    try {
      const { data: analyticsData, error } = await window.ezsite.apis.tablePage(35465, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'timestamp',
        IsAsc: false,
        Filters: [
        { name: 'timestamp', op: 'GreaterThan', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }]

      });

      if (!error && analyticsData?.List) {
        // Process analytics data
        const processed = {
          totalEvents: analyticsData.List.length,
          uniqueUsers: new Set(analyticsData.List.map((item) => item.user_id)).size,
          topEvents: Object.entries(
            analyticsData.List.reduce((acc, item) => {
              acc[item.event_type] = (acc[item.event_type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).sort(([, a], [, b]) => b - a).slice(0, 5)
        };
        setAnalytics(processed);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const toggleFeature = async (flagId: number, currentState: boolean) => {
    try {
      await window.ezsite.apis.tableUpdate(35455, {
        ID: flagId,
        is_enabled: !currentState,
        updated_at: new Date().toISOString()
      });

      setFeatureFlags((prev) => prev.map((flag) =>
      flag.id === flagId ? { ...flag, is_enabled: !currentState } : flag
      ));

      toast({
        title: 'Feature Updated',
        description: `Feature ${!currentState ? 'enabled' : 'disabled'} successfully.`
      });

      // Track the change
      await trackEvent('feature_toggle', {
        flag_id: flagId,
        new_state: !currentState
      });

    } catch (error: any) {
      toast({
        title: 'Error updating feature',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const trackEvent = async (eventType: string, eventData: any) => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();
      await window.ezsite.apis.tableCreate(35465, {
        customer_id: portalConfig?.id || 1,
        user_id: userInfo?.ID,
        event_type: eventType,
        event_data: JSON.stringify(eventData),
        timestamp: new Date().toISOString(),
        session_id: `session_${Date.now()}`,
        ip_address: '0.0.0.0',
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const saveLayout = async () => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();

      // Update existing layout
      const { data: layoutData } = await window.ezsite.apis.tablePage(35462, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
        { name: 'user_id', op: 'Equal', value: userInfo.ID },
        { name: 'is_default', op: 'Equal', value: true }]

      });

      if (layoutData?.List?.length > 0) {
        await window.ezsite.apis.tableUpdate(35462, {
          ID: layoutData.List[0].id,
          widget_layout: JSON.stringify(widgets),
          updated_at: new Date().toISOString()
        });
      }

      toast({
        title: 'Layout Saved',
        description: 'Your dashboard layout has been saved successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error saving layout',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'analytics':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {widget.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="font-semibold">{analytics.totalEvents || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-semibold">{analytics.uniqueUsers || 0}</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </CardContent>
          </Card>);


      case 'features':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ToggleLeft className="h-4 w-4" />
                {widget.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {featureFlags.slice(0, 5).map((flag) =>
                <div key={flag.id} className="flex items-center justify-between">
                    <span className="text-sm">{flag.flag_name}</span>
                    <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                      {flag.is_enabled ? 'On' : 'Off'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>);


      case 'users':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {widget.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{analytics.uniqueUsers || 0}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>);


      default:
        return (
          <Card className="h-full">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Unknown widget type: {widget.type}</p>
            </CardContent>
          </Card>);

    }
  };

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ClientPortalLayout>);

  }

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Portal</h1>
            <p className="text-muted-foreground">
              Manage your workspace, users, and integrations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={editMode ? 'default' : 'outline'}
              onClick={() => {
                if (editMode) {
                  saveLayout();
                }
                setEditMode(!editMode);
              }}>

              {editMode ? 'Save Layout' : 'Edit Layout'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-12 gap-4 min-h-[600px]">
              {widgets.map((widget) =>
              <div
                key={widget.id}
                className={`col-span-${widget.position.width} row-span-${widget.position.height} relative group`}>

                  {editMode &&
                <div className="absolute top-2 right-2 z-10 bg-background rounded-md border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Move className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                }
                  {renderWidget(widget)}
                </div>
              )}
              
              {editMode &&
              <div className="col-span-12 flex justify-center">
                  <Button variant="dashed" className="w-full h-32 border-2 border-dashed">
                    <Plus className="h-6 w-6 mr-2" />
                    Add Widget
                  </Button>
                </div>
              }
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <CustomerPortalFeatureFlags />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <CustomerPortalUserManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalEvents || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.uniqueUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Feature Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {featureFlags.filter((f) => f.is_enabled).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Features enabled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24m</div>
                  <p className="text-xs text-muted-foreground">Average duration</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <CustomerPortalBranding />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                  <CustomerPortalNotifications />
                </TabsContent>

                <TabsContent value="integrations">
                  <CustomerPortalIntegrations />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClientPortalLayout>);

};

export default CustomerPortalDashboard;