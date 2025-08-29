import React, { useState } from 'react';
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface TaskManagementTabProps {
  projectId: string;
}

const TaskManagementTab: React.FC<TaskManagementTabProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Site Survey and Inspection',
      description: 'Conduct thorough site inspection and document existing conditions',
      status: 'completed',
      priority: 'high',
      assignee: 'John Smith',
      due_date: '2024-01-15',
      created_at: '2024-01-01',
      updated_at: '2024-01-10'
    },
    {
      id: '2',
      title: 'Foundation Excavation',
      description: 'Begin foundation excavation according to architectural plans',
      status: 'in_progress',
      priority: 'critical',
      assignee: 'Mike Johnson',
      due_date: '2024-01-25',
      created_at: '2024-01-05',
      updated_at: '2024-01-15'
    },
    {
      id: '3',
      title: 'Electrical Rough-in',
      description: 'Install electrical conduits and wiring infrastructure',
      status: 'todo',
      priority: 'medium',
      assignee: 'Sarah Wilson',
      due_date: '2024-02-10',
      created_at: '2024-01-08',
      updated_at: '2024-01-08'
    },
    {
      id: '4',
      title: 'Plumbing Installation',
      description: 'Install main plumbing lines and fixtures',
      status: 'blocked',
      priority: 'high',
      assignee: 'David Brown',
      due_date: '2024-02-15',
      created_at: '2024-01-10',
      updated_at: '2024-01-16'
    }
  ]);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    due_date: ''
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIconSolid className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'blocked':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCreateTask = () => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || '',
      description: newTask.description || '',
      status: newTask.status as Task['status'] || 'todo',
      priority: newTask.priority as Task['priority'] || 'medium',
      assignee: newTask.assignee || '',
      due_date: newTask.due_date || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      due_date: ''
    });
    setIsCreatingTask(false);
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate !== '';
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Task Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage project tasks and milestones
          </p>
        </div>
        <button
          onClick={() => setIsCreatingTask(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{taskStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIconSolid className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">{taskStats.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Blocked</p>
              <p className="text-lg font-semibold text-gray-900">{taskStats.blocked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Form */}
      {isCreatingTask && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create New Task</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assignee</label>
                <input
                  type="text"
                  value={newTask.assignee || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Assign to team member"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={2}
                value={newTask.description || ''}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newTask.priority || 'medium'}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newTask.status || 'todo'}
                  onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={newTask.due_date || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Task
              </button>
              <button
                onClick={() => setIsCreatingTask(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                )}
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {task.assignee || 'Unassigned'}
                  </div>
                  {task.due_date && (
                    <div className={`flex items-center ${isOverdue(task.due_date) ? 'text-red-600' : ''}`}>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue(task.due_date) && ' (Overdue)'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                  className="text-xs border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreatingTask(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementTab;