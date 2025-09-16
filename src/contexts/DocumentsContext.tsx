import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { documentApi } from '@/services/api';

export interface Document {
  id: string;
  projectId: string;
  name: string;
  filename: string;
  type: 'drawing' | 'specification' | 'permit' | 'photo' | 'contract' | 'report' | 'invoice' | 'other';
  category: string;
  size: number;
  size_formatted: string;
  file_url?: string;
  thumbnail_url?: string;
  description?: string;
  version: string;
  status: 'approved' | 'pending' | 'draft' | 'rejected' | 'archived';
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_date: string;
  approved_by?: string;
  approved_date?: string;
  tags: string[];
  folder_path?: string;
  is_public: boolean;
  access_permissions: string[];
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentFolder {
  id: string;
  projectId: string;
  name: string;
  path: string;
  parent_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  file_url: string;
  size: number;
  uploaded_by: string;
  uploaded_date: string;
  change_notes?: string;
}

interface DocumentsContextType {
  documents: Document[];
  folders: DocumentFolder[];
  versions: DocumentVersion[];

  // Document operations
  getDocumentsByProject: (projectId: string) => Document[];
  fetchDocuments: (projectId: string) => Promise<Document[]>;
  getDocumentsByFolder: (folderId: string) => Document[];
  getDocument: (documentId: string) => Document | undefined;
  addDocument: (documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => Document;
  updateDocument: (documentId: string, updates: Partial<Document>) => Document | null;
  deleteDocument: (documentId: string) => boolean;
  duplicateDocument: (documentId: string) => Document | null;
  moveDocument: (documentId: string, newFolderId?: string) => Document | null;
  approveDocument: (documentId: string, approvedBy: string) => Document | null;
  archiveDocument: (documentId: string) => Document | null;

  // Folder operations
  getFoldersByProject: (projectId: string) => DocumentFolder[];
  getFolder: (folderId: string) => DocumentFolder | undefined;
  addFolder: (folderData: Omit<DocumentFolder, 'id' | 'created_at' | 'updated_at'>) => DocumentFolder;
  updateFolder: (folderId: string, updates: Partial<DocumentFolder>) => DocumentFolder | null;
  deleteFolder: (folderId: string) => boolean;
  moveFolder: (folderId: string, newParentId?: string) => DocumentFolder | null;

  // Version operations
  getDocumentVersions: (documentId: string) => DocumentVersion[];
  addDocumentVersion: (versionData: Omit<DocumentVersion, 'id'>) => DocumentVersion;
  deleteDocumentVersion: (versionId: string) => boolean;

  // Search and filter operations
  searchDocuments: (projectId: string, query: string) => Document[];
  getDocumentsByType: (projectId: string, type: Document['type']) => Document[];
  getDocumentsByStatus: (projectId: string, status: Document['status']) => Document[];
  getDocumentsByTag: (projectId: string, tag: string) => Document[];
  getRecentDocuments: (projectId: string, limit?: number) => Document[];

  // Utility operations
  incrementDownloadCount: (documentId: string) => void;
  bulkDeleteDocuments: (documentIds: string[]) => boolean[];
  bulkMoveDocuments: (documentIds: string[], folderId?: string) => Document[];
  getDocumentStats: (projectId: string) => {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalSize: number;
  };
  getDownloadUrl: (documentId: string) => string | undefined;
}

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    projectId: 'demo',
    name: 'Architectural Plans - Main Building',
    filename: 'architectural_plans_main_v2.1.pdf',
    type: 'drawing',
    category: 'Plans',
    size: 2514944,
    size_formatted: '2.4 MB',
    file_url: '/documents/architectural_plans_main_v2.1.pdf',
    thumbnail_url: '/thumbnails/architectural_plans_main_v2.1.jpg',
    description: 'Complete architectural drawings for the main building structure',
    version: 'v2.1',
    status: 'approved',
    uploaded_by: 'USER001',
    uploaded_by_name: 'Sarah Johnson',
    uploaded_date: '2024-09-05',
    approved_by: 'Project Manager',
    approved_date: '2024-09-06',
    tags: ['architecture', 'plans', 'main-building'],
    folder_path: '/Plans/Architectural',
    is_public: false,
    access_permissions: ['project_team', 'client'],
    download_count: 15,
    created_at: '2024-09-05T10:00:00Z',
    updated_at: '2024-09-06T14:30:00Z'
  },
  {
    id: '2',
    projectId: 'demo',
    name: 'Site Survey Report',
    filename: 'site_survey_report.pdf',
    type: 'report',
    category: 'Surveys',
    size: 1048576,
    size_formatted: '1.0 MB',
    file_url: '/documents/site_survey_report.pdf',
    description: 'Detailed site survey including topographical information',
    version: 'v1.0',
    status: 'approved',
    uploaded_by: 'USER002',
    uploaded_by_name: 'Mike Rodriguez',
    uploaded_date: '2024-09-03',
    approved_by: 'Site Manager',
    approved_date: '2024-09-03',
    tags: ['survey', 'site', 'topography'],
    folder_path: '/Reports/Surveys',
    is_public: false,
    access_permissions: ['project_team'],
    download_count: 8,
    created_at: '2024-09-03T09:15:00Z',
    updated_at: '2024-09-03T16:20:00Z'
  },
  {
    id: '3',
    projectId: 'demo',
    name: 'Foundation Progress Photo',
    filename: 'foundation_progress_20240915.jpg',
    type: 'photo',
    category: 'Progress Photos',
    size: 3145728,
    size_formatted: '3.0 MB',
    file_url: '/documents/foundation_progress_20240915.jpg',
    thumbnail_url: '/thumbnails/foundation_progress_20240915_thumb.jpg',
    description: 'Foundation concrete pour completion',
    version: 'v1.0',
    status: 'approved',
    uploaded_by: 'USER003',
    uploaded_by_name: 'David Chen',
    uploaded_date: '2024-09-15',
    tags: ['progress', 'foundation', 'concrete'],
    folder_path: '/Photos/Progress',
    is_public: true,
    access_permissions: ['public'],
    download_count: 3,
    created_at: '2024-09-15T17:30:00Z',
    updated_at: '2024-09-15T17:30:00Z'
  },
  {
    id: '4',
    projectId: 'demo',
    name: 'Building Permit Application',
    filename: 'building_permit_application.pdf',
    type: 'permit',
    category: 'Permits',
    size: 524288,
    size_formatted: '512 KB',
    file_url: '/documents/building_permit_application.pdf',
    description: 'Official building permit application and supporting documents',
    version: 'v1.2',
    status: 'pending',
    uploaded_by: 'USER001',
    uploaded_by_name: 'Sarah Johnson',
    uploaded_date: '2024-09-10',
    tags: ['permit', 'building', 'legal'],
    folder_path: '/Legal/Permits',
    is_public: false,
    access_permissions: ['management', 'legal'],
    download_count: 5,
    created_at: '2024-09-10T11:00:00Z',
    updated_at: '2024-09-12T09:45:00Z'
  },
  // Documents for project 1757454115704
  {
    id: '5',
    projectId: '1757454115704',
    name: 'Project Specifications Document',
    filename: 'project_specifications_v1.0.pdf',
    type: 'specification',
    category: 'Specifications',
    size: 2048000,
    size_formatted: '2.0 MB',
    file_url: '/documents/project_specifications_v1.0.pdf',
    description: 'Detailed project specifications and requirements',
    version: 'v1.0',
    status: 'approved',
    uploaded_by: 'USER001',
    uploaded_by_name: 'Sarah Johnson',
    uploaded_date: '2024-12-01',
    tags: ['specifications', 'requirements'],
    folder_path: '/Specifications',
    is_public: false,
    access_permissions: ['project_team', 'management'],
    download_count: 3,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z'
  },
  {
    id: '6',
    projectId: '1757454115704',
    name: 'Construction Progress Photos',
    filename: 'progress_photos_week1.zip',
    type: 'photo',
    category: 'Photos',
    size: 15728640,
    size_formatted: '15.0 MB',
    file_url: '/documents/progress_photos_week1.zip',
    description: 'Weekly construction progress photos and documentation',
    version: 'v1.0',
    status: 'approved',
    uploaded_by: 'USER002',
    uploaded_by_name: 'Mike Chen',
    uploaded_date: '2024-12-08',
    tags: ['photos', 'progress', 'documentation'],
    folder_path: '/Photos',
    is_public: true,
    access_permissions: ['project_team', 'client'],
    download_count: 7,
    created_at: '2024-12-08T15:30:00Z',
    updated_at: '2024-12-08T15:30:00Z'
  },
  {
    id: '7',
    projectId: '1757454115704',
    name: 'Safety Compliance Report',
    filename: 'safety_report_december_2024.pdf',
    type: 'report',
    category: 'Reports',
    size: 1024000,
    size_formatted: '1.0 MB',
    file_url: '/documents/safety_report_december_2024.pdf',
    description: 'Monthly safety compliance and incident report',
    version: 'v1.0',
    status: 'draft',
    uploaded_by: 'USER003',
    uploaded_by_name: 'Lisa Rodriguez',
    uploaded_date: '2024-12-09',
    tags: ['safety', 'compliance', 'monthly'],
    folder_path: '/Reports',
    is_public: false,
    access_permissions: ['management', 'safety_team'],
    download_count: 1,
    created_at: '2024-12-09T09:00:00Z',
    updated_at: '2024-12-09T09:00:00Z'
  }
];

