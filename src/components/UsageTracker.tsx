
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Users, 
  Database, 
  Zap, 
  AlertTriangle, 
  TrendingUp,
  RefreshCw 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface UsageMetric {
  id: number;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  billable_quantity: number;
  overage_amount: number;
  period_start: string;
  period_end: string;
}

const UsageTracker: React.FC = () => {
  const { subscription, plans } = useSubscription();
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([]);
  const [featureLimits, setFeatureLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, [subscription]);

  const loadUsageData = async () => {
    if (!subscription?.id) {
      setLoading(false);
      return;
    }

    try {
      // Load current usage metrics
      const { data: usageData, error: usageError } = await window.ezsite.apis.tablePage('35513', {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'recorded_at',
        IsAsc: false,
        Filters: [
          { name: 'user_subscription_id', op: 'Equal', value: subscription.id },
          { name: 'period_start', op: 'GreaterThanOrEqual', value: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() }
        ]
      });

      if (usageError) throw usageError;
      setUsageMetrics(usageData.List);

      // Load feature limits for current plan
      const { data: limitsData, error: limitsError } = await window.ezsite.apis.tablePage('35514', {
        PageNo: 1,
        PageSize: 20,
        Filters: [
          { name: 'subscription_plan_id', op: 'Equal', value: subscription.subscription_plan_id },
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });

      if (limitsError) throw limitsError;
      setFeatureLimits(limitsData.List);

    } catch (error) {
      console.error('Error loading usage data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load usage information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async (metricName: string, incrementValue: number = 1) => {
    if (!subscription?.id) return;

    try {
      const { data, error } = await window.ezsite.apis.run({
        path: 'trackUsage',
        param: [subscription.id, metricName, incrementValue, {}]
      });

      if (error) throw error;

      // Insert usage record
      await window.ezsite.apis.tableCreate('35513', {
        user_subscription_id: subscription.id,
        metric_name: metricName,
        metric_value: incrementValue,
        metric_unit: getMetricUnit(metricName),
        period_start: data.period_start,
        period_end: data.period_end,
        recorded_at: data.recorded_at,
        metadata: data.metadata
      });

      await loadUsageData();

    } catch (error) {
      console.error('Error tracking usage:', error);
      toast({
        title: 'Error',
        description: 'Failed to track usage',
        variant: 'destructive'
      });
    }
  };

  const getMetricUnit = (metricName: string): string => {
    const units: Record<string, string> = {
      'api_calls': 'calls',
      'storage_used': 'GB',
      'users_active': 'users',
      'projects': 'projects',
      'emails_sent': 'emails',
      'reports_generated': 'reports'
    };
    return units[metricName] || 'units';
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'api_calls': return <Zap className="h-4 w-4" />;
      case 'storage_used': return <Database className="h-4 w-4" />;
      case 'users_active': return <Users className="h-4 w-4" />;
      case 'projects': return <BarChart className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const calculateUsagePercentage = (metricName: string, currentUsage: number): number => {
    const limit = featureLimits.find(f => f.feature_key === metricName);
    if (!limit || limit.limit_value === -1) return 0; // Unlimited
    
    return Math.min((currentUsage / limit.limit_value) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 100) return { color: 'destructive', label: 'Over Limit' };
    if (percentage >= 90) return { color: 'warning', label: 'Near Limit' };
    if (percentage >= 70) return { color: 'default', label: 'High Usage' };
    return { color: 'secondary', label: 'Normal' };
  };

  const formatUsageValue = (value: number, unit: string): string => {
    if (unit === 'GB' && value > 1000) {
      return `${(value / 1000).toFixed(1)}TB`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const groupedMetrics = usageMetrics.reduce((acc, metric) => {
    if (!acc[metric.metric_name]) {
      acc[metric.metric_name] = {
        total: 0,
        unit: metric.metric_unit,
        overage: 0
      };
    }
    acc[metric.metric_name].total += metric.metric_value;
    acc[metric.metric_name].overage += metric.overage_amount;
    return acc;
  }, {} as Record<string, any>);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedMetrics).map(([metricName, data]) => {
          const percentage = calculateUsagePercentage(metricName, data.total);
          const status = getUsageStatus(percentage);
          const limit = featureLimits.find(f => f.feature_key === metricName);

          return (
            <Card key={metricName}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getMetricIcon(metricName)}
                    {metricName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </CardTitle>
                  <Badge variant={status.color as any} className="text-xs">
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {limit && limit.limit_value !== -1 ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatUsageValue(data.total, data.unit)}</span>
                        <span className="text-muted-foreground">
                          of {formatUsageValue(limit.limit_value, data.unit)}
                        </span>
                      </div>
                      <Progress value={percentage} className={`h-2 ${status.color}`} />
                    </div>

                    {data.overage > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Overage: ${(data.overage / 100).toFixed(2)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div className="text-center py-2">
                    <div className="text-2xl font-bold">
                      {formatUsageValue(data.total, data.unit)}
                    </div>
                    <p className="text-xs text-muted-foreground">Unlimited</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Usage Management
          </CardTitle>
          <CardDescription>
            Track and manage your resource usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => trackUsage('api_calls', 10)}
            >
              Track API Calls (+10)
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => trackUsage('storage_used', 1)}
            >
              Track Storage (+1GB)
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => trackUsage('emails_sent', 5)}
            >
              Track Emails (+5)
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={loadUsageData}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          {/* Overage Alert */}
          {Object.values(groupedMetrics).some((data: any) => data.overage > 0) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have usage overages that will be billed at the end of your billing cycle.
                Consider upgrading your plan to avoid additional charges.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageTracker;
