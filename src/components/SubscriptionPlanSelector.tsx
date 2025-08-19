
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Crown, Zap, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionPlanSelectorProps {
  onSelectPlan?: (planId: number, billingCycle: string) => void;
  showCurrentPlan?: boolean;
}

const SubscriptionPlanSelector: React.FC<SubscriptionPlanSelectorProps> = ({
  onSelectPlan,
  showCurrentPlan = true
}) => {
  const { plans, subscription, loading } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const handlePlanSelect = async (planId: number) => {
    try {
      setSelectedPlanId(planId);
      
      if (onSelectPlan) {
        onSelectPlan(planId, billingCycle);
      }
      
      toast({
        title: 'Plan Selected',
        description: `You selected the ${plans.find(p => p.id === planId)?.plan_name} plan`
      });
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to select plan',
        variant: 'destructive'
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price / 100);
  };

  const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const savings = monthlyCost - yearlyPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  const getPlanIcon = (planCode: string) => {
    switch (planCode.toLowerCase()) {
      case 'basic':
        return <CreditCard className="h-6 w-6" />;
      case 'professional':
        return <Zap className="h-6 w-6" />;
      case 'enterprise':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planCode: string) => {
    switch (planCode.toLowerCase()) {
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      case 'professional':
        return 'border-green-200 bg-green-50';
      case 'enterprise':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-toggle" className={billingCycle === 'monthly' ? 'font-semibold' : ''}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <Label htmlFor="billing-toggle" className={billingCycle === 'yearly' ? 'font-semibold' : ''}>
          Yearly
        </Label>
        <Badge variant="secondary" className="ml-2">Save up to 20%</Badge>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const savings = calculateYearlySavings(plan.price_monthly, plan.price_yearly);
          const isCurrentPlan = subscription?.subscription_plan_id === plan.id;
          const isPopular = plan.plan_code.toLowerCase() === 'professional';

          return (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.plan_code)} ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} ${isPopular ? 'scale-105 shadow-lg' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 hover:bg-green-600">Most Popular</Badge>
                </div>
              )}
              
              {isCurrentPlan && showCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-blue-500 text-white">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    {getPlanIcon(plan.plan_code)}
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.plan_name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {formatPrice(price)}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && savings.percentage > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Save {formatPrice(savings.amount)} ({savings.percentage}% off)
                    </p>
                  )}
                  {plan.trial_days > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                      {plan.trial_days}-day free trial
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {plan.max_users === -1 ? 'Unlimited users' : `Up to ${plan.max_users} users`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {plan.max_projects === -1 ? 'Unlimited projects' : `Up to ${plan.max_projects} projects`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {plan.storage_gb === -1 ? 'Unlimited storage' : `${plan.storage_gb}GB storage`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {plan.api_calls_per_month === -1 ? 'Unlimited API calls' : `${plan.api_calls_per_month.toLocaleString()} API calls/month`}
                    </span>
                  </div>

                  {/* Additional Features */}
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'secondary' : 'default'}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison Note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include 24/7 support, 99.9% uptime SLA, and data encryption at rest</p>
      </div>
    </div>
  );
};

export default SubscriptionPlanSelector;
