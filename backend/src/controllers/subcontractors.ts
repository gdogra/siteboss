import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SubcontractorContractModel } from '../models/Subcontractor';
import { SubcontractorModel } from '../models/Resource';

export class SubcontractorController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { q } = req.query;
      const result = await (await import('../models/Resource')).SubcontractorModel.findByCompany(req.user.companyId);
      const rows = Array.isArray(result) ? result : [];
      const filtered = q && typeof q === 'string'
        ? rows.filter((r: any) => r.business_name?.toLowerCase().includes(q.toLowerCase()))
        : rows;
      res.json({ success: true, data: filtered });
    } catch (error) {
      console.error('List subcontractors error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const data = req.body as any;
      const created = await SubcontractorModel.create(req.user.companyId, data);
      res.status(201).json({ success: true, data: created, message: 'Subcontractor created' });
    } catch (error) {
      console.error('Create subcontractor error:', error);
      res.status(500).json({ success: false, error: 'Failed to create subcontractor' });
    }
  }
  static async createAssignment(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const payload = req.body as any;
      const assignment = await SubcontractorContractModel.createAssignment(req.user.companyId, payload);
      res.status(201).json({ success: true, data: assignment, message: 'Assignment created' });
    } catch (error: any) {
      console.error('Create subcontractor assignment error:', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create assignment' });
    }
  }

  static async listAssignments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { business_name } = req.query;
      if (!business_name || typeof business_name !== 'string') {
        res.status(400).json({ success: false, error: 'business_name is required' });
        return;
      }

      const rows = await SubcontractorContractModel.listAssignmentsByBusinessName(req.user.companyId, business_name);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('List subcontractor assignments error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
