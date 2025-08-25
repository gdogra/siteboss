import axios from 'axios';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('siteboss_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
  getProjects: (params?: any): Promise<ApiResponse> =>
    api.get('/projects', { params }).then(res => res.data),
    
  getProject: (id: string): Promise<ApiResponse> =>
    api.get(`/projects/${id}`).then(res => res.data),
    
  createProject: (projectData: any): Promise<ApiResponse> =>
    api.post('/projects', projectData).then(res => res.data),
    
  updateProject: (id: string, updates: any): Promise<ApiResponse> =>
    api.put(`/projects/${id}`, updates).then(res => res.data),
    
  deleteProject: (id: string): Promise<ApiResponse> =>
    api.delete(`/projects/${id}`).then(res => res.data),
    
  getProjectStats: (): Promise<ApiResponse> =>
    api.get('/projects/stats').then(res => res.data),
    
  getMyProjects: (): Promise<ApiResponse> =>
    api.get('/projects/my-projects').then(res => res.data),
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