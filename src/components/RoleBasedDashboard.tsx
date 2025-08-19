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
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl lg:text-2xl text-blue-900 truncate">
                {getRoleTitle()}
              </CardTitle>
              <CardDescription className="text-blue-700 mt-2 text-sm lg:text-base">
                {getRoleDescription()}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">
              <Badge variant="outline" className="text-sm whitespace-nowrap">
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
            <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-green-800 truncate">Active Projects</p>
                    <p className="text-xl lg:text-2xl font-bold text-green-900 mt-1">{stats.activeProjects}</p>
                  </div>
                  <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-800 truncate">Total Revenue</p>
                    <p className="text-xl lg:text-2xl font-bold text-blue-900 mt-1 truncate">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-orange-800 truncate">Pending Payments</p>
                    <p className="text-xl lg:text-2xl font-bold text-orange-900 mt-1">{stats.pendingPayments}</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Management Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                variant="outline"
                className="w-full justify-start text-sm py-3"
                onClick={() => navigate('/leads')}>
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Lead Management</span>
                </Button>
                <Button
                variant="outline"
                className="w-full justify-start text-sm py-3"
                onClick={() => navigate('/payments')}>
                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Payment Processing</span>
                </Button>
                <Button
                variant="outline"
                className="w-full justify-start text-sm py-3"
                onClick={() => navigate('/invoice-submission')}>
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Invoice Management</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <span className="font-semibold">{stats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold">{stats.completedProjects}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
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
            <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-800 truncate">Revenue Tracking</p>
                    <p className="text-xl lg:text-2xl font-bold text-blue-900 mt-1 truncate">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-green-800 truncate">Active Projects</p>
                    <p className="text-xl lg:text-2xl font-bold text-green-900 mt-1">{stats.activeProjects}</p>
                  </div>
                  <Building2 className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Available Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
              variant="outline"
              className="w-full justify-start text-sm py-3"
              onClick={() => navigate('/leads')}>
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Manage Leads</span>
              </Button>
              <Button
              variant="outline"
              className="w-full justify-start text-sm py-3"
              onClick={() => navigate('/payments')}>
                <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Financial Overview</span>
              </Button>
              <Button
              variant="outline"
              className="w-full justify-start text-sm py-3"
              onClick={() => navigate('/invoice-submission')}>
                <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Invoice Processing</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      }

      {/* Viewer Only Access */}
      {isViewer() &&
      <div className="space-y-6">
          <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="text-center py-6 lg:py-8">
                <Eye className="h-10 w-10 lg:h-12 lg:w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">View-Only Access</h3>
                <p className="text-gray-600 mb-4 text-sm lg:text-base px-2">
                  You have read-only access to view project information and reports.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-xs lg:max-w-md mx-auto">
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                    <p className="text-xs lg:text-sm text-gray-600 mt-1">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                    <p className="text-xs lg:text-sm text-gray-600 mt-1">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                Available Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Project overview and status</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Financial summaries and reports</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 flex-shrink-0" />
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