import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  CameraIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface PunchListItem {
  id: string;
  title: string;
  description: string;
  category: 'defect' | 'incomplete' | 'safety' | 'code-violation' | 'cleanup' | 'testing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  trade: string;
  assignedTo: string;
  reportedBy: string;
  reportedDate: Date;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'verified' | 'closed';
  priority: number;
  photos: string[];
  notes: PunchListNote[];
  estimatedHours: number;
  actualHours?: number;
  cost?: number;
  tags: string[];
}

interface PunchListNote {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'status-change' | 'assignment' | 'resolution';
}

interface QualityInspection {
  id: string;
  name: string;
  type: 'walkthrough' | 'milestone' | 'final' | 'warranty' | 'safety';
  inspector: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  location: string;
  checklist: QualityChecklistItem[];
  punchListItems: string[]; // IDs of generated punch list items
  score?: number;
  notes: string;
}

interface QualityChecklistItem {
  id: string;
  description: string;
  category: string;
  required: boolean;
  status: 'not-checked' | 'pass' | 'fail' | 'n/a';
  notes?: string;
  photos?: string[];
}

const QualityControlWorkflows: React.FC = () => {
  const [punchListItems, setPunchListItems] = useState<PunchListItem[]>([]);
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [selectedView, setSelectedView] = useState<'punch-list' | 'inspections' | 'analytics'>('punch-list');
  const [selectedItem, setSelectedItem] = useState<PunchListItem | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    assignedTo: 'all',
    severity: 'all'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      const [punchListData, inspectionData] = await Promise.all([
        loadPunchListItems(),
        loadInspections()
      ]);
      setPunchListItems(punchListData);
      setInspections(inspectionData);
    } catch (error) {
      console.error('Failed to load quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPunchListItems = async (): Promise<PunchListItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'pl-001',
            title: 'Incomplete drywall finishing in Unit 2A',
            description: 'Drywall joints not properly finished and sanded in master bedroom',
            category: 'incomplete',
            severity: 'medium',
            location: 'Building A, Unit 2A, Master Bedroom',
            trade: 'Drywall',
            assignedTo: 'Mike Johnson',
            reportedBy: 'Sarah Inspector',
            reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            status: 'open',
            priority: 2,
            photos: ['photo1.jpg', 'photo2.jpg'],
            notes: [
              {
                id: 'note-1',
                author: 'Sarah Inspector',
                content: 'Multiple joints visible, requiring additional compound and sanding',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                type: 'comment'
              }
            ],
            estimatedHours: 8,
            tags: ['drywall', 'finishing', 'bedroom']
          },
          {
            id: 'pl-002',
            title: 'Electrical outlet not GFCI protected',
            description: 'Bathroom outlet missing GFCI protection per code requirements',
            category: 'code-violation',
            severity: 'high',
            location: 'Building B, Unit 1B, Guest Bathroom',
            trade: 'Electrical',
            assignedTo: 'Carlos Rodriguez',
            reportedBy: 'Tom Safety',
            reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            priority: 1,
            photos: ['electrical1.jpg'],
            notes: [
              {
                id: 'note-2',
                author: 'Tom Safety',
                content: 'Code violation - GFCI required within 6 feet of water source',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                type: 'comment'
              },
              {
                id: 'note-3',
                author: 'Carlos Rodriguez',
                content: 'Started work, ordering GFCI outlet',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                type: 'status-change'
              }
            ],
            estimatedHours: 2,
            tags: ['electrical', 'code', 'gfci', 'bathroom']
          },
          {
            id: 'pl-003',
            title: 'Paint touchups needed on trim',
            description: 'Multiple dings and scratches on door trim requiring touchup',
            category: 'defect',
            severity: 'low',
            location: 'Building A, Unit 1A, Living Room',
            trade: 'Painting',
            assignedTo: 'Lisa Martinez',
            reportedBy: 'Quality Team',
            reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'resolved',
            priority: 3,
            photos: ['paint1.jpg'],
            notes: [
              {
                id: 'note-4',
                author: 'Lisa Martinez',
                content: 'Touchups completed, ready for verification',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                type: 'resolution'
              }
            ],
            estimatedHours: 3,
            actualHours: 2.5,
            cost: 75,
            tags: ['paint', 'trim', 'cosmetic']
          },
          {
            id: 'pl-004',
            title: 'Safety hazard - exposed rebar',
            description: 'Exposed rebar on foundation wall poses injury risk',
            category: 'safety',
            severity: 'critical',
            location: 'Building C, Foundation, East Wall',
            trade: 'Concrete',
            assignedTo: 'Emergency Team',
            reportedBy: 'Site Supervisor',
            reportedDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            status: 'in-progress',
            priority: 1,
            photos: ['safety1.jpg', 'safety2.jpg'],
            notes: [
              {
                id: 'note-5',
                author: 'Site Supervisor',
                content: 'IMMEDIATE ATTENTION REQUIRED - Safety barrier installed temporarily',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                type: 'comment'
              }
            ],
            estimatedHours: 6,
            tags: ['safety', 'rebar', 'foundation', 'urgent']
          }
        ]);
      }, 800);
    });
  };

  const loadInspections = async (): Promise<QualityInspection[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'insp-001',
            name: 'Framing Inspection - Building A',
            type: 'milestone',
            inspector: 'Sarah Inspector',
            scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'scheduled',
            location: 'Building A - All Units',
            checklist: [
              {
                id: 'check-1',
                description: 'Structural framing meets specifications',
                category: 'Structure',
                required: true,
                status: 'not-checked'
              },
              {
                id: 'check-2',
                description: 'Electrical rough-in completed',
                category: 'Electrical',
                required: true,
                status: 'not-checked'
              }
            ],
            punchListItems: [],
            notes: ''
          },
          {
            id: 'insp-002',
            name: 'Final Walkthrough - Unit 2A',
            type: 'final',
            inspector: 'Tom Quality',
            scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            completedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'completed',
            location: 'Building A, Unit 2A',
            checklist: [
              {
                id: 'check-3',
                description: 'All finishes completed satisfactorily',
                category: 'Finishes',
                required: true,
                status: 'fail',
                notes: 'Drywall finishing incomplete'
              },
              {
                id: 'check-4',
                description: 'All electrical fixtures installed and working',
                category: 'Electrical',
                required: true,
                status: 'pass'
              }
            ],
            punchListItems: ['pl-001'],
            score: 75,
            notes: 'Overall good quality with minor drywall issues'
          }
        ]);
      }, 600);
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-purple-100 text-purple-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'in-progress': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircleIcon className="h-4 w-4 text-purple-500" />;
      case 'verified': case 'closed': case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'defect': return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'incomplete': return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'safety': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'code-violation': return <DocumentTextIcon className="h-4 w-4 text-purple-500" />;
      case 'cleanup': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'testing': return <EyeIcon className="h-4 w-4 text-yellow-500" />;
      default: return <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredPunchListItems = punchListItems.filter(item => {
    const statusMatch = filters.status === 'all' || item.status === filters.status;
    const categoryMatch = filters.category === 'all' || item.category === filters.category;
    const assignedMatch = filters.assignedTo === 'all' || item.assignedTo === filters.assignedTo;
    const severityMatch = filters.severity === 'all' || item.severity === filters.severity;
    return statusMatch && categoryMatch && assignedMatch && severityMatch;
  });

  const uniqueAssignees = Array.from(new Set(punchListItems.map(item => item.assignedTo)));
  const categories = ['defect', 'incomplete', 'safety', 'code-violation', 'cleanup', 'testing'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in-progress', 'resolved', 'verified', 'closed'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quality Control & Punch Lists</h2>
            <p className="text-gray-600">Digital punch lists, quality inspections, and workflow management</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Punch Item
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Open Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {punchListItems.filter(item => item.status === 'open').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {punchListItems.filter(item => item.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {punchListItems.filter(item => ['resolved', 'verified', 'closed'].includes(item.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">4.2 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'punch-list', name: 'Punch List', icon: ClipboardDocumentListIcon, count: punchListItems.filter(i => i.status !== 'closed').length },
              { id: 'inspections', name: 'Inspections', icon: EyeIcon, count: inspections.filter(i => i.status === 'scheduled').length },
              { id: 'analytics', name: 'Analytics', icon: DocumentTextIcon }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`${
                    selectedView === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Punch List View */}
          {selectedView === 'punch-list' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status} className="capitalize">
                      {status.replace('-', ' ')}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category.replace('-', ' ')}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({...filters, severity: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Severities</option>
                  {severities.map(severity => (
                    <option key={severity} value={severity} className="capitalize">
                      {severity}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Assignees</option>
                  {uniqueAssignees.map(assignee => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </select>
              </div>

              {/* Punch List Items */}
              <div className="space-y-4">
                {filteredPunchListItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getCategoryIcon(item.category)}
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {item.location}
                          </span>
                          <span className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {item.assignedTo}
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Due: {item.dueDate.toLocaleDateString()}
                          </span>
                          {item.photos.length > 0 && (
                            <span className="flex items-center">
                              <CameraIcon className="h-4 w-4 mr-1" />
                              {item.photos.length} photos
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium text-gray-600">
                          Priority {item.priority}
                        </span>
                      </div>
                    </div>

                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspections View */}
          {selectedView === 'inspections' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Quality Inspections</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedInspection(inspection)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{inspection.name}</h4>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(inspection.status)}`}>
                            {inspection.status}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                            {inspection.type}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-2" />
                            <span>{inspection.inspector}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            <span>{inspection.location}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>
                              {inspection.completedDate 
                                ? `Completed: ${inspection.completedDate.toLocaleDateString()}`
                                : `Scheduled: ${inspection.scheduledDate.toLocaleDateString()}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      {inspection.score && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            inspection.score >= 90 ? 'text-green-600' :
                            inspection.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {inspection.score}%
                          </div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Checklist Items:</span>
                        <span className="font-medium">{inspection.checklist.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Punch List Items:</span>
                        <span className="font-medium text-red-600">{inspection.punchListItems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pass Rate:</span>
                        <span className="font-medium">
                          {inspection.checklist.length > 0 
                            ? `${Math.round((inspection.checklist.filter(item => item.status === 'pass').length / inspection.checklist.length) * 100)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {selectedView === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Quality Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Items by Category</h4>
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const categoryItems = punchListItems.filter(item => item.category === category);
                      const percentage = punchListItems.length > 0 
                        ? (categoryItems.length / punchListItems.length) * 100 
                        : 0;
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{category.replace('-', ' ')}</span>
                            <span className="font-medium">{categoryItems.length} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-primary-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Resolution Times</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Resolution:</span>
                      <span className="font-medium">4.2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Critical Issues:</span>
                      <span className="font-medium">1.8 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Priority:</span>
                      <span className="font-medium">2.5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium Priority:</span>
                      <span className="font-medium">5.1 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Low Priority:</span>
                      <span className="font-medium">8.3 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Punch List Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Punch List Item Details
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Item Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{selectedItem.title}</h4>
                <p className="text-gray-700 mb-4">{selectedItem.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{selectedItem.category.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Severity:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedItem.severity)}`}>
                      {selectedItem.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="ml-2 font-medium">{selectedItem.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Assigned To:</span>
                    <span className="ml-2 font-medium">{selectedItem.assignedTo}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trade:</span>
                    <span className="ml-2 font-medium">{selectedItem.trade}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reported By:</span>
                    <span className="ml-2 font-medium">{selectedItem.reportedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="ml-2 font-medium">{selectedItem.dueDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes/Comments */}
              {selectedItem.notes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Activity & Notes</h4>
                  <div className="space-y-3">
                    {selectedItem.notes.map((note) => (
                      <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{note.author}</span>
                          <span className="text-sm text-gray-500">{note.timestamp.toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700">{note.content}</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                          note.type === 'comment' ? 'bg-blue-100 text-blue-800' :
                          note.type === 'status-change' ? 'bg-yellow-100 text-yellow-800' :
                          note.type === 'assignment' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {note.type.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t">
                <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center">
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Update Status
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Add Note
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityControlWorkflows;