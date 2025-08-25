import { Response } from 'express';
import { BudgetModel, ExpenseModel } from '../models/Budget';
import { ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

export class BudgetController {
  static async getBudgetCategories(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const categories = await BudgetModel.findByProject(projectId);

      const response: ApiResponse = {
        success: true,
        data: categories
      };

      res.json(response);
    } catch (error) {
      console.error('Get budget categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createBudgetCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const { name, category, budgeted_amount } = req.body;

      const budgetCategory = await BudgetModel.createCategory(
        projectId, 
        name, 
        category, 
        budgeted_amount
      );

      const response: ApiResponse = {
        success: true,
        data: budgetCategory,
        message: 'Budget category created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create budget category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateBudgetCategory(req: AuthRequest, res: Response): Promise<void> {
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

      const updatedCategory = await BudgetModel.updateCategory(id, updates);

      if (!updatedCategory) {
        res.status(404).json({
          success: false,
          error: 'Budget category not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedCategory,
        message: 'Budget category updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update budget category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteBudgetCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const deleted = await BudgetModel.deleteCategory(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Budget category not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Budget category deleted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Delete budget category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getBudgetSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const summary = await BudgetModel.getProjectBudgetSummary(projectId);

      const response: ApiResponse = {
        success: true,
        data: summary
      };

      res.json(response);
    } catch (error) {
      console.error('Get budget summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getBudgetByCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const categoryBreakdown = await BudgetModel.getBudgetByCategory(projectId);

      const response: ApiResponse = {
        success: true,
        data: categoryBreakdown
      };

      res.json(response);
    } catch (error) {
      console.error('Get budget by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export class ExpenseController {
  static async getExpenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { projectId } = req.params;
      const expenses = await ExpenseModel.findByProject(projectId);

      const response: ApiResponse = {
        success: true,
        data: expenses
      };

      res.json(response);
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const expenseData = req.body;
      const expense = await ExpenseModel.create(expenseData, req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: expense,
        message: 'Expense created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateExpense(req: AuthRequest, res: Response): Promise<void> {
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

      const updatedExpense = await ExpenseModel.update(id, updates);

      if (!updatedExpense) {
        res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: updatedExpense,
        message: 'Expense updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async approveExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const approvedExpense = await ExpenseModel.approve(id, req.user.userId);

      if (!approvedExpense) {
        res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: approvedExpense,
        message: 'Expense approved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Approve expense error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async rejectExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const rejectedExpense = await ExpenseModel.reject(id);

      if (!rejectedExpense) {
        res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: rejectedExpense,
        message: 'Expense rejected successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Reject expense error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteExpense(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      const deleted = await ExpenseModel.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Expense deleted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getPendingExpenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const expenses = await ExpenseModel.findPendingApproval(req.user.companyId);

      const response: ApiResponse = {
        success: true,
        data: expenses
      };

      res.json(response);
    } catch (error) {
      console.error('Get pending expenses error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getMyExpenses(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const expenses = await ExpenseModel.findByUser(req.user.userId);

      const response: ApiResponse = {
        success: true,
        data: expenses
      };

      res.json(response);
    } catch (error) {
      console.error('Get my expenses error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}