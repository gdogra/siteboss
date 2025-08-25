export type UserRole = 'super_admin' | 'company_admin' | 'project_manager' | 'foreman' | 'worker' | 'client';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type CostCategory = 'labor' | 'materials' | 'equipment' | 'permits' | 'subcontractor' | 'overhead' | 'other';

export type ResourceType = 'equipment' | 'vehicle' | 'tool' | 'material';

export type DocumentCategory = 'contract' | 'permit' | 'drawing' | 'specification' | 'photo' | 'invoice' | 'report' | 'other';

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  company_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  company_id: string;
  client_id?: string;
  project_manager_id?: string;
  name: string;
  description?: string;
  address: string;
  start_date?: Date;
  end_date?: Date;
  estimated_duration?: number;
  status: ProjectStatus;
  total_budget?: number;
  contract_value?: number;
  profit_margin?: number;
  created_at: Date;
  updated_at: Date;
}

export interface JobSite {
  id: string;
  project_id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  site_supervisor_id?: string;
  safety_requirements?: string;
  access_instructions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  project_id: string;
  phase_id?: string;
  parent_task_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  start_date?: Date;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  status: TaskStatus;
  priority: TaskPriority;
  completion_percentage: number;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BudgetCategory {
  id: string;
  project_id: string;
  name: string;
  category: CostCategory;
  budgeted_amount: number;
  actual_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string;
  project_id: string;
  budget_category_id?: string;
  user_id?: string;
  vendor_name?: string;
  description: string;
  amount: number;
  expense_date: Date;
  receipt_url?: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Resource {
  id: string;
  company_id: string;
  name: string;
  type: ResourceType;
  model?: string;
  serial_number?: string;
  purchase_date?: Date;
  purchase_cost?: number;
  hourly_rate?: number;
  maintenance_schedule?: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subcontractor {
  id: string;
  company_id: string;
  business_name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  license_number?: string;
  specialty?: string;
  hourly_rate?: number;
  rating?: number;
  insurance_expires?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  project_id: string;
  task_id?: string;
  uploaded_by?: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  version: number;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  user_id?: string;
  title?: string;
  content: string;
  update_type: string;
  is_public: boolean;
  attachments?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  start_time: Date;
  end_time?: Date;
  hours_worked?: number;
  description?: string;
  hourly_rate?: number;
  overtime_hours: number;
  is_approved: boolean;
  approved_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  userId: string;
  companyId: string;
  role: UserRole;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  company_name: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  address: string;
  start_date?: Date;
  end_date?: Date;
  estimated_duration?: number;
  total_budget?: number;
  contract_value?: number;
  client_id?: string;
  project_manager_id?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  project_id: string;
  phase_id?: string;
  parent_task_id?: string;
  assigned_to?: string;
  start_date?: Date;
  due_date?: Date;
  estimated_hours?: number;
  priority: TaskPriority;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}