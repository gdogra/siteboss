import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true
}) => {
  const { 
    hasFeatureAccess, 
    isTrialActive, 
    daysLeftInTrial, 
    currentPlan,
    loading
  } = useSubscription();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Checking access...</span>
      </div>
    );
  }

  // Check if user has access to this feature
  if (hasFeatureAccess(feature)) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (!showUpgradePrompt) {
    return null;
  }

  const trialActive = isTrialActive();
  const daysLeft = daysLeftInTrial();

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-amber-600" />
          <span>Premium Feature</span>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {currentPlan?.plan_name || 'Upgrade Required'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {trialActive ? (
          <Alert className="border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              You have {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your free trial. 
              Upgrade now to continue using this feature after your trial ends.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-amber-200 bg-amber-50">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-amber-800">
              This feature requires a premium subscription. Upgrade your plan to access advanced functionality.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Unlock this feature with a premium plan:</h4>
          
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <div className="font-medium text-slate-900">Professional Plan</div>
                <div className="text-slate-600">Full access to all features</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">$99/mo</div>
                <div className="text-xs text-slate-500">Most Popular</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <div className="font-medium text-slate-900">Enterprise Plan</div>
                <div className="text-slate-600">Advanced features + priority support</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">$199/mo</div>
                <div className="text-xs text-slate-500">Best Value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            className="flex-1"
            onClick={() => window.location.href = '/subscription-management'}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          {!trialActive && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/trial-signup'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try Free
            </Button>
          )}
        </div>

        <div className="text-xs text-slate-500 text-center">
          Questions? <a href="mailto:support@siteboss.app" className="text-blue-600 hover:underline">Contact our sales team</a>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureGate;