
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line } from
'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Crown,
  AlertTriangle,
  Download,
  RefreshCw } from
'lucide-react';
import { toast } from '@/hooks/use-toast';

const SubscriptionAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>({});
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load subscription data for analytics
      const { data: subscriptions, error: subError } = await window.ezsite.apis.tablePage('35511', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false
      });

      if (subError) throw subError;

      // Load billing data
      const { data: billingData, error: billingError } = await window.ezsite.apis.tablePage('35512', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false
      });

      if (billingError) throw billingError;

      // Load plans
      const { data: plans, error: plansError } = await window.ezsite.apis.tablePage('35510', {
        PageNo: 1,
        PageSize: 100
      });

      if (plansError) throw plansError;

      // Calculate analytics
      const analyticsData = calculateAnalytics(subscriptions.List, billingData.List, plans.List);
      setAnalytics(analyticsData);

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

  const calculateAnalytics = (subscriptions: any[], billingData: any[], plans: any[]) => {
    const now = new Date();
    const timeRanges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365
    };

    const daysBack = timeRanges[timeRange as keyof typeof timeRanges] || 30;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Filter data by time range
    const recentSubscriptions = subscriptions.filter((s) =>
    new Date(s.created_at) >= cutoffDate
    );
    const recentBilling = billingData.filter((b) =>
    new Date(b.created_at) >= cutoffDate
    );

    // Total metrics
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;
    const trialSubscriptions = subscriptions.filter((s) => s.is_trial).length;
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'cancelled').length;

    // Revenue metrics
    const totalRevenue = billingData.
    filter((b) => b.status === 'paid').
    reduce((sum, b) => sum + b.total_amount, 0);
    const recentRevenue = recentBilling.
    filter((b) => b.status === 'paid').
    reduce((sum, b) => sum + b.total_amount, 0);

    // MRR calculation (Monthly Recurring Revenue)
    const monthlyRevenue = subscriptions.
    filter((s) => s.status === 'active' && !s.is_trial).
    reduce((sum, s) => {
      const plan = plans.find((p) => p.id === s.subscription_plan_id);
      if (plan) {
        const monthlyAmount = s.billing_cycle === 'yearly' ?
        plan.price_yearly / 12 :
        plan.price_monthly;
        return sum + monthlyAmount;
      }
      return sum;
    }, 0);

    // Conversion rate
    const totalTrials = subscriptions.filter((s) => s.is_trial).length;
    const convertedTrials = subscriptions.filter((s) =>
    s.is_trial && s.status === 'active'
    ).length;
    const conversionRate = totalTrials > 0 ? convertedTrials / totalTrials * 100 : 0;

    // Churn rate (simplified)
    const churnRate = totalSubscriptions > 0 ?
    cancelledSubscriptions / totalSubscriptions * 100 :
    0;

    // Plan distribution
    const planDistribution = plans.map((plan) => {
      const count = subscriptions.filter((s) => s.subscription_plan_id === plan.id).length;
      return {
        name: plan.plan_name,
        value: count,
        percentage: totalSubscriptions > 0 ? count / totalSubscriptions * 100 : 0
      };
    });

    // Growth data (mock for demonstration)
    const growthData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const daySubscriptions = Math.floor(Math.random() * 10) + 1;
      return {
        date: date.toISOString().split('T')[0],
        subscriptions: daySubscriptions,
        revenue: daySubscriptions * 2500 // Average revenue per subscription
      };
    });

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      totalRevenue,
      recentRevenue,
      monthlyRevenue,
      conversionRate,
      churnRate,
      planDistribution,
      growthData,
      recentSubscriptions: recentSubscriptions.length
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const exportData = () => {
    // Mock export functionality
    toast({
      title: 'Export Started',
      description: 'Analytics data export will be ready shortly'
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) =>
        <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        )}
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Subscription Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your subscription business
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold">{analytics.totalSubscriptions}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">
                +{analytics.recentSubscriptions} this period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.monthlyRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">MRR</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress value={analytics.conversionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold">{analytics.churnRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <Progress value={analytics.churnRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Growth</CardTitle>
              <CardDescription>New subscriptions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="subscriptions" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Subscription breakdown by plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.planDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value">

                      {analytics.planDistribution.map((entry: any, index: number) =>
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  {analytics.planDistribution.map((plan: any, index: number) =>
                  <div key={plan.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      </div>
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {plan.value} ({plan.percentage.toFixed(1)}%)
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default SubscriptionAnalytics;