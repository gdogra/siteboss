import React from 'react';
import {
  XMarkIcon,
  StarIcon,
  ArrowRightIcon,
  CheckIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { useTenant } from '../../contexts/TenantContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: 'professional' | 'premium' | 'enterprise';
  description?: string;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature,
  requiredPlan,
  description
}) => {
  const { tenant } = useTenant();

  if (!isOpen) return null;

  const planDetails = {
    professional: {
      name: 'Professional',
      price: '$79/month',
      color: 'purple',
      features: [
        'Advanced Analytics',
        'AI Assistant',
        'API Access',
        'Priority Support'
      ]
    },
    premium: {
      name: 'Premium',
      price: '$199/month',
      color: 'blue',
      features: [
        'Advanced AI Insights & Predictions',
        'Custom Workflow Automation',
        'Premium Integrations (Salesforce, HubSpot)',
        'Advanced Lead Scoring & Attribution',
        'Custom Dashboard Builder',
        'Video Call Integration'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: '$299/month',
      color: 'gold',
      features: [
        'Enterprise AI & Machine Learning',
        'Custom Data Warehouse Integration',
        'Advanced Security & Compliance',
        'Multi-tenant White-label Solution',
        'Custom Mobile App Development',
        'Dedicated Account Manager'
      ]
    }
  };

  const plan = planDetails[requiredPlan];
  const currentPlan = tenant?.subscription.plan || 'starter';

  const handleUpgrade = () => {
    // In real implementation, this would redirect to billing page or open upgrade flow
    window.location.href = '/subscription-plans';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${
          plan.color === 'purple' ? 'from-purple-600 to-purple-700' :
          plan.color === 'blue' ? 'from-blue-600 to-blue-700' :
          'from-yellow-500 to-yellow-600'
        } p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <LockClosedIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Premium Feature</h2>
              <p className="text-sm opacity-90">Upgrade to unlock</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Feature Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature}</h3>
            <p className="text-gray-600 text-sm">
              {description || `This feature requires a ${plan.name} subscription or higher to access.`}
            </p>
          </div>

          {/* Current vs Required Plan */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="font-medium text-gray-900 capitalize">{currentPlan}</p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Required Plan</p>
                <p className={`font-medium ${
                  plan.color === 'purple' ? 'text-purple-600' :
                  plan.color === 'blue' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>{plan.name}</p>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">
              What you'll get with {plan.name}:
            </h4>
            <ul className="space-y-2">
              {plan.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
              {plan.features.length > 4 && (
                <li className="text-sm text-gray-500 ml-6">
                  + {plan.features.length - 4} more features
                </li>
              )}
            </ul>
          </div>

          {/* Pricing */}
          <div className="mb-6 text-center">
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">{plan.price.split('/')[0]}</span>
              <span className="text-gray-600">/{plan.price.split('/')[1]}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Billed monthly • Cancel anytime
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                plan.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                plan.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              Upgrade to {plan.name}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ✨ First month free on all plans • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;