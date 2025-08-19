
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AnalyticsChart from './AnalyticsChart';

interface TrendsAnalyzerProps {
  timeRange: string;
  category: string;
}

const TrendsAnalyzer: React.FC<TrendsAnalyzerProps> = ({ timeRange, category }) => {
  const [trendsData, setTrendsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const { toast } = useToast();

  const loadTrendsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.run({
        path: 'getAnalyticsTrends',
        param: [category, timeRange]
      });

      if (error) throw new Error(error);
      setTrendsData(data);
    } catch (error) {
      console.error('Failed to load trends data:', error);
      toast({
        title: "Error",
        description: "Failed to load trends data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendsData();
  }, [category, timeRange]);

  const getTrendDirection = (summary: any) => {
    if (!summary) return 'stable';
    if (summary.changePercentage > 5) return 'increasing';
    if (summary.changePercentage < -5) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading trends analysis...</p>
        </div>
      </div>);

  }

  if (!trendsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No trends data available.</p>
        <Button onClick={loadTrendsData} className="mt-4">
          Retry Loading
        </Button>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Trends Analysis
          </h2>
          <p className="text-muted-foreground">
            Historical trends and future projections for {category === 'all' ? 'all categories' : category}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="primary">Primary Only</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadTrendsData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(trendsData.trends).map(([categoryName, categoryData]: [string, any]) => {
          const direction = getTrendDirection(categoryData.summary);
          return (
            <Card key={categoryName}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                  {getTrendIcon(direction)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getTrendColor(direction)}`}>
                    {categoryData.summary?.changePercentage > 0 ? '+' : ''}
                    {categoryData.summary?.changePercentage?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{direction}</Badge>
                    <Badge variant="secondary">{categoryData.summary?.volatility || 'low'} volatility</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Change over {timeRange} period
                  </p>
                </div>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Detailed Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(trendsData.trends).map(([categoryName, categoryData]: [string, any]) =>
        <AnalyticsChart
          key={categoryName}
          title={`${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Trends`}
          type="line"
          data={categoryData.data}
          height={300}
          description={`Historical data with ${categoryData.forecast?.length || 0} day forecast`} />

        )}
      </div>

      {/* Forecast Section */}
      {trendsData.trends && Object.values(trendsData.trends)[0]?.forecast?.length > 0 &&
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              7-Day Forecast
            </CardTitle>
            <CardDescription>
              Projected values based on historical trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(trendsData.trends).map(([categoryName, categoryData]: [string, any]) => {
              const forecastData = [...categoryData.data.slice(-7), ...categoryData.forecast];
              return (
                <AnalyticsChart
                  key={`${categoryName}-forecast`}
                  title={`${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Forecast`}
                  type="line"
                  data={forecastData}
                  height={250} />);


            })}
            </div>
          </CardContent>
        </Card>
      }

      {/* Trend Analysis Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis Summary</CardTitle>
          <CardDescription>
            Key observations from the trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(trendsData.trends).map(([categoryName, categoryData]: [string, any]) => {
              const direction = getTrendDirection(categoryData.summary);
              return (
                <div key={categoryName} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getTrendIcon(direction)}
                  <div>
                    <h4 className="font-medium mb-1">
                      {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {direction === 'increasing' && 'Showing positive growth with upward trajectory'}
                      {direction === 'decreasing' && 'Experiencing decline, may require attention'}
                      {direction === 'stable' && 'Maintaining steady performance levels'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {Math.abs(categoryData.summary?.changePercentage || 0).toFixed(1)}% change
                      </Badge>
                      <Badge variant="secondary">
                        {categoryData.summary?.volatility || 'low'} volatility
                      </Badge>
                    </div>
                  </div>
                </div>);

            })}
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default TrendsAnalyzer;