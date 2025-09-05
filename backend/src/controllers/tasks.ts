import { Response } from 'express';
import { TaskModel } from '../models/Task';
import { CreateTaskRequest, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

export class TaskController {
  static async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const { status } = req.query;

      let tasks;
      if (status && typeof status === 'string') {
        tasks = await TaskModel.findByStatus(projectId, status as any);
      } else {
        tasks = await TaskModel.findByProject(projectId);
      }

      const response: ApiResponse = {
        success: true,
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const task = await TaskModel.findById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: task
      };

      res.json(response);
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const taskData: CreateTaskRequest = req.body;
      
      // For demo users (identified by demo token), create without foreign key constraints by setting created_by to undefined
      const authToken = req.headers.authorization?.substring(7); // Remove 'Bearer ' prefix
      const createdBy = authToken === 'demo-token' ? undefined : req.user.userId;
      const task = await TaskModel.create(taskData, createdBy);

      const response: ApiResponse = {
        success: true,
        data: task,
        message: 'Task created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      // Provide clearer DB error messages in dev for easier debugging
      // Common Postgres error codes: 22P02 (invalid_text_representation),
      // 23503 (foreign_key_violation), 23514 (check_violation)
      // eslint-disable-next-line no-console
      console.error('Create task error:', error);
      const err: any = error as any;
      const code = err?.code as string | undefined;
      const detail = err?.detail as string | undefined;

      if (code === '22P02') {
        res.status(400).json({ success: false, error: 'Invalid input syntax', details: [{ message: detail || 'One or more fields have invalid format' }] });
        return;
      }
      if (code === '23503') {
        // Foreign key violation: identify which field failed
        const constraint = (err?.constraint as string | undefined) || '';
        let message = 'Related record not found';
        if (constraint.includes('tasks_project_id')) message = 'Invalid project_id (project not found)';
        else if (constraint.includes('tasks_assigned_to')) message = 'Invalid assigned_to (user not found)';
        else if (constraint.includes('tasks_phase_id')) message = 'Invalid phase_id (phase not found)';
        else if (constraint.includes('tasks_parent_task_id')) message = 'Invalid parent_task_id (task not found)';
        res.status(400).json({ success: false, error: 'Validation error', details: [{ message }] });
        return;
      }
      if (code === '23514') {
        res.status(400).json({ success: false, error: 'Constraint violation', details: [{ message: detail || 'One or more values violate constraints' }] });
        return;
      }

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? (err?.message || 'Internal server error') : 'Internal server error'
      });
    }
  }

  static async updateTask(req: AuthRequest, res: Response): Promise<void> {
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

      const existingTask = await TaskModel.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      const updatedTask = await TaskModel.update(id, updates);

      const response: ApiResponse = {
        success: true,
        data: updatedTask,
        message: 'Task updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;

      const existingTask = await TaskModel.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      await TaskModel.delete(id);

      const response: ApiResponse = {
        success: true,
        message: 'Task deleted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getMyTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const tasks = await TaskModel.findByAssignee(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get my tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getTaskStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const stats = await TaskModel.getTaskStats(projectId);

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      console.error('Get task stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getSubtasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { parentId } = req.params;
      const subtasks = await TaskModel.findSubtasks(parentId);

      const response: ApiResponse = {
        success: true,
        data: subtasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get subtasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getOverdueTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const tasks = await TaskModel.findOverdueTasks(req.user.companyId);

      const response: ApiResponse = {
        success: true,
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get overdue tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
