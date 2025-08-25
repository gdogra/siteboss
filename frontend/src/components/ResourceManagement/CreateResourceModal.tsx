import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Resource } from './ResourceCard';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceData: Omit<Resource, 'id'>) => void;
}

const CreateResourceModal: React.FC<CreateResourceModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment' as Resource['type'],
    description: '',
    cost_per_unit: 0,
    unit: '',
    quantity_available: 0,
    quantity_allocated: 0,
    status: 'available' as Resource['status']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Resource name is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (formData.cost_per_unit <= 0) {
      newErrors.cost_per_unit = 'Cost per unit must be greater than 0';
    }

    if (formData.quantity_available < 0) {
      newErrors.quantity_available = 'Available quantity cannot be negative';
    }

    if (formData.quantity_allocated < 0) {
      newErrors.quantity_allocated = 'Allocated quantity cannot be negative';
    }

    if (formData.quantity_allocated > formData.quantity_available) {
      newErrors.quantity_allocated = 'Allocated quantity cannot exceed available quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      setFormData({
        name: '',
        type: 'equipment',
        description: '',
        cost_per_unit: 0,
        unit: '',
        quantity_available: 0,
        quantity_allocated: 0,
        status: 'available'
      });
      setErrors({});
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost_per_unit' || name === 'quantity_available' || name === 'quantity_allocated'
        ? parseFloat(value) || 0
        : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const typeOptions = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'material', label: 'Material' },
    { value: 'labor', label: 'Labor' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'allocated', label: 'Allocated' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  const unitSuggestions = {
    equipment: ['hours', 'days', 'weeks', 'months', 'unit'],
    material: ['kg', 'lbs', 'm²', 'ft²', 'm³', 'ft³', 'liters', 'gallons', 'units', 'pieces'],
    labor: ['hours', 'days', 'weeks', 'months']
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Create New Resource
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter resource name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter resource description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cost per Unit ($) *
                    </label>
                    <input
                      type="number"
                      name="cost_per_unit"
                      value={formData.cost_per_unit}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                        errors.cost_per_unit ? 'border-red-300' : ''
                      }`}
                      placeholder="0.00"
                    />
                    {errors.cost_per_unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.cost_per_unit}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit *</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      list="unitSuggestions"
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                        errors.unit ? 'border-red-300' : ''
                      }`}
                      placeholder="e.g., hours, kg, m²"
                    />
                    <datalist id="unitSuggestions">
                      {unitSuggestions[formData.type].map(unit => (
                        <option key={unit} value={unit} />
                      ))}
                    </datalist>
                    {errors.unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Available Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity_available"
                      value={formData.quantity_available}
                      onChange={handleChange}
                      min="0"
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                        errors.quantity_available ? 'border-red-300' : ''
                      }`}
                      placeholder="0"
                    />
                    {errors.quantity_available && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity_available}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Allocated Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity_allocated"
                      value={formData.quantity_allocated}
                      onChange={handleChange}
                      min="0"
                      max={formData.quantity_available}
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                        errors.quantity_allocated ? 'border-red-300' : ''
                      }`}
                      placeholder="0"
                    />
                    {errors.quantity_allocated && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity_allocated}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Utilization:</strong> {' '}
                    {formData.quantity_available > 0 
                      ? ((formData.quantity_allocated / formData.quantity_available) * 100).toFixed(1)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Create Resource
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

export default CreateResourceModal;