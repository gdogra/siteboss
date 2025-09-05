import pool from '../database/connection';
import { Task, CreateTaskRequest, TaskStatus, TaskPriority } from '../types';

export class TaskModel {
  static async findByProject(projectId: string): Promise<Task[]> {
    const query = `
      SELECT t.*, 
             CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
             CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
             pp.name as phase_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN project_phases pp ON t.phase_id = pp.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async findById(id: string): Promise<Task | null> {
    const query = `
      SELECT t.*, 
             CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
             CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
             pp.name as phase_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN project_phases pp ON t.phase_id = pp.id
      WHERE t.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(taskData: CreateTaskRequest, createdBy?: string): Promise<Task> {
    const query = `
      INSERT INTO tasks (
        project_id, phase_id, parent_task_id, assigned_to, title, description,
        start_date, due_date, estimated_hours, priority, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      taskData.project_id,
      taskData.phase_id || null,
      taskData.parent_task_id || null,
      taskData.assigned_to || null,
      taskData.title,
      taskData.description,
      taskData.start_date || null,
      taskData.due_date || null,
      taskData.estimated_hours || null,
      taskData.priority,
      createdBy || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const allowedFields = [
      'title', 'description', 'assigned_to', 'start_date', 'due_date',
      'estimated_hours', 'actual_hours', 'status', 'priority', 'completion_percentage'
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
      UPDATE tasks 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM tasks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findByAssignee(assigneeId: string): Promise<Task[]> {
    const query = `
      SELECT t.*, 
             p.name as project_name,
             pp.name as phase_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_phases pp ON t.phase_id = pp.id
      WHERE t.assigned_to = $1
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC, t.created_at DESC
    `;
    
    const result = await pool.query(query, [assigneeId]);
    return result.rows;
  }

  static async findOverdueTasks(companyId: string): Promise<Task[]> {
    const query = `
      SELECT t.*, 
             p.name as project_name,
             CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE p.company_id = $1 
        AND t.due_date < CURRENT_DATE 
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async getTaskStats(projectId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks,
        COALESCE(AVG(completion_percentage), 0) as avg_completion,
        COALESCE(SUM(estimated_hours), 0) as total_estimated_hours,
        COALESCE(SUM(actual_hours), 0) as total_actual_hours
      FROM tasks 
      WHERE project_id = $1
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
  }

  static async findByStatus(projectId: string, status: TaskStatus): Promise<Task[]> {
    const query = `
      SELECT t.*, 
             CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
             pp.name as phase_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN project_phases pp ON t.phase_id = pp.id
      WHERE t.project_id = $1 AND t.status = $2
      ORDER BY t.priority DESC, t.created_at DESC
    `;
    
    const result = await pool.query(query, [projectId, status]);
    return result.rows;
  }

  static async findSubtasks(parentTaskId: string): Promise<Task[]> {
    const query = `
      SELECT t.*, 
             CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.parent_task_id = $1
      ORDER BY t.created_at ASC
    `;
    
    const result = await pool.query(query, [parentTaskId]);
    return result.rows;
  }
}
