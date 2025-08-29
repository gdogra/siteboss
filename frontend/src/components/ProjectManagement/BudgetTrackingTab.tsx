import React, { useState } from 'react';
import {
  PlusIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface BudgetCategory {
  id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  status: 'on_budget' | 'over_budget' | 'warning' | 'completed';
}

interface Expense {
  id: string;
  category_id: string;
  description: string;
  amount: number;
  date: string;
  vendor: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt_url?: string;
  created_by: string;
}

interface BudgetTrackingTabProps {
  projectId: string;
  totalBudget: number;
}

const BudgetTrackingTab: React.FC<BudgetTrackingTabProps> = ({ projectId, totalBudget }) => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Materials',
      allocated_amount: 150000,
      spent_amount: 125000,
      remaining_amount: 25000,
      percentage_used: 83.33,
      status: 'warning'
    },
    {
      id: '2',
      name: 'Labor',
      allocated_amount: 200000,
      spent_amount: 180000,
      remaining_amount: 20000,
      percentage_used: 90,
      status: 'warning'
    },
    {
      id: '3',
      name: 'Equipment',
      allocated_amount: 50000,
      spent_amount: 35000,
      remaining_amount: 15000,
      percentage_used: 70,
      status: 'on_budget'
    },
    {
      id: '4',
      name: 'Permits & Fees',
      allocated_amount: 15000,
      spent_amount: 15000,
      remaining_amount: 0,
      percentage_used: 100,
      status: 'completed'
    },
    {
      id: '5',
      name: 'Contingency',
      allocated_amount: 35000,
      spent_amount: 5000,
      remaining_amount: 30000,
      percentage_used: 14.29,
      status: 'on_budget'
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      category_id: '1',
      description: 'Steel beams delivery',
      amount: 25000,
      date: '2024-01-15',
      vendor: 'Steel Supply Co.',
      status: 'approved',
      created_by: 'John Smith'
    },
    {
      id: '2',
      category_id: '2',
      description: 'Weekly labor costs',
      amount: 12000,
      date: '2024-01-20',
      vendor: 'Construction Crew LLC',
      status: 'pending',
      created_by: 'Mike Johnson'
    },
    {
      id: '3',
      category_id: '3',
      description: 'Excavator rental',
      amount: 8000,
      date: '2024-01-18',
      vendor: 'Heavy Equipment Rental',
      status: 'approved',
      created_by: 'Sarah Wilson'
    }
  ]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', allocated_amount: 0 });
  const [newExpense, setNewExpense] = useState({
    category_id: '',
    description: '',
    amount: 0,
    date: '',
    vendor: '',
    status: 'pending' as const
  });

  const getCategoryStatusColor = (status: BudgetCategory['status']) => {
    switch (status) {
      case 'on_budget':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'over_budget':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpenseStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const budgetUtilization = (totalSpent / totalAllocated) * 100;

  const handleAddCategory = () => {
    const category: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      allocated_amount: newCategory.allocated_amount,
      spent_amount: 0,
      remaining_amount: newCategory.allocated_amount,
      percentage_used: 0,
      status: 'on_budget'
    };

    setBudgetCategories(prev => [...prev, category]);
    setNewCategory({ name: '', allocated_amount: 0 });
    setIsAddingCategory(false);
  };

  const handleAddExpense = () => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      ...newExpense,
      created_by: 'Current User'
    };

    setExpenses(prev => [...prev, expense]);
    setNewExpense({
      category_id: '',
      description: '',
      amount: 0,
      date: '',
      vendor: '',
      status: 'pending'
    });
    setIsAddingExpense(false);
  };

  const handleApproveExpense = (expenseId: string) => {
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === expenseId ? { ...exp, status: 'approved' as const } : exp
      )
    );
  };

  const handleRejectExpense = (expenseId: string) => {
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === expenseId ? { ...exp, status: 'rejected' as const } : exp
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Overall Budget Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Budget Tracking</h3>
          <p className="mt-1 text-sm text-gray-500">
            Monitor expenses and budget allocation across categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingExpense(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add Expense
          </button>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-lg font-semibold text-gray-900">
                ${totalBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-lg font-semibold text-gray-900">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingDownIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className="text-lg font-semibold text-gray-900">
                ${totalRemaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Utilization</p>
              <p className="text-lg font-semibold text-gray-900">
                {budgetUtilization.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      {isAddingCategory && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add Budget Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Materials, Labor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Allocated Amount</label>
              <input
                type="number"
                value={newCategory.allocated_amount || ''}
                onChange={(e) => setNewCategory(prev => ({ ...prev, allocated_amount: Number(e.target.value) }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Category
            </button>
            <button
              onClick={() => setIsAddingCategory(false)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      {isAddingExpense && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Expense</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newExpense.category_id}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category_id: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category</option>
                  {budgetCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={2}
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Expense description"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddExpense}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add Expense
              </button>
              <button
                onClick={() => setIsAddingExpense(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Categories */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Budget Categories</h4>
        <div className="space-y-4">
          {budgetCategories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h5 className="text-sm font-medium text-gray-900">{category.name}</h5>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStatusColor(category.status)}`}>
                    {category.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  ${category.spent_amount.toLocaleString()} / ${category.allocated_amount.toLocaleString()}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    category.percentage_used > 90 ? 'bg-red-500' :
                    category.percentage_used > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{category.percentage_used.toFixed(1)}% used</span>
                <span>${category.remaining_amount.toLocaleString()} remaining</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Expenses</h4>
        <div className="space-y-3">
          {expenses.map((expense) => {
            const category = budgetCategories.find(c => c.id === expense.category_id);
            return (
              <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h5 className="text-sm font-medium text-gray-900">{expense.description}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpenseStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {category?.name} • {expense.vendor} • {new Date(expense.date).toLocaleDateString()}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Submitted by: {expense.created_by}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">
                      ${expense.amount.toLocaleString()}
                    </span>
                    {expense.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApproveExpense(expense.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectExpense(expense.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start tracking expenses for this project.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetTrackingTab;