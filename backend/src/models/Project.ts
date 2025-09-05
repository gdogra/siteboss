import pool from '../database/connection';
import { Project, CreateProjectRequest, ProjectStatus } from '../types';

export class ProjectModel {
  static async findByCompany(companyId: string): Promise<Project[]> {
    const query = `
      SELECT p.*, 
             CONCAT(pm.first_name, ' ', pm.last_name) as project_manager_name,
             CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM projects p
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users c ON p.client_id = c.id
      WHERE p.company_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async findById(id: string): Promise<Project | null> {
    const query = `
      SELECT p.*, 
             CONCAT(pm.first_name, ' ', pm.last_name) as project_manager_name,
             CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM projects p
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users c ON p.client_id = c.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(companyId: string, projectData: CreateProjectRequest): Promise<Project> {
    const query = `
      INSERT INTO projects (
        company_id, name, description, address, start_date, end_date, 
        estimated_duration, total_budget, contract_value, client_id, project_manager_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      companyId,
      projectData.name,
      projectData.description,
      projectData.address,
      projectData.start_date,
      projectData.end_date,
      projectData.estimated_duration,
      projectData.total_budget,
      projectData.contract_value,
      projectData.client_id,
      projectData.project_manager_id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    const allowedFields = [
      'name', 'description', 'address', 'start_date', 'end_date', 
      'estimated_duration', 'status', 'total_budget', 'contract_value', 
      'profit_margin', 'project_manager_id', 'client_id'
    ];
    
    const setFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    setFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE projects 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findByStatus(companyId: string, status: ProjectStatus): Promise<Project[]> {
    const query = `
      SELECT p.*, 
             CONCAT(pm.first_name, ' ', pm.last_name) as project_manager_name,
             CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM projects p
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users c ON p.client_id = c.id
      WHERE p.company_id = $1 AND p.status = $2
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, [companyId, status]);
    return result.rows;
  }

  static async getProjectStats(companyId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects,
        COALESCE(SUM(total_budget), 0) as total_budget_value,
        COALESCE(SUM(contract_value), 0) as total_contract_value
      FROM projects 
      WHERE company_id = $1
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows[0];
  }

  static async findByProjectManager(projectManagerId: string): Promise<Project[]> {
    const query = `
      SELECT p.*, 
             CONCAT(c.first_name, ' ', c.last_name) as client_name
      FROM projects p
      LEFT JOIN users c ON p.client_id = c.id
      WHERE p.project_manager_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, [projectManagerId]);
    return result.rows;
  }

  static async getTeamMembers(projectId: string): Promise<any[]> {
    const query = `
      WITH pm AS (
        SELECT project_manager_id AS uid, company_id
        FROM projects WHERE id = $1
      )
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN pm ON u.company_id = pm.company_id
      WHERE u.id = pm.uid
      UNION
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1`;

    const result = await pool.query(query, [projectId]);
    return result.rows;
  }
}
