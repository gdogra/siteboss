import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BoltIcon,
  TruckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { aiService, ScheduleOptimization, OptimizedTask, ResourceAllocation } from '../../services/aiService';

interface Task {
  id: string;
  name: string;
  description: string;
  duration: number;
  dependencies: string[];
  requiredCrew: string[];
  requiredEquipment: string[];
  weatherSensitive: boolean;
  priority: number;
  originalStart: Date;
  originalEnd: Date;
  optimizedStart?: Date;
  optimizedEnd?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

interface Resource {
  id: string;
  name: string;
  type: 'crew' | 'equipment';
  availability: number;
  skills?: string[];
  hourlyRate?: number;
}

interface WeatherForecast {
  date: Date;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  workabilityScore: number;
}

interface IntelligentScheduleOptimizerProps {
  projectId: string;
}

const IntelligentScheduleOptimizer: React.FC<IntelligentScheduleOptimizerProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [optimization, setOptimization] = useState<ScheduleOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedView, setSelectedView] = useState<'timeline' | 'resources' | 'conflicts'>('timeline');

  useEffect(() => {
    loadScheduleData();
  }, [projectId]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      
      // Load tasks, resources, and weather data
      const [taskData, resourceData, weatherData] = await Promise.all([
        loadProjectTasks(),
        loadProjectResources(),
        loadWeatherForecast()
      ]);
      
      setTasks(taskData);
      setResources(resourceData);
      setWeatherForecast(weatherData);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (): Promise<Task[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'task-1',
            name: 'Site Preparation',
            description: 'Clear and level construction site',
            duration: 3,
            dependencies: [],
            requiredCrew: ['excavation-crew'],
            requiredEquipment: ['excavator', 'bulldozer'],
            weatherSensitive: true,
            priority: 1,
            originalStart: new Date('2024-01-15'),
            originalEnd: new Date('2024-01-18'),
            status: 'not-started'
          },
          {
            id: 'task-2',
            name: 'Foundation Excavation',
            description: 'Excavate foundation trenches',
            duration: 5,
            dependencies: ['task-1'],
            requiredCrew: ['excavation-crew'],
            requiredEquipment: ['excavator'],
            weatherSensitive: true,
            priority: 1,
            originalStart: new Date('2024-01-19'),
            originalEnd: new Date('2024-01-24'),
            status: 'not-started'
          },
          {
            id: 'task-3',
            name: 'Foundation Concrete Pour',
            description: 'Pour concrete foundation',
            duration: 2,
            dependencies: ['task-2'],
            requiredCrew: ['concrete-crew'],
            requiredEquipment: ['concrete-mixer', 'pump'],
            weatherSensitive: true,
            priority: 1,
            originalStart: new Date('2024-01-25'),
            originalEnd: new Date('2024-01-27'),
            status: 'not-started'
          },
          {
            id: 'task-4',
            name: 'Framing',
            description: 'Install structural framing',
            duration: 8,
            dependencies: ['task-3'],
            requiredCrew: ['framing-crew'],
            requiredEquipment: ['crane'],
            weatherSensitive: false,
            priority: 2,
            originalStart: new Date('2024-01-29'),
            originalEnd: new Date('2024-02-06'),
            status: 'not-started'
          },
          {
            id: 'task-5',
            name: 'Electrical Rough-In',
            description: 'Install electrical wiring',
            duration: 4,
            dependencies: ['task-4'],
            requiredCrew: ['electrical-crew'],
            requiredEquipment: [],
            weatherSensitive: false,
            priority: 3,
            originalStart: new Date('2024-02-07'),
            originalEnd: new Date('2024-02-11'),
            status: 'not-started'
          },
          {
            id: 'task-6',
            name: 'Plumbing Rough-In',
            description: 'Install plumbing systems',
            duration: 3,
            dependencies: ['task-4'],
            requiredCrew: ['plumbing-crew'],
            requiredEquipment: [],
            weatherSensitive: false,
            priority: 3,
            originalStart: new Date('2024-02-07'),
            originalEnd: new Date('2024-02-10'),
            status: 'not-started'
          }
        ]);
      }, 500);
    });
  };

  const loadProjectResources = async (): Promise<Resource[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'excavation-crew',
            name: 'Excavation Team Alpha',
            type: 'crew',
            availability: 0.8,
            skills: ['excavation', 'site-prep'],
            hourlyRate: 85
          },
          {
            id: 'concrete-crew',
            name: 'Concrete Specialists',
            type: 'crew',
            availability: 0.9,
            skills: ['concrete', 'finishing'],
            hourlyRate: 75
          },
          {
            id: 'framing-crew',
            name: 'Framing Team Bravo',
            type: 'crew',
            availability: 0.7,
            skills: ['framing', 'carpentry'],
            hourlyRate: 80
          },
          {
            id: 'electrical-crew',
            name: 'Electric Pro Team',
            type: 'crew',
            availability: 0.95,
            skills: ['electrical', 'wiring'],
            hourlyRate: 95
          },
          {
            id: 'plumbing-crew',
            name: 'Plumbing Masters',
            type: 'crew',
            availability: 0.85,
            skills: ['plumbing', 'pipefitting'],
            hourlyRate: 90
          },
          {
            id: 'excavator',
            name: 'CAT 320 Excavator',
            type: 'equipment',
            availability: 0.8
          },
          {
            id: 'bulldozer',
            name: 'CAT D6 Bulldozer',
            type: 'equipment',
            availability: 0.9
          },
          {
            id: 'crane',
            name: 'Tower Crane TC-500',
            type: 'equipment',
            availability: 0.6
          }
        ]);
      }, 300);
    });
  };

  const loadWeatherForecast = async (): Promise<WeatherForecast[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const forecast: WeatherForecast[] = [];
        const startDate = new Date();
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          const temp = 65 + Math.random() * 20;
          const precipitation = Math.random() * 0.8;
          const windSpeed = 5 + Math.random() * 15;
          
          let workabilityScore = 10;
          if (precipitation > 0.3) workabilityScore -= 4;
          if (precipitation > 0.6) workabilityScore -= 3;
          if (windSpeed > 15) workabilityScore -= 2;
          if (temp < 40 || temp > 90) workabilityScore -= 2;
          
          forecast.push({
            date,
            temperature: temp,
            precipitation,
            windSpeed,
            workabilityScore: Math.max(0, workabilityScore)
          });
        }
        
        resolve(forecast);
      }, 400);
    });
  };

  const optimizeSchedule = async () => {
    try {
      setOptimizing(true);
      
      const constraints = {
        weatherForecast,
        resources,
        projectDeadline: new Date('2024-03-15'),
        priorities: tasks.map(t => ({ taskId: t.id, priority: t.priority }))
      };
      
      const result = await aiService.optimizeSchedule(projectId, constraints);
      setOptimization(result);
      
      // Apply optimized dates to tasks
      const optimizedTasks = tasks.map(task => {
        const optimizedTask = result.optimizedTasks.find(ot => ot.taskId === task.id);
        if (optimizedTask) {
          return {
            ...task,
            optimizedStart: optimizedTask.optimizedStart,
            optimizedEnd: new Date(optimizedTask.optimizedStart.getTime() + task.duration * 24 * 60 * 60 * 1000)
          };
        }
        return task;
      });
      
      setTasks(optimizedTasks);
    } catch (error) {
      console.error('Failed to optimize schedule:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getWorkabilityColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const calculateTimeSaved = () => {
    if (!optimization) return 0;
    
    const originalEnd = Math.max(...tasks.map(t => t.originalEnd.getTime()));
    const optimizedEnd = optimization.estimatedCompletion.getTime();
    
    return Math.max(0, Math.ceil((originalEnd - optimizedEnd) / (24 * 60 * 60 * 1000)));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Intelligent Schedule Optimizer</h2>
            <p className="text-gray-600">AI-powered scheduling with weather, resource, and dependency optimization</p>
          </div>
        </div>
        <button
          onClick={optimizeSchedule}
          disabled={optimizing}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {optimizing ? (
            <>
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Optimizing...
            </>
          ) : (
            <>
              <BoltIcon className="h-5 w-5 mr-2" />
              Optimize Schedule
            </>
          )}
        </button>
      </div>

      {/* Optimization Results Summary */}
      {optimization && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">{calculateTimeSaved()} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{(optimization.efficiency * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Resource Conflicts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {optimization.resourceAllocation.filter(r => r.conflictScore > 0.5).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">New Completion</p>
                <p className="text-lg font-bold text-gray-900">
                  {optimization.estimatedCompletion.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'timeline', name: 'Timeline View', icon: CalendarIcon },
              { id: 'resources', name: 'Resource Allocation', icon: UserGroupIcon },
              { id: 'conflicts', name: 'Conflicts & Issues', icon: ExclamationTriangleIcon }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`${
                    selectedView === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Timeline View */}
          {selectedView === 'timeline' && (
            <div className="space-y-6">
              {/* Weather Forecast Strip */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <CloudIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Weather Impact (Next 14 Days)
                </h3>
                <div className="flex space-x-1 overflow-x-auto pb-2">
                  {weatherForecast.slice(0, 14).map((weather, index) => (
                    <div key={index} className="flex-shrink-0 w-16 text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {weather.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`h-8 rounded mb-1 ${getWorkabilityColor(weather.workabilityScore)}`}></div>
                      <div className="text-xs text-gray-600">
                        {weather.workabilityScore}/10
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(weather.temperature)}°F
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Task Schedule {optimization ? '(Optimized)' : '(Original)'}
                </h3>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{task.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              Priority {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {task.duration} days
                            </span>
                            <span className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              {task.requiredCrew.length} crews
                            </span>
                            {task.requiredEquipment.length > 0 && (
                              <span className="flex items-center">
                                <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                                {task.requiredEquipment.length} equipment
                              </span>
                            )}
                            {task.weatherSensitive && (
                              <span className="flex items-center text-blue-600">
                                <CloudIcon className="h-4 w-4 mr-1" />
                                Weather Sensitive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Comparison */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Original Schedule</span>
                            <span className="text-sm font-medium">
                              {task.originalStart.toLocaleDateString()} - {task.originalEnd.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        {task.optimizedStart && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-primary-600 font-medium">Optimized Schedule</span>
                              <span className="text-sm font-medium text-primary-600">
                                {task.optimizedStart.toLocaleDateString()} - {task.optimizedEnd?.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dependencies */}
                      {task.dependencies.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-sm text-gray-600">Dependencies: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {task.dependencies.map((depId) => {
                              const depTask = tasks.find(t => t.id === depId);
                              return (
                                <span key={depId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {depTask?.name || depId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resource Allocation View */}
          {selectedView === 'resources' && optimization && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-green-500" />
                Resource Allocation Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Utilization */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Resource Utilization</h4>
                  <div className="space-y-4">
                    {optimization.resourceAllocation.map((allocation) => {
                      const resource = resources.find(r => r.id === allocation.resourceId);
                      if (!resource) return null;

                      return (
                        <div key={allocation.resourceId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {resource.type === 'crew' ? (
                                <UserGroupIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <WrenchScrewdriverIcon className="h-4 w-4 text-green-500" />
                              )}
                              <span className="font-medium text-gray-900">{resource.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {(allocation.allocation * 100).toFixed(0)}% utilized
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full ${
                                allocation.allocation > 0.9 ? 'bg-red-500' :
                                allocation.allocation > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${allocation.allocation * 100}%` }}
                            ></div>
                          </div>
                          
                          {allocation.conflictScore > 0 && (
                            <div className="flex items-center text-sm text-red-600">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {(allocation.conflictScore * 100).toFixed(0)}% conflict risk
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resource Availability Calendar */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Availability Overview</h4>
                  <div className="space-y-3">
                    {resources.slice(0, 6).map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {resource.type === 'crew' ? (
                            <UserGroupIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <TruckIcon className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{resource.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            resource.availability > 0.8 ? 'bg-green-100 text-green-800' :
                            resource.availability > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {(resource.availability * 100).toFixed(0)}% available
                          </div>
                          {resource.hourlyRate && (
                            <p className="text-sm text-gray-600 mt-1">${resource.hourlyRate}/hr</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conflicts & Issues View */}
          {selectedView === 'conflicts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Schedule Conflicts & Issues
              </h3>

              {/* Resource Conflicts */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Resource Conflicts</h4>
                <div className="space-y-3">
                  {optimization?.resourceAllocation
                    .filter(r => r.conflictScore > 0.3)
                    .map((conflict) => {
                      const resource = resources.find(r => r.id === conflict.resourceId);
                      return (
                        <div key={conflict.resourceId} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                              <h5 className="font-medium text-red-900">
                                {resource?.name} - Over-allocation Conflict
                              </h5>
                              <p className="text-red-700 text-sm mt-1">
                                Resource is allocated at {(conflict.allocation * 100).toFixed(0)}% capacity 
                                with {(conflict.conflictScore * 100).toFixed(0)}% conflict probability.
                              </p>
                              <div className="mt-2">
                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                  Suggest Alternative →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }) || []
                  }
                </div>
              </div>

              {/* Weather Conflicts */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Weather-Related Issues</h4>
                <div className="space-y-3">
                  {tasks
                    .filter(task => task.weatherSensitive)
                    .map((task) => {
                      const startDate = task.optimizedStart || task.originalStart;
                      const weatherDuringTask = weatherForecast.find(w => 
                        w.date.toDateString() === startDate.toDateString()
                      );
                      
                      if (!weatherDuringTask || weatherDuringTask.workabilityScore > 6) return null;
                      
                      return (
                        <div key={task.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <CloudIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div className="flex-1">
                              <h5 className="font-medium text-yellow-900">
                                {task.name} - Weather Risk
                              </h5>
                              <p className="text-yellow-700 text-sm mt-1">
                                Scheduled during poor weather conditions. Workability score: {weatherDuringTask.workabilityScore}/10
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-yellow-600 mt-2">
                                <span>🌧️ {(weatherDuringTask.precipitation * 100).toFixed(0)}% rain chance</span>
                                <span>🌡️ {Math.round(weatherDuringTask.temperature)}°F</span>
                                <span>💨 {Math.round(weatherDuringTask.windSpeed)} mph</span>
                              </div>
                              <div className="mt-2">
                                <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
                                  Reschedule Task →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Dependency Issues */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dependency Chain Issues</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-900">Critical Path Analysis</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    No critical dependency conflicts detected. All task dependencies can be satisfied 
                    within the optimized schedule.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {optimization && (
        <div className="flex space-x-4">
          <button className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 font-medium">
            Apply Optimization
          </button>
          <button className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium">
            Export Schedule
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Save as Template
          </button>
        </div>
      )}
    </div>
  );
};

export default IntelligentScheduleOptimizer;