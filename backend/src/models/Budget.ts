import pool from '../database/connection';
import { BudgetCategory, Expense, CostCategory } from '../types';

export class BudgetModel {
  static async findByProject(projectId: string): Promise<BudgetCategory[]> {
    const query = `
      SELECT bc.*,
             COALESCE(SUM(e.amount), 0) as actual_spent,
             COUNT(e.id) as expense_count
      FROM budget_categories bc
      LEFT JOIN expenses e ON bc.id = e.budget_category_id AND e.is_approved = true
      WHERE bc.project_id = $1
      GROUP BY bc.id, bc.name, bc.category, bc.budgeted_amount, bc.actual_amount, bc.created_at, bc.updated_at
      ORDER BY bc.category, bc.name
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async findById(id: string): Promise<BudgetCategory | null> {
    const query = `
      SELECT bc.*,
             COALESCE(SUM(e.amount), 0) as actual_spent,
             COUNT(e.id) as expense_count
      FROM budget_categories bc
      LEFT JOIN expenses e ON bc.id = e.budget_category_id AND e.is_approved = true
      WHERE bc.id = $1
      GROUP BY bc.id, bc.name, bc.category, bc.budgeted_amount, bc.actual_amount, bc.created_at, bc.updated_at
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async createCategory(
    projectId: string, 
    name: string, 
    category: CostCategory, 
    budgetedAmount: number
  ): Promise<BudgetCategory> {
    const query = `
      INSERT INTO budget_categories (project_id, name, category, budgeted_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [projectId, name, category, budgetedAmount]);
    return result.rows[0];
  }

  static async updateCategory(id: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory | null> {
    const allowedFields = ['name', 'budgeted_amount'];
    const setFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    setFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE budget_categories 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const query = 'DELETE FROM budget_categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getProjectBudgetSummary(projectId: string): Promise<any> {
    const query = `
      SELECT 
        COALESCE(SUM(bc.budgeted_amount), 0) as total_budget,
        COALESCE(SUM(bc.actual_amount), 0) as total_actual,
        COALESCE(SUM(CASE WHEN e.is_approved THEN e.amount ELSE 0 END), 0) as total_approved_expenses,
        COALESCE(SUM(CASE WHEN NOT e.is_approved THEN e.amount ELSE 0 END), 0) as total_pending_expenses,
        COUNT(DISTINCT bc.id) as budget_categories_count,
        COUNT(e.id) as total_expenses
      FROM budget_categories bc
      LEFT JOIN expenses e ON bc.project_id = e.project_id
      WHERE bc.project_id = $1
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
  }

  static async getBudgetByCategory(projectId: string): Promise<any[]> {
    const query = `
      SELECT 
        bc.category,
        COALESCE(SUM(bc.budgeted_amount), 0) as total_budgeted,
        COALESCE(SUM(bc.actual_amount), 0) as total_actual,
        COALESCE(SUM(CASE WHEN e.is_approved THEN e.amount ELSE 0 END), 0) as approved_expenses,
        COUNT(DISTINCT bc.id) as categories_count,
        COUNT(e.id) as expenses_count
      FROM budget_categories bc
      LEFT JOIN expenses e ON bc.id = e.budget_category_id
      WHERE bc.project_id = $1
      GROUP BY bc.category
      ORDER BY bc.category
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }
}

export class ExpenseModel {
  static async findByProject(projectId: string): Promise<Expense[]> {
    const query = `
      SELECT e.*, 
             bc.name as budget_category_name,
             bc.category as budget_category_type,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM expenses e
      LEFT JOIN budget_categories bc ON e.budget_category_id = bc.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN users approver ON e.approved_by = approver.id
      WHERE e.project_id = $1
      ORDER BY e.expense_date DESC, e.created_at DESC
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async findById(id: string): Promise<Expense | null> {
    const query = `
      SELECT e.*, 
             bc.name as budget_category_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM expenses e
      LEFT JOIN budget_categories bc ON e.budget_category_id = bc.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN users approver ON e.approved_by = approver.id
      WHERE e.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(expenseData: any, userId: string): Promise<Expense> {
    const query = `
      INSERT INTO expenses (
        project_id, budget_category_id, user_id, vendor_name, description,
        amount, expense_date, receipt_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      expenseData.project_id,
      expenseData.budget_category_id,
      userId,
      expenseData.vendor_name,
      expenseData.description,
      expenseData.amount,
      expenseData.expense_date,
      expenseData.receipt_url
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const allowedFields = ['vendor_name', 'description', 'amount', 'expense_date', 'receipt_url'];
    const setFields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    setFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE expenses 
      SET ${setFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async approve(id: string, approvedBy: string): Promise<Expense | null> {
    const query = `
      UPDATE expenses 
      SET is_approved = true, approved_by = $2, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, approvedBy]);
    return result.rows[0] || null;
  }

  static async reject(id: string): Promise<Expense | null> {
    const query = `
      UPDATE expenses 
      SET is_approved = false, approved_by = NULL, approved_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM expenses WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findPendingApproval(companyId: string): Promise<Expense[]> {
    const query = `
      SELECT e.*, 
             bc.name as budget_category_name,
             p.name as project_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM expenses e
      LEFT JOIN budget_categories bc ON e.budget_category_id = bc.id
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE p.company_id = $1 AND e.is_approved = false AND e.approved_by IS NULL
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }

  static async findByUser(userId: string): Promise<Expense[]> {
    const query = `
      SELECT e.*, 
             bc.name as budget_category_name,
             p.name as project_name
      FROM expenses e
      LEFT JOIN budget_categories bc ON e.budget_category_id = bc.id
      LEFT JOIN projects p ON e.project_id = p.id
      WHERE e.user_id = $1
      ORDER BY e.expense_date DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}