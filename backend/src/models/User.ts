import pool from '../database/connection';
import { User, CreateUserRequest, UserRole } from '../types';
import { hashPassword } from '../utils/auth';

interface CreateUserWithCompanyIdRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  company_id: string;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, company_id, email, password_hash, first_name, last_name, 
             phone, role, avatar_url, is_active, last_login, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, company_id, email, password_hash, first_name, last_name, 
             phone, role, avatar_url, is_active, last_login, created_at, updated_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserWithCompanyIdRequest): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role, company_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, company_id, email, first_name, last_name, phone, role, 
                avatar_url, is_active, last_login, created_at, updated_at
    `;
    
    const values = [
      userData.email,
      hashedPassword,
      userData.first_name,
      userData.last_name,
      userData.phone,
      userData.role || 'worker',
      userData.company_id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByCompany(companyId: string): Promise<User[]> {
    const query = `
      SELECT id, company_id, email, first_name, last_name, phone, role, 
             avatar_url, is_active, last_login, created_at, updated_at
      FROM users 
      WHERE company_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  static async updateRole(id: string, role: UserRole): Promise<User | null> {
    const query = `
      UPDATE users 
      SET role = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, company_id, email, first_name, last_name, phone, role, 
                avatar_url, is_active, last_login, created_at, updated_at
    `;
    
    const result = await pool.query(query, [id, role]);
    return result.rows[0] || null;
  }

  static async deactivate(id: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async updateProfile(id: string, updates: Partial<User>): Promise<User | null> {
    const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
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
      UPDATE users 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex} AND is_active = true
      RETURNING id, company_id, email, first_name, last_name, phone, role, 
                avatar_url, is_active, last_login, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}