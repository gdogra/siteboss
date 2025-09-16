import { Response } from 'express';
import pool from '../database/connection';
import { AuthRequest } from '../middleware/auth';

export class JobSitesController {
  static async listByProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id } = req.params; // project id
      const query = `
        SELECT js.*
        FROM job_sites js
        JOIN projects p ON js.project_id = p.id
        WHERE js.project_id = $1 AND p.company_id = $2
        ORDER BY js.created_at DESC
      `;
      const result = await pool.query(query, [id, req.user.companyId]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('List job sites error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id } = req.params; // project id
      // Ensure project belongs to company
      const check = await pool.query('SELECT company_id FROM projects WHERE id = $1', [id]);
      if (check.rowCount === 0) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }
      if (check.rows[0].company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      const b = req.body as any;
      const result = await pool.query(
        `INSERT INTO job_sites (project_id, name, address, latitude, longitude, site_supervisor_id, safety_requirements, access_instructions, street_address, city, state, postal_code, country)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [id, b.name, b.address || null, b.latitude ?? null, b.longitude ?? null, b.site_supervisor_id || null, b.safety_requirements || null, b.access_instructions || null, b.street_address || null, b.city || null, b.state || null, b.postal_code || null, b.country || null]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Create job site error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id, siteId } = req.params; // project id & site id
      // Ensure site belongs to project and company
      const check = await pool.query(
        `SELECT js.id, p.company_id FROM job_sites js JOIN projects p ON js.project_id = p.id WHERE js.id = $1 AND js.project_id = $2`,
        [siteId, id]
      );
      if (check.rowCount === 0) {
        res.status(404).json({ success: false, error: 'Job site not found' });
        return;
      }
      if (check.rows[0].company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      const allowed = ['name','address','latitude','longitude','site_supervisor_id','safety_requirements','access_instructions','street_address','city','state','postal_code','country'];
      const sets: string[] = [];
      const values: any[] = [];
      let i = 1;
      for (const [k,v] of Object.entries(req.body || {})) {
        if (allowed.includes(k) && v !== undefined) {
          sets.push(`${k} = $${i}`);
          values.push(v);
          i++;
        }
      }
      if (sets.length === 0) {
        res.status(400).json({ success: false, error: 'No valid fields to update' });
        return;
      }
      values.push(siteId);
      const result = await pool.query(
        `UPDATE job_sites SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`,
        values
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Update job site error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async remove(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id, siteId } = req.params;
      const check = await pool.query(
        `SELECT js.id, p.company_id FROM job_sites js JOIN projects p ON js.project_id = p.id WHERE js.id = $1 AND js.project_id = $2`,
        [siteId, id]
      );
      if (check.rowCount === 0) {
        res.status(404).json({ success: false, error: 'Job site not found' });
        return;
      }
      if (check.rows[0].company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      await pool.query('DELETE FROM job_sites WHERE id = $1', [siteId]);
      res.json({ success: true, message: 'Job site deleted' });
    } catch (error) {
      console.error('Delete job site error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