const mockFolders: DocumentFolder[] = [
  {
    id: '1',
    projectId: 'demo',
    name: 'Plans',
    path: '/Plans',
    created_by: 'USER001',
    created_at: '2024-09-01T08:00:00Z',
    updated_at: '2024-09-01T08:00:00Z'
  },
  {
    id: '2',
    projectId: 'demo',
    name: 'Architectural',
    path: '/Plans/Architectural',
    parent_id: '1',
    created_by: 'USER001',
    created_at: '2024-09-01T08:05:00Z',
    updated_at: '2024-09-01T08:05:00Z'
  },
  {
    id: '3',
    projectId: 'demo',
    name: 'Reports',
    path: '/Reports',
    created_by: 'USER002',
    created_at: '2024-09-01T08:10:00Z',
    updated_at: '2024-09-01T08:10:00Z'
  },
  {
    id: '4',
    projectId: 'demo',
    name: 'Photos',
    path: '/Photos',
    created_by: 'USER003',
    created_at: '2024-09-01T08:15:00Z',
    updated_at: '2024-09-01T08:15:00Z'
  }
];

const mockVersions: DocumentVersion[] = [
  {
    id: '1',
    document_id: '1',
    version: 'v2.0',
    file_url: '/documents/versions/architectural_plans_main_v2.0.pdf',
    size: 2400000,
    uploaded_by: 'USER001',
    uploaded_date: '2024-09-04',
    change_notes: 'Updated electrical layouts based on engineer feedback'
  },
  {
    id: '2',
    document_id: '4',
    version: 'v1.1',
    file_url: '/documents/versions/building_permit_application_v1.1.pdf',
    size: 500000,
    uploaded_by: 'USER001',
    uploaded_date: '2024-09-11',
    change_notes: 'Added additional structural details per city requirements'
  }
];

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

interface DocumentsProviderProps {
  children: ReactNode;
}

export const DocumentsProvider: React.FC<DocumentsProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [folders, setFolders] = useState<DocumentFolder[]>(mockFolders);
  const [versions, setVersions] = useState<DocumentVersion[]>(mockVersions);
  const loadedForProject = useRef<Set<string>>(new Set());

  const formatSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const val = bytes / Math.pow(1024, i);
    return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const mapApiDoc = (row: any): Document => {
    const id = row.id;
    const createdAt = row.created_at || new Date().toISOString();
    const updatedAt = row.updated_at || createdAt;
    return {
      id,
      projectId: row.project_id,
      name: row.title || row.file_name || 'Document',
      filename: row.file_name || 'file',
      type: (row.category as Document['type']) || 'other',
      category: row.category || 'other',
      size: Number(row.file_size || 0),
      size_formatted: formatSize(Number(row.file_size || 0)),
      file_url: documentApi.downloadUrl(id),
      thumbnail_url: undefined,
      description: row.description || undefined,
      version: (row.version ? `v${row.version}` : 'v1.0'),
      status: 'approved',
      uploaded_by: row.uploaded_by || '',
      uploaded_by_name: row.uploaded_by_name || '',
      uploaded_date: (createdAt || '').toString().slice(0, 10),
      approved_by: undefined,
      approved_date: undefined,
      tags: [],
      folder_path: undefined,
      is_public: !!row.is_public,
      access_permissions: [],
      download_count: 0,
      created_at: createdAt,
      updated_at: updatedAt,
    };
  };

  // Document operations
  const getDocumentsByProject = (projectId: string): Document[] => {
    // Kick off a fetch the first time this project is requested
    if (!loadedForProject.current.has(projectId)) {
      // Fire-and-forget
      fetchDocuments(projectId).catch(() => {});
    }
    return documents.filter(doc => doc.projectId === projectId);
  };

  const fetchDocuments = async (projectId: string): Promise<Document[]> => {
    try {
      const resp = await documentApi.listByProject(projectId);
      const rows = (resp as any).data || [];
      const mapped = rows.map(mapApiDoc);
      // Replace documents for this project with fresh list
      setDocuments(prev => {
        const others = prev.filter(d => d.projectId !== projectId);
        return [...others, ...mapped];
      });
      loadedForProject.current.add(projectId);
      return mapped;
    } catch (e) {
      // Keep existing (mock) data if API fails
      return documents.filter(d => d.projectId === projectId);
    }
  };

  const getDocumentsByFolder = (folderId: string): Document[] => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];
    
    return documents.filter(doc => doc.folder_path?.startsWith(folder.path));
  };

  const getDocument = (documentId: string): Document | undefined => {
    return documents.find(doc => doc.id === documentId);
  };

  const addDocument = (documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Document => {
    const newDocument: Document = {
      ...documentData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = (documentId: string, updates: Partial<Document>): Document | null => {
    const index = documents.findIndex(doc => doc.id === documentId);
    if (index === -1) return null;

    const updatedDocument = {
      ...documents[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    setDocuments(prev => [...prev.slice(0, index), updatedDocument, ...prev.slice(index + 1)]);
    return updatedDocument;
  };

  const deleteDocument = (documentId: string): boolean => {
    const index = documents.findIndex(doc => doc.id === documentId);
    if (index === -1) return false;

    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    // Also delete associated versions
    setVersions(prev => prev.filter(version => version.document_id !== documentId));
    return true;
  };

  const duplicateDocument = (documentId: string): Document | null => {
    const original = getDocument(documentId);
    if (!original) return null;

    const duplicated = addDocument({
      ...original,
      name: `${original.name} (Copy)`,
      filename: `copy_${original.filename}`,
      version: 'v1.0',
      status: 'draft',
      download_count: 0
    });

    return duplicated;
  };

  const moveDocument = (documentId: string, newFolderId?: string): Document | null => {
    const folder = newFolderId ? folders.find(f => f.id === newFolderId) : null;
    const newFolderPath = folder ? folder.path : '/';

    return updateDocument(documentId, { folder_path: newFolderPath });
  };

  const approveDocument = (documentId: string, approvedBy: string): Document | null => {
    return updateDocument(documentId, {
      status: 'approved',
      approved_by: approvedBy,
      approved_date: new Date().toISOString().split('T')[0]
    });
  };

  const archiveDocument = (documentId: string): Document | null => {
    return updateDocument(documentId, { status: 'archived' });
  };

  // Folder operations
  const getFoldersByProject = (projectId: string): DocumentFolder[] => {
    return folders.filter(folder => folder.projectId === projectId);
  };

  const getFolder = (folderId: string): DocumentFolder | undefined => {
    return folders.find(folder => folder.id === folderId);
  };

  const addFolder = (folderData: Omit<DocumentFolder, 'id' | 'created_at' | 'updated_at'>): DocumentFolder => {
    const newFolder: DocumentFolder = {
      ...folderData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (folderId: string, updates: Partial<DocumentFolder>): DocumentFolder | null => {
    const index = folders.findIndex(folder => folder.id === folderId);
    if (index === -1) return null;

    const updatedFolder = {
      ...folders[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    setFolders(prev => [...prev.slice(0, index), updatedFolder, ...prev.slice(index + 1)]);
    return updatedFolder;
  };

  const deleteFolder = (folderId: string): boolean => {
    const folder = getFolder(folderId);
    if (!folder) return false;

    // Move documents out of folder before deleting
    const folderDocuments = getDocumentsByFolder(folderId);
    folderDocuments.forEach(doc => {
      moveDocument(doc.id, undefined);
    });

    setFolders(prev => prev.filter(f => f.id !== folderId));
    return true;
  };

  const moveFolder = (folderId: string, newParentId?: string): DocumentFolder | null => {
    const folder = getFolder(folderId);
    if (!folder) return null;

    const parentFolder = newParentId ? getFolder(newParentId) : null;
    const newPath = parentFolder ? `${parentFolder.path}/${folder.name}` : `/${folder.name}`;

    return updateFolder(folderId, { 
      parent_id: newParentId,
      path: newPath 
    });
  };

  // Version operations
  const getDocumentVersions = (documentId: string): DocumentVersion[] => {
    return versions.filter(version => version.document_id === documentId);
  };

  const addDocumentVersion = (versionData: Omit<DocumentVersion, 'id'>): DocumentVersion => {
    const newVersion: DocumentVersion = {
      ...versionData,
      id: Date.now().toString()
    };

    setVersions(prev => [...prev, newVersion]);
    return newVersion;
  };

  const deleteDocumentVersion = (versionId: string): boolean => {
    const index = versions.findIndex(version => version.id === versionId);
    if (index === -1) return false;

    setVersions(prev => prev.filter(version => version.id !== versionId));
    return true;
  };

  // Search and filter operations
  const searchDocuments = (projectId: string, query: string): Document[] => {
    const projectDocs = getDocumentsByProject(projectId);
    const lowercaseQuery = query.toLowerCase();

    return projectDocs.filter(doc =>
      doc.name.toLowerCase().includes(lowercaseQuery) ||
      doc.description?.toLowerCase().includes(lowercaseQuery) ||
      doc.filename.toLowerCase().includes(lowercaseQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      doc.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getDocumentsByType = (projectId: string, type: Document['type']): Document[] => {
    return getDocumentsByProject(projectId).filter(doc => doc.type === type);
  };

  const getDocumentsByStatus = (projectId: string, status: Document['status']): Document[] => {
    return getDocumentsByProject(projectId).filter(doc => doc.status === status);
  };

  const getDocumentsByTag = (projectId: string, tag: string): Document[] => {
    return getDocumentsByProject(projectId).filter(doc => 
      doc.tags.includes(tag.toLowerCase())
    );
  };

  const getRecentDocuments = (projectId: string, limit: number = 10): Document[] => {
    return getDocumentsByProject(projectId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit);
  };

  // Utility operations
  const incrementDownloadCount = (documentId: string): void => {
    updateDocument(documentId, { 
      download_count: (getDocument(documentId)?.download_count || 0) + 1 
    });
  };

  const bulkDeleteDocuments = (documentIds: string[]): boolean[] => {
    return documentIds.map(id => deleteDocument(id));
  };

  const bulkMoveDocuments = (documentIds: string[], folderId?: string): Document[] => {
    const movedDocuments: Document[] = [];
    
    documentIds.forEach(id => {
      const moved = moveDocument(id, folderId);
      if (moved) movedDocuments.push(moved);
    });

    return movedDocuments;
  };

  const getDocumentStats = (projectId: string) => {
    const projectDocs = getDocumentsByProject(projectId);
    
    const byType = projectDocs.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = projectDocs.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSize = projectDocs.reduce((acc, doc) => acc + doc.size, 0);

    return {
      total: projectDocs.length,
      byType,
      byStatus,
      totalSize
    };
  };

  const getDownloadUrl = (documentId: string): string | undefined => {
    const doc = getDocument(documentId);
    if (!doc) return undefined;
    // Prefer backend download route to support private buckets
    return documentApi.downloadUrl(documentId);
  };

  const contextValue: DocumentsContextType = {
    documents,
    folders,
    versions,
    getDocumentsByProject,
    fetchDocuments,
    getDocumentsByFolder,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    moveDocument,
    approveDocument,
    archiveDocument,
    getFoldersByProject,
    getFolder,
    addFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    getDocumentVersions,
    addDocumentVersion,
    deleteDocumentVersion,
    searchDocuments,
    getDocumentsByType,
    getDocumentsByStatus,
    getDocumentsByTag,
    getRecentDocuments,
    incrementDownloadCount,
    bulkDeleteDocuments,
    bulkMoveDocuments,
    getDocumentStats,
    getDownloadUrl
  };

  return (
    <DocumentsContext.Provider value={contextValue}>
      {children}
    </DocumentsContext.Provider>
  );
};

export const useDocuments = (): DocumentsContextType => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
};
