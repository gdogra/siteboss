
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Users,
  Calendar,
  Settings,
  Smartphone,
  Building,
  Shield,
  PlusCircle } from
'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import PermitManagementDashboard from '@/components/PermitManagementDashboard';
import ApplicantPortal from '@/components/ApplicantPortal';
import InspectorMobileInterface from '@/components/InspectorMobileInterface';
import { useToast } from '@/hooks/use-toast';

const PermitManagementPage = () => {
  const [userRole, setUserRole] = useState<string>('');
  const [activeInterface, setActiveInterface] = useState('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    getUserRole();
  }, []);

  const getUserRole = async () => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();
      if (userInfo?.Roles) {
        setUserRole(userInfo.Roles);

        // Default interface based on role
        if (userInfo.Roles.includes('Administrator')) {
          setActiveInterface('dashboard');
        } else if (userInfo.Roles.includes('Inspector')) {
          setActiveInterface('inspector');
        } else {
          setActiveInterface('applicant');
        }
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  };

  const getRoleInterfaces = () => {
    const interfaces = [];

    // Always show applicant portal (everyone can apply for permits)
    interfaces.push({
      id: 'applicant',
      name: 'Apply for Permits',
      icon: FileText,
      description: 'Submit new permit applications',
      component: ApplicantPortal
    });

    // Show inspector interface if user has appropriate role
    if (userRole.includes('Inspector') || userRole.includes('Administrator')) {
      interfaces.push({
        id: 'inspector',
        name: 'Inspector Mobile',
        icon: Smartphone,
        description: 'Mobile inspection interface',
        component: InspectorMobileInterface
      });
    }

    // Show admin dashboard if user is administrator
    if (userRole.includes('Administrator')) {
      interfaces.push({
        id: 'dashboard',
        name: 'Admin Dashboard',
        icon: Settings,
        description: 'Manage permits and inspections',
        component: PermitManagementDashboard
      });
    }

    return interfaces;
  };

  const interfaces = getRoleInterfaces();
  const ActiveComponent = interfaces.find((int) => int.id === activeInterface)?.component || ApplicantPortal;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Interface Selector for multi-role users */}
        {interfaces.length > 1 &&
        <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8 overflow-x-auto py-4">
                {interfaces.map((interfaceItem) => {
                const Icon = interfaceItem.icon;
                return (
                  <button
                    key={interfaceItem.id}
                    onClick={() => setActiveInterface(interfaceItem.id)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeInterface === interfaceItem.id ?
                    'bg-blue-100 text-blue-700 border border-blue-200' :
                    'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                    }>

                      <Icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{interfaceItem.name}</div>
                        <div className="text-xs text-gray-500">{interfaceItem.description}</div>
                      </div>
                    </button>);

              })}
              </div>
            </div>
          </div>
        }

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ActiveComponent />
        </div>

        {/* Quick Actions Floating Button (Mobile) */}
        {activeInterface === 'inspector' &&
        <div className="fixed bottom-6 right-6 md:hidden">
            <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => toast({ title: "Quick Action", description: "Feature coming soon!" })}>

              <PlusCircle className="w-6 h-6" />
            </Button>
          </div>
        }

        {/* Role Badge */}
        <div className="fixed top-20 right-4 z-50">
          <Badge variant="outline" className="bg-white shadow-sm">
            <Shield className="w-3 h-3 mr-1" />
            {userRole.includes('Administrator') ? 'Admin' :
            userRole.includes('Inspector') ? 'Inspector' : 'Applicant'}
          </Badge>
        </div>
      </div>
    </AuthGuard>);

};

export default PermitManagementPage;