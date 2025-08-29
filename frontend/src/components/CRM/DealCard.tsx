import React from 'react';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  EllipsisVerticalIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  probability: number;
  stage: string;
  expected_close_date: Date;
  assigned_to: string;
  created_at: Date;
  description: string;
  last_activity?: Date;
}

interface DealCardProps {
  deal: Deal;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onEmail: (deal: Deal) => void;
  onSMS: (deal: Deal) => void;
  isDragging?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  onEdit,
  onDelete,
  onView,
  onEmail,
  onSMS,
  isDragging = false
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getProbabilityColor = (probability: number): string => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-100';
    if (probability >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getDateColor = (date: Date): string => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600'; // Overdue
    if (diffDays <= 7) return 'text-orange-600'; // Due soon
    return 'text-gray-600'; // Normal
  };

  const getDaysOld = (date: Date): number => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 transform rotate-2 scale-105' : ''
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Header */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 truncate mb-1" title={deal.title}>
          {deal.title}
        </h4>
        <p className="text-xs text-gray-500 truncate" title={deal.customer}>
          {deal.customer}
        </p>
      </div>

      {/* Value */}
      <div className="flex items-center justify-center mb-3 py-2 bg-green-50 rounded">
        <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1" />
        <span className="text-base font-semibold text-green-700">{formatCurrency(deal.value)}</span>
      </div>

      {/* Key Info */}
      <div className="space-y-2 mb-3">
        {/* Probability */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Win Rate:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(deal.probability)}`}>
            {deal.probability}%
          </span>
        </div>

        {/* Close Date */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Close:</span>
          <span className={`text-xs font-medium ${getDateColor(deal.expected_close_date)}`}>
            {formatDate(deal.expected_close_date)}
          </span>
        </div>

        {/* Assigned To */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Owner:</span>
          <span className="text-xs text-gray-900 font-medium truncate ml-1" title={deal.assigned_to}>
            {deal.assigned_to}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-1 mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEmail(deal);
            }}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 px-2 rounded transition-colors"
            title="Send Email"
          >
            📧 Email
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSMS(deal);
            }}
            className="text-xs bg-green-50 text-green-600 hover:bg-green-100 py-1 px-2 rounded transition-colors"
            title="Send SMS"
          >
            📱 SMS
          </button>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
          >
            View
          </button>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;