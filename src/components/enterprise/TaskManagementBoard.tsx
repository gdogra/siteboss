import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTasks } from '@/contexts/TasksContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Paperclip,
  DollarSign,
  Wrench,
  HardHat,
  X,
  Edit,
  Trash2,
  Save
} from 'lucide-react';

interface TaskDependency {
  id: string;
  title: string;
  status: string;
  completion_percentage: number;
}

interface TaskRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: 'weather' | 'safety' | 'technical' | 'resource' | 'schedule' | 'quality' | 'regulatory' | 'financial';
  description: string;
  mitigation: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface TaskLOE {
  optimistic_hours: number;
  most_likely_hours: number;
  pessimistic_hours: number;
  confidence_level: number; // 0-100
  complexity_factor: 'simple' | 'moderate' | 'complex' | 'highly_complex';
  skill_level_required: 'entry' | 'intermediate' | 'senior' | 'expert';
}

interface EnhancedTask {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completion_percentage: number;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  start_date?: string;
  estimated_hours: number;
  actual_hours: number;
  location?: string;
  cost_code?: string;
  weather_dependent: boolean;
  requires_inspection: boolean;
  inspection_passed?: boolean;
  safety_requirements?: string[];
  equipment_needed?: string[];
  materials_needed?: string[];
  dependencies: TaskDependency[];
  before_photos?: string[];
  progress_photos?: string[];
  after_photos?: string[];
  time_entries_count: number;
  billable_hours: number;
  quality_score?: number;
  rework_required: boolean;
  phase_name?: string;
  subtasks?: string[];
  loe: TaskLOE;
  risks: TaskRisk[];
}

interface TaskManagementBoardProps {
  projectId: string;
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

const TaskManagementBoard: React.FC<TaskManagementBoardProps> = ({ 
  projectId, 
  onTaskUpdate 
}) => {
  const { 
    getTasksByProject, 
    addTask, 
    updateTask, 
    deleteTask, 
    duplicateTask,
    bulkUpdateTasks,
    searchTasks,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks
  } = useTasks();
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'gantt'>('board');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<EnhancedTask | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    phase: '',
    search: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'not_started' as const,
    priority: 'medium' as const,
    assigned_to_name: '',
    due_date: '',
    start_date: '',
    estimated_hours: 8,
    location: '',
    cost_code: ''
  });

  const tasks = getTasksByProject(projectId);

  // Memoized filtered tasks to prevent fluctuations
  const filteredTasks = useMemo(() => {
    let filtered = tasks || [];

    if (filters.search) {
      filtered = searchTasks(projectId, filters.search) || [];
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.assignee) {
      filtered = filtered.filter(task => task.assigned_to_name?.includes(filters.assignee));
    }

    if (filters.phase) {
      filtered = filtered.filter(task => task.phase_name === filters.phase);
    }

    return filtered;
  }, [tasks, filters, projectId, searchTasks]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Task action handlers
  const handleTaskUpdate = (taskId: string, updates: any) => {
    const updatedTask = updateTask(taskId, updates);
    if (updatedTask && onTaskUpdate) {
      onTaskUpdate(taskId, updates);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleTaskDuplicate = (taskId: string) => {
    duplicateTask(taskId);
  };

  const handleAddTask = () => {
    const newTaskData = {
      projectId,
      title: 'New Task',
      description: 'Task description',
      status: 'not_started' as const,
      priority: 'medium' as const,
      completion_percentage: 0,
      estimated_hours: 8,
      actual_hours: 0,
      weather_dependent: false,
      requires_inspection: false,
      dependencies: [],
      time_entries_count: 0,
      billable_hours: 0,
      rework_required: false,
      subtasks: [],
      loe: {
        optimistic_hours: 6,
        most_likely_hours: 8,
        pessimistic_hours: 10,
        confidence_level: 75,
        complexity_factor: 'moderate' as const,
        skill_level_required: 'intermediate' as const
      },
      risks: []
    };
    addTask(newTaskData);
  };

  const handleBulkStatusUpdate = (taskIds: string[], status: any) => {
    bulkUpdateTasks(taskIds, { status });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assignee: '',
      phase: '',
      search: ''
    });
  };

  const handleCreateTask = () => {
    const taskData = {
      ...newTask,
      projectId: projectId,
      actual_hours: 0,
      completion_percentage: 0,
      assigned_to: 'USER001',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: [],
      equipment_needed: [],
      materials_needed: [],
      dependencies: [],
      time_entries_count: 0,
      billable_hours: 0,
      quality_score: 0,
      rework_required: false,
      phase_name: 'Construction',
      subtasks: [],
      loe: {
        optimistic_hours: newTask.estimated_hours * 0.8,
        most_likely_hours: newTask.estimated_hours,
        pessimistic_hours: newTask.estimated_hours * 1.3,
        confidence_level: 75,
        complexity_factor: 'moderate' as const,
        skill_level_required: 'intermediate' as const
      },
      risks: []
    };
    
    addTask(taskData);
    setNewTask({
      title: '',
      description: '',
      status: 'not_started',
      priority: 'medium',
      assigned_to_name: '',
      due_date: '',
      start_date: '',
      estimated_hours: 8,
      location: '',
      cost_code: ''
    });
    setShowAddTaskModal(false);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: EnhancedTask['status']) => {
    updateTask(taskId, { 
      status: newStatus,
      completion_percentage: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0
    });
  };

  const handleEditTask = (task: EnhancedTask) => {
    setEditingTask(task);
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      updateTask(editingTask.id, editingTask);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  // Get unique values for filter dropdowns
  const uniqueAssignees = [...new Set(tasks.map(task => task.assigned_to_name).filter(Boolean))];
  const uniquePhases = [...new Set(tasks.map(task => task.phase_name).filter(Boolean))];

  // Get task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    not_started: tasks.filter(t => t.status === 'not_started').length,
    overdue: getOverdueTasks(projectId).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canStartTask = (task: EnhancedTask) => {
    return task.dependencies.every(dep => dep.status === 'completed');
  };

  const renderTaskCard = (task: EnhancedTask) => (
    <Card 
      key={task.id} 
      className="mb-3 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border hover:border-gray-300 group"
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium mb-1 group-hover:text-blue-600 transition-colors">
              {task.title}
            </CardTitle>
            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          </div>
          <div className="flex space-x-1 ml-2">
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
          </div>
        </div>
        
        {task.completion_percentage > 0 && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{task.completion_percentage}%</span>
            </div>
            <Progress value={task.completion_percentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Assignment and timing */}
        <div className="space-y-2">
          {task.assigned_to_name && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="w-3 h-3 mr-1" />
              <span>{task.assigned_to_name}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
              {new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                <AlertTriangle className="w-3 h-3 ml-1 text-red-500" />
              )}
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-600">
            <Clock className="w-3 h-3 mr-1" />
            <span>{task.actual_hours}/{task.estimated_hours}h</span>
          </div>
          
          {task.location && (
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{task.location}</span>
            </div>
          )}
        </div>

        {/* Dependencies */}
        {task.dependencies.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs font-medium text-gray-700 mb-1">Dependencies:</div>
            {task.dependencies.map((dep, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-1" />
                  {dep.title}
                </span>
                <div className="flex items-center">
                  {dep.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <Badge variant="outline" className="text-xs py-0">
                      {dep.completion_percentage}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {!canStartTask(task) && task.status === 'not_started' && (
              <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mt-1">
                ⏳ Waiting for dependencies
              </div>
            )}
          </div>
        )}

        {/* Task attributes */}
        <div className="flex flex-wrap gap-1">
          {task.weather_dependent && (
            <Badge variant="outline" className="text-xs">
              ☁️ Weather
            </Badge>
          )}
          {task.requires_inspection && (
            <Badge variant="outline" className="text-xs">
              🔍 Inspection
            </Badge>
          )}
          {task.safety_requirements && task.safety_requirements.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <HardHat className="w-3 h-3 mr-1" />
              Safety
            </Badge>
          )}
          {task.progress_photos && task.progress_photos.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <Camera className="w-3 h-3 mr-1" />
              {task.progress_photos.length}
            </Badge>
          )}
          {task.cost_code && (
            <Badge variant="outline" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              {task.cost_code}
            </Badge>
          )}
        </div>

        {/* LOE Information */}
        {task.loe && (
          <div className="border-t pt-2">
            <div className="text-xs font-medium text-gray-700 mb-1">Level of Effort:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="text-gray-600">
                <span className="font-medium">Range:</span> {task.loe.optimistic_hours}h - {task.loe.pessimistic_hours}h
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Confidence:</span> {task.loe.confidence_level}%
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Complexity:</span> {task.loe.complexity_factor}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Skill Level:</span> {task.loe.skill_level_required}
              </div>
            </div>
          </div>
        )}

        {/* Risk Information */}
        {task.risks && task.risks.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs font-medium text-gray-700 mb-1">Risks ({task.risks.length}):</div>
            <div className="space-y-1">
              {task.risks.slice(0, 2).map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      risk.level === 'critical' ? 'border-red-500 text-red-700' :
                      risk.level === 'high' ? 'border-orange-500 text-orange-700' :
                      risk.level === 'medium' ? 'border-yellow-500 text-yellow-700' :
                      'border-green-500 text-green-700'
                    }`}
                  >
                    {risk.level}
                  </Badge>
                  <div className="flex-1 text-xs">
                    <div className="text-gray-700 font-medium">{risk.type}</div>
                    <div className="text-gray-600 truncate">{risk.description}</div>
                    <div className="text-gray-500 text-xs">Risk: {risk.probability}% | Impact: {risk.impact}</div>
                  </div>
                </div>
              ))}
              {task.risks.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{task.risks.length - 2} more risks...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs font-medium text-gray-700 mb-1">Subtasks ({task.subtasks.length}):</div>
            <div className="flex flex-wrap gap-1">
              {task.subtasks.slice(0, 3).map((subtask, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {subtask}
                </Badge>
              ))}
              {task.subtasks.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{task.subtasks.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-2 border-t gap-2">
          <Select
            value={task.status}
            onValueChange={(newStatus) => handleUpdateTaskStatus(task.id, newStatus as EnhancedTask['status'])}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditTask(task)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteTask(task.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleUpdateTaskStatus(taskId, newStatus as EnhancedTask['status']);
    }
  }, []);

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'border-gray-300 bg-gray-50';
      case 'in_progress':
        return 'border-blue-300 bg-blue-50';
      case 'on_hold':
        return 'border-yellow-300 bg-yellow-50';
      case 'completed':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in_progress':
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case 'on_hold':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderBoardView = () => {
    const columns = [
      { 
        title: 'Not Started', 
        status: 'not_started', 
        tasks: filteredTasks.filter(t => t.status === 'not_started'),
        description: 'Tasks waiting to begin'
      },
      { 
        title: 'In Progress', 
        status: 'in_progress', 
        tasks: filteredTasks.filter(t => t.status === 'in_progress'),
        description: 'Currently active tasks'
      },
      { 
        title: 'On Hold', 
        status: 'on_hold', 
        tasks: filteredTasks.filter(t => t.status === 'on_hold'),
        description: 'Temporarily paused'
      },
      { 
        title: 'Completed', 
        status: 'completed', 
        tasks: filteredTasks.filter(t => t.status === 'completed'),
        description: 'Finished tasks'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((column) => (
          <div 
            key={column.status} 
            className={`rounded-lg border-2 border-dashed transition-colors duration-200 ${getColumnColor(column.status)}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="p-4 border-b border-current border-opacity-20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getColumnIcon(column.status)}
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {column.tasks.length}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{column.description}</p>
            </div>
            
            <div className="p-3">
              <div className="space-y-3 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                      {getColumnIcon(column.status)}
                    </div>
                    <p className="text-xs">No tasks</p>
                  </div>
                ) : (
                  column.tasks.map(task => renderTaskCard(task))
                )}
              </div>
              
              {/* Add Task to Column Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewTask({...newTask, status: column.status as any});
                  setShowAddTaskModal(true);
                }}
                className="w-full mt-3 text-xs border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-white"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-2">
      {filteredTasks.map(task => (
        <Card key={task.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Checkbox />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{task.title}</h3>
                <p className="text-xs text-gray-600 truncate">{task.description}</p>
              </div>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)} variant="outline">
                {task.priority}
              </Badge>
              <div className="text-xs text-gray-600 w-24">
                {task.assigned_to_name}
              </div>
              <div className="text-xs text-gray-600 w-20">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
              </div>
              <div className="w-20">
                <Progress value={task.completion_percentage} className="h-2" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 w-64"
            />
          </div>
          
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority || "all"}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value === "all" ? "" : value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-600"
          >
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              onClick={() => setViewMode('board')}
            >
              Board
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
          
          <Button 
            size="sm"
            onClick={() => setShowAddTaskModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task view */}
      <div className="bg-white rounded-lg border">
        {viewMode === 'board' ? renderBoardView() : renderListView()}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Create New Task</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddTaskModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) => setNewTask({...newTask, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({...newTask, priority: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned_to_name">Assigned To</Label>
                    <Input
                      id="assigned_to_name"
                      value={newTask.assigned_to_name}
                      onChange={(e) => setNewTask({...newTask, assigned_to_name: e.target.value})}
                      placeholder="Enter assignee name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimated_hours">Estimated Hours</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask({...newTask, estimated_hours: parseInt(e.target.value) || 8})}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newTask.start_date}
                      onChange={(e) => setNewTask({...newTask, start_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newTask.location}
                      onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                      placeholder="Project location or area"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost_code">Cost Code</Label>
                    <Input
                      id="cost_code"
                      value={newTask.cost_code}
                      onChange={(e) => setNewTask({...newTask, cost_code: e.target.value})}
                      placeholder="e.g., SITE-001"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddTaskModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Edit Task</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingTask(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Task Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editingTask.status}
                      onValueChange={(value) => setEditingTask({...editingTask, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value) => setEditingTask({...editingTask, priority: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-completion">Completion Percentage</Label>
                  <Input
                    id="edit-completion"
                    type="number"
                    min="0"
                    max="100"
                    value={editingTask.completion_percentage}
                    onChange={(e) => setEditingTask({...editingTask, completion_percentage: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementBoard;