import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, UserIcon, DocumentTextIcon, CogIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Project, ProjectStatus } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

interface ProjectFormData {
  // Basic Info
  name: string;
  description: string;
  address: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  project_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Schedule
  start_date: string;
  end_date: string;
  estimated_duration: string;
  
  // Budget
  total_budget: string;
  contract_value: string;
  profit_margin: string;
  
  // Team
  project_manager: string;
  team_members: string[];
  supervisor: string;
  
  // Documents
  required_permits: string[];
  safety_requirements: string;
  special_requirements: string;
  
  // Settings
  status: ProjectStatus;
  visibility: 'public' | 'private' | 'team';
  notifications: {
    milestone_alerts: boolean;
    budget_alerts: boolean;
    deadline_reminders: boolean;
  };
}

const initialFormData: ProjectFormData = {
  // Basic Info
  name: '',
  description: '',
  address: '',
  client_name: '',
  client_email: '',
  client_phone: '',
  project_type: 'commercial',
  priority: 'medium',
  
  // Schedule
  start_date: '',
  end_date: '',
  estimated_duration: '',
  
  // Budget
  total_budget: '',
  contract_value: '',
  profit_margin: '',
  
  // Team
  project_manager: '',
  team_members: [],
  supervisor: '',
  
  // Documents
  required_permits: [],
  safety_requirements: '',
  special_requirements: '',
  
  // Settings
  status: 'planning',
  visibility: 'team',
  notifications: {
    milestone_alerts: true,
    budget_alerts: true,
    deadline_reminders: true
  }
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'budget' | 'team' | 'documents' | 'settings' | 'overview'>('basic');

  const tabs = [
    { key: 'basic', label: 'Basic Info', icon: DocumentTextIcon },
    { key: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { key: 'budget', label: 'Budget', icon: CurrencyDollarIcon },
    { key: 'team', label: 'Team', icon: UserIcon },
    { key: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { key: 'settings', label: 'Settings', icon: CogIcon },
    { key: 'overview', label: 'Overview', icon: EyeIcon }
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (name.includes('.')) {
      // Handle nested properties like notifications.milestone_alerts
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProjectFormData] as any,
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
    // Auto-calculate estimated duration when dates change
    if (name === 'start_date' || name === 'end_date') {
      const startDate = name === 'start_date' ? value : formData.start_date;
      const endDate = name === 'end_date' ? value : formData.end_date;
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setFormData(prev => ({ ...prev, estimated_duration: diffDays.toString() }));
      }
    }
    
    // Auto-calculate profit margin when budget values change
    if (name === 'total_budget' || name === 'contract_value') {
      const budget = parseFloat(name === 'total_budget' ? value : formData.total_budget) || 0;
      const contract = parseFloat(name === 'contract_value' ? value : formData.contract_value) || 0;
      
      if (budget > 0 && contract > 0) {
        const margin = ((contract - budget) / contract * 100);
        setFormData(prev => ({ ...prev, profit_margin: margin.toFixed(2) }));
      }
    }
  };

  const handleArrayAdd = (field: 'team_members' | 'required_permits', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field: 'team_members' | 'required_permits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock project creation - use partial type to match what we actually need
      const newProject: any = {
        id: `project-${Date.now()}`,
        name: formData.name,
        description: formData.description || '',
        address: formData.address,
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        status: formData.status,
        budget: formData.total_budget ? parseFloat(formData.total_budget) : 0,
        spent_amount: 0,
        client_name: formData.client_name || 'N/A',
        project_manager: formData.project_manager || 'Unassigned',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add additional fields from form data
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        project_type: formData.project_type,
        priority: formData.priority,
        estimated_duration: formData.estimated_duration,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : 0,
        profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : 0,
        supervisor: formData.supervisor,
        team_members: formData.team_members,
        required_permits: formData.required_permits,
        safety_requirements: formData.safety_requirements,
        special_requirements: formData.special_requirements,
        visibility: formData.visibility,
        notifications: formData.notifications
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onProjectCreated(newProject);
      setFormData(initialFormData);
      onClose();
    } catch (error: any) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setError(null);
    setActiveTab('basic');
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Project
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mt-6">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.key
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                  {/* Tab Content */}
                  <div className="space-y-6">
                    {activeTab === 'basic' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Project Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter project name"
                            />
                          </div>
                          <div>
                            <label htmlFor="project_type" className="block text-sm font-medium text-gray-700">
                              Project Type
                            </label>
                            <select
                              name="project_type"
                              id="project_type"
                              value={formData.project_type}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="residential">Residential</option>
                              <option value="commercial">Commercial</option>
                              <option value="industrial">Industrial</option>
                              <option value="renovation">Renovation</option>
                              <option value="infrastructure">Infrastructure</option>
                            </select>
                          </div>
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
                            placeholder="Project description"
                          />
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Project Address *
                          </label>
                          <input
                            type="text"
                            name="address"
                            id="address"
                            required
                            value={formData.address}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Project location address"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">
                              Client Name
                            </label>
                            <input
                              type="text"
                              name="client_name"
                              id="client_name"
                              value={formData.client_name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Client name"
                            />
                          </div>
                          <div>
                            <label htmlFor="client_email" className="block text-sm font-medium text-gray-700">
                              Client Email
                            </label>
                            <input
                              type="email"
                              name="client_email"
                              id="client_email"
                              value={formData.client_email}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              placeholder="client@example.com"
                            />
                          </div>
                          <div>
                            <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700">
                              Client Phone
                            </label>
                            <input
                              type="tel"
                              name="client_phone"
                              id="client_phone"
                              value={formData.client_phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                            Priority Level
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
                      </div>
                    )}

                    {activeTab === 'schedule' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <div className="mt-1 relative">
                              <input
                                type="date"
                                name="end_date"
                                id="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pr-10"
                              />
                              <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700">
                            Estimated Duration (days)
                          </label>
                          <input
                            type="number"
                            name="estimated_duration"
                            id="estimated_duration"
                            min="1"
                            value={formData.estimated_duration}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Auto-calculated from dates"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'budget' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="total_budget" className="block text-sm font-medium text-gray-700">
                              Total Budget
                            </label>
                            <div className="mt-1 relative">
                              <input
                                type="number"
                                name="total_budget"
                                id="total_budget"
                                min="0"
                                step="0.01"
                                value={formData.total_budget}
                                onChange={handleInputChange}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
                                placeholder="0.00"
                              />
                              <CurrencyDollarIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="contract_value" className="block text-sm font-medium text-gray-700">
                              Contract Value
                            </label>
                            <div className="mt-1 relative">
                              <input
                                type="number"
                                name="contract_value"
                                id="contract_value"
                                min="0"
                                step="0.01"
                                value={formData.contract_value}
                                onChange={handleInputChange}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
                                placeholder="0.00"
                              />
                              <CurrencyDollarIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="profit_margin" className="block text-sm font-medium text-gray-700">
                            Profit Margin (%)
                          </label>
                          <input
                            type="number"
                            name="profit_margin"
                            id="profit_margin"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.profit_margin}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                            placeholder="Auto-calculated"
                            readOnly
                          />
                          <p className="mt-1 text-sm text-gray-500">Automatically calculated based on budget and contract value</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'team' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="project_manager" className="block text-sm font-medium text-gray-700">
                              Project Manager
                            </label>
                            <input
                              type="text"
                              name="project_manager"
                              id="project_manager"
                              value={formData.project_manager}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Project manager name"
                            />
                          </div>
                          <div>
                            <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700">
                              Site Supervisor
                            </label>
                            <input
                              type="text"
                              name="supervisor"
                              id="supervisor"
                              value={formData.supervisor}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Site supervisor name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Members
                          </label>
                          <div className="space-y-2">
                            {formData.team_members.map((member, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={member}
                                  readOnly
                                  className="flex-1 border-gray-300 rounded-md shadow-sm bg-gray-50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleArrayRemove('team_members', index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Add team member name"
                                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    handleArrayAdd('team_members', input.value);
                                    input.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                  handleArrayAdd('team_members', input.value);
                                  input.value = '';
                                }}
                                className="bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'documents' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Required Permits
                          </label>
                          <div className="space-y-2">
                            {formData.required_permits.map((permit, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={permit}
                                  readOnly
                                  className="flex-1 border-gray-300 rounded-md shadow-sm bg-gray-50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleArrayRemove('required_permits', index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Add required permit"
                                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    handleArrayAdd('required_permits', input.value);
                                    input.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                  handleArrayAdd('required_permits', input.value);
                                  input.value = '';
                                }}
                                className="bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="safety_requirements" className="block text-sm font-medium text-gray-700">
                            Safety Requirements
                          </label>
                          <textarea
                            name="safety_requirements"
                            id="safety_requirements"
                            rows={3}
                            value={formData.safety_requirements}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Describe safety requirements and protocols"
                          />
                        </div>
                        <div>
                          <label htmlFor="special_requirements" className="block text-sm font-medium text-gray-700">
                            Special Requirements
                          </label>
                          <textarea
                            name="special_requirements"
                            id="special_requirements"
                            rows={3}
                            value={formData.special_requirements}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Any special requirements or considerations"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              <option value="planning">Planning</option>
                              <option value="active">Active</option>
                              <option value="on_hold">On Hold</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                              Project Visibility
                            </label>
                            <select
                              name="visibility"
                              id="visibility"
                              value={formData.visibility}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="public">Public</option>
                              <option value="team">Team Only</option>
                              <option value="private">Private</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">Notification Settings</label>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label htmlFor="milestone_alerts" className="text-sm text-gray-700">Milestone Alerts</label>
                                <p className="text-xs text-gray-500">Get notified when milestones are reached</p>
                              </div>
                              <input
                                type="checkbox"
                                name="notifications.milestone_alerts"
                                id="milestone_alerts"
                                checked={formData.notifications.milestone_alerts}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <label htmlFor="budget_alerts" className="text-sm text-gray-700">Budget Alerts</label>
                                <p className="text-xs text-gray-500">Get notified about budget changes</p>
                              </div>
                              <input
                                type="checkbox"
                                name="notifications.budget_alerts"
                                id="budget_alerts"
                                checked={formData.notifications.budget_alerts}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <label htmlFor="deadline_reminders" className="text-sm text-gray-700">Deadline Reminders</label>
                                <p className="text-xs text-gray-500">Get reminded about upcoming deadlines</p>
                              </div>
                              <input
                                type="checkbox"
                                name="notifications.deadline_reminders"
                                id="deadline_reminders"
                                checked={formData.notifications.deadline_reminders}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Project Summary</h4>
                          
                          {/* Basic Information Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Basic Information</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Project Name:</span>
                                  <span className="font-medium text-gray-900">{formData.name || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Type:</span>
                                  <span className="font-medium text-gray-900 capitalize">{formData.project_type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Priority:</span>
                                  <span className={`font-medium capitalize ${
                                    formData.priority === 'critical' ? 'text-red-600' : 
                                    formData.priority === 'high' ? 'text-orange-600' : 
                                    formData.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                  }`}>{formData.priority}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Status:</span>
                                  <span className="font-medium text-gray-900 capitalize">{formData.status.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Address:</span>
                                  <span className="font-medium text-gray-900 text-right">{formData.address || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Client Information</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Client Name:</span>
                                  <span className="font-medium text-gray-900">{formData.client_name || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Email:</span>
                                  <span className="font-medium text-gray-900">{formData.client_email || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Phone:</span>
                                  <span className="font-medium text-gray-900">{formData.client_phone || 'Not specified'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Schedule and Budget Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Schedule</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Start Date:</span>
                                  <span className="font-medium text-gray-900">
                                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : 'Not set'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">End Date:</span>
                                  <span className="font-medium text-gray-900">
                                    {formData.end_date ? new Date(formData.end_date).toLocaleDateString() : 'Not set'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Duration:</span>
                                  <span className="font-medium text-gray-900">
                                    {formData.estimated_duration ? `${formData.estimated_duration} days` : 'Not calculated'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Budget</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Total Budget:</span>
                                  <span className="font-medium text-gray-900">
                                    {formData.total_budget ? `$${parseFloat(formData.total_budget).toLocaleString()}` : 'Not set'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Contract Value:</span>
                                  <span className="font-medium text-gray-900">
                                    {formData.contract_value ? `$${parseFloat(formData.contract_value).toLocaleString()}` : 'Not set'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Profit Margin:</span>
                                  <span className="font-medium text-gray-900">
                                    {formData.profit_margin ? `${parseFloat(formData.profit_margin).toFixed(2)}%` : 'Not calculated'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Team Summary */}
                          <div className="space-y-3 mb-6">
                            <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Team</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Project Manager:</span>
                                <span className="font-medium text-gray-900">{formData.project_manager || 'Not assigned'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Site Supervisor:</span>
                                <span className="font-medium text-gray-900">{formData.supervisor || 'Not assigned'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Team Members:</span>
                                <span className="font-medium text-gray-900">
                                  {formData.team_members.length > 0 ? `${formData.team_members.length} member(s)` : 'None added'}
                                </span>
                              </div>
                              {formData.team_members.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {formData.team_members.map((member, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {member}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Documents and Requirements Summary */}
                          {(formData.required_permits.length > 0 || formData.safety_requirements || formData.special_requirements) && (
                            <div className="space-y-3 mb-6">
                              <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Documents & Requirements</h5>
                              <div className="space-y-2 text-sm">
                                {formData.required_permits.length > 0 && (
                                  <div>
                                    <span className="text-gray-500">Required Permits:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {formData.required_permits.map((permit, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                          {permit}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {formData.safety_requirements && (
                                  <div>
                                    <span className="text-gray-500">Safety Requirements:</span>
                                    <p className="mt-1 text-gray-900 text-xs bg-white p-2 rounded border">{formData.safety_requirements}</p>
                                  </div>
                                )}
                                {formData.special_requirements && (
                                  <div>
                                    <span className="text-gray-500">Special Requirements:</span>
                                    <p className="mt-1 text-gray-900 text-xs bg-white p-2 rounded border">{formData.special_requirements}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Settings Summary */}
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1">Settings</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Visibility:</span>
                                <span className="font-medium text-gray-900 capitalize">{formData.visibility}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Notifications:</span>
                                <div className="flex gap-1">
                                  {formData.notifications.milestone_alerts && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Milestones
                                    </span>
                                  )}
                                  {formData.notifications.budget_alerts && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Budget
                                    </span>
                                  )}
                                  {formData.notifications.deadline_reminders && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Deadlines
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {formData.description && (
                            <div className="mt-6">
                              <h5 className="text-sm font-medium text-gray-700 border-b border-gray-300 pb-1 mb-2">Description</h5>
                              <p className="text-sm text-gray-900 bg-white p-3 rounded border">{formData.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                      {loading ? 'Creating...' : 'Create Project'}
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

export default CreateProjectModal;