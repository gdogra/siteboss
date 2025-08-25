import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { Expense } from '../../types';
import BudgetCategoryCard from './BudgetCategoryCard';
import ExpenseModal from './ExpenseModal';
import BudgetAnalytics from './BudgetAnalytics';

interface BudgetCategory {
  id: string;
  project_id: string;
  name: string;
  category: 'labor' | 'materials' | 'equipment' | 'permits' | 'subcontractor' | 'overhead' | 'other';
  budgeted_amount: number;
  actual_amount: number;
  created_at: string;
  updated_at: string;
}


interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  variancePercentage: number;
  categoriesOverBudget: number;
  pendingExpenses: number;
  approvalRequired: number;
}

const BudgetManagement: React.FC = () => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'categories' | 'expenses' | 'analytics'>('overview');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBudgetData();
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      // Mock projects data
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Downtown Office Building',
          description: 'Construction of 15-story office building'
        },
        {
          id: 'project-2',
          name: 'Residential Complex',
          description: '50-unit residential development'
        },
        {
          id: 'project-3',
          name: 'Shopping Mall Renovation',
          description: 'Complete renovation of existing mall'
        }
      ];
      
      setProjects(mockProjects);
      if (mockProjects.length > 0) {
        setSelectedProjectId(mockProjects[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      // Mock data for budget categories
      const mockCategories: BudgetCategory[] = [
        {
          id: '1',
          name: 'Materials',
          category: 'materials',
          budgeted_amount: 50000,
          actual_amount: 42000,
          project_id: selectedProjectId,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          name: 'Labor',
          category: 'labor',
          budgeted_amount: 80000,
          actual_amount: 65000,
          project_id: selectedProjectId,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '3',
          name: 'Equipment',
          category: 'equipment',
          budgeted_amount: 25000,
          actual_amount: 18000,
          project_id: selectedProjectId,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '4',
          name: 'Permits & Licenses',
          category: 'permits',
          budgeted_amount: 5000,
          actual_amount: 4500,
          project_id: selectedProjectId,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ] as BudgetCategory[];

      // Mock data for expenses
      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Steel beams and structural materials',
          amount: 15000,
          budget_category_id: '1',
          project_id: selectedProjectId,
          vendor_name: 'Steel Supply Co.',
          expense_date: new Date('2024-01-10'),
          is_approved: true,
          approved_by: 'John Manager',
          approved_at: new Date('2024-01-11'),
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-11')
        },
        {
          id: '2',
          description: 'Construction crew wages',
          amount: 22000,
          budget_category_id: '2',
          project_id: selectedProjectId,
          vendor_name: 'ABC Construction',
          expense_date: new Date('2024-01-15'),
          is_approved: true,
          approved_by: 'John Manager',
          approved_at: new Date('2024-01-16'),
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-16')
        },
        {
          id: '3',
          description: 'Excavator rental',
          amount: 8000,
          budget_category_id: '3',
          project_id: selectedProjectId,
          vendor_name: 'Heavy Equipment Rentals',
          expense_date: new Date('2024-01-12'),
          is_approved: false,
          created_at: new Date('2024-01-12'),
          updated_at: new Date('2024-01-12')
        }
      ] as Expense[];
      
      setBudgetCategories(mockCategories);
      setExpenses(mockExpenses);
      calculateSummary(mockCategories, mockExpenses);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (categories: BudgetCategory[], expensesList: Expense[]) => {
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0);
    const totalSpent = expensesList
      .filter(exp => exp.is_approved)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const totalRemaining = totalBudget - totalSpent;
    const variancePercentage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100) - 100 : 0;
    const categoriesOverBudget = categories.filter(cat => cat.actual_amount > cat.budgeted_amount).length;
    const pendingExpenses = expensesList.filter(exp => !exp.is_approved).length;
    
    setSummary({
      totalBudget,
      totalSpent,
      totalRemaining,
      variancePercentage,
      categoriesOverBudget,
      pendingExpenses,
      approvalRequired: pendingExpenses
    });
  };

  const handleAddExpense = (categoryId?: string) => {
    setSelectedCategoryId(categoryId || '');
    setIsExpenseModalOpen(true);
  };

  const handleExpenseAdded = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
    setIsExpenseModalOpen(false);
    fetchBudgetData(); // Refresh to update calculations
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      labor: 'bg-blue-100 text-blue-800',
      materials: 'bg-green-100 text-green-800',
      equipment: 'bg-yellow-100 text-yellow-800',
      permits: 'bg-purple-100 text-purple-800',
      subcontractor: 'bg-indigo-100 text-indigo-800',
      overhead: 'bg-gray-100 text-gray-800',
      other: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${summary.totalBudget.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className={`h-6 w-6 ${summary.variancePercentage > 0 ? 'text-red-400' : 'text-green-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${summary.totalSpent.toLocaleString()}
                    </dd>
                    <dd className={`text-sm ${summary.variancePercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {summary.variancePercentage > 0 && '+'}
                      {summary.variancePercentage.toFixed(1)}% variance
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className={`h-6 w-6 ${summary.totalRemaining < 0 ? 'text-red-400' : 'text-green-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Remaining</dt>
                    <dd className={`text-lg font-medium ${summary.totalRemaining < 0 ? 'text-red-900' : 'text-gray-900'}`}>
                      ${Math.abs(summary.totalRemaining).toLocaleString()}
                      {summary.totalRemaining < 0 && ' over'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className={`h-6 w-6 ${summary.approvalRequired > 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.approvalRequired}
                    </dd>
                    <dd className="text-sm text-gray-500">expenses</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Progress */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
        {summary && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">Budget Utilization</span>
                <span className={summary.variancePercentage > 10 ? 'text-red-600' : 'text-gray-900'}>
                  {((summary.totalSpent / summary.totalBudget) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    summary.variancePercentage > 10 ? 'bg-red-500' : 
                    summary.variancePercentage > 0 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((summary.totalSpent / summary.totalBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
            <button
              onClick={() => handleAddExpense()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>
        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {expenses.slice(0, 5).map((expense) => (
              <li key={expense.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        expense.is_approved ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <CurrencyDollarIcon className={`w-4 h-4 ${
                          expense.is_approved ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {expense.vendor_name} • {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      ${expense.amount.toLocaleString()}
                    </span>
                    {!expense.is_approved && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {expenses.length > 5 && (
          <div className="bg-gray-50 px-6 py-3">
            <button
              onClick={() => setViewMode('expenses')}
              className="text-sm text-primary-600 hover:text-primary-900"
            >
              View all {expenses.length} expenses →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track project budgets, expenses, and cost control
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* Project Selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
          >
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            )) || []}
          </select>

          <button
            onClick={() => handleAddExpense()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'categories', label: 'Categories', icon: CurrencyDollarIcon },
            { key: 'expenses', label: 'Expenses', icon: DocumentIcon },
            { key: 'analytics', label: 'Analytics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as any)}
              className={`${
                viewMode === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {viewMode === 'overview' && renderOverview()}
      
      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetCategories.map((category) => (
            <BudgetCategoryCard
              key={category.id}
              category={category}
              onAddExpense={() => handleAddExpense(category.id)}
            />
          ))}
        </div>
      )}

      {viewMode === 'expenses' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => {
                  const category = budgetCategories.find(cat => cat.id === expense.budget_category_id);
                  return (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                          {expense.vendor_name && (
                            <div className="text-sm text-gray-500">{expense.vendor_name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category.category)}`}>
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expense.is_approved 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && summary && (
        <BudgetAnalytics 
          categories={budgetCategories}
          expenses={expenses}
          summary={summary}
        />
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
        projectId={selectedProjectId}
        categoryId={selectedCategoryId}
        categories={budgetCategories}
      />
    </div>
  );
};

export default BudgetManagement;