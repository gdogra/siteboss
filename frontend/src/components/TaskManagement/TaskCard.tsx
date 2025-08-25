import React from 'react';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Task, TaskStatus, TaskPriority } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, compact = false }) => {
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'not_started':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'in_progress':
        return <PlayCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'on_hold':
        return <PauseCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: TaskPriority): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getStatusText = (status: TaskStatus): string => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const isOverdue = (): boolean => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date() > new Date(task.due_date);
  };

  const getDaysUntilDue = (): number => {
    if (!task.due_date) return 0;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdue = isOverdue();
  const daysUntilDue = getDaysUntilDue();

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`bg-white p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow duration-200 ${
          overdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <h3 className={`text-sm font-medium truncate ${overdue ? 'text-red-900' : 'text-gray-900'}`}>
              {task.title}
            </h3>
          </div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {getPriorityText(task.priority)}
          </div>
        </div>

        {/* Progress */}
        {task.completion_percentage !== undefined && task.completion_percentage > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{task.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${task.completion_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.due_date && (
            <div className={`flex items-center ${overdue ? 'text-red-600 font-medium' : ''}`}>
              <CalendarIcon className="h-3 w-3 mr-1" />
              {overdue ? `${Math.abs(daysUntilDue)}d overdue` : 
               daysUntilDue === 0 ? 'Due today' :
               daysUntilDue > 0 ? `${daysUntilDue}d left` : ''}
            </div>
          )}
          
          {task.estimated_hours && (
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {task.estimated_hours}h
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 ${
        overdue ? 'ring-2 ring-red-200' : ''
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(task.status)}
            <div className="min-w-0 flex-1">
              <h3 className={`text-lg font-medium truncate ${overdue ? 'text-red-900' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {getPriorityText(task.priority)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {task.completion_percentage !== undefined && task.completion_percentage > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-medium">{task.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  task.status === 'completed' ? 'bg-green-500' : 'bg-primary-600'
                }`}
                style={{ width: `${task.completion_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center text-sm">
              <CalendarIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
              <div>
                <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  Due {new Date(task.due_date).toLocaleDateString()}
                </span>
                {overdue && (
                  <div className="text-xs text-red-500 font-medium">
                    {Math.abs(daysUntilDue)} days overdue
                  </div>
                )}
                {!overdue && daysUntilDue >= 0 && (
                  <div className="text-xs text-gray-500">
                    {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimated_hours && (
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <div>
                <span>{task.estimated_hours}h estimated</span>
                {task.actual_hours && (
                  <div className="text-xs">
                    {task.actual_hours}h actual
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignee */}
          {task.assigned_to && (
            <div className="flex items-center text-sm text-gray-500">
              <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Assigned</span>
            </div>
          )}

          {/* Phase/Project Info */}
          <div className="flex items-center text-sm text-gray-500">
            <ChartBarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Project task</span>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdue && (
          <div className="mt-4 flex items-center p-2 bg-red-100 border border-red-200 rounded-md">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700 font-medium">
              This task is overdue and requires attention
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;