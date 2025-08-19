
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Server,
  DollarSign,
  Zap,
  RefreshCw,
  Plus,
  Minus,
  AlertTriangle } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScalingMetric {
  id: number;
  resource_type: string;
  current_usage: number;
  peak_usage: number;
  average_usage: number;
  capacity_total: number;
  capacity_available: number;
  scaling_recommendation: string;
  projected_need: number;
  cost_impact: number;
  timestamp: string;
}

const ScalingControlPanel = () => {
  const { toast } = useToast();
  const [scalingMetrics, setScalingMetrics] = useState<ScalingMetric[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScalingMetrics();
    const interval = setInterval(fetchScalingMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchScalingMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35450, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: "timestamp",
        IsAsc: false
      });

      if (error) throw error;

      setScalingMetrics(data?.List || []);
    } catch (error) {
      console.error('Error fetching scaling metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scaling metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleScalingData = async () => {
    try {
      const sampleData = [
      {
        resource_type: "CPU Cores",
        current_usage: 75,
        peak_usage: 95,
        average_usage: 68,
        capacity_total: 16,
        capacity_available: 4,
        scaling_recommendation: "Scale up recommended",
        projected_need: 20,
        cost_impact: 150,
        timestamp: new Date().toISOString()
      },
      {
        resource_type: "Memory (GB)",
        current_usage: 82,
        peak_usage: 89,
        average_usage: 70,
        capacity_total: 64,
        capacity_available: 12,
        scaling_recommendation: "Monitor closely",
        projected_need: 80,
        cost_impact: 200,
        timestamp: new Date().toISOString()
      },
      {
        resource_type: "Storage (TB)",
        current_usage: 45,
        peak_usage: 52,
        average_usage: 42,
        capacity_total: 10,
        capacity_available: 5.5,
        scaling_recommendation: "Adequate capacity",
        projected_need: 8,
        cost_impact: 0,
        timestamp: new Date().toISOString()
      },
      {
        resource_type: "Network Bandwidth",
        current_usage: 60,
        peak_usage: 85,
        average_usage: 55,
        capacity_total: 1000,
        capacity_available: 400,
        scaling_recommendation: "Consider upgrade",
        projected_need: 1200,
        cost_impact: 300,
        timestamp: new Date().toISOString()
      }];


      for (const data of sampleData) {
        const { error } = await window.ezsite.apis.tableCreate(35450, data);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Sample scaling data added successfully"
      });

      fetchScalingMetrics();
    } catch (error) {
      console.error('Error adding sample scaling data:', error);
      toast({
        title: "Error",
        description: "Failed to add sample scaling data",
        variant: "destructive"
      });
    }
  };

  const handleScaleResource = async (resourceType: string, action: 'up' | 'down') => {
    try {
      // In a real implementation, this would trigger actual scaling operations
      toast({
        title: "Scaling Operation Initiated",
        description: `${action === 'up' ? 'Scaling up' : 'Scaling down'} ${resourceType}. This may take a few minutes.`
      });

      // Simulate scaling operation
      setTimeout(() => {
        toast({
          title: "Scaling Complete",
          description: `${resourceType} has been successfully scaled ${action}.`
        });
        fetchScalingMetrics();
      }, 3000);
    } catch (error) {
      console.error('Error scaling resource:', error);
      toast({
        title: "Scaling Failed",
        description: `Failed to scale ${resourceType}`,
        variant: "destructive"
      });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    const lower = recommendation.toLowerCase();
    if (lower.includes('scale up') || lower.includes('upgrade')) {
      return 'bg-red-100 text-red-800';
    } else if (lower.includes('monitor') || lower.includes('consider')) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scaling Control Panel</h2>
          <p className="text-gray-600">Monitor resource usage and manage scaling operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchScalingMetrics} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {scalingMetrics.length === 0 &&
          <Button onClick={addSampleScalingData} variant="outline" size="sm">
              Add Sample Data
            </Button>
          }
        </div>
      </div>

      {scalingMetrics.length === 0 ?
      <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <Server className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Scaling Data</h3>
            <p className="text-gray-600 text-center mb-4">
              No scaling metrics are currently available. Add some sample data to get started.
            </p>
            <Button onClick={addSampleScalingData}>Add Sample Data</Button>
          </CardContent>
        </Card> :

      <>
          {/* Resource Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                <Server className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scalingMetrics.length}</div>
                <p className="text-xs text-gray-500">
                  Resource types monitored
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scalingMetrics.reduce((acc, m) => acc + m.current_usage, 0) / scalingMetrics.length || 0}%
                </div>
                <p className="text-xs text-gray-500">
                  Across all resources
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scale Recommendations</CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scalingMetrics.filter((m) => m.scaling_recommendation.toLowerCase().includes('scale')).length}
                </div>
                <p className="text-xs text-gray-500">
                  Actions needed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Monthly Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${scalingMetrics.reduce((acc, m) => acc + m.cost_impact, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  For recommended scaling
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resource Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scalingMetrics.map((metric) =>
          <Card key={metric.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.resource_type}</CardTitle>
                    <Badge className={getRecommendationColor(metric.scaling_recommendation)}>
                      {metric.scaling_recommendation}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Usage Statistics */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Usage</span>
                      <span className={`text-sm font-bold ${getUsageColor(metric.current_usage)}`}>
                        {metric.current_usage}%
                      </span>
                    </div>
                    <Progress value={metric.current_usage} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Peak (24h)</div>
                        <div className="font-medium">{metric.peak_usage}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Average</div>
                        <div className="font-medium">{metric.average_usage}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Information */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Capacity</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Total</div>
                        <div className="font-medium">{metric.capacity_total}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Available</div>
                        <div className="font-medium">{metric.capacity_available}</div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Impact */}
                  {metric.cost_impact > 0 &&
              <Alert>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        Scaling impact: +${metric.cost_impact}/month
                      </AlertDescription>
                    </Alert>
              }

                  {/* Scaling Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Updated: {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleScaleResource(metric.resource_type, 'down')}>

                        <Minus className="h-4 w-4 mr-1" />
                        Scale Down
                      </Button>
                      <Button
                    size="sm"
                    onClick={() => handleScaleResource(metric.resource_type, 'up')}>

                        <Plus className="h-4 w-4 mr-1" />
                        Scale Up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
          </div>
        </>
      }
    </div>);

};

export default ScalingControlPanel;