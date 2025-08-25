import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Resource } from './ResourceCard';

interface Assignment {
  id?: string;
  resource_id: string;
  project_id: string;
  assigned_by?: string;
  assigned_at?: Date;
  quantity_assigned: number;
}

interface ResourceAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignment: Omit<Assignment, 'id' | 'assigned_at'>) => void;
  resource: Resource;
  projects: any[];
}

const ResourceAssignmentModal: React.FC<ResourceAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  resource,
  projects
}) => {
  const [formData, setFormData] = useState({
    project_id: '',
    quantity_assigned: 1,
    assigned_by: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_id) {
      newErrors.project_id = 'Please select a project';
    }

    if (formData.quantity_assigned <= 0) {
      newErrors.quantity_assigned = 'Quantity must be greater than 0';
    }

    const availableQuantity = resource.quantity_available - resource.quantity_allocated;
    if (formData.quantity_assigned > availableQuantity) {
      newErrors.quantity_assigned = `Only ${availableQuantity} units available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAssign({
        resource_id: resource.id,
        project_id: formData.project_id,
        assigned_by: formData.assigned_by || undefined,
        quantity_assigned: formData.quantity_assigned
      });
      
      setFormData({
        project_id: '',
        quantity_assigned: 1,
        assigned_by: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity_assigned' ? parseFloat(value) || 1 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const availableQuantity = resource.quantity_available - resource.quantity_allocated;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Assign Resource
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{resource.name}</h4>
                <p className="text-sm text-gray-600">
                  Available: {availableQuantity} {resource.unit}
                </p>
                <p className="text-sm text-gray-600">
                  Cost: ${resource.cost_per_unit}/{resource.unit}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project *
                  </label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.project_id ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select a project</option>
                    {projects?.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    )) || []}
                  </select>
                  {errors.project_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity to Assign *
                  </label>
                  <input
                    type="number"
                    name="quantity_assigned"
                    value={formData.quantity_assigned}
                    onChange={handleChange}
                    min="1"
                    max={availableQuantity}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.quantity_assigned ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.quantity_assigned && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity_assigned}</p>
                  )}
                </div>

                {availableQuantity === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm text-yellow-600">
                      This resource is fully allocated. No additional assignments possible.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={availableQuantity === 0}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Resource
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourceAssignmentModal;