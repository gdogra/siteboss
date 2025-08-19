
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download,
  Eye,
  Trash2,
  Search,
  Plus,
  File,
  Image,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ClientPortalLayout from '@/components/ClientPortalLayout';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: number;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  category: string;
  project_id?: number;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

const ClientDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProjectId, setUploadProjectId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [isUploading, setIsUploading] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  // Check if we were passed a specific project ID
  const initialProjectId = location.state?.projectId;

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchDocuments(), fetchProjects()]);
        if (initialProjectId) {
          setUploadProjectId(initialProjectId.toString());
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [initialProjectId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(32236, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: initialProjectId ? [
          { name: "project_id", op: "Equal", value: initialProjectId }
        ] : []
      });

      if (error) throw new Error(error);
      setDocuments(data?.List || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error loading documents",
        description: error?.message || "Failed to load documents",
        variant: "destructive"
      });
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) {
        console.warn('Error loading projects:', error);
        setProjects([]);
        return;
      }

      setProjects(data?.List || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const getFileIcon = (filename: string) => {
    if (!filename) return <File className="h-8 w-8 text-gray-500" />;
    
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="h-8 w-8 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileCode className="h-8 w-8 text-blue-600" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleFileUpload = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadTitle.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide a file and title",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file
      const { data: fileId, error: uploadError } = await window.ezsite.apis.upload({
        filename: uploadFile.name,
        file: uploadFile
      });

      if (uploadError) throw new Error(uploadError);

      // Create document record
      const documentData = {
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || null,
        file_path: fileId.toString(),
        file_name: uploadFile.name,
        file_size: uploadFile.size,
        category: uploadCategory || 'general',
        project_id: uploadProjectId ? parseInt(uploadProjectId) : null,
        created_at: new Date().toISOString()
      };

      const { error: createError } = await window.ezsite.apis.tableCreate(32236, documentData);
      if (createError) throw new Error(createError);

      toast({
        title: "Document uploaded successfully",
        description: `${uploadFile.name} has been uploaded.`,
      });

      // Reset form and close modal
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadCategory('general');
      if (!initialProjectId) {
        setUploadProjectId('');
      }
      setIsUploadModalOpen(false);
      
      // Refresh documents
      await fetchDocuments();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error?.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, uploadTitle, uploadDescription, uploadCategory, uploadProjectId, initialProjectId, toast]);

  const handleDownload = async (document: Document) => {
    try {
      const { data: fileUrl, error } = await window.ezsite.apis.getUploadUrl(parseInt(document.file_path));
      if (error) throw new Error(error);

      // Create download link
      const link = window.document.createElement('a');
      link.href = fileUrl;
      link.download = document.file_name;
      link.click();

      toast({
        title: "Download started",
        description: `Downloading ${document.file_name}`,
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error?.message || "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(32236, { id: documentId });
      if (error) throw new Error(error);

      toast({
        title: "Document deleted",
        description: "The document has been removed successfully.",
      });

      await fetchDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error?.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (!doc) return false;
    
    const matchesSearch = !searchTerm || 
      (doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProjectName = (projectId: number) => {
    if (!projectId) return 'No Project';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground">
              Upload and manage your project documents
              {initialProjectId && (
                <span className="ml-2">
                  • Filtered for {getProjectName(initialProjectId)}
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="contract">Contracts</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.file_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{document.title || 'Untitled'}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {document.file_name || 'Unknown file'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(document.file_size || 0)}</span>
                      <span>•</span>
                      <span>{document.created_at ? new Date(document.created_at).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                    {document.category && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {document.category}
                      </Badge>
                    )}
                    {document.project_id && (
                      <Badge variant="outline" className="mt-2 ml-2 text-xs">
                        {getProjectName(document.project_id)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {document.description && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {document.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No documents message */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'No documents match your search criteria.' 
                : 'You haven\'t uploaded any documents yet.'}
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First Document
            </Button>
          </div>
        )}

        {/* Upload Modal */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Choose File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
                {uploadFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter document title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!initialProjectId && (
                <div>
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isUploading} className="flex-1">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ClientPortalLayout>
  );
};

export default ClientDocuments;
