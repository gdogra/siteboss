import React from 'react';
import { ProjectStatus } from '../../types';

interface ProjectFiltersProps {
  status: ProjectStatus | 'all';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onStatusChange: (status: ProjectStatus | 'all') => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  status,
  sortBy,
  sortOrder,
  onStatusChange,
  onSortChange
}) => {
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [string, 'asc' | 'desc'];
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center space-x-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ProjectStatus | 'all')}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="start_date-desc">Newest First</option>
          <option value="start_date-asc">Oldest First</option>
          <option value="budget-desc">Highest Budget</option>
          <option value="budget-asc">Lowest Budget</option>
          <option value="status-asc">Status</option>
        </select>
      </div>
    </div>
  );
};

export default ProjectFilters;