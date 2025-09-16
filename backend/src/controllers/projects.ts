import { Response } from 'express';
import { ProjectModel } from '../models/Project';
import { CompanyModel } from '../models/Company';
import { CreateProjectRequest, ApiResponse, PaginatedResponse } from '../types';
import { TaskModel } from '../models/Task';
import pool from '../database/connection';
import { AuthRequest } from '../middleware/auth';

export class ProjectController {
  static async getProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { status } = req.query;
      let projects;

      if (status && typeof status === 'string') {
        projects = await ProjectModel.findByStatus(req.user.companyId, status as any);
      } else {
        projects = await ProjectModel.findByCompany(req.user.companyId);
      }

      const response: ApiResponse = {
        success: true,
        data: projects
      };

      res.json(response);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const project = await ProjectModel.findById(id);

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      if (project.company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: project
      };

      res.json(response);
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const projectData: CreateProjectRequest = req.body;

      // Ensure a valid company exists (demo/dev tokens may have non‑UUID company ids)
      let companyId = req.user.companyId;
      try {
        const existing = await CompanyModel.findById(companyId);
        if (!existing) {
          const created = await CompanyModel.create({ name: 'Demo Company' });
          companyId = created.id;
        }
      } catch (e) {
        // If companyId is not a valid UUID, create a demo company
        const created = await CompanyModel.create({ name: 'Demo Company' });
        companyId = created.id;
      }

      const project = await ProjectModel.create(companyId, projectData);

      // Seed default tasks in "To Do" (DB default: not_started)
      try {
        const templateTasks = [
          { title: 'Kickoff Meeting', description: 'Schedule and run project kickoff with stakeholders', priority: 'medium' as const },
          { title: 'Site Survey', description: 'Initial site assessment and documentation', priority: 'high' as const },
          { title: 'Procurement Plan', description: 'Outline materials, vendors, and timelines', priority: 'medium' as const },
          { title: 'Safety Plan', description: 'Draft safety procedures and training needs', priority: 'medium' as const },
        ];

        // For demo users, skip foreign key constraints for template tasks too
        const authToken = req.headers.authorization?.substring(7); // Remove 'Bearer ' prefix
        const createdBy = authToken === 'demo-token' ? undefined : req.user!.userId;
        
        await Promise.all(
          templateTasks.map(t =>
            TaskModel.create(
              {
                project_id: (project as any).id,
                title: t.title,
                description: t.description,
                priority: t.priority,
              } as any,
              createdBy
            )
          )
        );
      } catch (seedErr) {
        console.error('Warning: failed to seed default tasks for project', seedErr);
      }

      // Create default job site if coordinates provided; include structured address if present
      try {
        const lat = (req.body as any)?.latitude;
        const lng = (req.body as any)?.longitude;
        if (lat !== undefined && lng !== undefined) {
          const supervisor = projectData.project_manager_id || req.user.userId;
          const b = req.body as any;
          await pool.query(
            `INSERT INTO job_sites (project_id, name, address, latitude, longitude, site_supervisor_id, street_address, city, state, postal_code, country)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [ (project as any).id, 'Primary Site', projectData.address, lat, lng, supervisor || null, b.street_address || null, b.city || null, b.state || null, b.postal_code || null, b.country || null ]
          );
        }
      } catch (siteErr) {
        // Non-fatal
        console.error('Warning: failed to create default job site', siteErr);
      }

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Project created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Create project error:', error);
      const err: any = error as any;
      const code = err?.code as string | undefined;
      const detail = err?.detail as string | undefined;
      if (code === '22P02') {
        res.status(400).json({ success: false, error: 'Invalid input syntax', details: [{ message: detail || 'One or more fields have invalid format' }] });
        return;
      }
      if (code === '23503') {
        const constraint = (err?.constraint as string | undefined) || '';
        let message = 'Related record not found';
        if (constraint.includes('projects_company_id')) message = 'Invalid company_id (company not found)';
        else if (constraint.includes('projects_client_id')) message = 'Invalid client_id (user not found)';
        else if (constraint.includes('projects_project_manager_id')) message = 'Invalid project_manager_id (user not found)';
        res.status(400).json({ success: false, error: 'Validation error', details: [{ message }] });
        return;
      }
      if (code === '23514') {
        res.status(400).json({ success: false, error: 'Constraint violation', details: [{ message: detail || 'One or more values violate constraints' }] });
        return;
      }
      res.status(500).json({ success: false, error: process.env.NODE_ENV === 'development' ? (err?.message || 'Internal server error') : 'Internal server error' });
    }
  }

  static async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const updates = req.body;

      const existingProject = await ProjectModel.findById(id);
      if (!existingProject) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      if (existingProject.company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      const updatedProject = await ProjectModel.update(id, updates);

      const response: ApiResponse = {
        success: true,
        data: updatedProject,
        message: 'Project updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;

      const existingProject = await ProjectModel.findById(id);
      if (!existingProject) {
        res.status(404).json({
          success: false,
          error: 'Project not found'
        });
        return;
      }

      if (existingProject.company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        });
        return;
      }

      await ProjectModel.delete(id);

      const response: ApiResponse = {
        success: true,
        message: 'Project deleted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProjectStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const stats = await ProjectModel.getProjectStats(req.user.companyId);

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getMyProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const projects = await ProjectModel.findByProjectManager(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: projects
      };

      res.json(response);
    } catch (error) {
      console.error('Get my projects error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProjectTeam(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const { id } = req.params;
      const project = await ProjectModel.findById(id);
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }
      if (project.company_id !== req.user.companyId && req.user.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
      const team = await ProjectModel.getTeamMembers(id);
      res.json({ success: true, data: team });
    } catch (error) {
      console.error('Get project team error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
