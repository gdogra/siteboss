import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { api } from '../../services/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  projects: any[];
  users: any[];
}

interface TaskFormData {
  title: string;
  description: string;
  project_id: string;
  phase_id: string;
  assigned_to: string;
  start_date: string;
  due_date: string;
  estimated_hours: string;
  priority: TaskPriority;
  status: TaskStatus;
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  project_id: '',
  phase_id: '',
  assigned_to: '',
  start_date: '',
  due_date: '',
  estimated_hours: '',
  priority: 'medium',
  status: 'not_started'
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  projects,
  users
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Fetch phases when project changes
    if (name === 'project_id' && value) {
      fetchProjectPhases(value);
    }
  };

  const fetchProjectPhases = async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}/phases`);
      setPhases(response.data);
    } catch (error) {
      console.error('Error fetching phases:', error);
      setPhases([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        project_id: formData.project_id,
        phase_id: formData.phase_id || null,
        assigned_to: formData.assigned_to || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        priority: formData.priority,
        status: formData.status
      };

      const response = await api.post<Task>('/tasks', taskData);
      onTaskCreated(response.data);
      setFormData(initialFormData);
      setPhases([]);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setPhases([]);
    setError(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Task
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter task title"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Task description (optional)"
                      />
                    </div>
                  </div>

                  {/* Project and Phase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
                        Project *
                      </label>
                      <select
                        name="project_id"
                        id="project_id"
                        required
                        value={formData.project_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select a project</option>
                        {projects?.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        )) || []}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="phase_id" className="block text-sm font-medium text-gray-700">
                        Phase
                      </label>
                      <select
                        name="phase_id"
                        id="phase_id"
                        value={formData.phase_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        disabled={!formData.project_id}
                      >
                        <option value="">No specific phase</option>
                        {phases?.map(phase => (
                          <option key={phase.id} value={phase.id}>
                            {phase.name}
                          </option>
                        )) || []}
                      </select>
                    </div>
                  </div>

                  {/* Assignment and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                        Assign To
                      </label>
                      <div className="mt-1 relative">
                        <select
                          name="assigned_to"
                          id="assigned_to"
                          value={formData.assigned_to}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
                        >
                          <option value="">Unassigned</option>
                          {users?.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.role})
                            </option>
                          )) || []}
                        </select>
                        <UserIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        name="priority"
                        id="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Initial Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="date"
                          name="start_date"
                          id="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pr-10"
                        />
                        <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="date"
                          name="due_date"
                          id="due_date"
                          value={formData.due_date}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pr-10"
                        />
                        <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700">
                        Estimated Hours
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="number"
                          name="estimated_hours"
                          id="estimated_hours"
                          min="0"
                          step="0.5"
                          value={formData.estimated_hours}
                          onChange={handleInputChange}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
                          placeholder="0"
                        />
                        <ClockIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateTaskModal;