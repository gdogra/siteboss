import pool from '../database/connection';
import { Resource, Subcontractor, ResourceType } from '../types';

export class ResourceModel {
  static async findByCompany(companyId: string): Promise<Resource[]> {
    const query = `
      SELECT * FROM resources 
      WHERE company_id = $1 
      ORDER BY name
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async findAvailable(companyId: string, type?: ResourceType): Promise<Resource[]> {
    let query = `
      SELECT * FROM resources 
      WHERE company_id = $1 AND is_available = true
    `;
    
    const params = [companyId];
    
    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }
    
    query += ` ORDER BY name`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(companyId: string, resourceData: any): Promise<Resource> {
    const query = `
      INSERT INTO resources (
        company_id, name, type, model, serial_number, 
        purchase_date, purchase_cost, hourly_rate, maintenance_schedule
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      companyId,
      resourceData.name,
      resourceData.type,
      resourceData.model,
      resourceData.serial_number,
      resourceData.purchase_date,
      resourceData.purchase_cost,
      resourceData.hourly_rate,
      resourceData.maintenance_schedule
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Resource>): Promise<Resource | null> {
    const allowedFields = [
      'name', 'model', 'hourly_rate', 'maintenance_schedule', 'is_available'
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
      UPDATE resources 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}

export class SubcontractorModel {
  static async findByCompany(companyId: string): Promise<Subcontractor[]> {
    const query = `
      SELECT * FROM subcontractors 
      WHERE company_id = $1 AND is_active = true
      ORDER BY business_name
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async create(companyId: string, subcontractorData: any): Promise<Subcontractor> {
    const query = `
      INSERT INTO subcontractors (
        company_id, business_name, contact_name, phone, email, 
        address, license_number, specialty, hourly_rate, insurance_expires
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      companyId,
      subcontractorData.business_name,
      subcontractorData.contact_name,
      subcontractorData.phone,
      subcontractorData.email,
      subcontractorData.address,
      subcontractorData.license_number,
      subcontractorData.specialty,
      subcontractorData.hourly_rate,
      subcontractorData.insurance_expires
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Subcontractor>): Promise<Subcontractor | null> {
    const allowedFields = [
      'business_name', 'contact_name', 'phone', 'email', 'address',
      'license_number', 'specialty', 'hourly_rate', 'rating', 'insurance_expires'
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
      UPDATE subcontractors 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}