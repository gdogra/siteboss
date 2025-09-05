import pool from '../database/connection';
import { ProjectModel } from './Project';

export class SubcontractorContractModel {
  static async findOrCreateSubcontractor(companyId: string, data: {
    business_name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    specialty?: string;
    hourly_rate?: number;
  }) {
    const existing = await pool.query(
      `SELECT * FROM subcontractors WHERE company_id = $1 AND (LOWER(business_name) = LOWER($2) OR email = $3) LIMIT 1`,
      [companyId, data.business_name, data.email || null]
    );
    if (existing.rows[0]) return existing.rows[0];

    const insert = await pool.query(
      `INSERT INTO subcontractors (company_id, business_name, contact_name, email, phone, specialty, hourly_rate, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
      [companyId, data.business_name, data.contact_name || null, data.email || null, data.phone || null, data.specialty || null, data.hourly_rate || null]
    );
    return insert.rows[0];
  }

  static async createAssignment(companyId: string, payload: {
    business_name?: string;
    subcontractor_id?: string;
    project_id?: string;
    project_name?: string;
    start_date?: string;
    end_date?: string;
    contract_amount?: number;
    work_description?: string;
    payment_terms?: string;
  }) {
    // Resolve project
    let projectId = payload.project_id || '';
    if (!projectId && payload.project_name) {
      const found = await pool.query(
        `SELECT id FROM projects WHERE company_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
        [companyId, payload.project_name]
      );
      if (found.rows[0]) {
        projectId = found.rows[0].id;
      } else {
        // Create minimal project when only name provided
        const created = await ProjectModel.create(companyId, {
          name: payload.project_name,
          description: 'Auto-created from subcontractor assignment',
          address: 'Unknown',
          start_date: undefined,
          end_date: undefined,
          estimated_duration: undefined,
          total_budget: undefined,
          contract_value: undefined,
          client_id: undefined,
          project_manager_id: undefined
        } as any);
        projectId = created.id;
      }
    }
    const project = await ProjectModel.findById(projectId);
    if (!project || project.company_id !== companyId) {
      throw new Error('Invalid project');
    }

    // Resolve subcontractor
    let subcontractorId = payload.subcontractor_id;
    if (!subcontractorId) {
      if (!payload.business_name) throw new Error('Missing subcontractor');
      const sc = await this.findOrCreateSubcontractor(companyId, { business_name: payload.business_name });
      subcontractorId = sc.id;
    }

    const result = await pool.query(
      `INSERT INTO subcontractor_contracts (project_id, subcontractor_id, work_description, contract_amount, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        projectId,
        subcontractorId,
        payload.work_description || 'Contracted work',
        payload.contract_amount || 0,
        payload.start_date || null,
        payload.end_date || null,
        'pending'
      ]
    );

    return result.rows[0];
  }

  static async listAssignmentsByBusinessName(companyId: string, businessName: string) {
    const result = await pool.query(
      `SELECT sc.*, p.name as project_name
       FROM subcontractor_contracts sc
       JOIN subcontractors s ON sc.subcontractor_id = s.id
       JOIN projects p ON sc.project_id = p.id
       WHERE s.company_id = $1 AND LOWER(s.business_name) = LOWER($2)
       ORDER BY sc.created_at DESC`,
      [companyId, businessName]
    );
    return result.rows;
  }
}
