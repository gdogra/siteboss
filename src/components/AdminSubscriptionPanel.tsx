
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/DataTable';
import {
  Plus,
  Edit,
  Trash,
  Settings,
  Users,
  DollarSign,
  Crown,
  AlertTriangle } from
'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminSubscriptionPanel: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [featureLimits, setFeatureLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load subscription plans
      const { data: plansData, error: plansError } = await window.ezsite.apis.tablePage('35510', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'sort_order',
        IsAsc: true
      });
      if (plansError) throw plansError;
      setPlans(plansData.List);

      // Load all user subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await window.ezsite.apis.tablePage('35511', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false
      });
      if (subscriptionsError) throw subscriptionsError;
      setSubscriptions(subscriptionsData.List);

      // Load feature limits
      const { data: limitsData, error: limitsError } = await window.ezsite.apis.tablePage('35514', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'subscription_plan_id',
        IsAsc: true
      });
      if (limitsError) throw limitsError;
      setFeatureLimits(limitsData.List);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async (planData: any) => {
    try {
      if (editingPlan) {
        // Update existing plan
        await window.ezsite.apis.tableUpdate('35510', {
          id: editingPlan.id,
          ...planData,
          updated_at: new Date().toISOString()
        });
        toast({
          title: 'Plan Updated',
          description: 'Subscription plan updated successfully'
        });
      } else {
        // Create new plan
        await window.ezsite.apis.tableCreate('35510', {
          ...planData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        toast({
          title: 'Plan Created',
          description: 'New subscription plan created successfully'
        });
      }

      setShowPlanDialog(false);
      setEditingPlan(null);
      await loadAdminData();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save plan',
        variant: 'destructive'
      });
    }
  };

  const deletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      await window.ezsite.apis.tableDelete('35510', { id: planId });
      toast({
        title: 'Plan Deleted',
        description: 'Subscription plan deleted successfully'
      });
      await loadAdminData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive'
      });
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: number, newStatus: string) => {
    try {
      await window.ezsite.apis.tableUpdate('35511', {
        id: subscriptionId,
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      toast({
        title: 'Subscription Updated',
        description: `Subscription status changed to ${newStatus}`
      });

      await loadAdminData();
    } catch (error) {
      console.error('Error updating subscription:', error);
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

  const PlanForm = ({ plan = null, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState({
      plan_name: plan?.plan_name || '',
      plan_code: plan?.plan_code || '',
      description: plan?.description || '',
      price_monthly: plan?.price_monthly || 0,
      price_yearly: plan?.price_yearly || 0,
      currency: plan?.currency || 'USD',
      billing_interval: plan?.billing_interval || 'monthly',
      trial_days: plan?.trial_days || 30,
      max_users: plan?.max_users || -1,
      max_projects: plan?.max_projects || -1,
      storage_gb: plan?.storage_gb || -1,
      api_calls_per_month: plan?.api_calls_per_month || -1,
      is_active: plan?.is_active ?? true,
      sort_order: plan?.sort_order || 0,
      features: plan?.features ? JSON.stringify(plan.features) : '[]'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        features: JSON.parse(formData.features || '[]')
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="plan_name">Plan Name</Label>
            <Input
              id="plan_name"
              value={formData.plan_name}
              onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
              required />

          </div>
          <div>
            <Label htmlFor="plan_code">Plan Code</Label>
            <Input
              id="plan_code"
              value={formData.plan_code}
              onChange={(e) => setFormData({ ...formData, plan_code: e.target.value })}
              required />

          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_monthly">Monthly Price (cents)</Label>
            <Input
              id="price_monthly"
              type="number"
              value={formData.price_monthly}
              onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) })} />

          </div>
          <div>
            <Label htmlFor="price_yearly">Yearly Price (cents)</Label>
            <Input
              id="price_yearly"
              type="number"
              value={formData.price_yearly}
              onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) })} />

          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trial_days">Trial Days</Label>
            <Input
              id="trial_days"
              type="number"
              value={formData.trial_days}
              onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) })} />

          </div>
          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />

          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max_users">Max Users (-1 for unlimited)</Label>
            <Input
              id="max_users"
              type="number"
              value={formData.max_users}
              onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })} />

          </div>
          <div>
            <Label htmlFor="max_projects">Max Projects (-1 for unlimited)</Label>
            <Input
              id="max_projects"
              type="number"
              value={formData.max_projects}
              onChange={(e) => setFormData({ ...formData, max_projects: parseInt(e.target.value) })} />

          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />

          <Label htmlFor="is_active">Active</Label>
        </div>

        <div>
          <Label htmlFor="features">Features (JSON array)</Label>
          <Textarea
            id="features"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder='["Feature 1", "Feature 2", "Feature 3"]' />

        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </form>);

  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage subscription plans, user subscriptions, and billing settings
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Subscription Plans</h3>
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPlan(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the subscription plan details and features
                  </DialogDescription>
                </DialogHeader>
                <PlanForm
                  plan={editingPlan}
                  onSave={savePlan}
                  onCancel={() => {
                    setShowPlanDialog(false);
                    setEditingPlan(null);
                  }} />

              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) =>
            <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                      <CardDescription>{plan.plan_code}</CardDescription>
                    </div>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {formatCurrency(plan.price_monthly)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  
                  <div className="space-y-1 text-sm">
                    <p>Trial: {plan.trial_days} days</p>
                    <p>Users: {plan.max_users === -1 ? 'Unlimited' : plan.max_users}</p>
                    <p>Projects: {plan.max_projects === -1 ? 'Unlimited' : plan.max_projects}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPlan(plan);
                      setShowPlanDialog(true);
                    }}>

                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePlan(plan.id)}>

                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>
                View and manage all user subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={subscriptions}
                columns={[
                { key: 'user_id', label: 'User ID' },
                { key: 'subscription_plan_id', label: 'Plan ID' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (value: string) =>
                  <Badge variant={value === 'active' ? 'default' : 'secondary'}>
                        {value}
                      </Badge>

                },
                {
                  key: 'is_trial',
                  label: 'Trial',
                  render: (value: boolean) => value ? 'Yes' : 'No'
                },
                {
                  key: 'next_billing_date',
                  label: 'Next Billing',
                  render: (value: string) =>
                  value ? new Date(value).toLocaleDateString() : 'N/A'
                }]
                }
                actions={(row) =>
                <div className="flex gap-2">
                    <Select
                    value={row.status}
                    onValueChange={(value) => updateSubscriptionStatus(row.id, value)}>

                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                } />

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
              <CardDescription>
                Configure global subscription and billing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default_trial">Default Trial Days</Label>
                  <Input
                    id="default_trial"
                    type="number"
                    defaultValue={30} />

                </div>
                <div>
                  <Label htmlFor="grace_period">Grace Period (days)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    defaultValue={3} />

                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto_renewal" defaultChecked />
                <Label htmlFor="auto_renewal">Enable Auto-Renewal by Default</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="proration" defaultChecked />
                <Label htmlFor="proration">Enable Proration for Plan Changes</Label>
              </div>

              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default AdminSubscriptionPanel;