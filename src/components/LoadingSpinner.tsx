import React from 'react';
import { Clock } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Clock className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <p className="text-gray-600">{message}</p>
    </div>);

};

export default LoadingSpinner;