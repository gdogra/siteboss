import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Barcode,
  ShoppingCart,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  Download } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StatsCard from '@/components/StatsCard';

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  totalLocations: number;
  recentMovements: number;
  pendingOrders: number;
}

interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  location: string;
}

interface RecentMovement {
  id: number;
  itemName: string;
  movementType: string;
  quantity: number;
  location: string;
  date: string;
  user: string;
}

const InventoryDashboard: React.FC = () => {
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    totalLocations: 0,
    recentMovements: 0,
    pendingOrders: 0
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load inventory items for total count and value
      const { data: itemsData, error: itemsError } = await window.ezsite.apis.tablePage(35427, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "id",
        IsAsc: false,
        Filters: [{ name: "is_active", op: "Equal", value: true }]
      });

      if (itemsError) throw itemsError;

      // Load stock levels
      const { data: stockData, error: stockError } = await window.ezsite.apis.tablePage(35429, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (stockError) throw stockError;

      // Load locations
      const { data: locationsData, error: locationsError } = await window.ezsite.apis.tablePage(35428, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "id",
        IsAsc: false,
        Filters: [{ name: "is_active", op: "Equal", value: true }]
      });

      if (locationsError) throw locationsError;

      // Load recent movements
      const { data: movementsData, error: movementsError } = await window.ezsite.apis.tablePage(35431, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: "created_at",
        IsAsc: false,
        Filters: []
      });

      if (movementsError) throw movementsError;

      // Calculate stats
      const totalValue = stockData?.List?.reduce((sum: number, stock: any) => sum + (stock.total_value || 0), 0) || 0;
      const itemsMap = new Map(itemsData?.List?.map((item: any) => [item.id, item]));
      const locationsMap = new Map(locationsData?.List?.map((loc: any) => [loc.id, loc]));

      // Identify low stock items
      const lowStock = stockData?.List?.filter((stock: any) => {
        const item = itemsMap.get(stock.item_id);
        return item && stock.quantity_available <= item.reorder_point;
      }).map((stock: any) => {
        const item = itemsMap.get(stock.item_id);
        const location = locationsMap.get(stock.location_id);
        return {
          id: stock.id,
          name: item?.name || 'Unknown',
          sku: item?.sku || 'N/A',
          currentStock: stock.quantity_available || 0,
          minimumStock: item?.reorder_point || 0,
          location: location?.name || 'Unknown'
        };
      }) || [];

      // Format recent movements
      const movements = movementsData?.List?.map((movement: any) => {
        const item = itemsMap.get(movement.item_id);
        const fromLocation = locationsMap.get(movement.from_location_id);
        const toLocation = locationsMap.get(movement.to_location_id);

        return {
          id: movement.id,
          itemName: item?.name || 'Unknown',
          movementType: movement.movement_type || 'Unknown',
          quantity: movement.quantity || 0,
          location: toLocation?.name || fromLocation?.name || 'Unknown',
          date: new Date(movement.movement_date || movement.created_at).toLocaleDateString(),
          user: 'System User' // Would need to join with users table
        };
      }) || [];

      setStats({
        totalItems: itemsData?.VirtualCount || 0,
        totalValue: totalValue,
        lowStockItems: lowStock.length,
        totalLocations: locationsData?.VirtualCount || 0,
        recentMovements: movementsData?.VirtualCount || 0,
        pendingOrders: 0 // Would need purchase orders data
      });

      setLowStockItems(lowStock);
      setRecentMovements(movements);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) =>
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
            )}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>);

  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your inventory in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          icon={Package}
          description="Active inventory items"
          color="blue" />

        <StatsCard
          title="Total Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          description="Current inventory value"
          color="green" />

        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          description="Items below reorder point"
          color={stats.lowStockItems > 0 ? "red" : "green"} />

        <StatsCard
          title="Locations"
          value={stats.totalLocations}
          icon={MapPin}
          description="Active storage locations"
          color="default" />

      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Actions</TabsTrigger>
          <TabsTrigger value="movements">Recent Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Barcode className="h-6 w-6 mb-2" />
                    Scan Barcode
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Package className="h-6 w-6 mb-2" />
                    Add Item
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Stock Adjustment
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    Create PO
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Available Stock</span>
                    <Badge variant="outline">{stats.totalItems - stats.lowStockItems} items</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low Stock Items</span>
                    <Badge variant={stats.lowStockItems > 0 ? "destructive" : "default"}>
                      {stats.lowStockItems} items
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recent Movements</span>
                    <Badge variant="outline">{stats.recentMovements} this week</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Locations</span>
                    <Badge variant="outline">{stats.totalLocations} locations</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Low Stock Alerts ({lowStockItems.length})
                </CardTitle>
                <Button size="sm" variant="outline">
                  Generate Reorders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ?
              <p className="text-center text-gray-500 py-4">No low stock items at this time</p> :

              <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item) =>
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.sku} | {item.location}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-1">
                          {item.currentStock} / {item.minimumStock}
                        </Badge>
                        <p className="text-xs text-gray-500">Current / Minimum</p>
                      </div>
                    </div>
                )}
                  {lowStockItems.length > 5 &&
                <Button variant="ghost" className="w-full">
                      View All {lowStockItems.length} Low Stock Items
                    </Button>
                }
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Inventory Movements</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMovements.length === 0 ?
              <p className="text-center text-gray-500 py-4">No recent movements</p> :

              <div className="space-y-3">
                  {recentMovements.map((movement) =>
                <div key={movement.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{movement.itemName}</h4>
                          <p className="text-sm text-gray-600">{movement.movementType} | {movement.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={movement.quantity > 0 ? "default" : "secondary"}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{movement.date}</p>
                      </div>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Top Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Inventory Turnover</span>
                      <span className="font-medium">2.4x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Days on Hand</span>
                      <span className="font-medium">152 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock Accuracy</span>
                      <span className="font-medium">96.2%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Movement Trends</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>This Month</span>
                      <span className="font-medium text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Month</span>
                      <span className="font-medium">450 movements</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Daily</span>
                      <span className="font-medium">15 movements</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default InventoryDashboard;