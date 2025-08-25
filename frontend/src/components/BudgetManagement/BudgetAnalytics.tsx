import React from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Expense } from '../../types';

interface BudgetCategory {
  id: string;
  name: string;
  category: string;
  budgeted_amount: number;
  actual_amount: number;
}


interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  variancePercentage: number;
  categoriesOverBudget: number;
}

interface BudgetAnalyticsProps {
  categories: BudgetCategory[];
  expenses: Expense[];
  summary: BudgetSummary;
}

const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({ categories, expenses, summary }) => {
  // Calculate spending by category
  const categorySpending = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.budget_category_id === category.id && exp.is_approved);
    const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const variance = totalSpent - category.budgeted_amount;
    const variancePercentage = category.budgeted_amount > 0 ? (variance / category.budgeted_amount) * 100 : 0;
    
    return {
      ...category,
      totalSpent,
      variance,
      variancePercentage,
      utilizationPercentage: category.budgeted_amount > 0 ? (totalSpent / category.budgeted_amount) * 100 : 0
    };
  }).sort((a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage));

  // Calculate monthly spending trend
  const monthlySpending = expenses
    .filter(exp => exp.is_approved)
    .reduce((acc, expense) => {
      const month = new Date(expense.expense_date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlySpending)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6); // Last 6 months

  // Top spending categories
  const topCategories = categories
    .map(cat => ({
      name: cat.name,
      spent: expenses
        .filter(exp => exp.budget_category_id === cat.id && exp.is_approved)
        .reduce((sum, exp) => sum + exp.amount, 0)
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr: string): string => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className={`h-6 w-6 ${
                summary.variancePercentage > 0 ? 'text-red-500' : 'text-green-500'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget Variance</p>
              <div className="flex items-center">
                <p className={`text-2xl font-semibold ${
                  summary.variancePercentage > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {summary.variancePercentage > 0 ? '+' : ''}{summary.variancePercentage.toFixed(1)}%
                </p>
                {summary.variancePercentage > 0 ? (
                  <ArrowTrendingUpIcon className="ml-2 h-5 w-5 text-red-500" />
                ) : (
                  <ArrowTrendingDownIcon className="ml-2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className={`h-6 w-6 ${
                summary.categoriesOverBudget > 0 ? 'text-yellow-500' : 'text-gray-400'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories Over Budget</p>
              <p className={`text-2xl font-semibold ${
                summary.categoriesOverBudget > 0 ? 'text-yellow-600' : 'text-gray-900'
              }`}>
                {summary.categoriesOverBudget}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget Utilization</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.totalBudget > 0 ? ((summary.totalSpent / summary.totalBudget) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Category Performance</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {categorySpending.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        {formatCurrency(category.totalSpent)} / {formatCurrency(category.budgeted_amount)}
                      </span>
                      <span className={`font-medium ${
                        category.variancePercentage > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {category.variancePercentage > 0 ? '+' : ''}{category.variancePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        category.utilizationPercentage > 100 
                          ? 'bg-red-500' 
                          : category.utilizationPercentage > 80 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(category.utilizationPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Utilization: {category.utilizationPercentage.toFixed(1)}%</span>
                    {category.variance !== 0 && (
                      <span className={category.variance > 0 ? 'text-red-500' : 'text-green-500'}>
                        {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)} variance
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monthly Spending Trend</h3>
        </div>
        <div className="p-6">
          {monthlyData.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.map(([month, amount]) => {
                const maxAmount = Math.max(...monthlyData.map(([, amt]) => amt));
                const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={month} className="flex items-center">
                    <div className="w-20 text-sm text-gray-500">
                      {formatMonth(month)}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                          <div
                            className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-24 text-right">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No spending data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Spending Categories</h3>
        </div>
        <div className="p-6">
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map((category, index) => {
                const maxSpent = Math.max(...topCategories.map(cat => cat.spent));
                const percentage = maxSpent > 0 ? (category.spent / maxSpent) * 100 : 0;
                
                return (
                  <div key={category.name} className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-500">{formatCurrency(category.spent)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No spending data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {summary.categoriesOverBudget > 0 && (
              <div className="flex p-4 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Budget Overruns Detected</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {summary.categoriesOverBudget} categories are over budget. Review and adjust spending or request budget increases.
                  </p>
                </div>
              </div>
            )}
            
            {summary.variancePercentage > 10 && (
              <div className="flex p-4 bg-yellow-50 rounded-lg">
                <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">High Budget Variance</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Current spending is {summary.variancePercentage.toFixed(1)}% over budget. Consider implementing cost control measures.
                  </p>
                </div>
              </div>
            )}

            {summary.variancePercentage < -20 && (
              <div className="flex p-4 bg-blue-50 rounded-lg">
                <ArrowTrendingDownIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Under Budget Performance</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Spending is significantly under budget. Consider reallocating funds or accelerating project activities.
                  </p>
                </div>
              </div>
            )}

            {summary.categoriesOverBudget === 0 && Math.abs(summary.variancePercentage) <= 10 && (
              <div className="flex p-4 bg-green-50 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">On Track</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Budget performance is on track. Continue monitoring and maintain current spending patterns.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalytics;