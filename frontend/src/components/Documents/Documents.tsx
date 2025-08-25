import React, { useState, useEffect } from 'react';
import {
  DocumentIcon,
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  project_id?: string;
  project_name?: string;
  uploaded_by: string;
  uploaded_at: Date;
  url: string;
  description?: string;
}

interface Folder {
  id: string;
  name: string;
  project_id?: string;
  parent_id?: string;
  created_at: Date;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Construction Plans.pdf',
        type: 'application/pdf',
        size: 2048576,
        project_id: 'proj1',
        project_name: 'Office Building Construction',
        uploaded_by: 'John Doe',
        uploaded_at: new Date('2024-01-15'),
        url: '#',
        description: 'Main construction blueprints and plans'
      },
      {
        id: '2',
        name: 'Safety Guidelines.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        project_id: 'proj1',
        project_name: 'Office Building Construction',
        uploaded_by: 'Jane Smith',
        uploaded_at: new Date('2024-01-10'),
        url: '#',
        description: 'Site safety protocols and guidelines'
      },
      {
        id: '3',
        name: 'Material Specifications.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024000,
        project_id: 'proj2',
        project_name: 'Residential Complex',
        uploaded_by: 'Mike Johnson',
        uploaded_at: new Date('2024-01-12'),
        url: '#',
        description: 'Detailed material specifications and quantities'
      }
    ];

    setDocuments(mockDocuments);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'all' || doc.project_id === selectedProject;
    return matchesSearch && matchesProject;
  });

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleDownload = (document: Document) => {
    // In a real app, this would trigger the actual download
    console.log('Downloading:', document.name);
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage project documents, plans, and files
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
            Upload Document
          </button>
        </div>
      </div>

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
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Project Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              >
                <option value="all">All Projects</option>
                {projects?.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                )) || []}
              </select>

              {/* View Toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                    view === 'list'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    view === 'grid'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } border-l-0`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document List/Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedProject !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Upload your first document to get started.'}
              </p>
              {!searchTerm && selectedProject === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleUpload}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                    Upload Document
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {filteredDocuments.map((document) => (
                <div key={document.id} className={`${view === 'grid' ? 'border rounded-lg p-4' : 'flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0'}`}>
                  <div className={`flex items-center ${view === 'grid' ? 'flex-col text-center' : 'flex-1 min-w-0'}`}>
                    <div className={`${view === 'grid' ? 'mb-3' : 'mr-4'} flex-shrink-0`}>
                      <span className="text-2xl">{getFileIcon(document.type)}</span>
                    </div>
                    <div className={`${view === 'grid' ? 'w-full' : 'flex-1 min-w-0'}`}>
                      <p className={`text-sm font-medium text-gray-900 ${view === 'grid' ? 'text-center mb-1' : 'truncate'}`}>
                        {document.name}
                      </p>
                      <p className={`text-xs text-gray-500 ${view === 'grid' ? 'text-center' : ''}`}>
                        {document.project_name}
                      </p>
                      {document.description && (
                        <p className={`text-xs text-gray-400 ${view === 'grid' ? 'text-center mt-1' : 'mt-1'} ${view === 'list' ? 'truncate' : ''}`}>
                          {document.description}
                        </p>
                      )}
                      <div className={`text-xs text-gray-400 ${view === 'grid' ? 'text-center mt-2' : 'mt-1'}`}>
                        {formatFileSize(document.size)} • {document.uploaded_at.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${view === 'grid' ? 'mt-4 justify-center' : ''}`}>
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal Placeholder */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsUploadModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Document</h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose File
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" onChange={(e) => {
                            if (e.target.files?.[0]) {
                              alert(`Selected file: ${e.target.files[0].name}`);
                            }
                          }} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, XLS, PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Document Title
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter document title"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      rows={3}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    alert('Document uploaded successfully!');
                    setIsUploadModalOpen(false);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Upload
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;