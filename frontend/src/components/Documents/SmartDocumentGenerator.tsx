import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  CogIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShareIcon,
  PencilIcon,
  FolderIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface DocumentTemplate {
  id: string;
  name: string;
  category: 'contracts' | 'reports' | 'invoices' | 'change-orders' | 'permits' | 'safety' | 'quality' | 'compliance';
  description: string;
  fields: DocumentField[];
  lastModified: Date;
  usage: number;
  status: 'active' | 'draft' | 'deprecated';
  autoGenerate: boolean;
}

interface DocumentField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'signature' | 'table' | 'image';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: string;
}

interface GeneratedDocument {
  id: string;
  templateId: string;
  name: string;
  category: string;
  projectId: string;
  projectName: string;
  createdBy: string;
  createdDate: Date;
  status: 'draft' | 'pending-review' | 'approved' | 'signed' | 'sent';
  content: Record<string, any>;
  version: number;
  recipients?: string[];
  signatures?: DocumentSignature[];
  fileUrl?: string;
}

interface DocumentSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  signedDate?: Date;
  status: 'pending' | 'signed' | 'declined';
}

const SmartDocumentGenerator: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [selectedView, setSelectedView] = useState<'templates' | 'documents' | 'generator'>('templates');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadDocumentData();
  }, []);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      const [templatesData, documentsData] = await Promise.all([
        loadTemplates(),
        loadGeneratedDocuments()
      ]);
      setTemplates(templatesData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to load document data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (): Promise<DocumentTemplate[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'template-001',
            name: 'Construction Contract',
            category: 'contracts',
            description: 'Standard construction contract template with scope, timeline, and payment terms',
            fields: [
              {
                id: 'field-1',
                name: 'client_name',
                type: 'text',
                label: 'Client Name',
                required: true
              },
              {
                id: 'field-2',
                name: 'project_address',
                type: 'text',
                label: 'Project Address',
                required: true
              },
              {
                id: 'field-3',
                name: 'contract_value',
                type: 'number',
                label: 'Contract Value',
                required: true
              },
              {
                id: 'field-4',
                name: 'start_date',
                type: 'date',
                label: 'Project Start Date',
                required: true
              },
              {
                id: 'field-5',
                name: 'completion_date',
                type: 'date',
                label: 'Completion Date',
                required: true
              }
            ],
            lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            usage: 45,
            status: 'active',
            autoGenerate: false
          },
          {
            id: 'template-002',
            name: 'Daily Progress Report',
            category: 'reports',
            description: 'Automated daily progress report with weather, activities, and issues',
            fields: [
              {
                id: 'field-6',
                name: 'report_date',
                type: 'date',
                label: 'Report Date',
                required: true
              },
              {
                id: 'field-7',
                name: 'weather_conditions',
                type: 'dropdown',
                label: 'Weather Conditions',
                required: true,
                options: ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Heavy Rain', 'Snow']
              },
              {
                id: 'field-8',
                name: 'crew_count',
                type: 'number',
                label: 'Crew Count',
                required: true
              },
              {
                id: 'field-9',
                name: 'activities_completed',
                type: 'table',
                label: 'Activities Completed',
                required: false
              }
            ],
            lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            usage: 156,
            status: 'active',
            autoGenerate: true
          },
          {
            id: 'template-003',
            name: 'Change Order Request',
            category: 'change-orders',
            description: 'Change order template for scope modifications and cost adjustments',
            fields: [
              {
                id: 'field-10',
                name: 'change_description',
                type: 'text',
                label: 'Description of Change',
                required: true
              },
              {
                id: 'field-11',
                name: 'reason',
                type: 'dropdown',
                label: 'Reason for Change',
                required: true,
                options: ['Client Request', 'Design Change', 'Site Conditions', 'Code Requirements', 'Material Unavailability']
              },
              {
                id: 'field-12',
                name: 'cost_impact',
                type: 'number',
                label: 'Cost Impact',
                required: true
              },
              {
                id: 'field-13',
                name: 'schedule_impact',
                type: 'number',
                label: 'Schedule Impact (days)',
                required: true
              }
            ],
            lastModified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            usage: 23,
            status: 'active',
            autoGenerate: false
          },
          {
            id: 'template-004',
            name: 'Safety Inspection Report',
            category: 'safety',
            description: 'Comprehensive safety inspection checklist and findings report',
            fields: [
              {
                id: 'field-14',
                name: 'inspection_date',
                type: 'date',
                label: 'Inspection Date',
                required: true
              },
              {
                id: 'field-15',
                name: 'inspector_name',
                type: 'text',
                label: 'Inspector Name',
                required: true
              },
              {
                id: 'field-16',
                name: 'safety_score',
                type: 'number',
                label: 'Overall Safety Score',
                required: true
              },
              {
                id: 'field-17',
                name: 'violations_found',
                type: 'checkbox',
                label: 'Violations Found',
                required: false
              }
            ],
            lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            usage: 89,
            status: 'active',
            autoGenerate: true
          },
          {
            id: 'template-005',
            name: 'Invoice Template',
            category: 'invoices',
            description: 'Professional invoice template with line items and payment terms',
            fields: [
              {
                id: 'field-18',
                name: 'invoice_number',
                type: 'text',
                label: 'Invoice Number',
                required: true
              },
              {
                id: 'field-19',
                name: 'client_name',
                type: 'text',
                label: 'Client Name',
                required: true
              },
              {
                id: 'field-20',
                name: 'invoice_date',
                type: 'date',
                label: 'Invoice Date',
                required: true
              },
              {
                id: 'field-21',
                name: 'due_date',
                type: 'date',
                label: 'Due Date',
                required: true
              },
              {
                id: 'field-22',
                name: 'line_items',
                type: 'table',
                label: 'Line Items',
                required: true
              }
            ],
            lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            usage: 67,
            status: 'active',
            autoGenerate: false
          }
        ]);
      }, 800);
    });
  };

  const loadGeneratedDocuments = async (): Promise<GeneratedDocument[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'doc-001',
            templateId: 'template-002',
            name: 'Daily Progress Report - March 15, 2024',
            category: 'reports',
            projectId: 'proj-001',
            projectName: 'Downtown Office Complex',
            createdBy: 'System Auto-Generation',
            createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'approved',
            content: {
              report_date: '2024-03-15',
              weather_conditions: 'Clear',
              crew_count: 12,
              activities_completed: 'Foundation work, Electrical rough-in'
            },
            version: 1,
            fileUrl: '/documents/daily-report-20240315.pdf'
          },
          {
            id: 'doc-002',
            templateId: 'template-003',
            name: 'Change Order #CO-2024-003',
            category: 'change-orders',
            projectId: 'proj-001',
            projectName: 'Downtown Office Complex',
            createdBy: 'Mike Johnson',
            createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            status: 'pending-review',
            content: {
              change_description: 'Additional HVAC units for increased capacity',
              reason: 'Client Request',
              cost_impact: 15000,
              schedule_impact: 5
            },
            version: 2,
            recipients: ['client@example.com', 'architect@example.com'],
            signatures: [
              {
                id: 'sig-1',
                signerName: 'John Client',
                signerEmail: 'client@example.com',
                status: 'pending'
              }
            ]
          },
          {
            id: 'doc-003',
            templateId: 'template-004',
            name: 'Safety Inspection Report - Building A',
            category: 'safety',
            projectId: 'proj-001',
            projectName: 'Downtown Office Complex',
            createdBy: 'Sarah Inspector',
            createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: 'signed',
            content: {
              inspection_date: '2024-03-14',
              inspector_name: 'Sarah Inspector',
              safety_score: 92,
              violations_found: false
            },
            version: 1,
            fileUrl: '/documents/safety-report-building-a.pdf'
          }
        ]);
      }, 600);
    });
  };

  const generateDocument = async (templateId: string, data: Record<string, any>) => {
    try {
      setGenerating(true);
      
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const newDocument: GeneratedDocument = {
        id: `doc-${Date.now()}`,
        templateId: templateId,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        category: template.category,
        projectId: 'proj-001',
        projectName: 'Current Project',
        createdBy: 'Current User',
        createdDate: new Date(),
        status: 'draft',
        content: data,
        version: 1
      };

      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      setSelectedView('documents');
      
    } catch (error) {
      console.error('Failed to generate document:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contracts': return 'bg-blue-100 text-blue-800';
      case 'reports': return 'bg-green-100 text-green-800';
      case 'invoices': return 'bg-yellow-100 text-yellow-800';
      case 'change-orders': return 'bg-orange-100 text-orange-800';
      case 'permits': return 'bg-purple-100 text-purple-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'quality': return 'bg-indigo-100 text-indigo-800';
      case 'compliance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending-review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <PencilIcon className="h-4 w-4 text-gray-500" />;
      case 'pending-review': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'approved': case 'signed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'sent': return <PaperAirplaneIcon className="h-4 w-4 text-purple-500" />;
      default: return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const searchMatch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === 'all' || template.category === filterCategory;
    return searchMatch && categoryMatch;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <DocumentTextIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Document Generator</h2>
            <p className="text-gray-600">AI-powered document creation with templates and automation</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Import Template
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            New Template
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Templates</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentArrowDownIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Generated Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.createdDate.toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'pending-review').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Auto-Generated</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => t.autoGenerate).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'templates', name: 'Templates', icon: FolderIcon, count: templates.length },
              { id: 'documents', name: 'Generated Documents', icon: DocumentTextIcon, count: documents.length },
              { id: 'generator', name: 'Document Generator', icon: CogIcon }
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
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Templates View */}
          {selectedView === 'templates' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="capitalize">
                      {category.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                            {template.category.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(template.status)}`}>
                            {template.status}
                          </span>
                          {template.autoGenerate && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              Auto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Fields:</span>
                        <span className="font-medium">{template.fields.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usage:</span>
                        <span className="font-medium">{template.usage} times</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Modified:</span>
                        <span className="font-medium">{template.lastModified.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex space-x-2">
                      <button className="flex-1 bg-primary-600 text-white py-2 px-3 rounded text-sm hover:bg-primary-700">
                        Use Template
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents View */}
          {selectedView === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Generated Documents</h3>
              
              <div className="space-y-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(document.status)}
                          <h4 className="font-medium text-gray-900">{document.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(document.category)}`}>
                            {document.category.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(document.status)}`}>
                            {document.status.replace('-', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>Project: {document.projectName}</span>
                          <span>Created: {document.createdDate.toLocaleDateString()}</span>
                          <span>Version: {document.version}</span>
                          <span>By: {document.createdBy}</span>
                        </div>

                        {document.recipients && document.recipients.length > 0 && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Recipients: </span>
                            <span className="text-sm font-medium">{document.recipients.join(', ')}</span>
                          </div>
                        )}

                        {document.signatures && document.signatures.length > 0 && (
                          <div className="flex space-x-2 mb-2">
                            {document.signatures.map((sig) => (
                              <span key={sig.id} className={`px-2 py-1 rounded text-xs font-medium ${
                                sig.status === 'signed' ? 'bg-green-100 text-green-800' :
                                sig.status === 'declined' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {sig.signerName}: {sig.status}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button className="p-2 text-gray-500 hover:text-gray-700" title="View">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700" title="Download">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700" title="Print">
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700" title="Share">
                          <ShareIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generator View */}
          {selectedView === 'generator' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Document Generator</h3>
              
              {!selectedTemplate ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Select a Template</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.filter(t => t.status === 'active').map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className="text-left border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <DocumentTextIcon className="h-5 w-5 text-primary-600" />
                          <h5 className="font-medium text-gray-900">{template.name}</h5>
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                          {template.category.replace('-', ' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                      <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Change Template
                    </button>
                  </div>

                  <DocumentGeneratorForm
                    template={selectedTemplate}
                    onGenerate={generateDocument}
                    generating={generating}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Document Generator Form Component
interface DocumentGeneratorFormProps {
  template: DocumentTemplate;
  onGenerate: (templateId: string, data: Record<string, any>) => void;
  generating: boolean;
}

const DocumentGeneratorForm: React.FC<DocumentGeneratorFormProps> = ({
  template,
  onGenerate,
  generating
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(template.id, formData);
  };

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {template.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => updateField(field.name, parseFloat(e.target.value))}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
            
            {field.type === 'date' && (
              <input
                type="date"
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
            
            {field.type === 'dropdown' && field.options && (
              <select
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select an option</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'checkbox' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData[field.name] || field.defaultValue || false}
                  onChange={(e) => updateField(field.name, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Yes</span>
              </div>
            )}
            
            {field.type === 'table' && (
              <textarea
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter table data..."
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={generating}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {generating ? (
            <>
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Generating Document...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Generate Document
            </>
          )}
        </button>
        <button
          type="button"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Save as Draft
        </button>
      </div>
    </form>
  );
};

export default SmartDocumentGenerator;