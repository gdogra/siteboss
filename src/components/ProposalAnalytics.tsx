import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, Eye, Download, FileSignature,
  Clock, Users, DollarSign, Target, BarChart3, PieChart,
  Calendar, Filter, ExternalLink, MapPin } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalProposals: number;
  signedProposals: number;
  rejectedProposals: number;
  pendingProposals: number;
  totalValue: number;
  signedValue: number;
  conversionRate: number;
  averageTimeToSign: number;
  viewsData: Array<{date: string;views: number;}>;
  deviceData: Array<{device: string;count: number;}>;
  locationData: Array<{location: string;count: number;}>;
}

interface ProposalAnalytic {
  id: number;
  proposal_id: number;
  event_type: string;
  event_data: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  page_viewed: string;
  time_spent: number;
  device_type: string;
  operating_system: string;
  browser: string;
  referrer_url: string;
  created_at: string;
}

interface Proposal {
  id: number;
  proposal_number: string;
  title: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  signed_at?: string;
  client_name: string;
}

const ProposalAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [events, setEvents] = useState<ProposalAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedProposal, setSelectedProposal] = useState<string>('all');

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [timeRange, selectedProposal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
      fetchProposals(),
      fetchAnalytics(),
      fetchEvents()]
      );
      calculateAnalytics();
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35433, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setProposals(data?.List || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const filters = [];

      // Date filter
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
      filters.push({
        name: 'created_at',
        op: 'GreaterThanOrEqual',
        value: daysAgo.toISOString()
      });

      // Proposal filter
      if (selectedProposal !== 'all') {
        filters.push({
          name: 'proposal_id',
          op: 'Equal',
          value: parseInt(selectedProposal)
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(35436, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;
      setEvents(data?.List || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchEvents = async () => {








    // This is handled in fetchAnalytics
  };const calculateAnalytics = () => {if (!proposals.length) return; // Filter proposals based on time range
    const cutoffDate = new Date();cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));const filteredProposals = proposals.filter((p) =>
    new Date(p.created_at) >= cutoffDate && (
    selectedProposal === 'all' || p.id.toString() === selectedProposal)
    );

    const totalProposals = filteredProposals.length;
    const signedProposals = filteredProposals.filter((p) => p.status === 'signed').length;
    const rejectedProposals = filteredProposals.filter((p) => p.status === 'rejected').length;
    const pendingProposals = filteredProposals.filter((p) =>
    ['sent', 'viewed'].includes(p.status)
    ).length;

    const totalValue = filteredProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const signedValue = filteredProposals.
    filter((p) => p.status === 'signed').
    reduce((sum, p) => sum + (p.total_amount || 0), 0);

    const conversionRate = totalProposals > 0 ? signedProposals / totalProposals * 100 : 0;

    // Calculate average time to sign
    const signedWithDates = filteredProposals.filter((p) => p.signed_at && p.created_at);
    const averageTimeToSign = signedWithDates.length > 0 ?
    signedWithDates.reduce((sum, p) => {
      const created = new Date(p.created_at).getTime();
      const signed = new Date(p.signed_at!).getTime();
      return sum + (signed - created);
    }, 0) / signedWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
    : 0;

    // Process views data for chart
    const viewsByDate: {[key: string]: number;} = {};
    events.filter((e) => e.event_type === 'view').forEach((event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    const viewsData = Object.entries(viewsByDate).
    map(([date, views]) => ({ date, views })).
    sort((a, b) => a.date.localeCompare(b.date));

    // Process device data
    const deviceCounts: {[key: string]: number;} = {};
    events.forEach((event) => {
      if (event.device_type) {
        deviceCounts[event.device_type] = (deviceCounts[event.device_type] || 0) + 1;
      }
    });

    const deviceData = Object.entries(deviceCounts).
    map(([device, count]) => ({ device, count })).
    sort((a, b) => b.count - a.count);

    // Process location data (simplified - in real app you'd use GeoIP)
    const locationCounts: {[key: string]: number;} = {};
    events.forEach((event) => {
      if (event.operating_system) {
        const location = event.operating_system; // Placeholder
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    const locationData = Object.entries(locationCounts).
    map(([location, count]) => ({ location, count })).
    sort((a, b) => b.count - a.count).
    slice(0, 10);

    setAnalytics({
      totalProposals,
      signedProposals,
      rejectedProposals,
      pendingProposals,
      totalValue,
      signedValue,
      conversionRate,
      averageTimeToSign,
      viewsData,
      deviceData,
      locationData
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTopPerformingProposals = () => {
    return proposals.
    filter((p) => p.status === 'signed').
    sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0)).
    slice(0, 10);
  };

  const getRecentActivity = () => {
    return events.
    sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).
    slice(0, 20);
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading analytics...</span>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Proposal Analytics</h2>
        
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProposal} onValueChange={setSelectedProposal}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All proposals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Proposals</SelectItem>
              {proposals.slice(0, 20).map((proposal) =>
              <SelectItem key={proposal.id} value={proposal.id.toString()}>
                  {proposal.proposal_number} - {proposal.title.substring(0, 30)}...
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold">{analytics.totalProposals}</p>
                <p className="text-xs text-gray-500">
                  Last {timeRange} days
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Signed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.signedProposals}</p>
                <p className="text-xs text-green-600">
                  {formatPercentage(analytics.conversionRate)} conversion
                </p>
              </div>
              <FileSignature className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</p>
                <p className="text-xs text-gray-500">
                  Signed: {formatCurrency(analytics.signedValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Time to Sign</p>
                <p className="text-2xl font-bold">{analytics.averageTimeToSign.toFixed(1)}</p>
                <p className="text-xs text-gray-500">days</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Proposal Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Signed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{analytics.signedProposals}</span>
                      <span className="text-xs text-gray-500">
                        ({formatPercentage(analytics.signedProposals / analytics.totalProposals * 100)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{analytics.pendingProposals}</span>
                      <span className="text-xs text-gray-500">
                        ({formatPercentage(analytics.pendingProposals / analytics.totalProposals * 100)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Rejected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{analytics.rejectedProposals}</span>
                      <span className="text-xs text-gray-500">
                        ({formatPercentage(analytics.rejectedProposals / analytics.totalProposals * 100)})
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Device Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.deviceData.slice(0, 5).map((device, index) =>
                  <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{device.device}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(device.count / analytics.deviceData[0]?.count || 1) * 100}%`
                          }}>
                        </div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{device.count}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Daily Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.viewsData.slice(-14).map((day, index) =>
                  <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${day.views / Math.max(...analytics.viewsData.map((d) => d.views)) * 100}%`
                          }}>
                        </div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{day.views}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.locationData.slice(0, 8).map((location, index) =>
                  <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{location.location}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(location.count / analytics.locationData[0]?.count || 1) * 100}%`
                          }}>
                        </div>
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{location.count}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopPerformingProposals().map((proposal, index) =>
                <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{proposal.title}</p>
                        <p className="text-sm text-gray-600">
                          {proposal.proposal_number} • {proposal.client_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(proposal.total_amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(proposal.signed_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getRecentActivity().map((activity, index) =>
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {activity.event_type === 'view' && <Eye className="w-4 h-4 text-blue-500" />}
                      {activity.event_type === 'download' && <Download className="w-4 h-4 text-green-500" />}
                      {activity.event_type === 'sign' && <FileSignature className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {activity.event_type === 'view' && 'Proposal Viewed'}
                          {activity.event_type === 'download' && 'PDF Downloaded'}
                          {activity.event_type === 'sign' && 'Proposal Signed'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.user_email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="capitalize">{activity.device_type}</span>
                        <span>{activity.browser?.split(' ')[0]}</span>
                        {activity.time_spent > 0 &&
                      <span>{activity.time_spent}s</span>
                      }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default ProposalAnalytics;