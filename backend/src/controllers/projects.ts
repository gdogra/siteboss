import { Response } from 'express';
import { ProjectModel } from '../models/Project';
import { CreateProjectRequest, ApiResponse, PaginatedResponse } from '../types';
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
      const project = await ProjectModel.create(req.user.companyId, projectData);

      const response: ApiResponse = {
        success: true,
        data: project,
        message: 'Project created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
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
}