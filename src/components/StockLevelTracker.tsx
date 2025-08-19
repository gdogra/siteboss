import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';

interface StockLevel {
  id: number;
  item_id: number;
  location_id: number;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  quantity_in_transit: number;
  last_counted_at: string;
  last_counted_by: number;
  last_movement_at: string;
  average_cost: number;
  total_value: number;
  updated_at: string;
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  unit_of_measure: string;
  minimum_stock_level: number;
  maximum_stock_level: number;
  reorder_point: number;
}

interface Location {
  id: number;
  name: string;
  code: string;
}

interface AdjustmentForm {
  stock_id: number;
  adjustment_type: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  notes: string;
}

const StockLevelTracker: React.FC = () => {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockLevel | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentForm>({
    stock_id: 0,
    adjustment_type: 'increase',
    quantity: 0,
    reason: '',
    notes: ''
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters = [];
      if (selectedLocation !== 'all') {
        filters.push({ name: "location_id", op: "Equal", value: parseInt(selectedLocation) });
      }

      const [stockResponse, itemsResponse, locationsResponse] = await Promise.all([
        window.ezsite.apis.tablePage(35429, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "updated_at",
          IsAsc: false,
          Filters: filters
        }),
        window.ezsite.apis.tablePage(35427, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "name",
          IsAsc: true,
          Filters: [{ name: "is_active", op: "Equal", value: true }]
        }),
        window.ezsite.apis.tablePage(35428, {
          PageNo: 1,
          PageSize: 1000,
          OrderByField: "name",
          IsAsc: true,
          Filters: [{ name: "is_active", op: "Equal", value: true }]
        })
      ]);

      if (stockResponse.error) throw stockResponse.error;
      if (itemsResponse.error) throw itemsResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      let stockData = stockResponse.data?.List || [];
      const itemsData = itemsResponse.data?.List || [];
      const locationsData = locationsResponse.data?.List || [];

      // Apply stock level filter
      if (stockFilter === 'low') {
        stockData = stockData.filter((stock: StockLevel) => {
          const item = itemsData.find((i: InventoryItem) => i.id === stock.item_id);
          return item && stock.quantity_available <= item.reorder_point;
        });
      } else if (stockFilter === 'out') {
        stockData = stockData.filter((stock: StockLevel) => stock.quantity_available <= 0);
      } else if (stockFilter === 'excess') {
        stockData = stockData.filter((stock: StockLevel) => {
          const item = itemsData.find((i: InventoryItem) => i.id === stock.item_id);
          return item && stock.quantity_available > item.maximum_stock_level;
        });
      }

      // Apply search filter
      if (searchTerm) {
        stockData = stockData.filter((stock: StockLevel) => {
          const item = itemsData.find((i: InventoryItem) => i.id === stock.item_id);
          return item && (
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      setStockLevels(stockData);
      setItems(itemsData);
      setLocations(locationsData);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load stock level data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLocation, stockFilter, searchTerm]);

  const handleStockAdjustment = async () => {
    try {
      if (!selectedStock) return;

      const item = items.find(i => i.id === selectedStock.item_id);
      if (!item) return;

      let newQuantity = selectedStock.quantity_on_hand;
      
      switch (adjustmentForm.adjustment_type) {
        case 'increase':
          newQuantity += adjustmentForm.quantity;
          break;
        case 'decrease':
          newQuantity -= adjustmentForm.quantity;
          break;
        case 'set':
          newQuantity = adjustmentForm.quantity;
          break;
      }

      // Update stock level
      const { error: stockError } = await window.ezsite.apis.tableUpdate(35429, {
        id: selectedStock.id,
        quantity_on_hand: newQuantity,
        quantity_available: newQuantity - selectedStock.quantity_reserved,
        last_counted_at: new Date().toISOString(),
        last_counted_by: 1,
        updated_at: new Date().toISOString()
      });

      if (stockError) throw stockError;

      // Create movement record
      const movementQuantity = adjustmentForm.adjustment_type === 'set' 
        ? newQuantity - selectedStock.quantity_on_hand 
        : adjustmentForm.adjustment_type === 'increase' 
          ? adjustmentForm.quantity 
          : -adjustmentForm.quantity;

      const { error: movementError } = await window.ezsite.apis.tableCreate(35431, {
        item_id: selectedStock.item_id,
        from_location_id: adjustmentForm.adjustment_type === 'decrease' ? selectedStock.location_id : null,
        to_location_id: adjustmentForm.adjustment_type === 'increase' ? selectedStock.location_id : null,
        movement_type: 'adjustment',
        quantity: movementQuantity,
        unit_cost: selectedStock.average_cost,
        total_cost: movementQuantity * selectedStock.average_cost,
        reference_type: 'stock_adjustment',
        notes: adjustmentForm.notes,
        movement_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        created_by: 1
      });

      if (movementError) throw movementError;

      toast({
        title: "Success",
        description: `Stock adjusted for ${item.name}`
      });

      setShowAdjustmentDialog(false);
      setSelectedStock(null);
      setAdjustmentForm({
        stock_id: 0,
        adjustment_type: 'increase',
        quantity: 0,
        reason: '',
        notes: ''
      });
      loadData();

    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Error",
        description: "Failed to adjust stock level",
        variant: "destructive"
      });
    }
  };

  const getItemDetails = (itemId: number) => {
    return items.find(i => i.id === itemId);
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStockStatus = (stock: StockLevel) => {
    const item = getItemDetails(stock.item_id);
    if (!item) return 'unknown';
    
    if (stock.quantity_available <= 0) return 'out';
    if (stock.quantity_available <= item.reorder_point) return 'low';
    if (stock.quantity_available > item.maximum_stock_level) return 'excess';
    return 'normal';
  };

  const getStockProgress = (stock: StockLevel) => {
    const item = getItemDetails(stock.item_id);
    if (!item || item.maximum_stock_level <= 0) return 0;
    
    return Math.min((stock.quantity_available / item.maximum_stock_level) * 100, 100);
  };

  const columns = [
    {
      key: 'item_id',
      title: 'Item',
      render: (value: number, stock: StockLevel) => {
        const item = getItemDetails(value);
        return (
          <div>
            <div className="font-medium">{item?.name || 'Unknown'}</div>
            <div className="text-sm text-gray-500">SKU: {item?.sku || 'N/A'}</div>
          </div>
        );
      }
    },
    {
      key: 'location_id',
      title: 'Location',
      render: (value: number) => getLocationName(value)
    },
    {
      key: 'quantity_available',
      title: 'Available Stock',
      sortable: true,
      render: (value: number, stock: StockLevel) => {
        const item = getItemDetails(stock.item_id);
        const status = getStockStatus(stock);
        const statusColors = {
          out: 'destructive',
          low: 'secondary',
          normal: 'default',
          excess: 'outline',
          unknown: 'outline'
        };

        return (
          <div className="space-y-1">
            <Badge variant={statusColors[status] as any}>
              {value} {item?.unit_of_measure || ''}
            </Badge>
            <Progress value={getStockProgress(stock)} className="h-2" />
          </div>
        );
      }
    },
    {
      key: 'quantity_reserved',
      title: 'Reserved',
      sortable: true,
      render: (value: number, stock: StockLevel) => {
        const item = getItemDetails(stock.item_id);
        return `${value} ${item?.unit_of_measure || ''}`;
      }
    },
    {
      key: 'total_value',
      title: 'Value',
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'last_counted_at',
      title: 'Last Counted',
      sortable: true,
      render: (value: string) => 
        value ? new Date(value).toLocaleDateString() : 'Never'
    }
  ];

  const stockSummary = {
    total: stockLevels.length,
    low: stockLevels.filter(s => getStockStatus(s) === 'low').length,
    out: stockLevels.filter(s => getStockStatus(s) === 'out').length,
    totalValue: stockLevels.reduce((sum, s) => sum + s.total_value, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Level Tracker</h1>
          <p className="text-gray-600">Monitor and adjust inventory stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stockSummary.total}</div>
              <div className="text-sm text-gray-600">Total Stock Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stockSummary.low}</div>
              <div className="text-sm text-gray-600">Low Stock Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stockSummary.out}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stockSummary.totalValue)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Stock filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="excess">Excess Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Levels Table */}
      <DataTable
        title="Stock Levels"
        data={stockLevels}
        columns={columns}
        loading={loading}
        onEdit={(stock) => {
          setSelectedStock(stock);
          setAdjustmentForm({
            stock_id: stock.id,
            adjustment_type: 'increase',
            quantity: 0,
            reason: '',
            notes: ''
          });
          setShowAdjustmentDialog(true);
        }}
        onView={(stock) => {
          const item = getItemDetails(stock.item_id);
          toast({
            title: "Stock Details",
            description: `${item?.name} - ${stock.quantity_available} available`
          });
        }}
      />

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium">{getItemDetails(selectedStock.item_id)?.name}</h4>
                <p className="text-sm text-gray-600">
                  Current: {selectedStock.quantity_available} {getItemDetails(selectedStock.item_id)?.unit_of_measure}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {getLocationName(selectedStock.location_id)}
                </p>
              </div>

              <div>
                <Label htmlFor="adjustment_type">Adjustment Type</Label>
                <Select
                  value={adjustmentForm.adjustment_type}
                  onValueChange={(value: any) => setAdjustmentForm({...adjustmentForm, adjustment_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase Stock</SelectItem>
                    <SelectItem value="decrease">Decrease Stock</SelectItem>
                    <SelectItem value="set">Set Exact Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">
                  {adjustmentForm.adjustment_type === 'set' ? 'New Quantity' : 'Quantity Change'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Select
                  value={adjustmentForm.reason}
                  onValueChange={(value) => setAdjustmentForm({...adjustmentForm, reason: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical_count">Physical Count</SelectItem>
                    <SelectItem value="damaged">Damaged Goods</SelectItem>
                    <SelectItem value="loss">Loss/Theft</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="correction">Data Correction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStockAdjustment}
              disabled={adjustmentForm.quantity <= 0 || !adjustmentForm.reason}
            >
              Apply Adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockLevelTracker;