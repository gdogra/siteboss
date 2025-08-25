import pool from '../database/connection';
import { Company } from '../types';

export interface CreateCompanyRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
}

export class CompanyModel {
  static async create(companyData: CreateCompanyRequest): Promise<Company> {
    const query = `
      INSERT INTO companies (name, address, phone, email, license_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, address, phone, email, license_number, created_at, updated_at
    `;
    
    const values = [
      companyData.name,
      companyData.address || null,
      companyData.phone || null,
      companyData.email || null,
      companyData.license_number || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Company | null> {
    const query = `
      SELECT id, name, address, phone, email, license_number, created_at, updated_at
      FROM companies 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<Company | null> {
    const query = `
      SELECT id, name, address, phone, email, license_number, created_at, updated_at
      FROM companies 
      WHERE LOWER(name) = LOWER($1)
    `;
    
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  static async update(id: string, updateData: Partial<CreateCompanyRequest>): Promise<Company | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updateData.name);
    }
    if (updateData.address !== undefined) {
      fields.push(`address = $${paramIndex++}`);
      values.push(updateData.address);
    }
    if (updateData.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(updateData.phone);
    }
    if (updateData.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updateData.email);
    }
    if (updateData.license_number !== undefined) {
      fields.push(`license_number = $${paramIndex++}`);
      values.push(updateData.license_number);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE companies 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, address, phone, email, license_number, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}