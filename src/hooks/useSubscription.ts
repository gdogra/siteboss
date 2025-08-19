
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  plan_code: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  trial_days: number;
  max_users: number;
  max_projects: number;
  storage_gb: number;
  api_calls_per_month: number;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  id: number;
  user_id: number;
  subscription_plan_id: number;
  status: string;
  billing_cycle: string;
  started_at: string;
  ends_at: string;
  trial_starts_at: string;
  trial_ends_at: string;
  is_trial: boolean;
  auto_renew: boolean;
  next_billing_date: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  hasFeatureAccess: (featureKey: string) => boolean;
  isTrialActive: () => boolean;
  daysLeftInTrial: () => number;
  canUpgrade: () => boolean;
  canDowngrade: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  plans: [],
  loading: true,
  refreshSubscription: async () => {},
  hasFeatureAccess: () => false,
  isTrialActive: () => false,
  daysLeftInTrial: () => 0,
  canUpgrade: () => false,
  canDowngrade: () => false
});

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const useSubscriptionManager = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);

      // Load user info to get user ID
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw userError;

      // Load subscription plans
      const { data: plansData, error: plansError } = await window.ezsite.apis.tablePage('35510', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'sort_order',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });
      if (plansError) throw plansError;

      setPlans(plansData.List.map((plan: any) => ({
        ...plan,
        features: JSON.parse(plan.features || '[]')
      })));

      // Load user subscription
      if (userInfo?.ID) {
        const { data: subscriptionData, error: subscriptionError } = await window.ezsite.apis.tablePage('35511', {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'created_at',
          IsAsc: false,
          Filters: [
          { name: 'user_id', op: 'Equal', value: userInfo.ID },
          { name: 'status', op: 'StringContains', value: 'active,trial,paused' }]

        });

        if (subscriptionError) throw subscriptionError;
        if (subscriptionData.List.length > 0) {
          setSubscription(subscriptionData.List[0]);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (featureKey: string): boolean => {
    if (!subscription) return false;

    // Always allow access during trial
    if (subscription.is_trial && isTrialActive()) return true;

    // Check plan features
    const currentPlan = plans.find((p) => p.id === subscription.subscription_plan_id);
    if (!currentPlan) return false;

    return currentPlan.features.includes(featureKey);
  };

  const isTrialActive = (): boolean => {
    if (!subscription || !subscription.is_trial) return false;

    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    return now < trialEnd;
  };

  const daysLeftInTrial = (): number => {
    if (!subscription || !subscription.is_trial) return 0;

    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const canUpgrade = (): boolean => {
    if (!subscription) return true;

    const currentPlan = plans.find((p) => p.id === subscription.subscription_plan_id);
    if (!currentPlan) return true;

    // Can upgrade if there's a higher-priced plan available
    return plans.some((p) => p.price_monthly > currentPlan.price_monthly);
  };

  const canDowngrade = (): boolean => {
    if (!subscription) return false;

    const currentPlan = plans.find((p) => p.id === subscription.subscription_plan_id);
    if (!currentPlan) return false;

    // Can downgrade if there's a lower-priced plan available
    return plans.some((p) => p.price_monthly < currentPlan.price_monthly);
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  return {
    subscription,
    plans,
    loading,
    refreshSubscription: loadSubscriptionData,
    hasFeatureAccess,
    isTrialActive,
    daysLeftInTrial,
    canUpgrade,
    canDowngrade
  };
};

export { SubscriptionContext };
export type { SubscriptionPlan, UserSubscription, SubscriptionContextType };