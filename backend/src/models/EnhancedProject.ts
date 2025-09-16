import pool from '../database/connection';
import { 
  Project, 
  CreateProjectRequest, 
  ProjectStatus, 
  ProjectTemplate, 
  ProjectPhase,
  ProjectMilestone,
  ChangeOrder,
  DailyReport 
} from '../types';

export class EnhancedProjectModel {
  // Enhanced project creation with templates
  static async createFromTemplate(
    companyId: string, 
    projectData: CreateProjectRequest & { template_id: string }
  ): Promise<Project> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get template data
      const templateQuery = `
        SELECT * FROM project_templates 
        WHERE id = $1 AND company_id = $2
      `;
      const template = await client.query(templateQuery, [projectData.template_id, companyId]);
      
      if (template.rows.length === 0) {
        throw new Error('Template not found');
      }
      
      const templateData = template.rows[0];
      
      // Create project with enhanced fields
      const projectQuery = `
        INSERT INTO projects (
          company_id, name, description, address, project_type, start_date, end_date,
          estimated_duration, total_budget, contract_value, client_id, project_manager_id,
          template_id, priority, completion_percentage, auto_schedule, send_notifications,
          allow_overtime, require_photos, sq_footage, latitude, longitude,
          change_orders_count, change_orders_value
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING *
      `;
      
      const values = [
        companyId,
        projectData.name,
        projectData.description,
        projectData.address,
        projectData.project_type,
        projectData.start_date,
        projectData.end_date,
        projectData.estimated_duration || templateData.estimated_duration,
        projectData.total_budget,
        projectData.contract_value,
        projectData.client_id,
        projectData.project_manager_id,
        projectData.template_id,
        projectData.priority || 'medium',
        0, // completion_percentage
        projectData.auto_schedule || true,
        projectData.send_notifications || true,
        projectData.allow_overtime || false,
        projectData.require_photos || true,
        projectData.sq_footage,
        projectData.latitude,
        projectData.longitude,
        0, // change_orders_count
        0  // change_orders_value
      ];
      
      const project = await client.query(projectQuery, values);
      const newProject = project.rows[0];
      
      // Create phases from template
      if (templateData.template_data?.phases) {
        for (const phase of templateData.template_data.phases) {
          await client.query(`
            INSERT INTO project_phases (
              project_id, name, description, phase_order, estimated_duration,
              completion_percentage, is_critical_path, budget_allocation
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            newProject.id, phase.name, phase.description, phase.phase_order,
            phase.estimated_duration, 0, phase.is_critical_path, phase.budget_allocation
          ]);
        }
      }
      
      // Create milestones from template
      if (templateData.template_data?.milestones) {
        for (const milestone of templateData.template_data.milestones) {
          const targetDate = new Date(projectData.start_date || new Date());
          targetDate.setDate(targetDate.getDate() + 
            Math.floor((projectData.estimated_duration || 30) * milestone.phase_percentage / 100)
          );
          
          await client.query(`
            INSERT INTO project_milestones (
              project_id, name, description, target_date, status, 
              payment_due, completion_requirements
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            newProject.id, milestone.name, milestone.description, targetDate,
            'not_started', 
            (projectData.contract_value || 0) * (milestone.payment_percentage || 0) / 100,
            milestone.requirements
          ]);
        }
      }
      
      // Update template usage count
      await client.query(
        'UPDATE project_templates SET usage_count = usage_count + 1 WHERE id = $1',
        [projectData.template_id]
      );
      
      await client.query('COMMIT');
      return newProject;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get project hierarchy (parent and sub-projects)
  static async getProjectHierarchy(projectId: string): Promise<any> {
    const query = `
      WITH RECURSIVE project_tree AS (
        -- Base case: get the root project
        SELECT id, name, parent_project_id, 0 as level
        FROM projects 
        WHERE id = $1
        
        UNION ALL
        
        -- Recursive case: get child projects
        SELECT p.id, p.name, p.parent_project_id, pt.level + 1
        FROM projects p
        JOIN project_tree pt ON p.parent_project_id = pt.id
      )
      SELECT * FROM project_tree ORDER BY level, name
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  // Get detailed project dashboard data
  static async getProjectDashboard(projectId: string): Promise<any> {
    const dashboardQuery = `
      SELECT 
        p.*,
        -- Budget performance
        COALESCE(p.labor_actual, 0) + COALESCE(p.material_actual, 0) + 
        COALESCE(p.equipment_actual, 0) + COALESCE(p.subcontractor_actual, 0) + 
        COALESCE(p.overhead_actual, 0) as total_actual_cost,
        
        -- Task statistics
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_tasks,
        COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 END) as overdue_tasks,
        
        -- Time tracking
        COALESCE(SUM(t.estimated_hours), 0) as total_estimated_hours,
        COALESCE(SUM(t.actual_hours), 0) as total_actual_hours,
        
        -- Safety and quality metrics
        COUNT(CASE WHEN t.requires_inspection AND t.inspection_passed = false THEN 1 END) as failed_inspections,
        AVG(CASE WHEN t.quality_score IS NOT NULL THEN t.quality_score END) as avg_quality_score,
        
        -- Team information
        COUNT(DISTINCT t.assigned_to) as team_members_count,
        
