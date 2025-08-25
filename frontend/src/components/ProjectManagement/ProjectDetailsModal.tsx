import React, { useState, Fragment } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserGroupIcon,
  DocumentIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { Project, ProjectStatus } from '../../types';
import { api } from '../../services/api';

interface ProjectDetailsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: string) => void;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  total_budget?: number;
  contract_value?: number;
  start_date?: string;
  end_date?: string;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  onProjectDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<UpdateProjectData>({});

  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ProjectStatus): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateProgress = (): number => {
    if (!project.start_date || !project.end_date) return 0;
    
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const currentDate = new Date();
    
    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: project.name,
      description: project.description,
      status: project.status,
      total_budget: project.total_budget,
      contract_value: project.contract_value,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : ''
    });
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put<Project>(`/projects/${project.id}`, editData);
      onProjectUpdated(response.data);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/projects/${project.id}`);
      onProjectDeleted(project.id);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete project');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setError(null);
  };

  const tabs = [
    { name: 'Overview', icon: ChartBarIcon },
    { name: 'Tasks', icon: ClipboardDocumentListIcon },
    { name: 'Budget', icon: CurrencyDollarIcon },
    { name: 'Team', icon: UserGroupIcon },
    { name: 'Documents', icon: DocumentIcon },
    { name: 'Resources', icon: WrenchScrewdriverIcon }
  ];

  const progress = calculateProgress();
  const isOverdue = project.end_date && new Date() > new Date(project.end_date) && project.status !== 'completed';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-xl font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-primary-500 bg-transparent"
                        />
                      ) : (
                        <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                          {project.name}
                        </Dialog.Title>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={handleEdit}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleCancel}
                            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-3 py-1 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-1/4 border-r border-gray-200 p-6">
                    <div className="space-y-6">
                      {/* Quick Stats */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Project Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{project.address}</span>
                          </div>
                          
                          {project.start_date && (
                            <div className="flex items-center text-sm">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-600">
                                {new Date(project.start_date).toLocaleDateString()}
                                {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString()}`}
                              </span>
                            </div>
                          )}

                          {project.total_budget && (
                            <div className="flex items-center text-sm">
                              <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-600">
                                ${project.total_budget.toLocaleString()} budget
                              </span>
                            </div>
                          )}

                          {project.contract_value && (
                            <div className="flex items-center text-sm">
                              <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-gray-600">
                                ${project.contract_value.toLocaleString()} contract
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {project.status === 'active' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Progress</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Completion</span>
                              <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                {Math.round(progress)}%
                                {isOverdue && ' (Overdue)'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isOverdue ? 'bg-red-500' : 'bg-primary-600'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {project.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                          {isEditing ? (
                            <textarea
                              value={editData.description || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full text-sm text-gray-600 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">{project.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1">
                    <Tab.Group>
                      <Tab.List className="flex space-x-1 border-b border-gray-200">
                        {tabs.map((tab) => (
                          <Tab
                            key={tab.name}
                            className={({ selected }) =>
                              `flex items-center px-4 py-3 text-sm font-medium border-b-2 border-transparent focus:outline-none ${
                                selected
                                  ? 'border-primary-500 text-primary-600'
                                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`
                            }
                          >
                            <tab.icon className="h-4 w-4 mr-2" />
                            {tab.name}
                          </Tab>
                        ))}
                      </Tab.List>

                      <Tab.Panels className="p-6">
                        {/* Overview Tab */}
                        <Tab.Panel>
                          <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Project Overview</h3>
                            
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Duration</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                      {project.estimated_duration || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500">days</p>
                                  </div>
                                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              </div>

                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Budget</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                      ${(project.total_budget || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">allocated</p>
                                  </div>
                                  <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              </div>

                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                      {project.profit_margin || 0}%
                                    </p>
                                    <p className="text-xs text-gray-500">target</p>
                                  </div>
                                  <ChartBarIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              </div>
                            </div>

                            {/* Status Actions */}
                            {isEditing && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Project Status
                                </label>
                                <select
                                  value={editData.status || project.status}
                                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                                  className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                >
                                  <option value="planning">Planning</option>
                                  <option value="active">Active</option>
                                  <option value="on_hold">On Hold</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </Tab.Panel>

                        {/* Other Tabs - Placeholders */}
                        <Tab.Panel>
                          <div className="text-center py-12">
                            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Task Management</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Task management features coming soon...
                            </p>
                          </div>
                        </Tab.Panel>

                        <Tab.Panel>
                          <div className="text-center py-12">
                            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Budget Tracking</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Budget tracking features coming soon...
                            </p>
                          </div>
                        </Tab.Panel>

                        <Tab.Panel>
                          <div className="text-center py-12">
                            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Team Management</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Team management features coming soon...
                            </p>
                          </div>
                        </Tab.Panel>

                        <Tab.Panel>
                          <div className="text-center py-12">
                            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Document Management</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Document management features coming soon...
                            </p>
                          </div>
                        </Tab.Panel>

                        <Tab.Panel>
                          <div className="text-center py-12">
                            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Resource Management</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Resource management features coming soon...
                            </p>
                          </div>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProjectDetailsModal;