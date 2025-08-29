import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { api } from '../../services/api';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import GanttChart from '../ProjectManagement/GanttChart';

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  avgCompletionTime: number;
  onTimeDelivery: number;
}

interface FilterOptions {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignedTo: string | 'all';
  project: string | 'all';
  search: string;
  sortBy: 'title' | 'due_date' | 'priority' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'gantt'>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    project: 'all',
    search: '',
    sortBy: 'due_date',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Mock task data
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Review project blueprints',
          description: 'Review and approve the architectural blueprints for the new office building',
          status: 'in_progress',
          priority: 'high',
          assigned_to: 'John Smith',
          project_id: '1',
          due_date: new Date('2024-02-15'),
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-15'),
          estimated_hours: 8,
          actual_hours: 4,
          completion_percentage: 50
        },
        {
          id: '2',
          title: 'Site inspection preparation',
          description: 'Prepare documentation and schedule for weekly site inspection',
          status: 'not_started',
          priority: 'medium',
          assigned_to: 'Sarah Wilson',
          project_id: '2',
          due_date: new Date('2024-02-10'),
          created_at: new Date('2024-01-08'),
          updated_at: new Date('2024-01-08'),
          estimated_hours: 4,
          actual_hours: 0,
          completion_percentage: 0
        },
        {
          id: '3',
          title: 'Update project timeline',
          description: 'Update project timeline based on latest progress reports',
          status: 'completed',
          priority: 'low',
          assigned_to: 'Mike Johnson',
          project_id: '1',
          due_date: new Date('2024-01-30'),
          created_at: new Date('2024-01-05'),
          updated_at: new Date('2024-01-25'),
          estimated_hours: 2,
          actual_hours: 3,
          completion_percentage: 100
        },
        {
          id: '4',
          title: 'Material procurement',
          description: 'Coordinate with suppliers for construction materials delivery',
          status: 'in_progress',
          priority: 'critical',
          assigned_to: 'Lisa Chen',
          project_id: '3',
          due_date: new Date('2024-02-08'),
          created_at: new Date('2024-01-12'),
          updated_at: new Date('2024-01-18'),
          estimated_hours: 12,
          actual_hours: 8,
          completion_percentage: 75
        },
        {
          id: '5',
          title: 'Safety inspection',
          description: 'Conduct monthly safety inspection of construction site',
          status: 'on_hold',
          priority: 'critical',
          assigned_to: 'David Brown',
          project_id: '2',
          due_date: new Date('2024-01-25'),
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-20'),
          estimated_hours: 6,
          actual_hours: 0,
          completion_percentage: 0
        }
      ];

      // Mock projects
      const mockProjects = [
        { id: '1', name: 'Downtown Office Complex' },
        { id: '2', name: 'Residential Villa Project' },
        { id: '3', name: 'Shopping Mall Renovation' }
      ];

      // Mock users
      const mockUsers = [
        { id: '1', name: 'John Smith' },
        { id: '2', name: 'Sarah Wilson' },
        { id: '3', name: 'Mike Johnson' },
        { id: '4', name: 'Lisa Chen' },
        { id: '5', name: 'David Brown' }
      ];

      // Mock stats
      const mockStats: TaskStats = {
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter(t => t.status === 'completed').length,
        overdueTasks: mockTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
        inProgressTasks: mockTasks.filter(t => t.status === 'in_progress').length,
        avgCompletionTime: 5.2,
        onTimeDelivery: 78
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTasks(mockTasks);
      setProjects(mockProjects);
      setUsers(mockUsers);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching task data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    let result = [...tasks];

    // Apply filters
    if (filters.search) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    if (filters.assignedTo !== 'all') {
      result = result.filter(task => task.assigned_to === filters.assignedTo);
    }

    if (filters.project !== 'all') {
      result = result.filter(task => task.project_id === filters.project);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'due_date':
          aValue = new Date(a.due_date || '2099-12-31');
          bValue = new Date(b.due_date || '2099-12-31');
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filters]);

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task]);
    setIsCreateModalOpen(false);
    fetchInitialData(); // Refresh stats
  };

  const handleTaskUpdated = (taskData: Partial<Task>) => {
    if (!taskData.id) return;
    
    setTasks(prev =>
      prev.map(task =>
        task.id === taskData.id ? { ...task, ...taskData } : task
      )
    );
    fetchInitialData(); // Refresh stats
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setIsDetailsModalOpen(false);
    setSelectedTask(null);
    fetchInitialData(); // Refresh stats
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderBoard = () => {
    const statusColumns: { status: TaskStatus; title: string; color: string }[] = [
      { status: 'not_started', title: 'To Do', color: 'border-gray-300' },
      { status: 'in_progress', title: 'In Progress', color: 'border-blue-300' },
      { status: 'completed', title: 'Done', color: 'border-green-300' },
      { status: 'on_hold', title: 'On Hold', color: 'border-yellow-300' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map(column => {
          const columnTasks = filteredAndSortedTasks.filter(task => task.status === column.status);
          
          return (
            <div key={column.status} className={`bg-gray-50 rounded-lg p-4 border-t-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-700 text-sm rounded-full px-2 py-1">
                  {columnTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                    compact
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ClipboardDocumentListIcon className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage tasks, deadlines, and project schedules
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'board'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'gantt'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gantt
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.completedTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.inProgressTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.overdueTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Time</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.avgCompletionTime || 0}d</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">On-Time Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.onTimeDelivery || 0}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Assignees</option>
              {users?.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              )) || []}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="due_date-asc">Due Date (Soon)</option>
              <option value="due_date-desc">Due Date (Later)</option>
              <option value="priority-desc">Priority (High)</option>
              <option value="priority-asc">Priority (Low)</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="created_at-desc">Newest</option>
              <option value="created_at-asc">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredAndSortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
          
          {filteredAndSortedTasks.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or create a new task.
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'board' && renderBoard()}

      {viewMode === 'gantt' && (
        <div className="bg-white shadow rounded-lg p-6">
          <GanttChart tasks={filteredAndSortedTasks} />
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        projects={projects}
        users={users}
      />

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default TaskManagement;