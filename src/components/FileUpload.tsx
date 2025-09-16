import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'],
  maxSize = 10,
  multiple = true,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension || '')) {
      return <Image className="w-5 h-5 text-green-600" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      
      const uploadFile: UploadFile = {
        file,
        id: Date.now().toString() + i,
        progress: 0,
        status: validation ? 'error' : 'pending',
        error: validation || undefined
      };
      
      newFiles.push(uploadFile);
    }

    if (!multiple && newFiles.length > 1) {
      alert('Multiple file upload is not allowed');
      return;
    }

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [acceptedTypes, maxSize, multiple]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateUpload = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate occasional upload failures
          if (Math.random() < 0.1) {
            setUploadFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id
                  ? { ...f, status: 'error', error: 'Upload failed. Please try again.' }
                  : f
              )
            );
            reject(new Error('Upload failed'));
          } else {
            setUploadFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id
                  ? { ...f, status: 'success', progress: 100 }
                  : f
              )
            );
            resolve();
          }
        } else {
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'uploading', progress: Math.floor(progress) }
                : f
            )
          );
        }
      }, 100);
    });
  };

  const handleUpload = async () => {
    const validFiles = uploadFiles.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files one by one
      for (const uploadFile of validFiles) {
        await simulateUpload(uploadFile);
      }

      // Call the onUpload callback with successful files
      const successfulFiles = uploadFiles
        .filter(f => f.status === 'success')
        .map(f => f.file);
      
      if (successfulFiles.length > 0) {
        await onUpload(successfulFiles);
      }

      // Clear successful uploads after a delay
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setUploadFiles([]);
  };

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const hasValidFiles = pendingFiles.length > 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 border-2 bg-blue-50'
            : 'border-dashed border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <h3 className="text-lg font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <div className="text-sm text-gray-400">
            <p>Accepted formats: {acceptedTypes.join(', ')}</p>
            <p>Maximum size: {maxSize}MB per file</p>
            {multiple && <p>Multiple files allowed</p>}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Files ({uploadFiles.length})</h3>
              <div className="flex gap-2">
                {hasValidFiles && (
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={isUploading || disabled}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${pendingFiles.length} Files`}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {getFileIcon(uploadFile.file.name)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {uploadFile.file.name}
                      </p>
                      <Badge
                        variant={
                          uploadFile.status === 'success'
                            ? 'default'
                            : uploadFile.status === 'error'
                            ? 'destructive'
                            : uploadFile.status === 'uploading'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {uploadFile.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      {uploadFile.error && (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {uploadFile.error}
                        </span>
                      )}
                    </div>

                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadFile.progress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;