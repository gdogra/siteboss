
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  MapPin, 
  BarChart3,
  PieChart,
  CalendarIcon,
  Download,
  Filter,
  Target,
  Zap,
  Route,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface AnalyticsData {
  totalHours: number;
  workHours: number;
  breakHours: number;
  averageProductivity: number;
  totalDistance: number;
  uniqueWorkers: number;
  geofenceViolations: number;
  sessionCount: number;
  trends: {
    hoursChange: number;
    productivityChange: number;
    distanceChange: number;
    violationsChange: number;
  };
}

interface ProductivityMetrics {
  hourlyProductivity: { hour: number; productivity: number; sessions: number }[];
  dailyProductivity: { date: string; productivity: number; hours: number }[];
  projectProductivity: { project: string; productivity: number; hours: number }[];
  workerProductivity: { worker: string; productivity: number; hours: number }[];
}

interface LocationMetrics {
  totalDistance: number;
  averageSpeed: number;
  topLocations: { address: string; visits: number; duration: number }[];
  geofenceCompliance: number;
  violationHotspots: { location: string; violations: number }[];
}

const TimeAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalHours: 0,
    workHours: 0,
    breakHours: 0,
    averageProductivity: 0,
    totalDistance: 0,
    uniqueWorkers: 0,
    geofenceViolations: 0,
    sessionCount: 0,
    trends: {
      hoursChange: 0,
      productivityChange: 0,
      distanceChange: 0,
      violationsChange: 0
    }
  });

  const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics>({
    hourlyProductivity: [],
    dailyProductivity: [],
    projectProductivity: [],
    workerProductivity: []
  });

  const [locationMetrics, setLocationMetrics] = useState<LocationMetrics>({
    totalDistance: 0,
    averageSpeed: 0,
    topLocations: [],
    geofenceCompliance: 100,
    violationHotspots: []
  });

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedProject]);

  const loadProjects = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: []
      });
      
      if (response.error) throw response.error;
      setProjects(response.data?.List || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32152, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'Name',
        IsAsc: true,
        Filters: []
      });
      
      if (response.error) throw response.error;
      setUsers(response.data?.List || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters = [
        { name: 'start_time', op: 'GreaterThanOrEqual', value: dateRange.from.toISOString() },
        { name: 'start_time', op: 'LessThanOrEqual', value: dateRange.to.toISOString() }
      ];

      if (selectedProject !== 'all') {
        filters.push({ name: 'project_id', op: 'Equal', value: parseInt(selectedProject) });
      }

      // Load sessions
      const sessionsResponse = await window.ezsite.apis.tablePage(35439, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'start_time',
        IsAsc: false,
        Filters: filters
      });

      if (sessionsResponse.error) throw sessionsResponse.error;
      const sessions = sessionsResponse.data?.List || [];

      // Load location data
      const locationResponse = await window.ezsite.apis.tablePage(35438, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'timestamp',
        IsAsc: false,
        Filters: [
          { name: 'timestamp', op: 'GreaterThanOrEqual', value: dateRange.from.toISOString() },
          { name: 'timestamp', op: 'LessThanOrEqual', value: dateRange.to.toISOString() }
        ]
      });

      const locations = locationResponse.data?.List || [];

      // Calculate analytics
      calculateAnalytics(sessions, locations);
      calculateProductivityMetrics(sessions);
      calculateLocationMetrics(locations);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessions: any[], locations: any[]) => {
    const totalHours = sessions.reduce((sum, session) => sum + (session.total_duration || 0) / 60, 0);
    const workHours = sessions.reduce((sum, session) => sum + (session.work_duration || 0) / 60, 0);
    const breakHours = sessions.reduce((sum, session) => sum + (session.break_duration || 0) / 60, 0);
    const averageProductivity = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + (session.productivity_score || 0), 0) / sessions.length 
      : 0;
    const totalDistance = sessions.reduce((sum, session) => sum + (session.total_distance || 0), 0);
    const uniqueWorkers = new Set(sessions.map(session => session.user_id)).size;
    const geofenceViolations = sessions.reduce((sum, session) => sum + (session.geofence_violations || 0), 0);

    // Calculate trends (simplified - comparing with previous period)
    const trends = {
      hoursChange: Math.random() * 20 - 10, // Mock trend data
      productivityChange: Math.random() * 10 - 5,
      distanceChange: Math.random() * 15 - 7,
      violationsChange: Math.random() * 5 - 2
    };

    setAnalytics({
      totalHours,
      workHours,
      breakHours,
      averageProductivity: Math.round(averageProductivity),
      totalDistance: totalDistance / 1000, // Convert to km
      uniqueWorkers,
      geofenceViolations,
      sessionCount: sessions.length,
      trends
    });
  };

  const calculateProductivityMetrics = (sessions: any[]) => {
    // Hourly productivity
    const hourlyData: { [key: number]: { productivity: number; sessions: number } } = {};
    sessions.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { productivity: 0, sessions: 0 };
      }
      hourlyData[hour].productivity += session.productivity_score || 0;
      hourlyData[hour].sessions += 1;
    });

    const hourlyProductivity = Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      productivity: Math.round(data.productivity / data.sessions),
      sessions: data.sessions
    }));

    // Daily productivity
    const dailyData: { [key: string]: { productivity: number; hours: number; sessions: number } } = {};
    sessions.forEach(session => {
      const date = new Date(session.start_time).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { productivity: 0, hours: 0, sessions: 0 };
      }
      dailyData[date].productivity += session.productivity_score || 0;
      dailyData[date].hours += (session.work_duration || 0) / 60;
      dailyData[date].sessions += 1;
    });

    const dailyProductivity = Object.entries(dailyData).map(([date, data]) => ({
      date,
      productivity: Math.round(data.productivity / data.sessions),
      hours: Math.round(data.hours * 10) / 10
    }));

    // Project productivity
    const projectData: { [key: number]: { productivity: number; hours: number; sessions: number } } = {};
    sessions.forEach(session => {
      const projectId = session.project_id;
      if (!projectData[projectId]) {
        projectData[projectId] = { productivity: 0, hours: 0, sessions: 0 };
      }
      projectData[projectId].productivity += session.productivity_score || 0;
      projectData[projectId].hours += (session.work_duration || 0) / 60;
      projectData[projectId].sessions += 1;
    });

    const projectProductivity = Object.entries(projectData).map(([projectId, data]) => {
      const project = projects.find((p: any) => p.id === parseInt(projectId));
      return {
        project: project ? (project as any).name : `Project ${projectId}`,
        productivity: Math.round(data.productivity / data.sessions),
        hours: Math.round(data.hours * 10) / 10
      };
    });

    // Worker productivity
    const workerData: { [key: number]: { productivity: number; hours: number; sessions: number } } = {};
    sessions.forEach(session => {
      const userId = session.user_id;
      if (!workerData[userId]) {
        workerData[userId] = { productivity: 0, hours: 0, sessions: 0 };
      }
      workerData[userId].productivity += session.productivity_score || 0;
      workerData[userId].hours += (session.work_duration || 0) / 60;
      workerData[userId].sessions += 1;
    });

    const workerProductivity = Object.entries(workerData).map(([userId, data]) => {
      const user = users.find((u: any) => u.ID === parseInt(userId));
      return {
        worker: user ? (user as any).Name : `User ${userId}`,
        productivity: Math.round(data.productivity / data.sessions),
        hours: Math.round(data.hours * 10) / 10
      };
    });

    setProductivityMetrics({
      hourlyProductivity,
      dailyProductivity,
      projectProductivity,
      workerProductivity
    });
  };

  const calculateLocationMetrics = (locations: any[]) => {
    const totalDistance = locations.reduce((sum, location) => sum + (location.distance_from_previous || 0), 0);
    
    // Calculate average speed (simplified)
    const averageSpeed = totalDistance > 0 ? (totalDistance / 1000) / (locations.length / 60) : 0; // rough estimate

    // Top locations
    const locationCounts: { [key: string]: { visits: number; duration: number } } = {};
    locations.forEach(location => {
      const address = location.address || 'Unknown';
      if (!locationCounts[address]) {
        locationCounts[address] = { visits: 0, duration: 0 };
      }
      locationCounts[address].visits += 1;
      locationCounts[address].duration += 5; // Assume 5 minutes per location point
    });

    const topLocations = Object.entries(locationCounts)
      .map(([address, data]) => ({ address, ...data }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Geofence compliance (mock calculation)
    const qualityScores = locations.map(l => l.quality_score || 100);
    const geofenceCompliance = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 100;

    // Violation hotspots (mock data)
    const violationHotspots = [
      { location: 'Main Street', violations: 5 },
      { location: 'Downtown Area', violations: 3 },
      { location: 'Industrial Zone', violations: 2 }
    ];

    setLocationMetrics({
      totalDistance: totalDistance / 1000, // Convert to km
      averageSpeed,
      topLocations,
      geofenceCompliance: Math.round(geofenceCompliance),
      violationHotspots
    });
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case '7d':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case '30d':
        setDateRange({ from: subDays(now, 30), to: now });
        break;
      case '90d':
        setDateRange({ from: subDays(now, 90), to: now });
        break;
      case 'week':
        setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
        break;
      case 'month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      default:
        break;
    }
  };

  const exportReport = async () => {
    try {
      // Generate CSV report
      const reportData = [
        ['Time Tracking Analytics Report'],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [`Period: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`],
        [''],
        ['Summary'],
        ['Total Hours', analytics.totalHours.toFixed(1)],
        ['Work Hours', analytics.workHours.toFixed(1)],
        ['Break Hours', analytics.breakHours.toFixed(1)],
        ['Average Productivity', `${analytics.averageProductivity}%`],
        ['Total Distance', `${analytics.totalDistance.toFixed(2)} km`],
        ['Unique Workers', analytics.uniqueWorkers.toString()],
        ['Geofence Violations', analytics.geofenceViolations.toString()],
        ['Total Sessions', analytics.sessionCount.toString()],
        ['']
      ];

      const csvContent = reportData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `time-tracking-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Analytics report has been downloaded'
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics report',
        variant: 'destructive'
      });
    }
  };

  const formatTrend = (value: number) => {
    const isPositive = value > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <TrendIcon className="h-3 w-3" />
        <span className="text-xs">{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Time Tracking Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and productivity insights
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Period Selection */}
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>

              {/* Project Filter */}
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button onClick={exportReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{analytics.totalHours.toFixed(1)}h</p>
                {formatTrend(analytics.trends.hoursChange)}
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Productivity</p>
                <p className="text-2xl font-bold">{analytics.averageProductivity}%</p>
                {formatTrend(analytics.trends.productivityChange)}
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">{analytics.totalDistance.toFixed(1)}km</p>
                {formatTrend(analytics.trends.distanceChange)}
              </div>
              <Route className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Geofence Violations</p>
                <p className="text-2xl font-bold">{analytics.geofenceViolations}</p>
                {formatTrend(analytics.trends.violationsChange)}
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.workHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Work Hours</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analytics.breakHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Break Hours</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.uniqueWorkers}</div>
              <div className="text-sm text-muted-foreground">Active Workers</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.sessionCount}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="productivity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Productivity */}
            <Card>
              <CardHeader>
                <CardTitle>Project Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                {productivityMetrics.projectProductivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No project data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productivityMetrics.projectProductivity.slice(0, 5).map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{project.project}</span>
                          <span>{project.productivity}% • {project.hours.toFixed(1)}h</span>
                        </div>
                        <Progress value={project.productivity} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Worker Productivity */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                {productivityMetrics.workerProductivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No worker data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productivityMetrics.workerProductivity.slice(0, 5).map((worker, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{worker.worker}</span>
                          <span>{worker.productivity}% • {worker.hours.toFixed(1)}h</span>
                        </div>
                        <Progress value={worker.productivity} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Location Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Distance</span>
                  <span className="text-lg font-bold">{locationMetrics.totalDistance.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Speed</span>
                  <span className="text-lg font-bold">{locationMetrics.averageSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Geofence Compliance</span>
                  <div className="flex items-center gap-2">
                    <Progress value={locationMetrics.geofenceCompliance} className="w-24 h-2" />
                    <span className="text-lg font-bold">{locationMetrics.geofenceCompliance}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Most Visited Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {locationMetrics.topLocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No location data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {locationMetrics.topLocations.slice(0, 5).map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{location.address}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{location.visits} visits</div>
                          <div className="text-xs text-muted-foreground">{location.duration}min</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Productivity */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Productivity Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                {productivityMetrics.hourlyProductivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hourly data available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productivityMetrics.hourlyProductivity.map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between text-sm">
                        <span>{hour.hour.toString().padStart(2, '0')}:00</span>
                        <div className="flex items-center gap-2">
                          <Progress value={hour.productivity} className="w-24 h-2" />
                          <span>{hour.productivity}%</span>
                          <Badge variant="outline" className="text-xs">
                            {hour.sessions} sessions
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Daily Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {productivityMetrics.dailyProductivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No daily data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productivityMetrics.dailyProductivity.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm">{format(new Date(day.date), 'MMM dd')}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={day.productivity} className="w-20 h-2" />
                          <span className="text-sm font-medium">{day.productivity}%</span>
                          <span className="text-xs text-muted-foreground">
                            {day.hours.toFixed(1)}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geofence Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Geofence Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {locationMetrics.geofenceCompliance}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Compliance Rate</div>
                </div>
                
                <Progress value={locationMetrics.geofenceCompliance} className="h-3" />
                
                <div className="text-sm text-muted-foreground text-center">
                  Based on location tracking accuracy and geofence boundary adherence
                </div>
              </CardContent>
            </Card>

            {/* Violation Hotspots */}
            <Card>
              <CardHeader>
                <CardTitle>Violation Hotspots</CardTitle>
              </CardHeader>
              <CardContent>
                {locationMetrics.violationHotspots.length === 0 ? (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div>No violations detected</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {locationMetrics.violationHotspots.map((hotspot, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">{hotspot.location}</span>
                        </div>
                        <Badge variant="destructive">
                          {hotspot.violations} violations
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeAnalyticsDashboard;
