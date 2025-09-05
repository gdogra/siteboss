import React, { useState, useEffect } from 'react';
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
  status: 'todo' | 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  assignee_id?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface TaskManagementTabProps {
  projectId: string;
}

const isUuid = (v: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

const TaskManagementTab: React.FC<TaskManagementTabProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        if (!isUuid(projectId)) {
          // Demo project (mock) — skip API calls; tasks are local-only
          setTasks([]);
          setUsers([]);
          return;
        }
        const { taskApi, projectApi } = await import('../../services/api');
        const res: any = await taskApi.getTasks(projectId);
        const rows: any[] = res?.data || [];
        const mapped: Task[] = rows.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: (t.status === 'not_started' ? 'todo' : t.status) as Task['status'],
          priority: (t.priority || 'medium') as Task['priority'],
          assignee: t.assigned_user_name || '',
          assignee_id: t.assigned_to || undefined,
          due_date: t.due_date || '',
          created_at: t.created_at || new Date().toISOString(),
          updated_at: t.updated_at || new Date().toISOString(),
        }));
        setTasks(mapped);
        try {
          const ures: any = await projectApi.getProjectTeam(projectId);
          const urows: any[] = ures?.data || [];
          setUsers(urows.map((u: any) => ({ id: u.id, name: `${u.first_name} ${u.last_name}` })));
        } catch {}
      } catch {
        // keep empty on failure; UI will show empty state
      }
    };
    load();
  }, [projectId]);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    due_date: ''
  });

  const normalizeStatus = (status: Task['status']): 'todo' | 'in_progress' | 'completed' | 'blocked' =>
    status === 'not_started' ? 'todo' : status;

  const getStatusColor = (status: Task['status']) => {
    switch (normalizeStatus(status)) {
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
    switch (normalizeStatus(status)) {
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

  const handleCreateTask = async () => {
    const title = (newTask.title || '').trim();
    if (!title) {
      setFormError('Title is required');
      return;
    }
    setFormError(null);
    try {
      setSaving(true);
      if (!isUuid(projectId)) {
        // Local-only creation for demo projects
        const mapped: Task = {
          id: `task-${Date.now()}`,
          title,
          description: newTask.description || '',
          status: 'todo',
          priority: (newTask.priority || 'medium') as Task['priority'],
          assignee: users.find(u => u.id === newTask.assignee)?.name || '',
          assignee_id: newTask.assignee,
          due_date: newTask.due_date || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTasks(prev => [mapped, ...prev]);
      } else {
        const { taskApi } = await import('../../services/api');
        const payload: any = {
          project_id: projectId,
          title,
          description: newTask.description || undefined,
          priority: (newTask.priority || 'medium') as any,
        };
        
        // Only include assigned_to if it's a valid UUID
        if (newTask.assignee && isUuid(newTask.assignee)) {
          payload.assigned_to = newTask.assignee;
        }
        
        // Only include due_date if it's a valid date
        if (newTask.due_date && new Date(newTask.due_date).toString() !== 'Invalid Date') {
          payload.due_date = newTask.due_date;
        }
        const res: any = await taskApi.createTask(payload);
        const t = res?.data;
        const mapped: Task = {
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: (t.status === 'not_started' ? 'todo' : t.status) as Task['status'],
          priority: (t.priority || 'medium') as Task['priority'],
          assignee: t.assigned_user_name || '',
          assignee_id: t.assigned_to || undefined,
          due_date: t.due_date || '',
          created_at: t.created_at || new Date().toISOString(),
          updated_at: t.updated_at || new Date().toISOString(),
        };
        setTasks(prev => [mapped, ...prev]);
      }
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '', due_date: '' });
      setIsCreatingTask(false);
    } catch (e) {
      // Log for debugging context
      // eslint-disable-next-line no-console
      console.error('Create task failed:', e);
      try {
        const err: any = e;
        const details = err?.response?.data?.details;
        if (Array.isArray(details) && details.length > 0) {
          setFormError(details[0].message);
        } else if (err?.response?.data?.error) {
          setFormError(err.response.data.error);
        } else {
          setFormError('Failed to create task');
        }
      } catch {
        setFormError('Failed to create task');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      setSaving(true);
      if (!isUuid(projectId)) {
        setTasks(prev => prev.map(task => task.id === taskId ? ({
          ...task,
          status: newStatus,
          updated_at: new Date().toISOString()
        }) : task));
      } else {
        const { taskApi } = await import('../../services/api');
        const mappedStatus = newStatus === 'todo' ? 'not_started' : newStatus;
        await taskApi.updateTask(taskId, { status: mappedStatus });
        setTasks(prev => prev.map(task => task.id === taskId ? ({
          ...task,
          status: newStatus,
          updated_at: new Date().toISOString()
        }) : task));
      }
    } catch (e) {
      alert('Failed to update task status');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setSaving(true);
      if (!isUuid(projectId)) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        const { taskApi } = await import('../../services/api');
        await taskApi.deleteTask(taskId);
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } catch (e) {
      alert('Failed to delete task');
    } finally {
      setSaving(false);
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
                {formError && (
                  <p className="mt-1 text-xs text-red-600">{formError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assignee</label>
                <select
                  value={newTask.assignee || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
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
                disabled={saving || !(newTask.title || '').trim()}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${saving || !(newTask.title || '').trim() ? 'bg-primary-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
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
                    {normalizeStatus(task.status) === 'todo' ? 'To Do' : normalizeStatus(task.status).replace('_', ' ')}
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
                  value={normalizeStatus(task.status)}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                  className="text-xs border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <select
                  value={task.assignee_id || ''}
                  onChange={async (e) => {
                    const newAssigneeId = e.target.value || undefined;
                    try {
                      setSaving(true);
                      const { taskApi } = await import('../../services/api');
                      await taskApi.updateTask(task.id, { assigned_to: newAssigneeId || null });
                      const name = users.find(u => u.id === newAssigneeId)?.name || '';
                      setTasks(prev => prev.map(t => t.id === task.id ? ({ ...t, assignee_id: newAssigneeId, assignee: name }) : t));
                    } catch {
                      alert('Failed to update assignee');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="text-xs border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
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
