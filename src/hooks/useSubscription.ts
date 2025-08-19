import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  plan_code: string;
  plan_description: string;
  price: number;
  currency: string;
  trial_period_days: number;
  max_users: number;
  max_projects: number;
  max_storage_gb: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  is_trial: boolean;
  start_date: string;
  trial_start: string;
  trial_end: string;
  amount: number;
  currency: string;
  next_billing_date: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
}

interface TrialData {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  extended_days: number;
  converted_to_paid: boolean;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  trial: TrialData | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  hasFeatureAccess: (featureKey: string) => boolean;
  isTrialActive: () => boolean;
  daysLeftInTrial: () => number;
  canUpgrade: () => boolean;
  canDowngrade: () => boolean;
  currentPlan: SubscriptionPlan | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  trial: null,
  plans: [],
  loading: true,
  refreshSubscription: async () => {},
  hasFeatureAccess: () => false,
  isTrialActive: () => false,
  daysLeftInTrial: () => 0,
  canUpgrade: () => false,
  canDowngrade: () => false,
  currentPlan: null
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
  const [trial, setTrial] = useState<TrialData | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);

      // Load user info to get user ID
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw userError;

      // Load subscription plans using correct table ID
      const { data: plansData, error: plansError } = await window.ezsite.apis.tablePage('35510', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'sort_order',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });
      if (plansError) throw plansError;

      setPlans(plansData.List.map((plan: any) => ({
        ...plan,
        features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : plan.features || []
      })));

      // Load user subscription using correct table ID and field names
      if (userInfo?.ID) {
        const { data: subscriptionData, error: subscriptionError } = await window.ezsite.apis.tablePage('35511', {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'created_at',
          IsAsc: false,
          Filters: [
            { name: 'user_id', op: 'Equal', value: userInfo.ID },
            { name: 'status', op: 'StringContains', value: 'active,trial,paused' }
          ]
        });

        if (subscriptionError) throw subscriptionError;
        if (subscriptionData.List.length > 0) {
          setSubscription(subscriptionData.List[0]);
        }

        // Load trial data using correct table ID  
        const { data: trialData, error: trialError } = await window.ezsite.apis.tablePage('35515', {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'created_at',
          IsAsc: false,
          Filters: [
            { name: 'user_id', op: 'Equal', value: userInfo.ID },
            { name: 'status', op: 'Equal', value: 'active' }
          ]
        });

        if (trialError) throw trialError;
        if (trialData.List.length > 0) {
          setTrial(trialData.List[0]);
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

  const getCurrentPlan = (): SubscriptionPlan | null => {
    if (!subscription) return null;
    return plans.find((p) => p.id === subscription.plan_id) || null;
  };

  const hasFeatureAccess = (featureKey: string): boolean => {
    if (!subscription) return false;

    // Always allow access during active trial
    if (subscription.is_trial && isTrialActive()) return true;

    // Check plan features
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return false;

    return currentPlan.features.includes(featureKey);
  };

  const isTrialActive = (): boolean => {
    if (!trial || trial.status !== 'active') return false;

    const now = new Date();
    const trialEnd = new Date(trial.end_date);
    return now < trialEnd;
  };

  const daysLeftInTrial = (): number => {
    if (!trial || trial.status !== 'active') return 0;

    const now = new Date();
    const trialEnd = new Date(trial.end_date);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const canUpgrade = (): boolean => {
    if (!subscription) return true;

    const currentPlan = getCurrentPlan();
    if (!currentPlan) return true;

    // Can upgrade if there's a higher-priced plan available
    return plans.some((p) => p.price > currentPlan.price);
  };

  const canDowngrade = (): boolean => {
    if (!subscription) return false;

    const currentPlan = getCurrentPlan();
    if (!currentPlan) return false;

    // Can downgrade if there's a lower-priced plan available
    return plans.some((p) => p.price < currentPlan.price && p.price > 0);
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  return {
    subscription,
    trial,
    plans,
    loading,
    refreshSubscription: loadSubscriptionData,
    hasFeatureAccess,
    isTrialActive,
    daysLeftInTrial,
    canUpgrade,
    canDowngrade,
    currentPlan: getCurrentPlan()
  };
};

export { SubscriptionContext };
export type { SubscriptionPlan, UserSubscription, SubscriptionContextType };