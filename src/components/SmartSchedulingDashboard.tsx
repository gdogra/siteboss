import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  CloudRain,
  Sun,
  AlertTriangle,
  TrendingUp,
  Users,
  Wrench,
  RefreshCw,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  Target
} from 'lucide-react';
import { 
  smartSchedulingService, 
  SmartScheduleOptimization, 
  TaskSchedule, 
  SchedulingConstraint,
  WeatherData
} from '@/services/smartSchedulingService';

interface SmartSchedulingDashboardProps {
  projectId: string;
  className?: string;
}

const SmartSchedulingDashboard: React.FC<SmartSchedulingDashboardProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [optimization, setOptimization] = useState<SmartScheduleOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadScheduleOptimization();
  }, [projectId]);

  const loadScheduleOptimization = async () => {
    try {
      setLoading(true);
      
      // Mock project tasks
      const mockTasks = [
        {
          id: 'task-1',
          name: 'Foundation Excavation',
          startDate: new Date(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          duration: 5,
          category: 'outdoor',
          priority: 'critical',
          dependencies: [],
          assignedResources: ['crew-alpha', 'excavator-001'],
          requiredResources: ['crew-alpha', 'excavator-001']
        },
        {
          id: 'task-2',
          name: 'Concrete Pour',
          startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          duration: 2,
          category: 'outdoor',
          priority: 'critical',
          dependencies: ['task-1'],
          assignedResources: ['crew-alpha', 'concrete-supplier'],
          requiredResources: ['concrete-supplier']
        },
        {
          id: 'task-3',
          name: 'Steel Framework',
          startDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          duration: 6,
          category: 'outdoor',
          priority: 'high',
          dependencies: ['task-2'],
          assignedResources: ['crew-beta', 'crane-001'],
          requiredResources: ['crane-001']
        },
        {
          id: 'task-4',
          name: 'Electrical Installation',
          startDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
          duration: 6,
          category: 'indoor',
          priority: 'medium',
          dependencies: ['task-3'],
          assignedResources: ['electrician-crew'],
          requiredResources: ['electrician-crew']
        }
      ];

      const result = await smartSchedulingService.optimizeProjectSchedule(
        projectId,
        mockTasks,
        [], // Let the service generate constraints automatically
        {
          prioritizeWeather: true,
          minimizeRisk: true,
          optimizeResources: true
        }
      );
      
      setOptimization(result);
    } catch (error) {
      console.error('Failed to load schedule optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy': return <CloudRain className="w-4 h-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'stormy': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Sun className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateScheduleHealth = () => {
    if (!optimization) return 0;
    
    const timelineSavings = optimization.timelineSavings;
    const costSavings = optimization.costSavings;
    const confidenceScore = optimization.confidenceScore;
    
    return Math.round((timelineSavings * 10 + costSavings / 1000 + confidenceScore * 50) / 3);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Smart Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Optimizing schedule...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!optimization) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Schedule Optimization Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to optimize schedule. Please try again.</p>
          <Button onClick={loadScheduleOptimization} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Optimization
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scheduleHealth = calculateScheduleHealth();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                AI-Powered Smart Scheduling
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {Math.round(optimization.confidenceScore * 100)}% confidence
                </Badge>
              </CardTitle>
              <CardDescription>
                Intelligent schedule optimization based on weather, resources, and constraints
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadScheduleOptimization}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Re-optimize
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Optimization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Schedule Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {scheduleHealth}%
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Optimized
              </Badge>
            </div>
            <Progress value={scheduleHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Time Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {optimization.timelineSavings.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Earlier project completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Cost Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(optimization.costSavings / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Resource optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {optimization.improvements.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimization strategies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Schedule Overview</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Timeline Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Comparison</CardTitle>
                <CardDescription>
                  Original vs Optimized timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimization.optimizedSchedule.map((task, index) => {
                  const original = optimization.originalSchedule[index];
                  const isImproved = task.optimizedEnd.getTime() < original.originalEnd.getTime();
                  
                  return (
                    <div key={task.taskId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{task.taskName}</span>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {/* Original Schedule */}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="w-16">Original:</span>
                          <span>{formatDate(original.originalStart)} → {formatDate(original.originalEnd)}</span>
                          <span className="ml-2">({original.duration} days)</span>
                        </div>
                        
                        {/* Optimized Schedule */}
                        <div className={`flex items-center text-xs ${isImproved ? 'text-green-600' : 'text-gray-600'}`}>
                          <span className="w-16">Optimized:</span>
                          <span>{formatDate(task.optimizedStart)} → {formatDate(task.optimizedEnd)}</span>
                          <span className="ml-2">({task.duration} days)</span>
                          {isImproved && <CheckCircle className="w-3 h-3 ml-2" />}
                        </div>
                      </div>
                      
                      {task.bufferTime > 0 && (
                        <div className="text-xs text-blue-600">
                          Buffer: +{task.bufferTime} days
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Risk Mitigation */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation</CardTitle>
                <CardDescription>
                  AI-identified risks and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimization.riskMitigation.map((risk, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {risk.riskType.replace('_', ' ')} Risk
                      </span>
                      <Badge variant="outline">
                        {Math.round(risk.probability * 100)}% chance
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {risk.mitigation}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Impact: {risk.impact}
                      </span>
                      <span className="font-medium">
                        Cost: ${risk.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Improvements</CardTitle>
              <CardDescription>
                AI-generated optimizations and their impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.improvements.map((improvement, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        {improvement.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {improvement.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        +{improvement.timeSaved} days saved
                      </div>
                      <div className="text-xs text-blue-600">
                        {Math.round(improvement.riskReduction * 100)}% risk reduction
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {improvement.affectedTasks.map((taskId) => {
                      const task = optimization.optimizedSchedule.find(t => t.taskId === taskId);
                      return (
                        <Badge key={taskId} variant="outline" className="text-xs">
                          {task?.taskName || taskId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constraints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Constraints</CardTitle>
              <CardDescription>
                Factors affecting your project schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Constraint details will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Optimization</CardTitle>
              <CardDescription>
                Equipment, labor, and material efficiency improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.resourceOptimization.map((resource, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                        {resource.resourceType === 'labor' && <Users className="w-4 h-4 text-blue-600" />}
                        {resource.resourceType === 'equipment' && <Wrench className="w-4 h-4 text-blue-600" />}
                        {resource.resourceType === 'material' && <BarChart3 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{resource.resourceId}</span>
                        <p className="text-xs text-muted-foreground capitalize">
                          {resource.resourceType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(resource.utilization * 100)}% utilized
                      </div>
                      {resource.savings > 0 && (
                        <div className="text-xs text-green-600">
                          ${resource.savings.toLocaleString()} saved
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {resource.optimization}
                  </p>
                  
                  <Progress value={resource.utilization * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartSchedulingDashboard;