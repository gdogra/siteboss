export type UserRole = 'super_admin' | 'company_admin' | 'project_manager' | 'foreman' | 'worker' | 'client';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  company_id: string;
  avatar_url?: string;
  last_login?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
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
  project_manager_name?: string;
  client_name?: string;
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
  assigned_user_name?: string;
  project_name?: string;
  phase_name?: string;
}

export interface BudgetCategory {
  id: string;
  project_id: string;
  name: string;
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  actual_spent?: number;
  expense_count?: number;
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
  budget_category_name?: string;
  user_name?: string;
  project_name?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
  company_name: string;
}