import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';

export class UsersController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { q } = req.query;
      const rows = await UserModel.findByCompany(req.user.companyId);
      const data = q && typeof q === 'string'
        ? rows.filter(u => (`${u.first_name} ${u.last_name}`.toLowerCase().includes(q.toLowerCase()) || (u.email || '').toLowerCase().includes(q.toLowerCase())))
        : rows;
      res.json({ success: true, data });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

