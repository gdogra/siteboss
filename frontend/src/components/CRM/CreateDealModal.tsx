import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  probability: number;
  stage: string;
  expected_close_date: Date;
  assigned_to: string;
  created_at: Date;
  description: string;
  last_activity?: Date;
}

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: Partial<Deal>) => void;
  editDeal?: Deal | null;
  initialStage?: string;
}

const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editDeal,
  initialStage = 'discovery'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    value: 0,
    probability: 50,
    stage: initialStage,
    expected_close_date: new Date().toISOString().split('T')[0],
    assigned_to: 'John Smith',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editDeal) {
      setFormData({
        title: editDeal.title,
        customer: editDeal.customer,
        value: editDeal.value,
        probability: editDeal.probability,
        stage: editDeal.stage,
        expected_close_date: editDeal.expected_close_date.toISOString().split('T')[0],
        assigned_to: editDeal.assigned_to,
        description: editDeal.description
      });
    } else {
      // Reset form for new deal
      setFormData({
        title: '',
        customer: '',
        value: 0,
        probability: 50,
        stage: initialStage,
        expected_close_date: new Date().toISOString().split('T')[0],
        assigned_to: 'John Smith',
        description: ''
      });
    }
    setErrors({});
  }, [editDeal, isOpen, initialStage]);

  const stages = [
    { id: 'lead', name: 'Lead' },
    { id: 'discovery', name: 'Discovery' },
    { id: 'qualified', name: 'Qualified' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'closed-won', name: 'Closed Won' },
    { id: 'closed-lost', name: 'Closed Lost' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer name is required';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dealData = {
      ...formData,
      value: Number(formData.value),
      probability: Number(formData.probability),
      expected_close_date: new Date(formData.expected_close_date)
    };

    onSubmit(dealData);
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getProbabilityLabel = (probability: number) => {
    if (probability >= 80) return 'Very High';
    if (probability >= 60) return 'High';
    if (probability >= 40) return 'Medium';
    if (probability >= 20) return 'Low';
    return 'Very Low';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {editDeal ? 'Edit Deal' : 'Create New Deal'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Deal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Johnson Kitchen Renovation"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Customer *
              </label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => handleChange('customer', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.customer ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Customer name"
              />
              {errors.customer && <p className="text-red-600 text-sm mt-1">{errors.customer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Deal Value *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.value}
                onChange={(e) => handleChange('value', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.value ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="25000"
              />
              {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
            </div>
          </div>

          {/* Deal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="John Smith">John Smith</option>
                <option value="Sarah Wilson">Sarah Wilson</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Emily Davis">Emily Davis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => handleChange('expected_close_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ChartBarIcon className="h-4 w-4 inline mr-1" />
                Win Probability
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => handleChange('probability', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">0%</span>
                  <span className={`text-sm font-medium ${getProbabilityColor(formData.probability)}`}>
                    {formData.probability}% - {getProbabilityLabel(formData.probability)}
                  </span>
                  <span className="text-sm text-gray-500">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add details about this deal..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {editDeal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealModal;