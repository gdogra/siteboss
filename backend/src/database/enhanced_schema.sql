-- Enhanced SiteBoss Schema with Advanced Features

-- AI & Analytics Tables
CREATE TABLE project_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  prediction_type VARCHAR(50) NOT NULL, -- 'delay', 'cost_overrun', 'completion_date', 'risk_score'
  predicted_value DECIMAL(15,2),
  predicted_date DATE,
  confidence_score DECIMAL(5,2), -- 0.00 to 100.00
  factors JSONB, -- Contributing factors
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  risk_category VARCHAR(100) NOT NULL, -- 'weather', 'supply_chain', 'labor', 'technical'
  risk_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  probability DECIMAL(5,2), -- 0.00 to 100.00
  impact_score DECIMAL(5,2), -- 0.00 to 100.00
  mitigation_plan TEXT,
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'identified', -- 'identified', 'mitigating', 'resolved', 'accepted'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather Integration
CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_site_id UUID REFERENCES job_sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  temperature_high DECIMAL(5,2),
  temperature_low DECIMAL(5,2),
  precipitation_chance DECIMAL(5,2),
  wind_speed DECIMAL(5,2),
  conditions VARCHAR(100), -- 'sunny', 'rainy', 'cloudy', 'stormy'
  work_suitability_score DECIMAL(5,2), -- 0.00 to 100.00
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IoT Equipment Tracking
CREATE TABLE equipment_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  sensor_type VARCHAR(50) NOT NULL, -- 'gps', 'fuel', 'temperature', 'vibration', 'hours'
  sensor_id VARCHAR(100) UNIQUE NOT NULL,
  last_reading JSONB,
  last_reading_time TIMESTAMP,
  battery_level DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES equipment_sensors(id) ON DELETE CASCADE,
  reading_data JSONB NOT NULL,
  reading_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(100) NOT NULL, -- 'preventive', 'corrective', 'predictive'
  schedule_type VARCHAR(50) NOT NULL, -- 'hours', 'date', 'condition'
  interval_value INTEGER, -- hours or days
  next_maintenance_date DATE,
  next_maintenance_hours INTEGER,
  description TEXT,
  assigned_technician UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'overdue'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BIM Integration
CREATE TABLE bim_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  model_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  model_version VARCHAR(50),
  model_type VARCHAR(50), -- 'architectural', 'structural', 'mep', 'civil'
  uploaded_by UUID REFERENCES users(id),
  is_current BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bim_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bim_model_id UUID REFERENCES bim_models(id) ON DELETE CASCADE,
  element_id VARCHAR(255) NOT NULL,
  element_type VARCHAR(100), -- 'wall', 'door', 'window', 'beam', 'column'
  element_properties JSONB,
  location_data JSONB, -- 3D coordinates
  material_info JSONB,
  quantity_takeoff DECIMAL(15,4),
  unit_of_measure VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advanced Project Management
CREATE TYPE dependency_type AS ENUM ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish');

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predecessor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  successor_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type dependency_type DEFAULT 'finish_to_start',
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(100), -- 'residential', 'commercial', 'industrial', 'renovation'
  template_data JSONB NOT NULL, -- JSON structure of phases, tasks, etc.
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gantt_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  view_settings JSONB, -- Zoom level, date range, visible columns
  custom_fields JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Control & Inspections
CREATE TABLE quality_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id),
  checklist_name VARCHAR(255) NOT NULL,
  checklist_type VARCHAR(100), -- 'safety', 'quality', 'completion', 'inspection'
  checklist_template JSONB, -- Questions and criteria
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES quality_checklists(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES users(id),
  inspection_date TIMESTAMP NOT NULL,
  inspection_results JSONB, -- Answers and scores
  overall_score DECIMAL(5,2),
  pass_fail_status VARCHAR(20), -- 'pass', 'fail', 'conditional'
  notes TEXT,
  photos JSONB, -- Array of photo URLs
  corrective_actions TEXT,
  reinspection_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Safety Management
CREATE TABLE safety_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  checklist_name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'as_needed'
  checklist_items JSONB NOT NULL,
  mandatory BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE safety_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_checklist_id UUID REFERENCES safety_checklists(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES users(id),
  inspection_date TIMESTAMP NOT NULL,
  inspection_results JSONB,
  hazards_identified TEXT[],
  corrective_actions_required BOOLEAN DEFAULT false,
  corrective_actions TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material Tracking & Inventory
CREATE TABLE material_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_name VARCHAR(255) NOT NULL,
  parent_category_id UUID REFERENCES material_categories(id),
  unit_of_measure VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES material_categories(id),
  material_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  unit_cost DECIMAL(15,2),
  unit_of_measure VARCHAR(50),
  supplier_info JSONB,
  environmental_data JSONB, -- Carbon footprint, recycled content, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  job_site_id UUID REFERENCES job_sites(id),
  quantity_on_hand DECIMAL(15,4),
  quantity_reserved DECIMAL(15,4),
  reorder_level DECIMAL(15,4),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  supplier_name VARCHAR(255),
  order_number VARCHAR(100),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  order_status VARCHAR(50) DEFAULT 'ordered', -- 'ordered', 'shipped', 'delivered', 'cancelled'
  total_amount DECIMAL(15,2),
  ordered_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES material_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  quantity_ordered DECIMAL(15,4),
  unit_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sustainability & ESG Tracking
CREATE TABLE carbon_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL,
  emission_source VARCHAR(100), -- 'materials', 'transport', 'equipment', 'energy'
  emission_type VARCHAR(50), -- 'scope1', 'scope2', 'scope3'
  co2_equivalent DECIMAL(15,4), -- kg CO2
  calculation_method VARCHAR(100),
  source_data JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE waste_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  waste_date DATE NOT NULL,
  waste_type VARCHAR(100), -- 'construction', 'demolition', 'hazardous', 'recyclable'
  material VARCHAR(255),
  quantity DECIMAL(15,4),
  unit_of_measure VARCHAR(50),
  disposal_method VARCHAR(100), -- 'landfill', 'recycle', 'reuse', 'incinerate'
  disposal_cost DECIMAL(15,2),
  disposal_location VARCHAR(255),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration Management
CREATE TABLE integration_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  integration_type VARCHAR(100) NOT NULL, -- 'quickbooks', 'salesforce', 'procore', 'slack'
  integration_name VARCHAR(255),
  configuration_data JSONB NOT NULL, -- API keys, settings, mappings
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  sync_frequency VARCHAR(50), -- 'real_time', 'hourly', 'daily', 'manual'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integration_configurations(id) ON DELETE CASCADE,
  sync_type VARCHAR(50), -- 'full', 'incremental', 'manual'
  sync_status VARCHAR(50), -- 'started', 'completed', 'failed', 'partial'
  records_processed INTEGER,
  errors_encountered INTEGER,
  sync_details JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Multi-tenant & White-label
CREATE TABLE tenant_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tenant_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'enterprise', 'white_label'
  branding_config JSONB, -- Logo, colors, domain
  feature_flags JSONB, -- Enabled/disabled features
  custom_fields JSONB, -- Company-specific fields
  api_limits JSONB, -- Rate limits, quotas
  billing_config JSONB,
  support_config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advanced Reporting
CREATE TABLE custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(100), -- 'project', 'financial', 'resource', 'safety', 'custom'
  report_config JSONB NOT NULL, -- Columns, filters, grouping
  schedule_config JSONB, -- Auto-generation schedule
  created_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES users(id),
  generation_parameters JSONB,
  file_path TEXT,
  file_format VARCHAR(20), -- 'pdf', 'excel', 'csv'
  generation_status VARCHAR(50), -- 'queued', 'processing', 'completed', 'failed'
  generated_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Performance Monitoring
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100), -- 'api_response_time', 'database_query_time', 'user_activity'
  metric_name VARCHAR(255),
  metric_value DECIMAL(15,4),
  metric_unit VARCHAR(50),
  dimensions JSONB, -- Additional context
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Indexes for Performance
CREATE INDEX idx_project_predictions_project_type ON project_predictions(project_id, prediction_type);
CREATE INDEX idx_equipment_telemetry_sensor_time ON equipment_telemetry(sensor_id, reading_time);
CREATE INDEX idx_risk_assessments_level_status ON risk_assessments(risk_level, status);
CREATE INDEX idx_weather_data_site_date ON weather_data(job_site_id, date);
CREATE INDEX idx_material_inventory_material_site ON material_inventory(material_id, job_site_id);
CREATE INDEX idx_carbon_tracking_project_date ON carbon_tracking(project_id, tracking_date);
CREATE INDEX idx_integration_sync_logs_status ON integration_sync_logs(integration_id, sync_status);
CREATE INDEX idx_system_metrics_type_timestamp ON system_metrics(metric_type, timestamp);

-- Views for Common Queries
CREATE VIEW project_health_dashboard AS
SELECT 
  p.id,
  p.name,
  p.status,
  p.total_budget,
  COALESCE(SUM(e.amount), 0) as spent_amount,
  ((COALESCE(SUM(e.amount), 0) / NULLIF(p.total_budget, 0)) * 100) as budget_utilization,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
  (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / NULLIF(COUNT(DISTINCT t.id), 0) * 100) as completion_percentage,
  AVG(ra.impact_score) as avg_risk_score,
  COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN t.id END) as overdue_tasks
FROM projects p
LEFT JOIN expenses e ON p.id = e.project_id AND e.is_approved = true
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN risk_assessments ra ON p.id = ra.project_id AND ra.status != 'resolved'
GROUP BY p.id, p.name, p.status, p.total_budget;

CREATE VIEW equipment_utilization AS
SELECT 
  r.id,
  r.name,
  r.type,
  COUNT(ra.id) as assignments_count,
  COALESCE(SUM(ra.hours_actual), 0) as total_hours_used,
  COALESCE(AVG(ra.hours_actual), 0) as avg_hours_per_assignment,
  r.hourly_rate,
  (COALESCE(SUM(ra.hours_actual), 0) * r.hourly_rate) as total_revenue_generated
FROM resources r
LEFT JOIN resource_assignments ra ON r.id = ra.resource_id
GROUP BY r.id, r.name, r.type, r.hourly_rate;