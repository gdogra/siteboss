// Enhanced types for advanced features

export interface ProjectPrediction {
  id: string;
  project_id: string;
  prediction_type: 'delay' | 'cost_overrun' | 'completion_date' | 'risk_score';
  predicted_value: number;
  predicted_date?: Date | null;
  confidence_score: number; // 0-100
  factors: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface RiskAssessment {
  id: string;
  project_id: string;
  risk_category: 'weather' | 'supply_chain' | 'labor' | 'technical' | 'budget' | 'schedule' | 'resource';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  probability: number; // 0-100
  impact_score: number; // 0-100
  mitigation_plan?: string;
  assigned_to?: string | null;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  created_at: Date;
  updated_at: Date;
}

export interface WeatherData {
  id: string;
  job_site_id: string;
  date: Date;
  temperature_high?: number;
  temperature_low?: number;
  precipitation_chance?: number;
  wind_speed?: number;
  conditions?: string;
  work_suitability_score?: number;
  created_at: Date;
}

export interface EquipmentSensor {
  id: string;
  resource_id: string;
  sensor_type: 'gps' | 'fuel' | 'temperature' | 'vibration' | 'hours';
  sensor_id: string;
  last_reading?: any;
  last_reading_time?: Date;
  battery_level?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EquipmentTelemetry {
  id: string;
  sensor_id: string;
  reading_data: any;
  reading_time: Date;
  created_at: Date;
}

export interface MaintenanceSchedule {
  id: string;
  resource_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive';
  schedule_type: 'hours' | 'date' | 'condition';
  interval_value?: number;
  next_maintenance_date?: Date;
  next_maintenance_hours?: number;
  description?: string;
  assigned_technician?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  created_at: Date;
  updated_at: Date;
}

export interface BIMModel {
  id: string;
  project_id: string;
  model_name: string;
  file_path: string;
  file_size?: number;
  model_version?: string;
  model_type: 'architectural' | 'structural' | 'mep' | 'civil';
  uploaded_by?: string;
  is_current: boolean;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface BIMElement {
  id: string;
  bim_model_id: string;
  element_id: string;
  element_type?: string;
  element_properties?: any;
  location_data?: any;
  material_info?: any;
  quantity_takeoff?: number;
  unit_of_measure?: string;
  created_at: Date;
}

export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';

export interface TaskDependency {
  id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: DependencyType;
  lag_days: number;
  created_at: Date;
}

export interface ProjectTemplate {
  id: string;
  company_id: string;
  template_name: string;
  project_type?: string;
  template_data: any;
  created_by?: string;
  is_public: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface GanttConfiguration {
  id: string;
  project_id: string;
  user_id?: string;
  view_settings?: any;
  custom_fields?: any;
  created_at: Date;
  updated_at: Date;
}

export interface QualityChecklist {
  id: string;
  project_id: string;
  task_id?: string;
  checklist_name: string;
  checklist_type: 'safety' | 'quality' | 'completion' | 'inspection';
  checklist_template: any;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QualityInspection {
  id: string;
  checklist_id: string;
  inspector_id?: string;
  inspection_date: Date;
  inspection_results?: any;
  overall_score?: number;
  pass_fail_status: 'pass' | 'fail' | 'conditional';
  notes?: string;
  photos?: any;
  corrective_actions?: string;
  reinspection_required: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SafetyChecklist {
  id: string;
  project_id: string;
  checklist_name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  checklist_items: any;
  mandatory: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SafetyInspection {
  id: string;
  safety_checklist_id: string;
  inspector_id?: string;
  inspection_date: Date;
  inspection_results?: any;
  hazards_identified?: string[];
  corrective_actions_required: boolean;
  corrective_actions?: string;
  follow_up_required: boolean;
  follow_up_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MaterialCategory {
  id: string;
  company_id: string;
  category_name: string;
  parent_category_id?: string;
  unit_of_measure?: string;
  created_at: Date;
}

export interface Material {
  id: string;
  company_id: string;
  category_id?: string;
  material_name: string;
  sku?: string;
  description?: string;
  unit_cost?: number;
  unit_of_measure?: string;
  supplier_info?: any;
  environmental_data?: any;
  created_at: Date;
  updated_at: Date;
}

export interface MaterialInventory {
  id: string;
  material_id: string;
  job_site_id?: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  reorder_level: number;
  last_updated: Date;
}

export interface MaterialOrder {
  id: string;
  project_id: string;
  supplier_name?: string;
  order_number?: string;
  order_date: Date;
  expected_delivery_date?: Date;
  actual_delivery_date?: Date;
  order_status: 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  total_amount?: number;
  ordered_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MaterialOrderItem {
  id: string;
  order_id: string;
  material_id?: string;
  quantity_ordered: number;
  unit_cost?: number;
  total_cost?: number;
  created_at: Date;
}

export interface CarbonTracking {
  id: string;
  project_id: string;
  tracking_date: Date;
  emission_source: string;
  emission_type: 'scope1' | 'scope2' | 'scope3';
  co2_equivalent: number;
  calculation_method?: string;
  source_data?: any;
  created_by?: string;
  created_at: Date;
}

export interface WasteTracking {
  id: string;
  project_id: string;
  waste_date: Date;
  waste_type: string;
  material?: string;
  quantity: number;
  unit_of_measure?: string;
  disposal_method: string;
  disposal_cost?: number;
  disposal_location?: string;
  created_by?: string;
  created_at: Date;
}

export interface IntegrationConfiguration {
  id: string;
  company_id: string;
  integration_type: string;
  integration_name?: string;
  configuration_data: any;
  is_active: boolean;
  last_sync?: Date;
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IntegrationSyncLog {
  id: string;
  integration_id: string;
  sync_type: 'full' | 'incremental' | 'manual';
  sync_status: 'started' | 'completed' | 'failed' | 'partial';
  records_processed?: number;
  errors_encountered?: number;
  sync_details?: any;
  started_at?: Date;
  completed_at?: Date;
}

export interface TenantConfiguration {
  id: string;
  company_id: string;
  tenant_type: 'standard' | 'enterprise' | 'white_label';
  branding_config?: any;
  feature_flags?: any;
  custom_fields?: any;
  api_limits?: any;
  billing_config?: any;
  support_config?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CustomReport {
  id: string;
  company_id: string;
  report_name: string;
  report_type: string;
  report_config: any;
  schedule_config?: any;
  created_by?: string;
  is_public: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ReportGeneration {
  id: string;
  report_id: string;
  generated_by?: string;
  generation_parameters?: any;
  file_path?: string;
  file_format: 'pdf' | 'excel' | 'csv';
  generation_status: 'queued' | 'processing' | 'completed' | 'failed';
  generated_at?: Date;
  expires_at?: Date;
}

export interface SystemMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  dimensions?: any;
  timestamp: Date;
}

// Advanced Analytics Types
export interface ProjectHealthMetrics {
  project_id: string;
  project_name: string;
  budget_utilization: number;
  schedule_performance: number;
  quality_score: number;
  safety_score: number;
  team_productivity: number;
  overall_health: number;
  alerts: string[];
}

export interface PredictiveInsight {
  id: string;
  insight_type: 'delay_warning' | 'budget_alert' | 'quality_issue' | 'safety_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommended_actions: string[];
  estimated_impact: number;
  confidence_level: number;
  expires_at?: Date;
}

export interface WeatherForecast {
  date: Date;
  temperature_high: number;
  temperature_low: number;
  precipitation_chance: number;
  wind_speed: number;
  conditions: string;
  work_impact: 'none' | 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Equipment IoT Types
export interface EquipmentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  geofence_status: 'inside' | 'outside' | 'unknown';
}

export interface EquipmentMetrics {
  fuel_level?: number;
  engine_hours?: number;
  temperature?: number;
  pressure?: number;
  vibration_level?: number;
  battery_voltage?: number;
  error_codes?: string[];
}

export interface MaintenanceAlert {
  id: string;
  resource_id: string;
  alert_type: 'scheduled' | 'predictive' | 'emergency';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommended_action: string;
  created_at: Date;
  acknowledged: boolean;
  acknowledged_by?: string;
  resolved: boolean;
  resolved_at?: Date;
}

// Integration Types
export interface QuickBooksConfig {
  client_id: string;
  client_secret: string;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  sync_customers: boolean;
  sync_vendors: boolean;
  sync_expenses: boolean;
  sync_invoices: boolean;
}

export interface SalesforceConfig {
  instance_url: string;
  access_token: string;
  refresh_token: string;
  sync_accounts: boolean;
  sync_opportunities: boolean;
  sync_contacts: boolean;
  lead_mapping: any;
}

export interface SlackConfig {
  bot_token: string;
  signing_secret: string;
  default_channel: string;
  notification_types: string[];
  user_mapping: any;
}

// Mobile App Types
export interface MobileSession {
  id: string;
  user_id: string;
  device_id: string;
  device_type: 'ios' | 'android';
  app_version: string;
  last_sync: Date;
  offline_data?: any;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
}

export interface OfflineAction {
  id: string;
  session_id: string;
  action_type: string;
  action_data: any;
  timestamp: Date;
  synced: boolean;
  sync_error?: string;
}

// Voice and AR Types
export interface VoiceNote {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  audio_file_path: string;
  transcription?: string;
  transcription_confidence?: number;
  duration_seconds: number;
  created_at: Date;
}

export interface ARSession {
  id: string;
  user_id: string;
  project_id: string;
  session_type: 'progress_tracking' | 'quality_inspection' | 'measurements';
  ar_data: any;
  captured_media: string[];
  measurements?: any;
  annotations?: any;
  created_at: Date;
}