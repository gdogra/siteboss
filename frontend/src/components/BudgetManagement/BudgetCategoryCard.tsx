import React from 'react';
import { 
  CurrencyDollarIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

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

interface BudgetCategoryCardProps {
  category: BudgetCategory;
  onAddExpense: () => void;
}

const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({ category, onAddExpense }) => {
  const remaining = category.budgeted_amount - category.actual_amount;
  const utilizationPercentage = category.budgeted_amount > 0 
    ? (category.actual_amount / category.budgeted_amount) * 100 
    : 0;
  const isOverBudget = category.actual_amount > category.budgeted_amount;
  
  const getCategoryColor = (categoryType: string): string => {
    const colors = {
      labor: 'bg-blue-500',
      materials: 'bg-green-500',
      equipment: 'bg-yellow-500',
      permits: 'bg-purple-500',
      subcontractor: 'bg-indigo-500',
      overhead: 'bg-gray-500',
      other: 'bg-pink-500'
    };
    return colors[categoryType as keyof typeof colors] || colors.other;
  };

  const getCategoryIcon = (categoryType: string): string => {
    const icons = {
      labor: '👷',
      materials: '🏗️',
      equipment: '🚛',
      permits: '📋',
      subcontractor: '🤝',
      overhead: '🏢',
      other: '📦'
    };
    return icons[categoryType as keyof typeof icons] || icons.other;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg ${getCategoryColor(category.category)} flex items-center justify-center text-white text-lg`}>
              {getCategoryIcon(category.category)}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{category.category.replace('_', ' ')}</p>
            </div>
          </div>
          
          {isOverBudget && (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>

        {/* Budget Overview */}
        <div className="space-y-3">
          {/* Amounts */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Budgeted</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(category.budgeted_amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Spent</span>
            <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(category.actual_amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Remaining</span>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${
                remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(Math.abs(remaining))}
                {remaining < 0 && ' over'}
              </span>
              {remaining < 0 ? (
                <ArrowUpIcon className="ml-1 h-4 w-4 text-red-500" />
              ) : (
                <ArrowDownIcon className="ml-1 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Utilization</span>
              <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
                {utilizationPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverBudget 
                    ? 'bg-red-500' 
                    : utilizationPercentage > 80 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(utilizationPercentage, 100)}%`
                }}
              />
              {/* Over-budget indicator */}
              {isOverBudget && utilizationPercentage > 100 && (
                <div className="relative">
                  <div 
                    className="absolute top-0 h-2 bg-red-600 opacity-50"
                    style={{
                      width: `${Math.min(utilizationPercentage - 100, 20)}%`,
                      left: '100%',
                      marginLeft: '-2px'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Variance Alert */}
          {isOverBudget && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-xs text-red-700">
                  Over budget by {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </div>
          )}

          {/* Near Budget Alert */}
          {!isOverBudget && utilizationPercentage > 90 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-xs text-yellow-700">
                  Only {formatCurrency(remaining)} remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onAddExpense}
            className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetCategoryCard;