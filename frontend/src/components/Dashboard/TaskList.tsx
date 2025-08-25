import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Task } from '../../types';
import { 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No tasks assigned to you
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {getStatusIcon(task.status)}
            <div>
              <Link
                to={`/projects/${task.project_id}/tasks/${task.id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {task.title}
              </Link>
              <p className="text-xs text-gray-500">
                {task.project_name}
                {task.due_date && (
                  <span className="ml-2">
                    Due: {format(new Date(task.due_date), 'MMM d')}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <div className="text-xs text-gray-500">
              {task.completion_percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;