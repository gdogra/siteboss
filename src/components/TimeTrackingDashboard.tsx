
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  MapPin,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Timer,
  Navigation,
  Calendar,
  FileText,
  Shield,
  Activity } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeTrackingDashboardProps {
  userRole?: string;
}

interface DashboardStats {
  activeSessions: number;
  totalHoursToday: number;
  geofenceViolations: number;
  pendingApprovals: number;
  averageProductivity: number;
  totalDistanceTraveled: number;
}

const TimeTrackingDashboard: React.FC<TimeTrackingDashboardProps> = ({ userRole = 'GeneralUser' }) => {
  const [stats, setStats] = useState<DashboardStats>({
    activeSessions: 0,
    totalHoursToday: 0,
    geofenceViolations: 0,
    pendingApprovals: 0,
    averageProductivity: 0,
    totalDistanceTraveled: 0
  });
  const [activeSessions, setActiveSessions] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load active sessions
      const sessionsResponse = await window.ezsite.apis.tablePage(35439, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'start_time',
        IsAsc: false,
        Filters: [{ name: 'status', op: 'Equal', value: 'active' }]
      });

      // Load recent clock events
      const eventsResponse = await window.ezsite.apis.tablePage(35437, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'timestamp',
        IsAsc: false,
        Filters: []
      });

      if (sessionsResponse.error) throw sessionsResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      setActiveSessions(sessionsResponse.data?.List || []);
      setRecentEvents(eventsResponse.data?.List || []);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = eventsResponse.data?.List.filter((event: any) =>
      event.timestamp?.startsWith(today)
      ) || [];

      const activeSessions = sessionsResponse.data?.List || [];
      const totalHours = activeSessions.reduce((sum: number, session: any) =>
      sum + (session.work_duration || 0) / 60, 0
      );

      const violations = activeSessions.reduce((sum: number, session: any) =>
      sum + (session.geofence_violations || 0), 0
      );

      const pendingEvents = eventsResponse.data?.List.filter((event: any) =>
      event.verification_status === 'pending'
      ).length || 0;

      const avgProductivity = activeSessions.length > 0 ?
      activeSessions.reduce((sum: number, session: any) =>
      sum + (session.productivity_score || 0), 0
      ) / activeSessions.length :
      0;

      const totalDistance = activeSessions.reduce((sum: number, session: any) =>
      sum + (session.total_distance || 0), 0
      );

      setStats({
        activeSessions: activeSessions.length,
        totalHoursToday: totalHours,
        geofenceViolations: violations,
        pendingApprovals: pendingEvents,
        averageProductivity: Math.round(avgProductivity),
        totalDistanceTraveled: Math.round(totalDistance / 1000 * 100) / 100 // Convert to km
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'clock_in':return <Clock className="h-4 w-4 text-green-600" />;
      case 'clock_out':return <Clock className="h-4 w-4 text-red-600" />;
      case 'break_start':return <Timer className="h-4 w-4 text-yellow-600" />;
      case 'break_end':return <Timer className="h-4 w-4 text-blue-600" />;
      default:return <Activity className="h-4 w-4" />;
    }
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>);

  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) =>
          <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hours Today</p>
                <p className="text-2xl font-bold">{stats.totalHoursToday.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Geofence Violations</p>
                <p className="text-2xl font-bold">{stats.geofenceViolations}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Productivity Score</span>
                <span>{stats.averageProductivity}%</span>
              </div>
              <Progress value={stats.averageProductivity} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Distance Traveled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistanceTraveled} km</div>
            <p className="text-sm text-muted-foreground">Total distance across all active sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Work Sessions</CardTitle>
              <CardDescription>Currently active time tracking sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ?
              <div className="text-center py-8 text-muted-foreground">
                  No active sessions
                </div> :

              <div className="space-y-4">
                  {activeSessions.map((session: any) =>
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">User ID: {session.user_id}</div>
                        <div className="text-sm text-muted-foreground">
                          Started: {formatTime(session.start_time)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Duration: {formatDuration(session.work_duration || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {session.productivity_score || 0}% productivity
                        </Badge>
                        {session.geofence_violations > 0 &&
                    <Badge variant="destructive">
                            {session.geofence_violations} violations
                          </Badge>
                    }
                        <Badge variant="outline">
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Clock Events</CardTitle>
              <CardDescription>Latest clock-in/out and break events</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ?
              <div className="text-center py-8 text-muted-foreground">
                  No recent events
                </div> :

              <div className="space-y-4">
                  {recentEvents.map((event: any) =>
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEventIcon(event.event_type)}
                        <div>
                          <div className="font-medium">
                            {event.event_type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(event.timestamp)} • User ID: {event.user_id}
                          </div>
                          {event.address &&
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.address}
                            </div>
                      }
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVerificationBadge(event.verification_status)}
                        <Badge variant={event.geofence_status === 'inside' ? 'default' : 'destructive'}>
                          {event.geofence_status}
                        </Badge>
                      </div>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Analytics dashboard is being enhanced with advanced reporting capabilities.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Approval workflow interface for supervisors is being developed.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>);

};

export default TimeTrackingDashboard;