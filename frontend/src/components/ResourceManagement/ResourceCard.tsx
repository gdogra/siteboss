import React from 'react';
import { PencilIcon, TrashIcon, UserIcon, TruckIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export interface Resource {
  id: string;
  name: string;
  type: 'equipment' | 'material' | 'labor';
  description?: string;
  cost_per_unit: number;
  unit: string;
  quantity_available: number;
  quantity_allocated: number;
  status: 'available' | 'allocated' | 'maintenance' | 'unavailable';
}

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete
}) => {
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'equipment':
        return <TruckIcon className="h-6 w-6" />;
      case 'material':
        return <WrenchScrewdriverIcon className="h-6 w-6" />;
      case 'labor':
        return <UserIcon className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'allocated':
        return 'text-blue-600 bg-blue-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
    }
  };

  const getTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'equipment':
        return 'text-orange-600 bg-orange-100';
      case 'material':
        return 'text-purple-600 bg-purple-100';
      case 'labor':
        return 'text-blue-600 bg-blue-100';
    }
  };

  const utilizationPercentage = resource.quantity_available > 0 
    ? (resource.quantity_allocated / resource.quantity_available) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
            {getResourceIcon(resource.type)}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{resource.name}</h3>
            {resource.description && (
              <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(resource)}
            className="text-gray-400 hover:text-gray-500"
            title="Edit resource"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="text-gray-400 hover:text-red-500"
            title="Delete resource"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(resource.status)}`}>
            {resource.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getTypeColor(resource.type)}`}>
            {resource.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Cost per {resource.unit}:</span>
            <p className="font-medium">${resource.cost_per_unit.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-500">Unit:</span>
            <p className="font-medium">{resource.unit}</p>
          </div>
          <div>
            <span className="text-gray-500">Available:</span>
            <p className="font-medium">{resource.quantity_available}</p>
          </div>
          <div>
            <span className="text-gray-500">Allocated:</span>
            <p className="font-medium">{resource.quantity_allocated}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Utilization</span>
            <span>{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                utilizationPercentage > 90 
                  ? 'bg-red-500' 
                  : utilizationPercentage > 70 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;