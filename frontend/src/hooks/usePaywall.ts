import { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';

export interface PaywallFeature {
  id: string;
  name: string;
  description: string;
  requiredPlan: 'professional' | 'premium' | 'enterprise';
  category: 'analytics' | 'ai' | 'integrations' | 'automation' | 'reporting' | 'communication';
}

// Define all paywall features
export const PAYWALL_FEATURES: PaywallFeature[] = [
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Access detailed business intelligence with custom metrics, advanced charts, and predictive insights.',
    requiredPlan: 'professional',
    category: 'analytics'
  },
  {
    id: 'ai-insights',
    name: 'AI-Powered Business Insights',
    description: 'Get intelligent recommendations, lead scoring, and automated insights powered by machine learning.',
    requiredPlan: 'premium',
    category: 'ai'
  },
  {
    id: 'custom-reports',
    name: 'Custom Report Builder',
    description: 'Create custom reports with drag-and-drop interface and advanced filtering options.',
    requiredPlan: 'premium',
    category: 'reporting'
  },
  {
    id: 'workflow-automation',
    name: 'Advanced Workflow Automation',
    description: 'Automate complex business processes with custom triggers, conditions, and actions.',
    requiredPlan: 'premium',
    category: 'automation'
  },
  {
    id: 'premium-integrations',
    name: 'Premium Integrations',
    description: 'Connect with Salesforce, HubSpot, Zapier, and 50+ premium business tools.',
    requiredPlan: 'premium',
    category: 'integrations'
  },
  {
    id: 'video-calls',
    name: 'Video Call Integration',
    description: 'Built-in video calling with screen sharing, recording, and calendar integration.',
    requiredPlan: 'premium',
    category: 'communication'
  },
  {
    id: 'enterprise-ai',
    name: 'Enterprise AI & Machine Learning',
    description: 'Advanced AI models, custom training, and enterprise-grade machine learning capabilities.',
    requiredPlan: 'enterprise',
    category: 'ai'
  },
  {
    id: 'data-warehouse',
    name: 'Custom Data Warehouse Integration',
    description: 'Connect to your enterprise data warehouse with real-time sync and custom queries.',
    requiredPlan: 'enterprise',
    category: 'integrations'
  },
  {
    id: 'white-label',
    name: 'Multi-tenant White-label Solution',
    description: 'Complete white-label solution with custom branding, domains, and tenant management.',
    requiredPlan: 'enterprise',
    category: 'automation'
  },
  {
    id: 'mobile-app',
    name: 'Custom Mobile App Development',
    description: 'Get a custom-branded mobile app for iOS and Android with full CRM functionality.',
    requiredPlan: 'enterprise',
    category: 'automation'
  }
];

export const usePaywall = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [activePaywall, setActivePaywall] = useState<PaywallFeature | null>(null);

  const currentPlan = tenant?.subscription.plan || 'starter';
  
  // Admin users (super_admin and company_admin) have access to all features
  const isAdmin = user?.role === 'super_admin' || user?.role === 'company_admin';

  const hasFeatureAccess = (featureId: string): boolean => {
    // Admin users always have access to all features
    if (isAdmin) return true;
    
    const feature = PAYWALL_FEATURES.find(f => f.id === featureId);
    if (!feature) return true; // If feature not found, allow access

    const planHierarchy = ['starter', 'professional', 'premium', 'enterprise'];
    const currentPlanIndex = planHierarchy.indexOf(currentPlan);
    const requiredPlanIndex = planHierarchy.indexOf(feature.requiredPlan);

    return currentPlanIndex >= requiredPlanIndex;
  };

  const checkFeatureAccess = (featureId: string): boolean => {
    // Admin users always have access - no paywall shown
    if (isAdmin) return true;
    
    if (hasFeatureAccess(featureId)) {
      return true;
    }

    // Show paywall only for non-admin users
    const feature = PAYWALL_FEATURES.find(f => f.id === featureId);
    if (feature) {
      setActivePaywall(feature);
    }
    return false;
  };

  const closePaywall = () => {
    setActivePaywall(null);
  };

  const getFeaturesByPlan = (plan: string): PaywallFeature[] => {
    const planHierarchy = ['starter', 'professional', 'premium', 'enterprise'];
    const planIndex = planHierarchy.indexOf(plan);
    
    return PAYWALL_FEATURES.filter(feature => {
      const requiredPlanIndex = planHierarchy.indexOf(feature.requiredPlan);
      return requiredPlanIndex <= planIndex;
    });
  };

  const getUpgradeRequiredFeatures = (): PaywallFeature[] => {
    return PAYWALL_FEATURES.filter(feature => !hasFeatureAccess(feature.id));
  };

  const getPlanFeatures = (plan: 'professional' | 'premium' | 'enterprise'): PaywallFeature[] => {
    return PAYWALL_FEATURES.filter(feature => feature.requiredPlan === plan);
  };

  return {
    hasFeatureAccess,
    checkFeatureAccess,
    activePaywall,
    closePaywall,
    getFeaturesByPlan,
    getUpgradeRequiredFeatures,
    getPlanFeatures,
    currentPlan,
    PAYWALL_FEATURES
  };
};