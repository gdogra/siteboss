import { Response } from 'express';
import pool from '../database/connection';
import { getSupabase, getBucketName } from '../services/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TaskModel } from '../models/Task';
import { CreateTaskRequest } from '../types';

export class DocumentController {
  static async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const sb = getSupabase();
      if (!sb) {
        res.status(500).json({ success: false, error: 'Supabase not configured on server' });
        return;
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      const { project_id, task_id, title, category } = req.body as Record<string, string>;

      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      if (!project_id) {
        res.status(400).json({ success: false, error: 'project_id is required' });
        return;
      }

      const bucket = getBucketName();
      const fileId = uuidv4();
      const ext = (file.originalname.split('.').pop() || '').toLowerCase();
      const filePath = `${project_id}/${fileId}.${ext || 'bin'}`;

      const { error: uploadError } = await sb
        .storage
        .from(bucket)
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });

      if (uploadError) {
        res.status(500).json({ success: false, error: `Upload failed: ${uploadError.message}` });
        return;
      }

      // Public URL (assumes bucket public or policies allow)
      const { data: pub } = sb.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = pub?.publicUrl || filePath;

      const insertQuery = `
        INSERT INTO documents (
          project_id, task_id, uploaded_by, title, description, category, 
          file_name, file_path, file_size, mime_type
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `;
      const values = [
        project_id,
        task_id || null,
        req.user.userId,
        title || file.originalname,
        null,
        category || 'other',
        file.originalname,
        publicUrl,
        file.size,
        file.mimetype,
      ];

      const result = await pool.query(insertQuery, values);
      const doc = result.rows[0];

      // Optional: generate tasks from uploaded document
      const genFlagRaw = (req.body as any)?.generate_tasks;
      const shouldGenerate = (typeof genFlagRaw === 'string' && ['true','1','yes','on'].includes(genFlagRaw.toLowerCase()))
        || (typeof genFlagRaw === 'boolean' && genFlagRaw === true)
        || ['specification','drawing','contract','report'].includes((category || '').toLowerCase());

      let createdTasks = 0;
      if (shouldGenerate) {
        try {
          const now = new Date();
          const addDays = (d: number) => new Date(now.getTime() + d*24*60*60*1000);
          const templates: Array<Pick<CreateTaskRequest,'title'|'description'|'priority'|'estimated_hours'>> = [
            { title: `Review: ${title || file.originalname}`, description: 'Review uploaded document and summarize key items', priority: 'medium', estimated_hours: 2 },
            { title: 'Extract milestones', description: 'Identify major milestones and deliverables from the document', priority: 'high', estimated_hours: 3 },
            { title: 'Draft project schedule', description: 'Create initial schedule based on scope', priority: 'high', estimated_hours: 4 },
            { title: 'Define budget categories', description: 'Outline budget categories aligned to scope', priority: 'medium', estimated_hours: 2 },
            { title: 'Plan kickoff meeting', description: 'Schedule kickoff with stakeholders and review scope', priority: 'medium', estimated_hours: 1 },
          ];
          for (let i = 0; i < templates.length; i++) {
            const t = templates[i];
            await TaskModel.create({
              project_id,
              title: t.title,
              description: t.description,
              start_date: addDays(i),
              due_date: addDays(i + 3),
              estimated_hours: t.estimated_hours,
              priority: t.priority as any,
            }, req.user.userId);
            createdTasks++;
          }
        } catch (taskErr) {
          // eslint-disable-next-line no-console
          console.error('Task generation from document failed:', taskErr);
        }
      }

      const response: ApiResponse = { success: true, data: { ...doc, created_tasks: createdTasks }, message: 'File uploaded' };
      res.status(201).json(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Document upload error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async listByProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { projectId } = req.params;
      // Ensure user belongs to the same company as the project
      const query = `
        SELECT d.*
        FROM documents d
        JOIN projects p ON d.project_id = p.id
        WHERE d.project_id = $1 AND p.company_id = $2
        ORDER BY d.created_at DESC
      `;
      const result = await pool.query(query, [projectId, req.user.companyId]);
      res.json({ success: true, data: result.rows } as ApiResponse);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('List documents error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getOne(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id } = req.params;
      const query = `
        SELECT d.*, p.company_id
        FROM documents d
        JOIN projects p ON d.project_id = p.id
        WHERE d.id = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [id]);
      const doc = result.rows[0];
      if (!doc) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
      }
      if (doc.company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      delete doc.company_id;
      res.json({ success: true, data: doc } as ApiResponse);
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async download(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id } = req.params;
      const docQuery = `
        SELECT d.file_path, d.file_name, d.mime_type, p.company_id
        FROM documents d
        JOIN projects p ON d.project_id = p.id
        WHERE d.id = $1
        LIMIT 1
      `;
      const result = await pool.query(docQuery, [id]);
      const row = result.rows[0];
      if (!row) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
      }
      if (row.company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      const sb = getSupabase();
      if (!sb) {
        // Fallback: if file_path is a public URL, redirect
        return res.redirect(row.file_path);
      }

      const bucket = getBucketName();
      const filePath: string = row.file_path;
      // If file_path looks like a URL, attempt to derive path; otherwise assume it's the storage key
      let storageKey = filePath;
      try {
        const url = new URL(filePath);
        const parts = url.pathname.split('/');
        const i = parts.findIndex((p) => p === 'object') + 1; // /object/BucketName/<path>
        if (i > 0 && i < parts.length) {
          storageKey = decodeURIComponent(parts.slice(i + 1).join('/'));
        }
      } catch {}

      const { data, error } = await sb.storage.from(bucket).createSignedUrl(storageKey, 60);
      if (error || !data?.signedUrl) {
        // If cannot sign, fallback to redirecting to file_path
        return res.redirect(filePath);
      }
      res.redirect(data.signedUrl);
    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
