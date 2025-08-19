
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthMetric {
  id: number;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  category: string;
  threshold_warning: number;
  threshold_critical: number;
  status: string;
  timestamp: string;
  server_instance: string;
}

const SystemHealthMonitor = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchHealthMetrics();
    const interval = setInterval(fetchHealthMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35449, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "timestamp",
        IsAsc: false
      });

      if (error) throw error;

      setMetrics(data?.List || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch health metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleMetrics = async () => {
    try {
      const sampleMetrics = [
      {
        metric_name: "CPU Usage",
        metric_value: Math.random() * 100,
        metric_unit: "%",
        category: "System",
        threshold_warning: 70,
        threshold_critical: 90,
        status: "healthy",
        timestamp: new Date().toISOString(),
        server_instance: "web-01"
      },
      {
        metric_name: "Memory Usage",
        metric_value: Math.random() * 100,
        metric_unit: "%",
        category: "System",
        threshold_warning: 80,
        threshold_critical: 95,
        status: "healthy",
        timestamp: new Date().toISOString(),
        server_instance: "web-01"
      },
      {
        metric_name: "Disk Usage",
        metric_value: Math.random() * 100,
        metric_unit: "%",
        category: "Storage",
        threshold_warning: 85,
        threshold_critical: 95,
        status: "healthy",
        timestamp: new Date().toISOString(),
        server_instance: "web-01"
      },
      {
        metric_name: "Response Time",
        metric_value: Math.random() * 1000 + 50,
        metric_unit: "ms",
        category: "Performance",
        threshold_warning: 500,
        threshold_critical: 1000,
        status: "healthy",
        timestamp: new Date().toISOString(),
        server_instance: "web-01"
      }];


      for (const metric of sampleMetrics) {
        // Update status based on thresholds
        if (metric.metric_value >= metric.threshold_critical) {
          metric.status = "critical";
        } else if (metric.metric_value >= metric.threshold_warning) {
          metric.status = "warning";
        }

        const { error } = await window.ezsite.apis.tableCreate(35449, metric);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Sample health metrics added successfully"
      });

      fetchHealthMetrics();
    } catch (error) {
      console.error('Error adding sample metrics:', error);
      toast({
        title: "Error",
        description: "Failed to add sample metrics",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':return 'bg-green-500';
      case 'warning':return 'bg-yellow-500';
      case 'critical':return 'bg-red-500';
      default:return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':return <CheckCircle className="h-4 w-4" />;
      case 'warning':return <AlertTriangle className="h-4 w-4" />;
      case 'critical':return <AlertTriangle className="h-4 w-4" />;
      default:return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getProgressValue = (value: number, category: string) => {
    if (category === "Performance") {
      // For performance metrics like response time, lower is better
      return Math.min(value / 1000 * 100, 100);
    }
    return Math.min(value, 100);
  };

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, HealthMetric[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-gray-600">Real-time system performance and health metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={fetchHealthMetrics} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={addSampleMetrics} variant="outline" size="sm">
            Add Sample Data
          </Button>
        </div>
      </div>

      {metrics.length === 0 ?
      <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Metrics</h3>
            <p className="text-gray-600 text-center mb-4">
              No system health metrics are currently available. Add some sample data to get started.
            </p>
            <Button onClick={addSampleMetrics}>Add Sample Metrics</Button>
          </CardContent>
        </Card> :

      Object.entries(groupedMetrics).map(([category, categoryMetrics]) =>
      <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{category} Metrics</span>
                <Badge variant="outline">{categoryMetrics.length} metrics</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryMetrics.map((metric) =>
            <div key={metric.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
                        <span className="font-medium">{metric.metric_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getStatusIcon(metric.status)}
                        <span className="ml-1 capitalize">{metric.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {metric.metric_value.toFixed(1)}{metric.metric_unit}</span>
                        <span className="text-gray-500">{metric.server_instance}</span>
                      </div>
                      
                      <Progress
                  value={getProgressValue(metric.metric_value, metric.category)}
                  className="h-2" />

                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Warning: {metric.threshold_warning}{metric.metric_unit}</span>
                        <span>Critical: {metric.threshold_critical}{metric.metric_unit}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
            )}
              </div>
            </CardContent>
          </Card>
      )
      }
    </div>);

};

export default SystemHealthMonitor;