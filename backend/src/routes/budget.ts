import { Router } from 'express';
import { BudgetController, ExpenseController } from '../controllers/budget';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createExpenseSchema } from '../middleware/validation';

const router = Router();

// Budget Categories
router.get('/project/:projectId/categories', authenticate, BudgetController.getBudgetCategories);
router.get('/project/:projectId/summary', authenticate, BudgetController.getBudgetSummary);
router.get('/project/:projectId/breakdown', authenticate, BudgetController.getBudgetByCategory);

router.post('/project/:projectId/categories', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  BudgetController.createBudgetCategory
);

router.put('/categories/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  BudgetController.updateBudgetCategory
);

router.delete('/categories/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  BudgetController.deleteBudgetCategory
);

// Expenses
router.get('/expenses/pending', authenticate, ExpenseController.getPendingExpenses);
router.get('/expenses/my-expenses', authenticate, ExpenseController.getMyExpenses);
router.get('/project/:projectId/expenses', authenticate, ExpenseController.getExpenses);

router.post('/expenses', 
  authenticate, 
  validate(createExpenseSchema), 
  ExpenseController.createExpense
);

router.put('/expenses/:id', 
  authenticate, 
  ExpenseController.updateExpense
);

router.post('/expenses/:id/approve', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ExpenseController.approveExpense
);

router.post('/expenses/:id/reject', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ExpenseController.rejectExpense
);

router.delete('/expenses/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ExpenseController.deleteExpense
);

export default router;