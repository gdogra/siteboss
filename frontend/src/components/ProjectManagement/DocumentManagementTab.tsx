import React, { useState } from 'react';
import {
  PlusIcon,
  DocumentIcon,
  FolderIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: string;
  uploaded_by: string;
  uploaded_at: string;
  last_modified: string;
  description?: string;
  tags: string[];
  version: string;
  status: 'draft' | 'approved' | 'archived';
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  document_count: number;
  color: string;
}

interface DocumentManagementTabProps {
  projectId: string;
}

const DocumentManagementTab: React.FC<DocumentManagementTabProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Project Blueprint - Main Floor',
      type: 'pdf',
      size: 2456789,
      url: '#',
      category: 'blueprints',
      uploaded_by: 'John Smith',
      uploaded_at: '2024-01-15',
      last_modified: '2024-01-15',
      description: 'Main floor architectural blueprint with detailed measurements',
      tags: ['architecture', 'main floor', 'measurements'],
      version: '1.0',
      status: 'approved'
    },
    {
      id: '2',
      name: 'Building Permit Application',
      type: 'pdf',
      size: 1234567,
      url: '#',
      category: 'permits',
      uploaded_by: 'Sarah Wilson',
      uploaded_at: '2024-01-10',
      last_modified: '2024-01-12',
      description: 'Official building permit application and approval documentation',
      tags: ['permit', 'legal', 'approval'],
      version: '2.1',
      status: 'approved'
    },
    {
      id: '3',
      name: 'Material Safety Data Sheets',
      type: 'pdf',
      size: 3456789,
      url: '#',
      category: 'safety',
      uploaded_by: 'Mike Johnson',
      uploaded_at: '2024-01-18',
      last_modified: '2024-01-18',
      description: 'Safety data sheets for all materials used in construction',
      tags: ['safety', 'materials', 'compliance'],
      version: '1.0',
      status: 'approved'
    },
    {
      id: '4',
      name: 'Progress Photos - Week 3',
      type: 'zip',
      size: 15678900,
      url: '#',
      category: 'photos',
      uploaded_by: 'Lisa Chen',
      uploaded_at: '2024-01-20',
      last_modified: '2024-01-20',
      description: 'Weekly progress photos showing foundation completion',
      tags: ['progress', 'photos', 'foundation'],
      version: '1.0',
      status: 'draft'
    },
    {
      id: '5',
      name: 'Contract Amendment #2',
      type: 'docx',
      size: 567890,
      url: '#',
      category: 'contracts',
      uploaded_by: 'John Smith',
      uploaded_at: '2024-01-22',
      last_modified: '2024-01-23',
      description: 'Amendment to original contract regarding timeline adjustments',
      tags: ['contract', 'amendment', 'timeline'],
      version: '1.1',
      status: 'draft'
    }
  ]);

  const [categories] = useState<DocumentCategory[]>([
    { id: 'blueprints', name: 'Blueprints', description: 'Architectural drawings and plans', document_count: 1, color: 'blue' },
    { id: 'permits', name: 'Permits', description: 'Legal permits and approvals', document_count: 1, color: 'green' },
    { id: 'contracts', name: 'Contracts', description: 'Contract documents and amendments', document_count: 1, color: 'purple' },
    { id: 'safety', name: 'Safety', description: 'Safety documentation and protocols', document_count: 1, color: 'red' },
    { id: 'photos', name: 'Photos', description: 'Progress and reference photos', document_count: 1, color: 'yellow' },
    { id: 'reports', name: 'Reports', description: 'Project reports and analyses', document_count: 0, color: 'indigo' }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <DocumentIcon className="h-8 w-8 text-red-500" />;
      case 'docx':
      case 'doc':
        return <DocumentIcon className="h-8 w-8 text-blue-500" />;
      case 'zip':
      case 'rar':
        return <FolderIcon className="h-8 w-8 text-yellow-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = () => {
    setIsUploading(true);
    // Mock upload process
    setTimeout(() => {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: 'New Document.pdf',
        type: 'pdf',
        size: 1234567,
        url: '#',
        category: 'blueprints',
        uploaded_by: 'Current User',
        uploaded_at: new Date().toISOString().split('T')[0],
        last_modified: new Date().toISOString().split('T')[0],
        tags: ['new'],
        version: '1.0',
        status: 'draft'
      };
      setDocuments(prev => [...prev, newDocument]);
      setIsUploading(false);
    }, 2000);
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  const handleStatusChange = (documentId: string, newStatus: Document['status']) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId 
          ? { ...doc, status: newStatus, last_modified: new Date().toISOString().split('T')[0] }
          : doc
      )
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const documentStats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    draft: documents.filter(d => d.status === 'draft').length,
    totalSize: documents.reduce((sum, d) => sum + d.size, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Store, organize, and manage project documents and files
          </p>
        </div>
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          <CloudArrowUpIcon className="-ml-1 mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Files</p>
              <p className="text-lg font-semibold text-gray-900">{documentStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-lg font-semibold text-gray-900">{documentStats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-lg font-semibold text-gray-900">{documentStats.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Size</p>
              <p className="text-lg font-semibold text-gray-900">{formatFileSize(documentStats.totalSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedCategory === category.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(category.color)}`}>
                <FolderIcon className="h-3 w-3 mr-1" />
                {category.name}
              </div>
              <p className="text-xs text-gray-500">{category.document_count} files</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(document.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                    <span className="text-xs text-gray-500">v{document.version}</span>
                  </div>
                  {document.description && (
                    <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {document.uploaded_by}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </div>
                    <div>{formatFileSize(document.size)}</div>
                  </div>
                  {document.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={document.status}
                  onChange={(e) => handleStatusChange(document.id, e.target.value as Document['status'])}
                  className="text-xs border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
                <button className="p-1 text-gray-400 hover:text-primary-600">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-primary-600">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(document.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery || selectedCategory !== 'all' ? 'No documents match your criteria' : 'No documents yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload documents to get started with document management.'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                Upload Documents
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentManagementTab;