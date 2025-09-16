import React, { useState } from 'react';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/FileUpload';
import {
  FileText,
  Image,
  Upload,
  Download,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';

interface DocumentsManagementProps {
  projectId?: string;
}

const DocumentsManagement: React.FC<DocumentsManagementProps> = ({ projectId = 'demo' }) => {
  const {
    getDocumentsByProject,
    addDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    moveDocument,
    approveDocument,
    searchDocuments,
    getDocumentsByType,
    getDocumentsByStatus,
    incrementDownloadCount,
    bulkDeleteDocuments
  } = useDocuments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const allDocuments = getDocumentsByProject(projectId);
  const documents = searchTerm ? searchDocuments(projectId, searchTerm) : allDocuments;

  // Create a downloadable file from document data
  const createDownloadableFile = (document: any) => {
    let content = '';
    let mimeType = 'text/plain';
    
    // Create different content based on document type
    switch (document.type) {
      case 'report':
        content = `Project Report: ${document.name}\n\nGenerated: ${document.uploaded_date}\nProject ID: ${document.projectId}\nVersion: ${document.version}\n\nDescription:\n${document.description}\n\nThis is a sample document content for ${document.name}.`;
        break;
      case 'contract':
        content = `CONTRACT DOCUMENT\n\n${document.name}\n\nDate: ${document.uploaded_date}\nProject: ${document.projectId}\nVersion: ${document.version}\n\nContract Terms:\n- Sample term 1\n- Sample term 2\n- Sample term 3\n\nThis document contains the contractual agreements for the project.`;
        break;
      case 'permit':
        content = `PERMIT DOCUMENT\n\n${document.name}\n\nIssued: ${document.uploaded_date}\nProject: ${document.projectId}\nPermit #: ${document.id}\n\nPermit Details:\n- Approved construction activities\n- Valid until project completion\n- Compliance with local regulations\n\nThis permit authorizes the specified construction activities.`;
        break;
      default:
        content = `Document: ${document.name}\n\nCreated: ${document.uploaded_date}\nProject: ${document.projectId}\nType: ${document.type}\nVersion: ${document.version}\n\nDescription:\n${document.description}\n\nDocument content for ${document.filename}`;
    }

    // For images, create a simple HTML file with image placeholder
    if (document.type === 'photo') {
      content = `<!DOCTYPE html>
<html>
<head>
    <title>${document.name}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; }
        .content { margin-top: 20px; }
        .placeholder { width: 400px; height: 300px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${document.name}</h1>
        <p>Project: ${document.projectId} | Date: ${document.uploaded_date}</p>
    </div>
    <div class="content">
        <p><strong>Description:</strong> ${document.description}</p>
        <p><strong>Size:</strong> ${document.size_formatted}</p>
        <div class="placeholder">Image Placeholder</div>
        <p>This is a sample image document. In a real application, this would contain the actual image data.</p>
    </div>
</body>
</html>`;
      mimeType = 'text/html';
    }

    return new Blob([content], { type: mimeType });
  };

  // Document action handlers
  const handleDownload = (document: any) => {
    incrementDownloadCount(document.id);
    
    try {
      // Create downloadable file content
      const blob = createDownloadableFile(document);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      
      // Set appropriate filename with extension
      let filename = document.filename;
      if (!filename.includes('.')) {
        const extension = document.type === 'photo' ? '.html' : '.txt';
        filename += extension;
      }
      
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleView = (document: any) => {
    // Open document in new window/tab
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleEdit = (document: any) => {
    // In a real app, this would open an edit modal
    const newName = prompt('Edit document name:', document.name);
    if (newName && newName !== document.name) {
      updateDocument(document.id, { name: newName });
    }
  };

  const handleDelete = (document: any) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      deleteDocument(document.id);
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    setUploading(true);
    try {
      // Process each uploaded file
      for (const file of files) {
        const fileType = getFileType(file.name);
        const category = getCategoryFromType(fileType);
        
        const newDoc = {
          projectId,
          name: file.name.split('.')[0], // Remove extension for name
          filename: file.name,
          type: fileType,
          category: category,
          size: file.size,
          size_formatted: formatFileSize(file.size),
          description: `Uploaded document: ${file.name}`,
          version: 'v1.0',
          status: 'draft' as const,
          uploaded_by: 'USER001',
          uploaded_by_name: 'Current User',
          uploaded_date: new Date().toISOString().split('T')[0],
          tags: ['uploaded'],
          is_public: false,
          access_permissions: ['project_team'],
          download_count: 0
        };
        
        addDocument(newDoc);
      }
      
      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (filename: string): 'drawing' | 'photo' | 'specification' | 'permit' | 'contract' | 'report' => {
    const extension = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return 'photo';
    }
    if (['dwg', 'dxf'].includes(extension || '')) {
      return 'drawing';
    }
    if (filename.toLowerCase().includes('permit')) {
      return 'permit';
    }
    if (filename.toLowerCase().includes('contract')) {
      return 'contract';
    }
    if (filename.toLowerCase().includes('spec')) {
      return 'specification';
    }
    return 'report';
  };

  const getCategoryFromType = (type: string): string => {
    switch (type) {
      case 'drawing': return 'Drawings';
      case 'photo': return 'Photos';
      case 'specification': return 'Specifications';
      case 'permit': return 'Permits';
      case 'contract': return 'Contracts';
      case 'report': return 'Reports';
      default: return 'General';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents based on selected category
  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  // Get available categories from documents
  const availableCategories = ['all', ...new Set(allDocuments.map(doc => doc.category))];

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'drawing':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'photo':
        return <Image className="w-5 h-5 text-green-600" />;
      case 'specification':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'permit':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'contract':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'report':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const variants = {
      approved: 'default',
      pending: 'secondary',
      draft: 'outline',
      rejected: 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };


  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Documents</h2>
          <p className="text-muted-foreground">Manage drawings, specifications, and project documentation</p>
        </div>
        <Button 
          onClick={() => setShowUpload(true)}
          disabled={uploading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Document Icon */}
                <div className="flex-shrink-0">
                  {getDocumentIcon(document.type)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{document.name}</h3>
                    {getStatusBadge(document.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {document.uploaded_by_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {document.uploaded_date}
                    </span>
                    <span>{document.size_formatted}</span>
                    <span>Version {document.version}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleView(document)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(document)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(document)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(document)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Upload your first document to get started'}
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {documents.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(documents.reduce((sum, doc) => sum + parseFloat(doc.size), 0) / 1024 * 100) / 100}
            </div>
            <div className="text-sm text-muted-foreground">MB Total Size</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Upload Documents</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <FileUpload
                onUpload={handleFilesUpload}
                acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.dwg', '.dxf', '.txt']}
                maxSize={25} // 25MB limit
                multiple={true}
                disabled={uploading}
              />

              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsManagement;