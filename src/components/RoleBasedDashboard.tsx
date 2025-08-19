import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2 } from
'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleBasedDashboardProps {
  userInfo: {
    ID: number;
    Name: string;
    Email: string;
    Roles: string;
  };
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalRevenue: number;
    pendingPayments: number;
  };
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ userInfo, stats }) => {
  const navigate = useNavigate();

  const hasRole = (requiredRole: string) => {
    if (!userInfo?.Roles) return false;
    const userRoles = userInfo.Roles.split(',');
    return userRoles.includes(requiredRole);
  };

  const isAdmin = () => hasRole('Administrator');
  const isSalesOrAccountant = () => hasRole('r-QpoZrh');
  const isViewer = () => hasRole('GeneralUser');

  const getRoleTitle = () => {
    if (isAdmin()) return 'Administrator Dashboard';
    if (isSalesOrAccountant()) return 'Sales/Accounting Dashboard';
    if (isViewer()) return 'Viewer Dashboard';
    return 'Dashboard';
  };

  const getRoleDescription = () => {
    if (isAdmin()) return 'Full access to all system features and management tools';
    if (isSalesOrAccountant()) return 'Access to projects, leads, payments, and financial data';
    if (isViewer()) return 'Read-only access to view project information and reports';
    return 'Welcome to your dashboard';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Role-specific Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-900">{getRoleTitle()}</CardTitle>
              <CardDescription className="text-blue-700 mt-2">
                {getRoleDescription()}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-sm">
                {userInfo.Name || userInfo.Email}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Admin/Manager View */}
      {isAdmin() &&
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Active Projects</p>
                    <p className="text-2xl font-bold text-green-900">{stats.activeProjects}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Pending Payments</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.pendingPayments}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Management Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/leads')}>

                  <Users className="h-4 w-4 mr-2" />
                  Lead Management
                </Button>
                <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/payments')}>

                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Processing
                </Button>
                <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/invoice-submission')}>

                  <FileText className="h-4 w-4 mr-2" />
                  Invoice Management
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <span className="font-semibold">{stats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold">{stats.completedProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold">
                      {stats.totalProjects > 0 ? Math.round(stats.completedProjects / stats.totalProjects * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }

      {/* Sales/Accountant View */}
      {isSalesOrAccountant() &&
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Revenue Tracking</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Active Projects</p>
                    <p className="text-2xl font-bold text-green-900">{stats.activeProjects}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/leads')}>

                <Users className="h-4 w-4 mr-2" />
                Manage Leads
              </Button>
              <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/payments')}>

                <DollarSign className="h-4 w-4 mr-2" />
                Financial Overview
              </Button>
              <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/invoice-submission')}>

                <FileText className="h-4 w-4 mr-2" />
                Invoice Processing
              </Button>
            </CardContent>
          </Card>
        </div>
      }

      {/* Viewer Only Access */}
      {isViewer() &&
      <div className="space-y-6">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">View-Only Access</h3>
                <p className="text-gray-600 mb-4">
                  You have read-only access to view project information and reports.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Available Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Project overview and status</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Financial summaries and reports</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Document access (view only)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    </div>);

};

export default RoleBasedDashboard;