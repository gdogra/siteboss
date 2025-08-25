import React from 'react';
import {
  LockClosedIcon,
  StarIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { usePaywall } from '../../hooks/usePaywall';

interface PremiumFeatureProps {
  featureId: string;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  showUpgradeButton?: boolean;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  featureId,
  children,
  fallback,
  className = '',
  showUpgradeButton = true
}) => {
  const { hasFeatureAccess, checkFeatureAccess, PAYWALL_FEATURES } = usePaywall();

  const feature = PAYWALL_FEATURES.find(f => f.id === featureId);
  const hasAccess = hasFeatureAccess(featureId);

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkFeatureAccess(featureId);
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state UI
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="relative overflow-hidden">
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center p-6 max-w-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <LockClosedIcon className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature?.name || 'Premium Feature'}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {feature?.description || 'This feature requires a premium subscription.'}
            </p>

            {showUpgradeButton && (
              <button
                onClick={handleUpgradeClick}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <StarIcon className="h-4 w-4" />
                <span>Upgrade to {feature?.requiredPlan || 'Premium'}</span>
                <ArrowUpRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeature;