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
  parent_project_id?: string; // For project hierarchies
  template_id?: string; // For project templates
  name: string;
  description?: string;
  address: string;
  start_date?: Date;
  end_date?: Date;
  estimated_duration?: number;
  actual_duration?: number;
  status: ProjectStatus;
  priority: TaskPriority;
  total_budget?: number;
  contract_value?: number;
  profit_margin?: number;
  completion_percentage: number;
  project_type: string; // 'residential', 'commercial', 'industrial'
  sq_footage?: number;
  cost_per_sqft?: number;
  weather_delays?: number; // days
  change_orders_count: number;
  change_orders_value: number;
  // GPS coordinates for mobile apps
  latitude?: number;
  longitude?: number;
  // Project settings
  auto_schedule: boolean;
  send_notifications: boolean;
  allow_overtime: boolean;
  require_photos: boolean;
  // Financial tracking
  labor_budget?: number;
  material_budget?: number;
  equipment_budget?: number;
  subcontractor_budget?: number;
  overhead_budget?: number;
  // Actual costs
  labor_actual?: number;
  material_actual?: number;
  equipment_actual?: number;
  subcontractor_actual?: number;
  overhead_actual?: number;
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
  // Enhanced task features for Procore competition
  dependencies?: string[]; // Array of task IDs this task depends on
  location?: string; // Specific location on job site
  cost_code?: string; // For budget tracking
  weather_dependent: boolean;
  requires_inspection: boolean;
  inspection_passed?: boolean;
  inspector_notes?: string;
  safety_requirements?: string[];
  required_skills?: string[];
  equipment_needed?: string[];
  materials_needed?: string[];
  // Photo documentation
  before_photos?: string[];
  progress_photos?: string[];
  after_photos?: string[];
  // Time tracking
  time_entries_count: number;
  billable_hours: number;
  overtime_hours: number;
  // Quality control
  quality_score?: number;
  rework_required: boolean;
  rework_reason?: string;
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

// New Enterprise-Grade Interfaces

export interface ProjectTemplate {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  project_type: string;
  template_data: {
    phases: ProjectPhase[];
    task_templates: TaskTemplate[];
    budget_categories: BudgetTemplate[];
    milestones: MilestoneTemplate[];
  };
  estimated_duration: number;
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  phase_order: number;
  start_date?: Date;
  end_date?: Date;
  estimated_duration: number;
  actual_duration?: number;
  completion_percentage: number;
  dependencies?: string[]; // Other phase IDs
  is_critical_path: boolean;
  budget_allocation: number;
  actual_cost?: number;
  created_at: Date;
  updated_at: Date;
}

export interface TaskTemplate {
  id: string;
  template_id: string;
  title: string;
  description?: string;
  phase_name: string;
  estimated_hours: number;
  priority: TaskPriority;
  required_skills: string[];
  equipment_needed: string[];
  materials_needed: string[];
  safety_requirements: string[];
  cost_code?: string;
  order_index: number;
}

export interface BudgetTemplate {
  id: string;
  template_id: string;
  category: CostCategory;
  name: string;
  percentage_of_total: number;
  cost_per_sqft?: number;
  is_variable: boolean;
}

export interface MilestoneTemplate {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  phase_percentage: number; // % through project when this milestone occurs
  payment_percentage?: number; // % of contract value due at milestone
  requirements: string[];
}

export interface CostCode {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description?: string;
  category: CostCategory;
  standard_rate?: number;
  markup_percentage?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChangeOrder {
  id: string;
  project_id: string;
  co_number: string;
  title: string;
  description: string;
  reason: string;
  requested_by: string;
  approved_by?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'implemented';
  original_amount: number;
  new_amount: number;
  impact_amount: number; // new_amount - original_amount
  time_impact_days?: number;
  justification: string;
  client_approval_required: boolean;
  client_approved?: boolean;
  client_approved_at?: Date;
  attachments?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface DailyReport {
  id: string;
  project_id: string;
  created_by: string;
  report_date: Date;
  weather_conditions: string;
  temperature_high?: number;
  temperature_low?: number;
  work_performed: string;
  crew_count: number;
  subcontractors_present: string[];
  equipment_on_site: string[];
  materials_delivered: string[];
  safety_incidents: number;
  quality_issues: number;
  delays_encountered?: string;
  work_planned_tomorrow: string;
  photos: string[];
  visitor_log?: {name: string, company: string, purpose: string}[];
  created_at: Date;
  updated_at: Date;
}

export interface RFI {
  id: string;
  project_id: string;
  rfi_number: string;
  submitted_by: string;
  assigned_to: string;
  title: string;
  question: string;
  drawing_reference?: string;
  specification_reference?: string;
  priority: TaskPriority;
  status: 'open' | 'answered' | 'closed' | 'cancelled';
  due_date?: Date;
  response?: string;
  responded_by?: string;
  responded_at?: Date;
  attachments: string[];
  created_at: Date;
  updated_at: Date;
}

export interface PunchListItem {
  id: string;
  project_id: string;
  task_id?: string;
  created_by: string;
  assigned_to?: string;
  title: string;
  description: string;
  location: string;
  priority: TaskPriority;
  status: 'open' | 'in_progress' | 'ready_for_review' | 'closed' | 'rejected';
  due_date?: Date;
  category: 'quality' | 'safety' | 'cleanup' | 'deficiency' | 'incomplete';
  trade: string; // electrical, plumbing, etc.
  cost_to_fix?: number;
  photos: string[];
  completed_by?: string;
  completed_at?: Date;
  verified_by?: string;
  verified_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  target_date: Date;
  actual_date?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  payment_due?: number;
  payment_received?: number;
  completion_requirements: string[];
  dependencies?: string[]; // Other milestone IDs
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Enhanced request interfaces
export interface CreateProjectRequest {
  name: string;
  description?: string;
  address: string;
  project_type: string;
  start_date?: Date;
  end_date?: Date;
  estimated_duration?: number;
  total_budget?: number;
  contract_value?: number;
  client_id?: string;
  project_manager_id?: string;
  template_id?: string;
  parent_project_id?: string;
  sq_footage?: number;
  latitude?: number;
  longitude?: number;
  priority: TaskPriority;
  auto_schedule?: boolean;
  send_notifications?: boolean;
  allow_overtime?: boolean;
  require_photos?: boolean;
}