        -- Recent activity
        MAX(t.updated_at) as last_task_update
        
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(dashboardQuery, [projectId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const project = result.rows[0];
    
    // Get phases with completion data
    const phasesQuery = `
      SELECT 
        pp.*,
        COUNT(t.id) as phase_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(SUM(t.actual_hours), 0) as actual_hours,
        COALESCE(SUM(t.estimated_hours), 0) as estimated_hours
      FROM project_phases pp
      LEFT JOIN tasks t ON pp.id = t.phase_id
      WHERE pp.project_id = $1
      GROUP BY pp.id
      ORDER BY pp.phase_order
    `;
    
    const phases = await pool.query(phasesQuery, [projectId]);
    project.phases = phases.rows;
    
    // Get recent milestones
    const milestonesQuery = `
      SELECT * FROM project_milestones 
      WHERE project_id = $1 
      ORDER BY target_date ASC 
      LIMIT 5
    `;
    
    const milestones = await pool.query(milestonesQuery, [projectId]);
    project.upcoming_milestones = milestones.rows;
    
    // Get recent change orders
    const changeOrdersQuery = `
      SELECT * FROM change_orders 
      WHERE project_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const changeOrders = await pool.query(changeOrdersQuery, [projectId]);
    project.recent_change_orders = changeOrders.rows;
    
    return project;
  }

  // Advanced project search with filters
  static async searchProjects(companyId: string, filters: any): Promise<any> {
    let whereClause = 'WHERE p.company_id = $1';
    const values = [companyId];
    let paramIndex = 2;
    
    if (filters.status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }
    
    if (filters.project_type) {
      whereClause += ` AND p.project_type = $${paramIndex}`;
      values.push(filters.project_type);
      paramIndex++;
    }
    
    if (filters.project_manager_id) {
      whereClause += ` AND p.project_manager_id = $${paramIndex}`;
      values.push(filters.project_manager_id);
      paramIndex++;
    }
    
    if (filters.budget_min) {
      whereClause += ` AND p.total_budget >= $${paramIndex}`;
      values.push(filters.budget_min);
      paramIndex++;
    }
    
    if (filters.budget_max) {
      whereClause += ` AND p.total_budget <= $${paramIndex}`;
      values.push(filters.budget_max);
      paramIndex++;
    }
    
    if (filters.start_date_from) {
      whereClause += ` AND p.start_date >= $${paramIndex}`;
      values.push(filters.start_date_from);
      paramIndex++;
    }
    
    if (filters.start_date_to) {
      whereClause += ` AND p.start_date <= $${paramIndex}`;
      values.push(filters.start_date_to);
      paramIndex++;
    }
    
    const query = `
      SELECT 
        p.*,
        CONCAT(pm.first_name, ' ', pm.last_name) as project_manager_name,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(p.labor_actual, 0) + COALESCE(p.material_actual, 0) + 
        COALESCE(p.equipment_actual, 0) + COALESCE(p.subcontractor_actual, 0) + 
        COALESCE(p.overhead_actual, 0) as total_spent
      FROM projects p
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users c ON p.client_id = c.id
      LEFT JOIN tasks t ON p.id = t.project_id
      ${whereClause}
      GROUP BY p.id, pm.first_name, pm.last_name, c.first_name, c.last_name
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Calculate project health score (like Procore's project insights)
  static async calculateProjectHealth(projectId: string): Promise<any> {
    const healthQuery = `
      SELECT 
        p.id,
        p.name,
        p.completion_percentage,
        p.total_budget,
        
        -- Budget health (0-100 score)
        CASE 
          WHEN p.total_budget > 0 THEN
            LEAST(100, GREATEST(0, 100 - (
              (COALESCE(p.labor_actual, 0) + COALESCE(p.material_actual, 0) + 
               COALESCE(p.equipment_actual, 0) + COALESCE(p.subcontractor_actual, 0) + 
               COALESCE(p.overhead_actual, 0)) / p.total_budget * 100
            )))
          ELSE 100
        END as budget_health,
        
        -- Schedule health (0-100 score)
        CASE 
          WHEN p.end_date IS NOT NULL THEN
            CASE 
              WHEN CURRENT_DATE > p.end_date THEN 0
              WHEN p.completion_percentage >= (
                EXTRACT(epoch FROM (CURRENT_DATE - p.start_date)) / 
                EXTRACT(epoch FROM (p.end_date - p.start_date)) * 100
              ) THEN 100
              ELSE GREATEST(0, 100 - (
                (EXTRACT(epoch FROM (CURRENT_DATE - p.start_date)) / 
                 EXTRACT(epoch FROM (p.end_date - p.start_date)) * 100) - p.completion_percentage
              ) * 2)
            END
          ELSE 100
        END as schedule_health,
        
        -- Quality health (0-100 score)
        COALESCE(AVG(t.quality_score), 85) as quality_health,
        
        -- Task completion rate
        CASE 
          WHEN COUNT(t.id) > 0 THEN
            COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::float / COUNT(t.id) * 100
          ELSE 100
        END as task_completion_rate,
        
        -- Risk indicators
        COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 END) as overdue_tasks,
        COUNT(CASE WHEN t.requires_inspection AND t.inspection_passed = false THEN 1 END) as failed_inspections,
        p.change_orders_count,
        p.weather_delays
        
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    
    const result = await pool.query(healthQuery, [projectId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const data = result.rows[0];
    
    // Calculate overall health score (weighted average)
    const overallHealth = Math.round(
      (data.budget_health * 0.3 + 
       data.schedule_health * 0.3 + 
       data.quality_health * 0.2 + 
       data.task_completion_rate * 0.2)
    );
    
    return {
      ...data,
      overall_health: overallHealth,
      health_status: overallHealth >= 80 ? 'excellent' : 
                    overallHealth >= 60 ? 'good' : 
                    overallHealth >= 40 ? 'warning' : 'critical',
      risk_factors: {
        overdue_tasks: data.overdue_tasks,
        failed_inspections: data.failed_inspections,
        change_orders: data.change_orders_count,
        weather_delays: data.weather_delays
      }
    };
  }
}