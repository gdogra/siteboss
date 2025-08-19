import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import InventoryDashboard from '@/components/InventoryDashboard';
import ItemManagement from '@/components/ItemManagement';
import BarcodeManager from '@/components/BarcodeManager';
import StockLevelTracker from '@/components/StockLevelTracker';
import LocationManager from '@/components/LocationManager';
import MovementHistory from '@/components/MovementHistory';
import ReorderManager from '@/components/ReorderManager';
import SupplierManager from '@/components/SupplierManager';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  TrendingUp,
  MapPin,
  Activity,
  AlertTriangle,
  Building2 } from
'lucide-react';

const InventoryManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: InventoryDashboard,
    description: 'Overview and key metrics'
  },
  {
    id: 'items',
    label: 'Items',
    icon: Package,
    component: ItemManagement,
    description: 'Manage inventory items'
  },
  {
    id: 'barcodes',
    label: 'Barcodes',
    icon: ScanLine,
    component: BarcodeManager,
    description: 'Barcode generation and scanning'
  },
  {
    id: 'stock-levels',
    label: 'Stock Levels',
    icon: TrendingUp,
    component: StockLevelTracker,
    description: 'Monitor and adjust stock'
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: MapPin,
    component: LocationManager,
    description: 'Manage storage locations'
  },
  {
    id: 'movements',
    label: 'Movements',
    icon: Activity,
    component: MovementHistory,
    description: 'Track inventory movements'
  },
  {
    id: 'reorders',
    label: 'Reorders',
    icon: AlertTriangle,
    component: ReorderManager,
    description: 'Manage reorder alerts'
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    icon: Building2,
    component: SupplierManager,
    description: 'Manage suppliers'
  }];


  const currentTab = tabConfig.find((tab) => tab.id === activeTab);
  const ActiveComponent = currentTab?.component || InventoryDashboard;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive inventory tracking and management system
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  {tabConfig.length} Modules
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="border-b border-gray-200 bg-white rounded-t-lg">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-2">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col items-center p-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">

                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </TabsTrigger>);

                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm min-h-[600px]">
              {tabConfig.map((tab) => {
                const Component = tab.component;
                return (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <Component />
                  </TabsContent>);

              })}
            </div>
          </Tabs>

          {/* Quick Stats Footer */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Management Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-gray-600">Real-time Tracking</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">📱</div>
                  <div className="text-sm text-gray-600">Mobile Compatible</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">🔄</div>
                  <div className="text-sm text-gray-600">Auto Reorder Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>);

};

export default InventoryManagementPage;