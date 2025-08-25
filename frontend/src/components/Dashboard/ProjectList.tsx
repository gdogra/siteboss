import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../../services/api';
import { format } from 'date-fns';

const ProjectList: React.FC = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: () => projectApi.getProjects(),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'planning': return 'text-blue-600 bg-blue-100';
      case 'on_hold': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const recentProjects = projects?.data?.slice(0, 5) || [];

  if (recentProjects.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No projects found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentProjects.map((project: any) => (
        <div
          key={project.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div>
            <Link
              to={`/projects/${project.id}`}
              className="text-sm font-medium text-gray-900 hover:text-primary-600"
            >
              {project.name}
            </Link>
            <p className="text-xs text-gray-500">
              {project.address}
              {project.start_date && (
                <span className="ml-2">
                  Started: {format(new Date(project.start_date), 'MMM d, yyyy')}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
            {project.total_budget && (
              <div className="text-xs text-gray-500">
                ${project.total_budget.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;