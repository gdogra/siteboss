import React, { useState, useEffect } from 'react';
import {
  WrenchScrewdriverIcon,
  TruckIcon,
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import ResourceCard from './ResourceCard';
import CreateResourceModal from './CreateResourceModal';
import ResourceAssignmentModal from './ResourceAssignmentModal';
import SubcontractorManagement from './SubcontractorManagement';

interface Resource {
  id: string;
  company_id: string;
  name: string;
  type: 'equipment' | 'vehicle' | 'tool' | 'material';
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  hourly_rate?: number;
  maintenance_schedule?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface ResourceAssignment {
  id: string;
  resource_id: string;
  project_id: string;
  task_id?: string;
  assigned_by: string;
  start_date: string;
  end_date?: string;
  hours_planned?: number;
  hours_actual?: number;
  cost_per_hour?: number;
  created_at: string;
  updated_at: string;
}

interface ResourceStats {
  totalResources: number;
  availableResources: number;
  assignedResources: number;
  maintenanceRequired: number;
  totalValue: number;
  avgUtilization: number;
}

interface FilterOptions {
  type: Resource['type'] | 'all';
  availability: 'all' | 'available' | 'assigned' | 'maintenance';
  search: string;
  sortBy: 'name' | 'type' | 'purchase_date' | 'hourly_rate';
  sortOrder: 'asc' | 'desc';
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<ResourceAssignment[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'resources' | 'subcontractors'>('resources');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    availability: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchResourceData();
  }, []);

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, assignmentsRes, statsRes, projectsRes] = await Promise.all([
        api.get('/resources'),
        api.get('/resources/assignments'),
        api.get('/resources/stats'),
        api.get('/projects')
      ]);
      
      setResources(resourcesRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
      setStats(statsRes.data.data || null);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching resource data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedResources = React.useMemo(() => {
    let result = [...resources];

    // Apply search filter
    if (filters.search) {
      result = result.filter(resource =>
        resource.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.model?.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.serial_number?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(resource => resource.type === filters.type);
    }

    // Apply availability filter
    if (filters.availability !== 'all') {
      const currentAssignments = assignments.filter(assignment => 
        !assignment.end_date || new Date(assignment.end_date) > new Date()
      );

      switch (filters.availability) {
        case 'available':
          result = result.filter(resource => 
            resource.is_available && 
            !currentAssignments.some(assignment => assignment.resource_id === resource.id)
          );
          break;
        case 'assigned':
          result = result.filter(resource =>
            currentAssignments.some(assignment => assignment.resource_id === resource.id)
          );
          break;
        case 'maintenance':
          result = result.filter(resource => !resource.is_available);
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'purchase_date':
          aValue = new Date(a.purchase_date || '1900-01-01');
          bValue = new Date(b.purchase_date || '1900-01-01');
          break;
        case 'hourly_rate':
          aValue = a.hourly_rate || 0;
          bValue = b.hourly_rate || 0;
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
  }, [resources, assignments, filters]);

  const handleResourceCreated = (resourceData: Omit<import('./ResourceCard').Resource, 'id'>) => {
    const newResource = {
      id: Date.now().toString(), // Generate temporary ID
      company_id: 'temp-company-id',
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...resourceData
    } as Resource;
    setResources(prev => [...prev, newResource]);
    setIsCreateModalOpen(false);
    fetchResourceData(); // Refresh stats
  };

  const handleAssignResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsAssignmentModalOpen(true);
  };

  const handleAssignmentCreated = (assignment: { resource_id: string; project_id: string; assigned_by?: string; quantity_assigned: number }) => {
    // Convert Assignment to ResourceAssignment format
    const resourceAssignment: ResourceAssignment = {
      id: Date.now().toString(),
      resource_id: assignment.resource_id,
      project_id: assignment.project_id,
      assigned_by: assignment.assigned_by || 'current-user',
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Additional fields that may be needed but not in modal
      task_id: undefined,
      end_date: undefined,
      hours_planned: undefined,
      hours_actual: undefined,
      cost_per_hour: undefined
    };
    
    setAssignments(prev => [...prev, resourceAssignment]);
    setIsAssignmentModalOpen(false);
    setSelectedResource(null);
    fetchResourceData(); // Refresh stats
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'equipment':
        return <WrenchScrewdriverIcon className="h-6 w-6" />;
      case 'vehicle':
        return <TruckIcon className="h-6 w-6" />;
      case 'tool':
        return <WrenchScrewdriverIcon className="h-6 w-6" />;
      case 'material':
        return <BuildingOfficeIcon className="h-6 w-6" />;
      default:
        return <WrenchScrewdriverIcon className="h-6 w-6" />;
    }
  };

  const getResourceTypeColor = (type: Resource['type']): string => {
    switch (type) {
      case 'equipment':
        return 'text-blue-600 bg-blue-100';
      case 'vehicle':
        return 'text-green-600 bg-green-100';
      case 'tool':
        return 'text-yellow-600 bg-yellow-100';
      case 'material':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage equipment, vehicles, tools, and subcontractors
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('resources')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'resources'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setViewMode('subcontractors')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                viewMode === 'subcontractors'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Subcontractors
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add {viewMode === 'resources' ? 'Resource' : 'Subcontractor'}
          </button>
        </div>
      </div>

      {viewMode === 'resources' ? (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Resources</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalResources}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.availableResources}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Assigned</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.assignedResources}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Maintenance</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.maintenanceRequired}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                        <dd className="text-lg font-medium text-gray-900">${stats.totalValue.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Utilization</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.avgUtilization}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicles</option>
                  <option value="tool">Tools</option>
                  <option value="material">Materials</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                  }}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="type-asc">Type</option>
                  <option value="purchase_date-desc">Newest</option>
                  <option value="purchase_date-asc">Oldest</option>
                  <option value="hourly_rate-desc">Highest Rate</option>
                  <option value="hourly_rate-asc">Lowest Rate</option>
                </select>
              </div>

              {/* Filter Button */}
              <div>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={{
                  id: resource.id,
                  name: resource.name,
                  type: resource.type as 'equipment' | 'material' | 'labor',
                  description: resource.model,
                  cost_per_unit: resource.hourly_rate || 0,
                  unit: 'hour',
                  quantity_available: 1,
                  quantity_allocated: assignments.filter(a => a.resource_id === resource.id).length,
                  status: 'available' as 'available' | 'allocated' | 'maintenance' | 'unavailable'
                }}
                onEdit={(resource) => {
                  alert(`Edit functionality for ${resource.name} would be implemented here`);
                }}
                onDelete={(resourceId) => {
                  if (window.confirm('Are you sure you want to delete this resource?')) {
                    setResources(prev => prev.filter(r => r.id !== resourceId));
                    alert('Resource deleted successfully');
                  }
                }}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedResources.length === 0 && (
            <div className="text-center py-12">
              <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resources found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.type !== 'all' || filters.availability !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first resource.'}
              </p>
            </div>
          )}
        </>
      ) : (
        <SubcontractorManagement />
      )}

      {/* Modals */}
      <CreateResourceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleResourceCreated}
      />

      {selectedResource && (
        <ResourceAssignmentModal
          resource={{
            id: selectedResource.id,
            name: selectedResource.name,
            type: selectedResource.type as 'equipment' | 'material' | 'labor',
            description: selectedResource.model,
            cost_per_unit: selectedResource.hourly_rate || 0,
            unit: 'hour',
            quantity_available: 1,
            quantity_allocated: assignments.filter(a => a.resource_id === selectedResource.id).length,
            status: 'available' as 'available' | 'allocated' | 'maintenance' | 'unavailable'
          }}
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedResource(null);
          }}
          onAssign={handleAssignmentCreated}
          projects={projects}
        />
      )}
    </div>
  );
};

export default ResourceManagement;