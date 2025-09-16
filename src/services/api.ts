import axios from 'axios';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
try {
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : '';
  // On Netlify or any non-localhost host, default to site-relative /api
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    API_BASE_URL = '/api';
  }
} catch {}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility: allow frontend-only mode without backend
const isApiDisabled = (): boolean => {
  try {
    if ((import.meta as any).env?.VITE_DISABLE_API === 'true') return true;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('siteboss_disable_api') === 'true') return true;
  } catch {}
  return false;
};

const markApiDisabled = (reason?: string) => {
  try {
    localStorage.setItem('siteboss_disable_api', 'true');
    if (reason) console.warn('[API] Disabling API due to network error:', reason);
  } catch {}
};

const isConnRefused = (err: any): boolean => {
  const msg = String(err?.message || err || '');
  return msg.includes('ERR_CONNECTION_REFUSED') || msg.includes('Network Error');
};

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('siteboss_token');
  // Dev fallback: if user is present but token missing, use demo-token
  if (!token) {
    const u = localStorage.getItem('siteboss_user');
    if (u) {
      token = 'demo-token';
      localStorage.setItem('siteboss_token', token);
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (token === 'demo-token') {
      try {
        const u = localStorage.getItem('siteboss_user');
        if (u) {
          const user = JSON.parse(u);
          // Normalize role: some legacy/demo profiles use 'admin'
          const role = user.role === 'admin' ? 'company_admin' : user.role;
          if (!config.headers['X-User-Role'] && role) config.headers['X-User-Role'] = role;
          // Use valid UUIDs for demo data instead of string IDs
          const companyId = user.company_id === 'demo-company-1' ? '123e4567-e89b-12d3-a456-426614174000' : user.company_id;
          const userId = user.id === 'demo-user-1' ? '123e4567-e89b-12d3-a456-426614174001' : user.id;
          if (!config.headers['X-Company-Id'] && companyId) config.headers['X-Company-Id'] = companyId;
          if (!config.headers['X-User-Id'] && userId) config.headers['X-User-Id'] = userId;
          if (!config.headers['X-User-Email'] && user.email) config.headers['X-User-Email'] = user.email;
        }
      } catch {}
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.response && isConnRefused(error)) {
      markApiDisabled(error?.message);
    }
    const skipRedirect = error?.config?.headers?.['X-Skip-Auth-Redirect'] === 'true';
    if (error.response?.status === 401 && !skipRedirect) {
      localStorage.removeItem('siteboss_token');
      localStorage.removeItem('siteboss_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/login', credentials).then(res => res.data),
    
  register: (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/register', userData).then(res => res.data),
    
  getProfile: (): Promise<ApiResponse> =>
    api.get('/auth/profile').then(res => res.data),
    
  updateProfile: (updates: any): Promise<ApiResponse> =>
    api.put('/auth/profile', updates).then(res => res.data),
    
  logout: (): Promise<ApiResponse> =>
    api.post('/auth/logout').then(res => res.data),
};

export const projectApi = {
  getProjects: (params?: any): Promise<ApiResponse> => {
    if (isApiDisabled()) {
      try { console.info('[API] getProjects skipped (API disabled)'); } catch {}
      return Promise.resolve({ success: true, data: [] } as any);
    }
    return api
      .get('/projects', { params })
      .then(res => res.data)
      .catch(err => {
        if (isConnRefused(err)) {
          markApiDisabled(err?.message);
          return { success: true, data: [] } as any;
        }
        throw err;
      });
  },
    
  getProject: (id: string): Promise<ApiResponse> =>
    api.get(`/projects/${id}`, { headers: { 'X-Skip-Auth-Redirect': 'true' } }).then(res => res.data),
    
  createProject: (projectData: any): Promise<ApiResponse> =>
    api.post('/projects', projectData, { headers: { 'X-Skip-Auth-Redirect': 'true' } }).then(res => res.data),
    
  updateProject: (id: string, updates: any): Promise<ApiResponse> =>
    api.put(`/projects/${id}`, updates).then(res => res.data),
    
  deleteProject: (id: string): Promise<ApiResponse> =>
    api.delete(`/projects/${id}`).then(res => res.data),
    
  getProjectStats: (): Promise<ApiResponse> =>
    api.get('/projects/stats').then(res => res.data),
    
  getMyProjects: (): Promise<ApiResponse> =>
    api.get('/projects/my-projects').then(res => res.data),

  getProjectTeam: (projectId: string): Promise<ApiResponse> =>
    api.get(`/projects/${projectId}/team`).then(res => res.data),
  getProjectSites: (projectId: string): Promise<ApiResponse> =>
    api.get(`/projects/${projectId}/sites`).then(res => res.data),
  createProjectSite: (projectId: string, site: any): Promise<ApiResponse> =>
    api.post(`/projects/${projectId}/sites`, site).then(res => res.data),
  updateProjectSite: (projectId: string, siteId: string, site: any): Promise<ApiResponse> =>
    api.put(`/projects/${projectId}/sites/${siteId}`, site).then(res => res.data),
  deleteProjectSite: (projectId: string, siteId: string): Promise<ApiResponse> =>
    api.delete(`/projects/${projectId}/sites/${siteId}`).then(res => res.data),
};

export const taskApi = {
  getTasks: (projectId: string, params?: any): Promise<ApiResponse> =>
    api.get(`/tasks/project/${projectId}`, { params }).then(res => res.data),
    
  getTask: (id: string): Promise<ApiResponse> =>
    api.get(`/tasks/${id}`).then(res => res.data),
    
  createTask: (taskData: any): Promise<ApiResponse> =>
    api.post('/tasks', taskData).then(res => res.data),
    
  updateTask: (id: string, updates: any): Promise<ApiResponse> =>
    api.put(`/tasks/${id}`, updates).then(res => res.data),
    
  deleteTask: (id: string): Promise<ApiResponse> =>
    api.delete(`/tasks/${id}`).then(res => res.data),
    
  getMyTasks: (): Promise<ApiResponse> =>
    api.get('/tasks/my-tasks').then(res => res.data),
    
  getTaskStats: (projectId: string): Promise<ApiResponse> =>
    api.get(`/tasks/project/${projectId}/stats`).then(res => res.data),
    
  getOverdueTasks: (): Promise<ApiResponse> =>
    api.get('/tasks/overdue').then(res => res.data),
};

export const budgetApi = {
  getBudgetCategories: (projectId: string): Promise<ApiResponse> =>
    api.get(`/budget/project/${projectId}/categories`).then(res => res.data),
    
  createBudgetCategory: (projectId: string, categoryData: any): Promise<ApiResponse> =>
    api.post(`/budget/project/${projectId}/categories`, categoryData).then(res => res.data),
    
  updateBudgetCategory: (id: string, updates: any): Promise<ApiResponse> =>
    api.put(`/budget/categories/${id}`, updates).then(res => res.data),
    
  deleteBudgetCategory: (id: string): Promise<ApiResponse> =>
    api.delete(`/budget/categories/${id}`).then(res => res.data),
    
  getBudgetSummary: (projectId: string): Promise<ApiResponse> =>
    api.get(`/budget/project/${projectId}/summary`).then(res => res.data),
    
  getExpenses: (projectId: string): Promise<ApiResponse> =>
    api.get(`/budget/project/${projectId}/expenses`).then(res => res.data),
    
  createExpense: (expenseData: any): Promise<ApiResponse> =>
    api.post('/budget/expenses', expenseData).then(res => res.data),
    
  updateExpense: (id: string, updates: any): Promise<ApiResponse> =>
    api.put(`/budget/expenses/${id}`, updates).then(res => res.data),
    
  approveExpense: (id: string): Promise<ApiResponse> =>
    api.post(`/budget/expenses/${id}/approve`).then(res => res.data),
    
  rejectExpense: (id: string): Promise<ApiResponse> =>
    api.post(`/budget/expenses/${id}/reject`).then(res => res.data),
    
  getPendingExpenses: (): Promise<ApiResponse> =>
    api.get('/budget/expenses/pending').then(res => res.data),
    
  getMyExpenses: (): Promise<ApiResponse> =>
    api.get('/budget/expenses/my-expenses').then(res => res.data),
};

export const documentApi = {
  listByProject: (projectId: string): Promise<ApiResponse> =>
    api.get(`/documents/project/${projectId}`).then(res => res.data),
  get: (id: string): Promise<ApiResponse> =>
    api.get(`/documents/${id}`).then(res => res.data),
  downloadUrl: (id: string): string => `/api/documents/${id}/download`,
};

export const contractorApi = {
  getSubcontractors: (q?: string): Promise<ApiResponse> =>
    api.get('/subcontractors', { params: q ? { q } : undefined }).then(res => res.data),
  createSubcontractor: (payload: any): Promise<ApiResponse> =>
    api.post('/subcontractors', payload).then(res => res.data),
  assignToProject: (payload: {
    business_name?: string;
    subcontractor_id?: string;
    project_id?: string;
    project_name?: string;
    start_date?: string;
    end_date?: string;
    contract_amount?: number;
    work_description?: string;
    payment_terms?: string;
  }): Promise<ApiResponse> =>
    api.post('/subcontractors/assignments', payload).then(res => res.data),

  getAssignmentsByBusinessName: (business_name: string): Promise<ApiResponse> =>
    api.get('/subcontractors/assignments', { params: { business_name } }).then(res => res.data),
};

export const userApi = {
  getUsers: (q?: string): Promise<ApiResponse> =>
    api.get('/users', { params: q ? { q } : undefined }).then(res => res.data),
};

export const billingApi = {
  getSettings: (): Promise<ApiResponse> =>
    api.get('/billing/settings').then(res => res.data),
  updateSettings: (settings: any): Promise<ApiResponse> =>
    api.put('/billing/settings', settings).then(res => res.data),
};
