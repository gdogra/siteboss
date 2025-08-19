
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureGateProps {
  featureKey: string;
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: string;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  featureName,
  children,
  fallback,
  requiredPlan,
  showUpgrade = true,
  onUpgrade
}) => {
  const { hasFeatureAccess, subscription, plans, isTrialActive } = useSubscription();

  // Check if user has access to the feature
  const hasAccess = hasFeatureAccess(featureKey);
  const isOnTrial = isTrialActive();

  // If user has access or is on trial, render children
  if (hasAccess || isOnTrial) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Find the required plan
  const currentPlan = subscription ? plans.find(p => p.id === subscription.subscription_plan_id) : null;
  const requiredPlanObj = requiredPlan ? plans.find(p => p.plan_code.toLowerCase() === requiredPlan.toLowerCase()) : null;

  const getPlanIcon = (planCode: string) => {
    switch (planCode?.toLowerCase()) {
      case 'professional': return <Zap className="h-4 w-4" />;
      case 'enterprise': return <Crown className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  // Default upgrade gate UI
  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="p-3 bg-muted rounded-full">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {requiredPlanObj && getPlanIcon(requiredPlanObj.plan_code)}
          {featureName} - Premium Feature
        </CardTitle>
        <CardDescription>
          {requiredPlan 
            ? `This feature requires the ${requiredPlan} plan or higher`
            : 'This feature is not available in your current plan'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current vs Required Plan */}
        <div className="flex items-center justify-center space-x-4">
          {currentPlan && (
            <>
              <Badge variant="outline">{currentPlan.plan_name}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          {requiredPlanObj && (
            <Badge variant="default" className="bg-primary">
              {requiredPlanObj.plan_name}
            </Badge>
          )}
        </div>

        {/* Feature Benefits */}
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Upgrade to unlock {featureName.toLowerCase()} and many other premium features
          </AlertDescription>
        </Alert>

        {/* Upgrade Button */}
        {showUpgrade && (
          <div className="text-center">
            <Button onClick={onUpgrade} className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        )}

        {/* Trial CTA */}
        {!subscription && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Try all premium features free for 30 days
            </p>
            <Button variant="outline" onClick={onUpgrade}>
              Start Free Trial
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureGate;
