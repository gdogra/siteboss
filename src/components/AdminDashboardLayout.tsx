
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Monitor,
  TrendingUp,
  AlertTriangle,
  Shield,
  Users,
  Settings,
  Activity,
  Server,
  Bell,
  LogOut } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';
import ScalingControlPanel from '@/components/ScalingControlPanel';
import AlertManagement from '@/components/AlertManagement';
import SecurityIncidentTracker from '@/components/SecurityIncidentTracker';
import UserManagementPanel from '@/components/UserManagementPanel';
import SystemConfigurationPanel from '@/components/SystemConfigurationPanel';

interface User {
  id: number;
  name: string;
  email: string;
  role_name: string;
  role_code: string;
}

const AdminDashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadUserInfo();
    loadAlertCount();
  }, []);

  const loadUserInfo = async () => {
    try {
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadAlertCount = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35451, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: "status", op: "Equal", value: "open" }]

      });
      if (error) throw error;
      setAlertCount(data.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading alert count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await window.ezsite.apis.logout();
      if (error) throw error;
      window.location.href = '/admin-login';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const tabConfig = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Monitor,
    component: SystemHealthMonitor
  },
  {
    id: 'scaling',
    label: 'Scaling',
    icon: TrendingUp,
    component: ScalingControlPanel
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: AlertTriangle,
    badge: alertCount > 0 ? alertCount : undefined,
    component: AlertManagement
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    component: SecurityIncidentTracker
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    component: UserManagementPanel
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    component: SystemConfigurationPanel
  }];


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>);

  }

  if (user.role_code !== 'Administrator') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this dashboard.</p>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Server className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Platform Administration</h1>
            </div>
            {alertCount > 0 &&
            <Badge variant="destructive" className="animate-pulse">
                {alertCount} Active Alerts
              </Badge>
            }
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500">{user.role_name}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 gap-1 bg-white p-1 rounded-lg shadow-sm">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md">

                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge &&
                  <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.badge}
                    </Badge>
                  }
                </TabsTrigger>);

            })}
          </TabsList>

          {tabConfig.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                <Component />
              </TabsContent>);

          })}
        </Tabs>
      </div>
    </div>);

};

export default AdminDashboardLayout;