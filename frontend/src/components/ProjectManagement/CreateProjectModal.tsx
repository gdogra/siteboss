import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Project, ProjectStatus } from '../../types';
import { api } from '../../services/api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  address: string;
  start_date: string;
  end_date: string;
  estimated_duration: string;
  total_budget: string;
  contract_value: string;
  profit_margin: string;
  status: ProjectStatus;
}

const initialFormData: ProjectFormData = {
  name: '',
  description: '',
  address: '',
  start_date: '',
  end_date: '',
  estimated_duration: '',
  total_budget: '',
  contract_value: '',
  profit_margin: '',
  status: 'planning'
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const projectData = {
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : null,
        profit_margin: formData.profit_margin ? parseFloat(formData.profit_margin) : null,
        status: formData.status
      };

      const response = await api.post<Project>('/projects', projectData);
      onProjectCreated(response.data);
      setFormData(initialFormData);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
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

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 gap-6">
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
                        placeholder="Project description (optional)"
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
                  </div>

                  {/* Schedule */}
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

                    <div>
                      <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700">
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        name="estimated_duration"
                        id="estimated_duration"
                        min="1"
                        value={formData.estimated_duration}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Auto-calculated"
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Status */}
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