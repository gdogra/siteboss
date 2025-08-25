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
      const task = await TaskModel.create(taskData, req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: task,
        message: 'Task created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
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