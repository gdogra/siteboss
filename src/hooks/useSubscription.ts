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
  error: string | null;
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
  error: null,
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
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptionData = async () => {
    let timeoutHandle: NodeJS.Timeout | null = null;

    try {
      setLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading
      timeoutHandle = setTimeout(() => {
        setLoading(false);
        setError('Request timed out - check your connection');
        console.warn('Subscription data loading timed out after 15 seconds');
      }, 15000);

      // Load user info first
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) {
        throw new Error(`Authentication failed: ${userError}`);
      }

      if (!userInfo?.ID) {
        // User not logged in - set default state
        setSubscription(null);
        setTrial(null);
        setPlans([]);
        if (timeoutHandle) clearTimeout(timeoutHandle);
        setLoading(false);
        return;
      }

      // Load subscription plans (graceful failure)
      try {
        const { data: plansData, error: plansError } = await window.ezsite.apis.tablePage('35510', {
          PageNo: 1,
          PageSize: 50,
          OrderByField: 'id',
          IsAsc: true,
          Filters: []
        });

        if (!plansError && plansData?.List) {
          setPlans(plansData.List.map((plan: any) => ({
            ...plan,
            features: typeof plan.features === 'string' ?
            plan.features ? JSON.parse(plan.features) : [] :
            Array.isArray(plan.features) ? plan.features : []
          })));
        } else {
          console.warn('Plans loading error:', plansError);
          setPlans([]);
        }
      } catch (planError) {
        console.warn('Plans loading failed:', planError);
        setPlans([]);
      }

      // Load user subscription (graceful failure)
      try {
        const { data: subscriptionData, error: subscriptionError } = await window.ezsite.apis.tablePage('35511', {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'id',
          IsAsc: false,
          Filters: [{ name: 'user_id', op: 'Equal', value: userInfo.ID }]
        });

        if (!subscriptionError && subscriptionData?.List?.length > 0) {
          setSubscription(subscriptionData.List[0]);
        } else {
          setSubscription(null);
        }
      } catch (subError) {
        console.warn('Subscription loading failed:', subError);
        setSubscription(null);
      }

      // Load trial data (graceful failure)
      try {
        const { data: trialData, error: trialError } = await window.ezsite.apis.tablePage('35515', {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'id',
          IsAsc: false,
          Filters: [{ name: 'user_id', op: 'Equal', value: userInfo.ID }]
        });

        if (!trialError && trialData?.List?.length > 0) {
          setTrial(trialData.List[0]);
        } else {
          setTrial(null);
        }
      } catch (trialLoadError) {
        console.warn('Trial loading failed:', trialLoadError);
        setTrial(null);
      }

    } catch (error: any) {
      console.error('Error loading subscription data:', error);
      setError(error.message || 'Failed to load subscription information');

      // Set fallback state
      setSubscription(null);
      setTrial(null);
      setPlans([]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      setLoading(false);
    }
  };

  const getCurrentPlan = (): SubscriptionPlan | null => {
    if (!subscription || !plans.length) return null;
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
    if (!subscription || !plans.length) return true;

    const currentPlan = getCurrentPlan();
    if (!currentPlan) return true;

    // Can upgrade if there's a higher-priced plan available
    return plans.some((p) => p.price > currentPlan.price);
  };

  const canDowngrade = (): boolean => {
    if (!subscription || !plans.length) return false;

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
    error,
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