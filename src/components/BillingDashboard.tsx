
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Receipt,
  Download,
  Settings,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp } from
'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionPlanSelector from '@/components/SubscriptionPlanSelector';
import TrialManager from '@/components/TrialManager';

const BillingDashboard: React.FC = () => {
  const { subscription, plans, refreshSubscription } = useSubscription();
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadBillingData();
  }, [subscription]);

  const loadBillingData = async () => {
    if (!subscription?.id) {
      setLoading(false);
      return;
    }

    try {
      // Load billing history
      const { data: billingData, error: billingError } = await window.ezsite.apis.tablePage('35512', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [{ name: 'user_subscription_id', op: 'Equal', value: subscription.id }]
      });

      if (billingError) throw billingError;
      setBillingHistory(billingData.List);

      // Load payment methods
      const { data: paymentData, error: paymentError } = await window.ezsite.apis.tablePage('33732', {
        PageNo: 1,
        PageSize: 5,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (paymentError) throw paymentError;
      setPaymentMethods(paymentData.List);

    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = async (planId: number, billingCycle: string) => {
    try {
      if (!subscription) {
        // Create new subscription
        const { data, error } = await window.ezsite.apis.run({
          path: 'createStripeSubscription',
          param: [subscription?.user_id, planId, null, 30]
        });

        if (error) throw error;

        toast({
          title: 'Subscription Created',
          description: 'Your subscription has been created successfully'
        });
      } else {
        // Upgrade/downgrade existing subscription
        const currentPlan = plans.find((p) => p.id === subscription.subscription_plan_id);
        const newPlan = plans.find((p) => p.id === planId);

        if (newPlan && currentPlan) {
          if (newPlan.price_monthly > currentPlan.price_monthly) {
            // Upgrade
            const { data, error } = await window.ezsite.apis.run({
              path: 'upgradeSubscription',
              param: [subscription.stripe_subscription_id, planId, 'create_prorations']
            });
            if (error) throw error;

            toast({
              title: 'Subscription Upgraded',
              description: `Upgraded to ${newPlan.plan_name} plan`
            });
          } else {
            // Downgrade
            const { data, error } = await window.ezsite.apis.run({
              path: 'downgradeSubscription',
              param: [subscription.stripe_subscription_id, planId, 'period_end']
            });
            if (error) throw error;

            toast({
              title: 'Subscription Scheduled for Downgrade',
              description: `Will downgrade to ${newPlan.plan_name} at the end of current billing period`
            });
          }
        }
      }

      await refreshSubscription();
    } catch (error) {
      console.error('Error changing subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':return 'default';
      case 'trial':return 'secondary';
      case 'cancelled':return 'destructive';
      case 'paused':return 'warning';
      case 'paid':return 'default';
      case 'overdue':return 'destructive';
      default:return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>);

  }

  const currentPlan = subscription ? plans.find((p) => p.id === subscription.subscription_plan_id) : null;

  return (
    <div className="space-y-6">
      {/* Current Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing preferences
              </CardDescription>
            </div>
            {subscription &&
            <Badge variant={getStatusColor(subscription.status) as any}>
                {subscription.status}
              </Badge>
            }
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {subscription && currentPlan ?
          <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{currentPlan.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing</p>
                  <p className="font-semibold">
                    {formatCurrency(
                    subscription.billing_cycle === 'yearly' ?
                    currentPlan.price_yearly :
                    currentPlan.price_monthly
                  )}
                    /{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="font-semibold">
                    {subscription.next_billing_date ?
                  new Date(subscription.next_billing_date).toLocaleDateString() :
                  'N/A'
                  }
                  </p>
                </div>
              </div>
              
              {subscription.is_trial &&
            <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You're currently on a free trial. Your subscription will begin after the trial ends.
                  </AlertDescription>
                </Alert>
            }
            </> :

          <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active subscription found. Choose a plan to get started.
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>

      {/* Trial Manager */}
      <TrialManager />

      {/* Tabs for detailed management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    billingHistory.
                    filter((b) => b.status === 'paid').
                    reduce((sum, b) => sum + b.total_amount, 0)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Invoices</span>
                </div>
                <div className="text-2xl font-bold">{billingHistory.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <div className="text-2xl font-bold">
                  {subscription?.started_at ?
                  new Date(subscription.started_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                  'N/A'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <SubscriptionPlanSelector
            onSelectPlan={handleSubscriptionChange}
            showCurrentPlan={true} />

        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingHistory.length > 0 ?
              <div className="space-y-4">
                  {billingHistory.map((bill) =>
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Invoice #{bill.invoice_id}</p>
                          <Badge variant={getStatusColor(bill.status) as any}>
                            {bill.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(bill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(bill.total_amount)}</p>
                        <Button size="sm" variant="ghost" className="h-auto p-0">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                )}
                </div> :

              <p className="text-muted-foreground text-center py-8">
                  No billing history found
                </p>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ?
              <div className="space-y-4">
                  {paymentMethods.map((method) =>
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {method.brand} •••• {method.last_four}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {method.exp_month}/{method.exp_year}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {method.is_default &&
                    <Badge variant="secondary">Default</Badge>
                    }
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                )}
                </div> :

              <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No payment methods found</p>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default BillingDashboard;