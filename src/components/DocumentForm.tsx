import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload, X, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentFormProps {
  document?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ document, onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project_id: document?.project_id || 0,
    title: document?.title || '',
    category: document?.category || 'Other',
    description: document?.description || '',
    is_client_visible: document?.is_client_visible !== undefined ? document.is_client_visible : true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "name",
        IsAsc: true
      });
      if (!response.error) {
        setProjects(response.data?.List || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }

    if (!document?.id && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let fileId = document?.file_id || 0;

      // Upload file if provided
      if (selectedFile) {
        const uploadResponse = await window.ezsite.apis.upload({
          filename: selectedFile.name,
          file: selectedFile
        });

        if (uploadResponse.error) throw uploadResponse.error;
        fileId = uploadResponse.data;
      }

      const submitData = {
        ...formData,
        project_id: Number(formData.project_id),
        file_id: fileId,
        upload_date: document?.upload_date || new Date().toISOString()
      };

      let response;
      if (document?.id) {
        // Update existing document
        response = await window.ezsite.apis.tableUpdate(32236, {
          ID: document.id,
          ...submitData
        });
      } else {
        // Create new document
        response = await window.ezsite.apis.tableCreate(32236, submitData);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `Document ${document?.id ? 'updated' : 'uploaded'} successfully`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: `Failed to ${document?.id ? 'update' : 'upload'} document`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {document?.id ? 'Edit Document' : 'Upload Document'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id.toString()}
                  onValueChange={(value) => handleInputChange('project_id', Number(value))}
                >
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
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permit">Permit</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Photo">Photo</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Building Permit, Electrical Invoice..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Document description..."
                rows={3}
              />
            </div>

            {!document?.id && (
              <div className="space-y-2">
                <Label htmlFor="file">File Upload *</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium"
                    required
                  />
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF
                </p>
              </div>
            )}

            {document?.id && (
              <div className="space-y-2">
                <Label>Current File</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">File ID: {document.file_id}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_file">Replace File (Optional)</Label>
                  <Input
                    id="new_file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="client_visible"
                checked={formData.is_client_visible}
                onCheckedChange={(checked) => handleInputChange('is_client_visible', checked)}
              />
              <Label htmlFor="client_visible">Client can view this document</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.project_id === 0}>
                {loading ? 'Saving...' : document?.id ? 'Update Document' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentForm;