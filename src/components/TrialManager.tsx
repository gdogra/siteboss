import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Gift, Star, AlertCircle, CheckCircle, Crown, RefreshCw, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionFallback from '@/components/SubscriptionFallback';

interface TrialManagerProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

const TrialManager: React.FC<TrialManagerProps> = ({
  showUpgradeButton = true,
  compact = false
}) => {
  const {
    subscription,
    trial,
    loading,
    error,
    refreshSubscription,
    isTrialActive,
    daysLeftInTrial,
    currentPlan
  } = useSubscription();
  const { toast } = useToast();
  const [extending, setExtending] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleExtendTrial = async () => {
    if (!trial) return;

    setExtending(true);
    try {
      const { error } = await window.ezsite.apis.tableUpdate('35515', {
        id: trial.id,
        extended_days: (trial.extended_days || 0) + 7,
        end_date: new Date(Date.now() + (daysLeftInTrial() + 7) * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Trial Extended",
        description: "Your trial has been extended by 7 days!"
      });

      await refreshSubscription();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend trial. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setExtending(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/subscription-management';
  };

  const handleRetry = async () => {
    setRetrying(true);
    await refreshSubscription();
    setRetrying(false);
  };

  // Enhanced loading state with timeout protection
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // Show timeout warning after 10 seconds
    } else {
      setLoadingTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  if (loading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : ""}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-slate-600">Loading trial information...</span>
            </div>
            {loadingTimeout && (
              <Button 
                onClick={() => window.location.reload()} 
                size="sm" 
                variant="outline"
                className="ml-2"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reload
              </Button>
            )}
          </div>
          {loadingTimeout && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              Taking longer than expected. Check your connection or try reloading.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Error state with fallback component
  if (error) {
    return (
      <SubscriptionFallback
        error={error}
        compact={compact}
        onRetry={handleRetry}
        onUpgrade={handleUpgrade}
      />
    );
  }

  // No trial state
  if (!trial || !isTrialActive()) {
    return (
      <Card className={compact ? "border-slate-200" : "border-red-200 bg-red-50"}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <CardTitle className={`flex items-center space-x-2 ${compact ? 'text-base' : 'text-lg'}`}>
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>No Active Trial</span>
          </CardTitle>
        </CardHeader>
        {!compact && (
          <CardContent>
            <p className="text-slate-600 mb-4">
              Your trial has expired or you don't have an active trial. 
              Upgrade to continue using all features.
            </p>
            {showUpgradeButton && (
              <Button onClick={handleUpgrade} className="w-full">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  const daysLeft = daysLeftInTrial();
  const progressPercentage = Math.max(0, (trial.days_remaining - daysLeft) / trial.days_remaining * 100);
  const isExpiringSoon = daysLeft <= 5;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {daysLeft} days left in trial
            </span>
          </div>
          {showUpgradeButton && (
            <Button size="sm" onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
              Upgrade
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`${isExpiringSoon ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className={`w-5 h-5 ${isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}`} />
          <span>Free Trial Active</span>
          <Badge variant={isExpiringSoon ? "destructive" : "secondary"}>
            {currentPlan?.plan_name || 'Professional'} Plan
          </Badge>
        </CardTitle>
        <CardDescription>
          You have {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in your free trial
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Trial Progress</span>
            <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}`}>
              {daysLeft} of {trial.days_remaining} days left
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={`h-2 ${isExpiringSoon ? 'bg-orange-200' : 'bg-blue-200'}`}
          />
        </div>

        {isExpiringSoon && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              Your trial expires soon! Upgrade now to avoid losing access to premium features.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-slate-900">What's included:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Unlimited projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Team collaboration</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Priority support</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {showUpgradeButton && (
            <Button onClick={handleUpgrade} className="flex-1">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          )}
          {daysLeft <= 7 && !trial.extended_days && (
            <Button
              variant="outline"
              onClick={handleExtendTrial}
              disabled={extending}
              className="flex-1"
            >
              {extending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Extending...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Extend 7 Days
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          <p>Trial started: {new Date(trial.start_date).toLocaleDateString()}</p>
          <p>Trial ends: {new Date(trial.end_date).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialManager;