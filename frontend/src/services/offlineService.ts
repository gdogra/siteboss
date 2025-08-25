import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { api } from './api';

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId?: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface CacheEntry {
  key: string;
  data: any;
  timestamp: Date;
  expiry?: Date;
}

class OfflineService {
  private db: IDBPDatabase | null = null;
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.initDB();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private async initDB() {
    try {
      this.db = await openDB('SiteBossOffline', 3, {
        upgrade(db, oldVersion, newVersion) {
          // Offline actions queue
          if (!db.objectStoreNames.contains('offlineActions')) {
            const actionStore = db.createObjectStore('offlineActions', {
              keyPath: 'id'
            });
            actionStore.createIndex('timestamp', 'timestamp');
            actionStore.createIndex('entity', 'entity');
          }

          // Cached data
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', {
              keyPath: 'key'
            });
            cacheStore.createIndex('timestamp', 'timestamp');
            cacheStore.createIndex('expiry', 'expiry');
          }

          // User data for offline access
          if (!db.objectStoreNames.contains('userData')) {
            db.createObjectStore('userData', {
              keyPath: 'userId'
            });
          }

          // Project data
          if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', {
              keyPath: 'id'
            });
            projectStore.createIndex('companyId', 'company_id');
            projectStore.createIndex('status', 'status');
          }

          // Tasks data
          if (!db.objectStoreNames.contains('tasks')) {
            const taskStore = db.createObjectStore('tasks', {
              keyPath: 'id'
            });
            taskStore.createIndex('projectId', 'project_id');
            taskStore.createIndex('assignedTo', 'assigned_to');
            taskStore.createIndex('status', 'status');
          }

          // Time entries
          if (!db.objectStoreNames.contains('timeEntries')) {
            const timeStore = db.createObjectStore('timeEntries', {
              keyPath: 'id'
            });
            timeStore.createIndex('userId', 'user_id');
            timeStore.createIndex('projectId', 'project_id');
            timeStore.createIndex('date', 'date');
          }

          // Photos and documents
          if (!db.objectStoreNames.contains('media')) {
            const mediaStore = db.createObjectStore('media', {
              keyPath: 'id'
            });
            mediaStore.createIndex('projectId', 'project_id');
            mediaStore.createIndex('taskId', 'task_id');
            mediaStore.createIndex('type', 'type');
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting sync...');
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Gone offline - enabling offline mode...');
    });

    // Background sync when possible - Temporarily disabled
    // TODO: Re-enable once service worker is properly configured
    console.log('Background sync registration disabled for now');
  }

  private startPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncOfflineActions();
      }
    }, 5 * 60 * 1000);
  }

  // Queue actions for offline execution
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>): Promise<string> {
    if (!this.db) return '';

    const offlineAction: OfflineAction = {
      ...action,
      id: uuidv4(),
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    };

    await this.db.add('offlineActions', offlineAction);
    console.log(`📱 Queued offline action: ${action.type} ${action.entity}`);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncOfflineActions();
    }

    return offlineAction.id;
  }

  // Cache data for offline access
  async cacheData(key: string, data: any, expiryMinutes: number = 60): Promise<void> {
    if (!this.db) return;

    const cacheEntry: CacheEntry = {
      key,
      data,
      timestamp: new Date(),
      expiry: new Date(Date.now() + expiryMinutes * 60 * 1000)
    };

    await this.db.put('cache', cacheEntry);
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) return null;

    const entry = await this.db.get('cache', key);
    if (!entry) return null;

    // Check expiry
    if (entry.expiry && new Date() > entry.expiry) {
      await this.db.delete('cache', key);
      return null;
    }

    return entry.data;
  }

  // Store user data for offline access
  async storeUserData(userId: string, userData: any): Promise<void> {
    if (!this.db) return;
    await this.db.put('userData', { userId, ...userData });
  }

  // Store project data
  async storeProjects(projects: any[]): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction('projects', 'readwrite');
    
    for (const project of projects) {
      await tx.store.put(project);
    }
    
    await tx.done;
  }

  // Get offline projects
  async getOfflineProjects(companyId?: string): Promise<any[]> {
    if (!this.db) return [];

    if (companyId) {
      return await this.db.getAllFromIndex('projects', 'companyId', companyId);
    }
    
    return await this.db.getAll('projects');
  }

  // Store task data
  async storeTasks(tasks: any[]): Promise<void> {
    if (!this.db) return;
    const tx = this.db.transaction('tasks', 'readwrite');
    
    for (const task of tasks) {
      await tx.store.put(task);
    }
    
    await tx.done;
  }

  // Get offline tasks
  async getOfflineTasks(projectId?: string, assignedTo?: string): Promise<any[]> {
    if (!this.db) return [];

    if (projectId) {
      return await this.db.getAllFromIndex('tasks', 'projectId', projectId);
    }
    
    if (assignedTo) {
      return await this.db.getAllFromIndex('tasks', 'assignedTo', assignedTo);
    }
    
    return await this.db.getAll('tasks');
  }

  // Time tracking offline
  async logTimeOffline(timeEntry: any): Promise<string> {
    const actionId = await this.queueAction({
      type: 'CREATE',
      entity: 'timeEntry',
      data: timeEntry
    });

    // Also store locally for immediate UI update
    if (this.db) {
      const entry = {
        ...timeEntry,
        id: timeEntry.id || uuidv4(),
        offline: true,
        synced: false
      };
      
      await this.db.put('timeEntries', entry);
    }

    return actionId;
  }

  // Get offline time entries
  async getOfflineTimeEntries(userId: string, date?: string): Promise<any[]> {
    if (!this.db) return [];

    let entries = await this.db.getAllFromIndex('timeEntries', 'userId', userId);
    
    if (date) {
      entries = entries.filter(entry => 
        entry.date && entry.date.startsWith(date)
      );
    }

    return entries;
  }

  // Store photos/documents offline
  async storeMediaOffline(file: File, metadata: any): Promise<string> {
    if (!this.db) return '';

    const mediaId = uuidv4();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const mediaEntry = {
            id: mediaId,
            ...metadata,
            filename: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: reader.result, // Base64 data
            timestamp: new Date(),
            offline: true,
            synced: false
          };

          await this.db!.put('media', mediaEntry);

          // Queue for upload when online
          await this.queueAction({
            type: 'CREATE',
            entity: 'media',
            data: mediaEntry
          });

          resolve(mediaId);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Get offline media
  async getOfflineMedia(projectId?: string, taskId?: string): Promise<any[]> {
    if (!this.db) return [];

    let media: any[] = [];

    if (projectId) {
      media = await this.db.getAllFromIndex('media', 'projectId', projectId);
    } else if (taskId) {
      media = await this.db.getAllFromIndex('media', 'taskId', taskId);
    } else {
      media = await this.db.getAll('media');
    }

    return media.filter(item => !item.synced);
  }

  // Sync offline actions to server
  private async syncOfflineActions(): Promise<void> {
    if (!this.db || this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    console.log('🔄 Starting offline sync...');

    try {
      const actions = await this.db.getAll('offlineActions');
      let syncedCount = 0;
      let failedCount = 0;

      for (const action of actions) {
        try {
          await this.executeAction(action);
          await this.db.delete('offlineActions', action.id);
          syncedCount++;
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          action.retryCount++;
          
          if (action.retryCount >= action.maxRetries) {
            // Max retries reached, remove from queue
            await this.db.delete('offlineActions', action.id);
            console.error(`Action ${action.id} reached max retries, removing from queue`);
            failedCount++;
          } else {
            // Update retry count
            await this.db.put('offlineActions', action);
          }
        }
      }

      console.log(`✅ Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      
      // Emit sync completion event
      window.dispatchEvent(new CustomEvent('syncCompleted', {
        detail: { syncedCount, failedCount }
      }));
      
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    switch (action.entity) {
      case 'task':
        await this.syncTask(action);
        break;
      case 'timeEntry':
        await this.syncTimeEntry(action);
        break;
      case 'expense':
        await this.syncExpense(action);
        break;
      case 'media':
        await this.syncMedia(action);
        break;
      case 'project':
        await this.syncProject(action);
        break;
      default:
        console.warn(`Unknown entity type: ${action.entity}`);
    }
  }

  private async syncTask(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await api.post('/tasks', action.data);
        break;
      case 'UPDATE':
        await api.put(`/tasks/${action.entityId}`, action.data);
        break;
      case 'DELETE':
        await api.delete(`/tasks/${action.entityId}`);
        break;
    }
  }

  private async syncTimeEntry(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        const response = await api.post('/time-entries', action.data);
        
        // Update local entry with server ID
        if (this.db && response.data?.id) {
          const localEntry = await this.db.get('timeEntries', action.data.id);
          if (localEntry) {
            localEntry.id = response.data.id;
            localEntry.synced = true;
            localEntry.offline = false;
            await this.db.put('timeEntries', localEntry);
          }
        }
        break;
      case 'UPDATE':
        await api.put(`/time-entries/${action.entityId}`, action.data);
        break;
      case 'DELETE':
        await api.delete(`/time-entries/${action.entityId}`);
        break;
    }
  }

  private async syncExpense(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        await api.post('/budget/expenses', action.data);
        break;
      case 'UPDATE':
        await api.put(`/budget/expenses/${action.entityId}`, action.data);
        break;
    }
  }

  private async syncMedia(action: OfflineAction): Promise<void> {
    if (action.type === 'CREATE') {
      const mediaData = action.data;
      
      // Convert base64 back to file for upload
      const response = await fetch(mediaData.fileData);
      const blob = await response.blob();
      const file = new File([blob], mediaData.filename, { type: mediaData.fileType });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', mediaData.project_id);
      if (mediaData.task_id) {
        formData.append('task_id', mediaData.task_id);
      }
      formData.append('title', mediaData.title || mediaData.filename);
      formData.append('category', mediaData.category || 'photo');

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Mark as synced in local storage
      if (this.db) {
        const localMedia = await this.db.get('media', mediaData.id);
        if (localMedia) {
          localMedia.synced = true;
          localMedia.offline = false;
          await this.db.put('media', localMedia);
        }
      }
    }
  }

  private async syncProject(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'UPDATE':
        await api.put(`/projects/${action.entityId}`, action.data);
        break;
    }
  }

  // Utility methods
  async clearExpiredCache(): Promise<void> {
    if (!this.db) return;

    const now = new Date();
    const tx = this.db.transaction('cache', 'readwrite');
    const index = tx.store.index('expiry');
    
    const expiredEntries = await index.getAll(IDBKeyRange.upperBound(now));
    
    for (const entry of expiredEntries) {
      await tx.store.delete(entry.key);
    }
    
    await tx.done;
    console.log(`🧹 Cleared ${expiredEntries.length} expired cache entries`);
  }

  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? (estimate.usage! / estimate.quota) * 100 : 0
      };
    }
    
    return { used: 0, quota: 0, percentage: 0 };
  }

  // Check connection status
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Get pending actions count
  async getPendingActionsCount(): Promise<number> {
    if (!this.db) return 0;
    return (await this.db.getAll('offlineActions')).length;
  }

  // Force sync
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncOfflineActions();
    }
  }

  // Clear all offline data (for logout)
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const stores = ['offlineActions', 'cache', 'userData', 'projects', 'tasks', 'timeEntries', 'media'];
    const tx = this.db.transaction(stores, 'readwrite');
    
    await Promise.all(stores.map(store => tx.objectStore(store).clear()));
    await tx.done;
    
    console.log('🧹 Cleared all offline data');
  }
}

// Create singleton instance
export const offlineService = new OfflineService();

// Service Worker registration for background sync - Temporarily disabled
// TODO: Re-enable once all assets are properly configured
if (false && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);

      // Listen for sync events
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC') {
          offlineService.forcSync();
        }
      });
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  });
}