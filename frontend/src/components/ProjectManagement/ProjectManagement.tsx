import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Project, ProjectStatus } from '../../types';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectFilters from './ProjectFilters';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;
  avgDuration: number;
  onTimeDelivery: number;
}

interface FilterOptions {
  status: ProjectStatus | 'all';
  search: string;
  sortBy: 'name' | 'start_date' | 'budget' | 'status';
  sortOrder: 'asc' | 'desc';
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Mock data for projects
      const mockProjects: any[] = [
        {
          id: '1',
          name: 'Downtown Office Complex',
          description: 'Modern 20-story office building with retail space',
          status: 'active' as ProjectStatus,
          budget: 2500000,
          spent_amount: 1200000,
          start_date: '2024-01-15',
          end_date: '2024-12-30',
          client_name: 'ABC Corporation',
          address: '123 Main St, Downtown',
          project_manager: 'John Smith',
          progress: 48,
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Residential Villa Project',
          description: 'Luxury 5-bedroom villa with modern amenities',
          status: 'planning' as ProjectStatus,
          budget: 850000,
          spent_amount: 50000,
          start_date: '2024-03-01',
          end_date: '2024-11-15',
          client_name: 'Johnson Family',
          address: '456 Oak Avenue, Suburbs',
          project_manager: 'Sarah Wilson',
          progress: 5,
          created_at: '2024-02-01',
          updated_at: '2024-02-10'
        },
        {
          id: '3',
          name: 'Shopping Mall Renovation',
          description: 'Complete renovation of existing shopping center',
          status: 'active' as ProjectStatus,
          budget: 1200000,
          spent_amount: 800000,
          start_date: '2024-02-10',
          end_date: '2024-09-20',
          client_name: 'Metro Properties',
          address: '789 Commerce Blvd, City Center',
          project_manager: 'Mike Johnson',
          progress: 67,
          created_at: '2024-01-20',
          updated_at: '2024-02-15'
        },
        {
          id: '4',
          name: 'Warehouse Construction',
          description: 'Industrial warehouse for logistics company',
          status: 'completed' as ProjectStatus,
          budget: 900000,
          spent_amount: 880000,
          start_date: '2023-08-01',
          end_date: '2024-01-31',
          client_name: 'Logistics Plus',
          address: '321 Industrial Way, Port District',
          project_manager: 'Lisa Chen',
          progress: 100,
          created_at: '2023-07-15',
          updated_at: '2024-02-01'
        }
      ];

      // Mock stats
      const mockStats: ProjectStats = {
        totalProjects: 4,
        activeProjects: 2,
        completedProjects: 1,
        totalValue: 5450000,
        avgDuration: 8,
        onTimeDelivery: 85
      };
      
      setProjects(mockProjects);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredAndSortedProjects = React.useMemo(() => {
    if (!Array.isArray(projects)) return [];
    let result = [...projects];

    // Apply search filter
    if (filters.search) {
      result = result.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(project => project.status === filters.status);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'start_date':
          aValue = new Date(a.start_date || 0);
          bValue = new Date(b.start_date || 0);
          break;
        case 'budget':
          aValue = a.total_budget || 0;
          bValue = b.total_budget || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, filters]);

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [...prev, project]);
    setIsCreateModalOpen(false);
    // Update stats locally instead of refetching
    if (stats) {
      setStats(prev => prev ? {
        ...prev,
        totalProjects: prev.totalProjects + 1,
        activeProjects: project.status === 'active' ? prev.activeProjects + 1 : prev.activeProjects
      } : null);
    }
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    fetchProjects(); // Refresh stats
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
    fetchProjects(); // Refresh stats
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your construction projects
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalProjects || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.activeProjects || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.completedProjects || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Value
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${(stats?.totalValue || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Duration
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.avgDuration || 0} days
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      On-Time Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.onTimeDelivery || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
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
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => handleProjectClick(project)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first project.'}
          </p>
          {(!filters.search && filters.status === 'all') && (
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProject(null);
          }}
          onProjectUpdated={handleProjectUpdated}
          onProjectDeleted={handleProjectDeleted}
        />
      )}
    </div>
  );
};

export default ProjectManagement;