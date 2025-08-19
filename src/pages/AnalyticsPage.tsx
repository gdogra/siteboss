
import React, { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  Settings,
  Download,
  Share,
  Filter,
  Calendar } from
'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [userRole, setUserRole] = useState('Administrator');
  const [userId, setUserId] = useState(1);

  return (
    <AuthGuard requiredRole="Administrator">
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  SiteBoss Analytics
                </h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Comprehensive real-time analytics across all your business operations
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share Dashboard
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard
            userRole={userRole}
            userId={userId} />


          {/* Additional Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Real-time Monitoring
                </CardTitle>
                <CardDescription>
                  Live updates every 30 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Sources</span>
                    <Badge variant="default">8 Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Sync</span>
                    <Badge variant="outline">Just now</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Insights
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Insights</span>
                    <Badge variant="default">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Priority</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Actionable</span>
                    <Badge variant="default">8</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Multi-tenant Support
                </CardTitle>
                <CardDescription>
                  Role-based analytics views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Role</span>
                    <Badge variant="default">{userRole}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Access Level</span>
                    <Badge variant="outline">Full Access</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customizable</span>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Yes
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Analytics Features
              </CardTitle>
              <CardDescription>
                Comprehensive analytics capabilities for all SiteBoss modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Data Sources</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Lead Management System</li>
                    <li>• Project Tracking</li>
                    <li>• Financial Transactions</li>
                    <li>• Inventory Management</li>
                    <li>• Time Tracking</li>
                    <li>• Proposal Management</li>
                    <li>• Permit Management</li>
                    <li>• Subscription Data</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Visualization Types</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time KPI Widgets</li>
                    <li>• Interactive Line Charts</li>
                    <li>• Bar and Column Charts</li>
                    <li>• Pie and Donut Charts</li>
                    <li>• Area Charts</li>
                    <li>• Trend Analysis</li>
                    <li>• Forecasting Charts</li>
                    <li>• Custom Dashboards</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Smart Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automated Alerts</li>
                    <li>• AI-powered Insights</li>
                    <li>• Predictive Analytics</li>
                    <li>• Custom Thresholds</li>
                    <li>• Performance Benchmarking</li>
                    <li>• Export Capabilities</li>
                    <li>• Role-based Access</li>
                    <li>• Real-time Updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>);

};

export default AnalyticsPage;