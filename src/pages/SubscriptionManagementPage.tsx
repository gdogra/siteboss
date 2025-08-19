
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import SubscriptionProvider from '@/components/SubscriptionProvider';
import BillingDashboard from '@/components/BillingDashboard';
import SubscriptionPlanSelector from '@/components/SubscriptionPlanSelector';
import UsageTracker from '@/components/UsageTracker';
import AdminSubscriptionPanel from '@/components/AdminSubscriptionPanel';
import SubscriptionAnalytics from '@/components/SubscriptionAnalytics';
import FeatureGate from '@/components/FeatureGate';
import { 
  CreditCard, 
  BarChart, 
  Settings, 
  Crown, 
  Shield,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';

const SubscriptionManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('billing');

  return (
    <AuthGuard>
      <SubscriptionProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-8">
              {/* Page Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Crown className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Subscription Management</h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Comprehensive subscription and billing management with Stripe integration, 
                  usage tracking, and feature gating
                </p>
              </div>

              {/* Feature Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Billing Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Invoices & payments
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Usage Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                          Monitor & enforce limits
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Feature Gating</h3>
                        <p className="text-sm text-muted-foreground">
                          Tier-based access control
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                          Subscription insights
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="billing" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </TabsTrigger>
                  <TabsTrigger value="plans" className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Plans
                  </TabsTrigger>
                  <TabsTrigger value="usage" className="flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Usage
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="billing" className="space-y-6">
                  <BillingDashboard />
                </TabsContent>

                <TabsContent value="plans" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Choose Your Plan</CardTitle>
                      <CardDescription>
                        Select the perfect plan for your needs with 30-day free trial
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SubscriptionPlanSelector />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage & Limits</CardTitle>
                      <CardDescription>
                        Monitor your resource usage and subscription limits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UsageTracker />
                    </CardContent>
                  </Card>

                  {/* Feature Gate Examples */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FeatureGate
                      featureKey="advanced_analytics"
                      featureName="Advanced Analytics"
                      requiredPlan="Professional"
                      showUpgrade={true}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Advanced Analytics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>You have access to advanced analytics features!</p>
                        </CardContent>
                      </Card>
                    </FeatureGate>

                    <FeatureGate
                      featureKey="priority_support"
                      featureName="Priority Support"
                      requiredPlan="Enterprise"
                      showUpgrade={true}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Priority Support
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>You have access to priority support!</p>
                        </CardContent>
                      </Card>
                    </FeatureGate>
                  </div>
                </TabsContent>

                <TabsContent value="admin" className="space-y-6">
                  <FeatureGate
                    featureKey="admin_panel"
                    featureName="Admin Panel"
                    requiredPlan="Enterprise"
                    showUpgrade={true}
                  >
                    <AdminSubscriptionPanel />
                  </FeatureGate>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <FeatureGate
                    featureKey="subscription_analytics"
                    featureName="Subscription Analytics"
                    requiredPlan="Professional"
                    showUpgrade={true}
                  >
                    <SubscriptionAnalytics />
                  </FeatureGate>
                </TabsContent>
              </Tabs>

              {/* Pricing Tiers Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">Subscription Tiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <div className="text-center space-y-2">
                        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold">Basic - $99/month</h4>
                        <p className="text-sm text-muted-foreground">
                          Essential features for small teams
                        </p>
                        <Badge variant="secondary">30-day trial</Badge>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="p-3 bg-green-100 rounded-full w-fit mx-auto">
                          <Zap className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold">Professional - $299/month</h4>
                        <p className="text-sm text-muted-foreground">
                          Advanced features for growing businesses
                        </p>
                        <Badge variant="default">Most Popular</Badge>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto">
                          <Crown className="h-6 w-6 text-purple-600" />
                        </div>
                        <h4 className="font-semibold">Enterprise - $599/month</h4>
                        <p className="text-sm text-muted-foreground">
                          Full feature set for large organizations
                        </p>
                        <Badge variant="outline">Premium</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SubscriptionProvider>
    </AuthGuard>
  );
};

export default SubscriptionManagementPage;
