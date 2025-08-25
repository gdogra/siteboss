import React from 'react';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Project, ProjectStatus } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

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
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'active':
      return 'Active';
    case 'on_hold':
      return 'On Hold';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
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

  const isOverdue = (): boolean => {
    if (!project.end_date || project.status === 'completed') return false;
    return new Date() > new Date(project.end_date);
  };

  const progress = calculateProgress();
  const overdue = isOverdue();

  return (
    <div
      onClick={onClick}
      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 truncate mt-1">
              {project.description || 'No description'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{project.address}</span>
        </div>

        {/* Progress Bar */}
        {project.status === 'active' && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                {Math.round(progress)}%
                {overdue && ' (Overdue)'}
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  overdue ? 'bg-red-500' : 'bg-primary-600'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Budget */}
          {project.total_budget && (
            <div className="flex items-center text-sm text-gray-500">
              <CurrencyDollarIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>${project.total_budget.toLocaleString()}</span>
            </div>
          )}

          {/* Duration */}
          {project.start_date && project.end_date && (
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>
                {Math.ceil(
                  (new Date(project.end_date).getTime() - 
                   new Date(project.start_date).getTime()) / 
                  (1000 * 60 * 60 * 24)
                )} days
              </span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {project.start_date ? (
              <span>
                {new Date(project.start_date).toLocaleDateString()}
              </span>
            ) : (
              <span>No start date</span>
            )}
          </div>
          {project.end_date && (
            <div className="flex items-center">
              <span>→</span>
              <span className="ml-1">
                {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            {project.estimated_duration && (
              <span>{project.estimated_duration} days estimated</span>
            )}
          </div>
          {project.profit_margin && (
            <div className="flex items-center text-xs text-green-600 font-medium">
              <ChartBarIcon className="h-3 w-3 mr-1" />
              {project.profit_margin}% margin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;