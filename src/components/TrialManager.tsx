
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Gift, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

const TrialManager: React.FC = () => {
  const { subscription, isTrialActive, daysLeftInTrial, refreshSubscription } = useSubscription();
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrialInfo();
  }, [subscription]);

  const loadTrialInfo = async () => {
    if (!subscription?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await window.ezsite.apis.tablePage('35515', {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_subscription_id', op: 'Equal', value: subscription.id }]
      });

      if (error) throw error;
      if (data.List.length > 0) {
        setTrialInfo(data.List[0]);
      }
    } catch (error) {
      console.error('Error loading trial info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trial information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const extendTrial = async (days: number) => {
    if (!trialInfo?.id) return;

    try {
      const currentEnd = new Date(trialInfo.ends_at);
      const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

      await window.ezsite.apis.tableUpdate('35515', {
        id: trialInfo.id,
        ends_at: newEnd.toISOString(),
        extended_at: new Date().toISOString(),
        extension_days: trialInfo.extension_days + days,
        updated_at: new Date().toISOString()
      });

      toast({
        title: 'Trial Extended',
        description: `Your trial has been extended by ${days} days`
      });

      await loadTrialInfo();
      await refreshSubscription();
    } catch (error) {
      console.error('Error extending trial:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend trial',
        variant: 'destructive'
      });
    }
  };

  const convertToSubscription = async (planId: number) => {
    try {
      const { data, error } = await window.ezsite.apis.run({
        path: 'processTrialToSubscription',
        param: [trialInfo.id, true]
      });

      if (error) throw error;

      // Update subscription status
      await window.ezsite.apis.tableUpdate('35511', {
        id: subscription?.id,
        status: 'active',
        is_trial: false,
        updated_at: new Date().toISOString()
      });

      // Update trial management record
      await window.ezsite.apis.tableUpdate('35515', {
        id: trialInfo.id,
        conversion_status: 'converted',
        converted_at: new Date().toISOString(),
        conversion_plan_id: planId,
        updated_at: new Date().toISOString()
      });

      toast({
        title: 'Subscription Activated',
        description: 'Welcome to your paid subscription!'
      });

      await refreshSubscription();
    } catch (error) {
      console.error('Error converting trial:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert trial to subscription',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>);

  }

  if (!subscription?.is_trial || !isTrialActive()) {
    return null;
  }

  const daysLeft = daysLeftInTrial();
  const totalTrialDays = trialInfo?.trial_duration_days || 30;
  const daysUsed = totalTrialDays - daysLeft;
  const progressPercentage = daysUsed / totalTrialDays * 100;

  const getTrialStatus = () => {
    if (daysLeft <= 1) return { color: 'destructive', icon: AlertTriangle, message: 'Trial expires today!' };
    if (daysLeft <= 3) return { color: 'warning', icon: AlertTriangle, message: 'Trial expires soon' };
    if (daysLeft <= 7) return { color: 'default', icon: Clock, message: 'Trial active' };
    return { color: 'secondary', icon: Gift, message: 'Free trial active' };
  };

  const status = getTrialStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <status.icon className="h-5 w-5" />
                Free Trial
              </CardTitle>
              <CardDescription>{status.message}</CardDescription>
            </div>
            <Badge variant={status.color as any}>
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Trial Progress</span>
              <span>{daysUsed}/{totalTrialDays} days used</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Started</p>
              <p className="font-medium">
                {new Date(subscription.trial_starts_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">
                {new Date(subscription.trial_ends_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {trialInfo?.extension_days > 0 &&
          <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Trial extended by {trialInfo.extension_days} days
              </AlertDescription>
            </Alert>
          }
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button onClick={() => convertToSubscription(subscription.subscription_plan_id)} className="flex-1">
            Subscribe Now
          </Button>
          {daysLeft <= 7 &&
          <Button
            variant="outline"
            onClick={() => extendTrial(7)}
            className="flex-1">

              Extend Trial
            </Button>
          }
        </CardFooter>
      </Card>

      {/* Trial Warnings */}
      {daysLeft <= 3 &&
      <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your trial expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. 
            Subscribe now to continue using all features without interruption.
          </AlertDescription>
        </Alert>
      }

      {daysLeft <= 7 && daysLeft > 3 &&
      <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your trial expires in {daysLeft} days. Consider upgrading to continue 
            enjoying all the premium features.
          </AlertDescription>
        </Alert>
      }
    </div>);

};

export default TrialManager;