import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for recent projects
    const timer = setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'Downtown Office Complex',
          status: 'active',
          budget: 2500000,
          start_date: new Date('2024-01-15'),
          end_date: new Date('2024-12-30'),
          client_name: 'ABC Corporation'
        },
        {
          id: '2', 
          name: 'Residential Villa Project',
          status: 'planning',
          budget: 850000,
          start_date: new Date('2024-03-01'),
          end_date: new Date('2024-11-15'),
          client_name: 'Johnson Family'
        },
        {
          id: '3',
          name: 'Shopping Mall Renovation',
          status: 'active',
          budget: 1200000,
          start_date: new Date('2024-02-10'),
          end_date: new Date('2024-09-20'),
          client_name: 'Metro Properties'
        }
      ]);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

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

  const recentProjects = projects.slice(0, 5);

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
              to="/projects"
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