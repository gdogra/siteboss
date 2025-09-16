import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getSupabase, getBucketName } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

export class UploadsController {
  static async uploadReceipt(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const sb = getSupabase();
      if (!sb) {
        res.status(500).json({ error: 'Supabase not configured on server' });
        return;
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      const { project_id } = req.body as Record<string, string>;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      if (!project_id) {
        res.status(400).json({ error: 'project_id is required' });
        return;
      }

      const bucket = getBucketName();
      const id = uuidv4();
      const ext = (file.originalname.split('.').pop() || '').toLowerCase();
      const path = `receipts/${project_id}/${id}.${ext || 'bin'}`;
      const { data, error } = await sb.storage.from(bucket).upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
      if (error) {
        res.status(500).json({ error: `Upload failed: ${error.message}` });
        return;
      }
      const { data: pub } = sb.storage.from(bucket).getPublicUrl(data?.path || path);
      res.status(201).json({ file_path: pub?.publicUrl || path });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Upload receipt error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

