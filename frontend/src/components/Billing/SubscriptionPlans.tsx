import React, { useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CloudIcon,
  BoltIcon,
  ShieldCheckIcon,
  CogIcon,
  StarIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useTenant } from '../../contexts/TenantContext';

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  popular: boolean;
  firstMonthFree?: boolean;
  features: PlanFeature[];
  limits: {
    users: number;
    leads: number;
    deals: number;
    storage: number;
  };
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams just getting started',
    price: {
      monthly: 29,
      yearly: 290
    },
    popular: false,
    features: [
      { name: 'Lead Management', included: true },
      { name: 'Basic Pipeline', included: true },
      { name: 'Email Integration', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'AI Assistant', included: false },
      { name: 'Advanced Analytics', included: false },
      { name: 'Custom Reports', included: false },
      { name: 'API Access', included: false },
      { name: 'White Labeling', included: false },
      { name: 'Priority Support', included: false }
    ],
    limits: {
      users: 5,
      leads: 1000,
      deals: 100,
      storage: 5
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams that need more power',
    price: {
      monthly: 79,
      yearly: 790
    },
    popular: true,
    firstMonthFree: true,
    features: [
      { name: 'Lead Management', included: true },
      { name: 'Advanced Pipeline', included: true },
      { name: 'Email & SMS Integration', included: true },
      { name: 'Advanced Reports', included: true },
      { name: 'AI Assistant', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Custom Reports', included: false },
      { name: 'API Access', included: true },
      { name: 'White Labeling', included: false },
      { name: 'Priority Support', included: true }
    ],
    limits: {
      users: 25,
      leads: 10000,
      deals: 1000,
      storage: 50
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features with premium integrations',
    price: {
      monthly: 199,
      yearly: 1990
    },
    popular: false,
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'Advanced AI Insights & Predictions', included: true },
      { name: 'Custom Workflow Automation', included: true },
      { name: 'Premium Integrations (Salesforce, HubSpot)', included: true },
      { name: 'Advanced Lead Scoring & Attribution', included: true },
      { name: 'Custom Dashboard Builder', included: true },
      { name: 'Video Call Integration', included: true },
      { name: 'Advanced Team Analytics', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Custom Branding', included: true }
    ],
    limits: {
      users: 50,
      leads: 50000,
      deals: 5000,
      storage: 200
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Ultimate solution with all premium features',
    price: {
      monthly: 299,
      yearly: 2990
    },
    popular: false,
    features: [
      { name: 'Everything in Premium', included: true },
      { name: 'Enterprise AI & Machine Learning', included: true },
      { name: 'Custom Data Warehouse Integration', included: true },
      { name: 'Advanced Security & Compliance (SOC2, GDPR)', included: true },
      { name: 'Multi-tenant White-label Solution', included: true },
      { name: 'Custom Mobile App Development', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Custom SLA & Support', included: true },
      { name: 'On-premise Deployment Options', included: true },
      { name: 'Advanced Backup & Disaster Recovery', included: true }
    ],
    limits: {
      users: -1, // Unlimited
      leads: -1,
      deals: -1,
      storage: 500
    }
  }
];

const SubscriptionPlans: React.FC = () => {
  const { tenant } = useTenant();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatLimit = (limit: number): string => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  };

  const getYearlySavings = (plan: Plan): number => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    return ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
  };

  const handlePlanSelect = async (planId: string) => {
    try {
      setIsLoading(planId);
      
      // In a real implementation, this would integrate with Stripe, Paddle, etc.
      console.log(`Upgrading to ${planId} plan with ${billingCycle} billing`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to payment processor or show success
      alert(`Plan upgrade initiated for ${planId}!`);
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const currentPlan = tenant?.subscription.plan;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Scale your CRM with plans designed for teams of every size. 
          All plans include our core features with advanced capabilities as you grow.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
          </button>
        </div>
        {billingCycle === 'yearly' && (
          <div className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Save up to 17%
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const savings = billingCycle === 'yearly' ? getYearlySavings(plan) : 0;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all ${
                plan.popular
                  ? 'border-primary-500 ring-1 ring-primary-500'
                  : isCurrentPlan
                  ? 'border-green-500 ring-1 ring-green-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <StarIcon className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{formatPrice(price)}</span>
                    <span className="text-gray-600 ml-2">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  
                  {billingCycle === 'yearly' && savings > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      Save {savings.toFixed(0)}% with yearly billing
                    </p>
                  )}
                </div>

                {/* Usage Limits */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Included:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatLimit(plan.limits.users)} users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChartBarIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatLimit(plan.limits.leads)} leads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatLimit(plan.limits.deals)} deals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CloudIcon className="h-4 w-4 text-gray-400" />
                      <span>{plan.limits.storage}GB storage</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        {feature.included ? (
                          <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.name}
                          {feature.limit && <span className="text-gray-500"> ({feature.limit})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan || isLoading === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  } ${isLoading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading === plan.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    `Get Started with ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate any billing adjustments.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What happens to my data if I downgrade?</h3>
            <p className="text-gray-600 text-sm">
              Your data is always safe. If you exceed the limits of a lower plan, 
              we'll help you manage the transition without losing any information.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Do you offer custom enterprise plans?</h3>
            <p className="text-gray-600 text-sm">
              Absolutely! For organizations with unique needs, we offer custom enterprise solutions. 
              Contact our sales team to discuss your requirements.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600 text-sm">
              Yes, we offer a 14-day free trial of our Professional plan so you can explore 
              all features before making a commitment.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Need something more?</h2>
        <p className="mb-6 opacity-90">
          Our Enterprise plan includes everything you need to scale your business, 
          plus dedicated support and custom integrations.
        </p>
        <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;