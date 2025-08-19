import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle,
  ShoppingCart,
  Plus,
  Search,
  Filter,
  TrendingDown,
  Clock,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';

interface ReorderItem {
  id: number;
  item_id: number;
  item_name: string;
  item_sku: string;
  current_stock: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_of_measure: string;
  unit_cost: number;
  supplier_name: string;
  supplier_id?: number;
  lead_time_days: number;
  location_name: string;
  priority: 'high' | 'medium' | 'low';
  days_out_of_stock?: number;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name: string;
  status: string;
  order_date: string;
  expected_delivery_date: string;
  total_amount: number;
  items_count: number;
}

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  lead_time_days: number;
  is_active: boolean;
}

const ReorderManager: React.FC = () => {
  const [reorderItems, setReorderItems] = useState<ReorderItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePODialog, setShowCreatePODialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ReorderItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [poFormData, setPOFormData] = useState({
    expected_delivery_date: '',
    notes: ''
  });
  const { toast } = useToast();

  const loadReorderItems = async () => {
    try {
      setLoading(true);

      // Load inventory items with stock levels
      const [itemsResponse, stockResponse, locationsResponse] = await Promise.all([
        window.ezsite.apis.tablePage(35427, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "name",
          IsAsc: true,
          Filters: [{ name: "is_active", op: "Equal", value: true }]
        }),
        window.ezsite.apis.tablePage(35429, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "item_id",
          IsAsc: true,
          Filters: []
        }),
        window.ezsite.apis.tablePage(35428, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "name",
          IsAsc: true,
          Filters: [{ name: "is_active", op: "Equal", value: true }]
        })
      ]);

      if (itemsResponse.error) throw itemsResponse.error;
      if (stockResponse.error) throw stockResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      const items = itemsResponse.data?.List || [];
      const stockLevels = stockResponse.data?.List || [];
      const locations = locationsResponse.data?.List || [];

      const locationsMap = new Map(locations.map((l: any) => [l.id, l]));

      // Identify items that need reordering
      const reorderNeeded: ReorderItem[] = [];

      items.forEach((item: any) => {
        const itemStocks = stockLevels.filter((s: any) => s.item_id === item.id);
        
        itemStocks.forEach((stock: any) => {
          if (stock.quantity_available <= item.reorder_point) {
            const location = locationsMap.get(stock.location_id);
            const daysOutOfStock = stock.quantity_available <= 0 ? 
              Math.floor((Date.now() - new Date(stock.last_movement_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) : 
              undefined;

            let priority: 'high' | 'medium' | 'low' = 'medium';
            if (stock.quantity_available <= 0) priority = 'high';
            else if (stock.quantity_available <= item.reorder_point * 0.5) priority = 'high';
            else if (stock.quantity_available <= item.reorder_point * 0.8) priority = 'medium';
            else priority = 'low';

            reorderNeeded.push({
              id: stock.id,
              item_id: item.id,
              item_name: item.name,
              item_sku: item.sku,
              current_stock: stock.quantity_available,
              reorder_point: item.reorder_point,
              reorder_quantity: item.reorder_quantity || 100,
              unit_of_measure: item.unit_of_measure,
              unit_cost: item.unit_cost,
              supplier_name: item.supplier_name || 'No Supplier',
              lead_time_days: item.lead_time_days || 7,
              location_name: location?.name || 'Unknown',
              priority,
              days_out_of_stock: daysOutOfStock
            });
          }
        });
      });

      // Sort by priority (high first) and days out of stock
      reorderNeeded.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return (b.days_out_of_stock || 0) - (a.days_out_of_stock || 0);
      });

      setReorderItems(reorderNeeded);

    } catch (error) {
      console.error('Error loading reorder data:', error);
      toast({
        title: "Error",
        description: "Failed to load reorder data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35472, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "order_date",
        IsAsc: false,
        Filters: [
          { name: "status", op: "StringContains", value: "pending" }
        ]
      });

      if (error) throw error;
      setPurchaseOrders(data?.List || []);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35471, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "name",
        IsAsc: true,
        Filters: [{ name: "is_active", op: "Equal", value: true }]
      });

      if (error) throw error;
      setSuppliers(data?.List || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  useEffect(() => {
    loadReorderItems();
    loadPurchaseOrders();
    loadSuppliers();
  }, []);

  const handleCreatePO = async () => {
    try {
      if (selectedItems.length === 0 || !selectedSupplier) {
        toast({
          title: "Missing Information",
          description: "Please select items and a supplier",
          variant: "destructive"
        });
        return;
      }

      const supplier = suppliers.find(s => s.id.toString() === selectedSupplier);
      if (!supplier) return;

      // Generate PO number
      const poNumber = `PO-${Date.now().toString().slice(-6)}`;
      
      // Calculate totals
      const subtotal = selectedItems.reduce((sum, item) => 
        sum + (item.unit_cost * item.reorder_quantity), 0
      );
      const taxAmount = subtotal * 0.08; // 8% tax
      const totalAmount = subtotal + taxAmount;

      // Create purchase order
      const { error: poError } = await window.ezsite.apis.tableCreate(35472, {
        po_number: poNumber,
        supplier_id: supplier.id,
        status: 'draft',
        order_date: new Date().toISOString(),
        expected_delivery_date: poFormData.expected_delivery_date || 
          new Date(Date.now() + supplier.lead_time_days * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: poFormData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 1,
        updated_by: 1
      });

      if (poError) throw poError;

      // Get the created PO ID (in a real implementation, the API would return the ID)
      const poId = Date.now(); // This would come from the API response

      // Create PO line items
      for (const item of selectedItems) {
        const { error: lineError } = await window.ezsite.apis.tableCreate(35473, {
          po_id: poId,
          item_id: item.item_id,
          quantity_ordered: item.reorder_quantity,
          quantity_received: 0,
          unit_cost: item.unit_cost,
          total_cost: item.unit_cost * item.reorder_quantity,
          notes: `Auto-generated from reorder alert`
        });

        if (lineError) throw lineError;
      }

      toast({
        title: "Success",
        description: `Purchase order ${poNumber} created successfully`
      });

      setShowCreatePODialog(false);
      setSelectedItems([]);
      setSelectedSupplier('');
      setPOFormData({ expected_delivery_date: '', notes: '' });
      loadPurchaseOrders();

    } catch (error) {
      console.error('Error creating PO:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const reorderColumns = [
    {
      key: 'priority',
      title: 'Priority',
      render: (value: string, item: ReorderItem) => (
        <div className="flex items-center space-x-2">
          <Badge variant={getPriorityColor(value) as any}>
            {value.toUpperCase()}
          </Badge>
          {item.days_out_of_stock && (
            <Badge variant="destructive" className="text-xs">
              {item.days_out_of_stock}d out
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'item_name',
      title: 'Item',
      render: (value: string, item: ReorderItem) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            SKU: {item.item_sku} | {item.location_name}
          </div>
        </div>
      )
    },
    {
      key: 'current_stock',
      title: 'Current Stock',
      render: (value: number, item: ReorderItem) => (
        <div className="text-center">
          <div className={`font-medium ${value <= 0 ? 'text-red-600' : 'text-orange-600'}`}>
            {value}
          </div>
          <div className="text-xs text-gray-500">
            Min: {item.reorder_point}
          </div>
        </div>
      )
    },
    {
      key: 'reorder_quantity',
      title: 'Suggested Order',
      render: (value: number, item: ReorderItem) => (
        <div className="text-center">
          <div className="font-medium">{value} {item.unit_of_measure}</div>
          <div className="text-xs text-gray-500">
            {formatCurrency(item.unit_cost * value)}
          </div>
        </div>
      )
    },
    {
      key: 'supplier_name',
      title: 'Supplier',
      render: (value: string, item: ReorderItem) => (
        <div>
          <div className="text-sm">{value}</div>
          <div className="text-xs text-gray-500">
            {item.lead_time_days} day lead time
          </div>
        </div>
      )
    }
  ];

  const poColumns = [
    {
      key: 'po_number',
      title: 'PO Number',
      render: (value: string) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'supplier_name',
      title: 'Supplier',
      render: (value: string) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      key: 'order_date',
      title: 'Order Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'expected_delivery_date',
      title: 'Expected Delivery',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'total_amount',
      title: 'Amount',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'pending' ? 'secondary' : 'default'}>
          {value}
        </Badge>
      )
    }
  ];

  const summaryStats = {
    totalReorderItems: reorderItems.length,
    highPriority: reorderItems.filter(item => item.priority === 'high').length,
    outOfStock: reorderItems.filter(item => item.current_stock <= 0).length,
    estimatedOrderValue: reorderItems.reduce((sum, item) => 
      sum + (item.unit_cost * item.reorder_quantity), 0
    ),
    pendingOrders: purchaseOrders.length,
    pendingOrderValue: purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reorder Management</h1>
          <p className="text-gray-600">Manage inventory reorders and purchase orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReorderItems}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreatePODialog} onOpenChange={setShowCreatePODialog}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={selectedItems.length === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Purchase Order ({selectedItems.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Selected Items ({selectedItems.length})</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                        <span>{item.item_name}</span>
                        <span>{item.reorder_quantity} × {formatCurrency(item.unit_cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name} ({supplier.lead_time_days} day lead time)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="delivery_date">Expected Delivery Date</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={poFormData.expected_delivery_date}
                    onChange={(e) => setPOFormData({...poFormData, expected_delivery_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={poFormData.notes}
                    onChange={(e) => setPOFormData({...poFormData, notes: e.target.value})}
                    placeholder="Additional notes for the purchase order"
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Total:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedItems.reduce((sum, item) => 
                        sum + (item.unit_cost * item.reorder_quantity), 0
                      ))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreatePODialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePO}
                  disabled={!selectedSupplier || selectedItems.length === 0}
                >
                  Create Purchase Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{summaryStats.totalReorderItems}</div>
              <div className="text-xs text-gray-600">Items Need Reorder</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-700">{summaryStats.highPriority}</div>
              <div className="text-xs text-gray-600">High Priority</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{summaryStats.outOfStock}</div>
              <div className="text-xs text-gray-600">Out of Stock</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(summaryStats.estimatedOrderValue)}
              </div>
              <div className="text-xs text-gray-600">Est. Order Value</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{summaryStats.pendingOrders}</div>
              <div className="text-xs text-gray-600">Pending Orders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(summaryStats.pendingOrderValue)}
              </div>
              <div className="text-xs text-gray-600">Pending Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for critical items */}
      {summaryStats.highPriority > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Inventory Alert</AlertTitle>
          <AlertDescription>
            You have {summaryStats.highPriority} high-priority items that need immediate attention.
            {summaryStats.outOfStock > 0 && ` ${summaryStats.outOfStock} items are completely out of stock.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="reorder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reorder">
            Reorder Items ({summaryStats.totalReorderItems})
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            Purchase Orders ({summaryStats.pendingOrders})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reorder" className="space-y-4">
          <DataTable
            title="Items Requiring Reorder"
            data={reorderItems}
            columns={reorderColumns}
            loading={loading}
            onView={(item) => {
              const isSelected = selectedItems.some(si => si.id === item.id);
              if (isSelected) {
                setSelectedItems(selectedItems.filter(si => si.id !== item.id));
              } else {
                setSelectedItems([...selectedItems, item]);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4">
          <DataTable
            title="Pending Purchase Orders"
            data={purchaseOrders}
            columns={poColumns}
            loading={false}
            onView={(po) => {
              toast({
                title: "Purchase Order Details",
                description: `${po.po_number} - ${formatCurrency(po.total_amount)}`
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReorderManager;