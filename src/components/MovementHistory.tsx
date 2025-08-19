import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Activity,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Package,
  MapPin,
  Calendar as CalendarIcon,
  RefreshCw,
  FileText,
  User,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';
import { format } from 'date-fns';

interface Movement {
  id: number;
  item_id: number;
  from_location_id: number;
  to_location_id: number;
  movement_type: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  reference_number: string;
  reference_type: string;
  project_id: number;
  work_order_id: number;
  barcode_scanned: string;
  notes: string;
  movement_date: string;
  created_at: string;
  created_by: number;
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  unit_of_measure: string;
}

interface Location {
  id: number;
  name: string;
  code: string;
}

const MovementHistory: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const movementTypes = [
  { value: 'receipt', label: 'Receipt', icon: Plus, color: 'green' },
  { value: 'issue', label: 'Issue', icon: Minus, color: 'red' },
  { value: 'transfer', label: 'Transfer', icon: ArrowRight, color: 'blue' },
  { value: 'adjustment', label: 'Adjustment', icon: RotateCcw, color: 'orange' },
  { value: 'return', label: 'Return', icon: RefreshCw, color: 'purple' }];


  const loadData = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters = [];

      if (movementTypeFilter !== 'all') {
        filters.push({ name: "movement_type", op: "Equal", value: movementTypeFilter });
      }

      if (itemFilter !== 'all') {
        filters.push({ name: "item_id", op: "Equal", value: parseInt(itemFilter) });
      }

      if (locationFilter !== 'all') {
        filters.push({
          name: "from_location_id",
          op: "Equal",
          value: parseInt(locationFilter)
        });
        // Also check to_location_id - this would need OR logic in a real implementation
      }

      if (dateFrom) {
        filters.push({
          name: "movement_date",
          op: "GreaterThanOrEqual",
          value: dateFrom.toISOString()
        });
      }

      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filters.push({
          name: "movement_date",
          op: "LessThanOrEqual",
          value: endOfDay.toISOString()
        });
      }

      if (searchTerm) {
        filters.push({ name: "reference_number", op: "StringContains", value: searchTerm });
      }

      const [movementsResponse, itemsResponse, locationsResponse] = await Promise.all([
      window.ezsite.apis.tablePage(35431, {
        PageNo: 1,
        PageSize: 200,
        OrderByField: "movement_date",
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
      })]
      );

      if (movementsResponse.error) throw movementsResponse.error;
      if (itemsResponse.error) throw itemsResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      setMovements(movementsResponse.data?.List || []);
      setItems(itemsResponse.data?.List || []);
      setLocations(locationsResponse.data?.List || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load movement history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [movementTypeFilter, itemFilter, locationFilter, dateFrom, dateTo, searchTerm]);

  const getItemDetails = (itemId: number) => {
    return items.find((i) => i.id === itemId);
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find((l) => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getMovementTypeConfig = (type: string) => {
    return movementTypes.find((t) => t.value === type) || movementTypes[0];
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const columns = [
  {
    key: 'movement_date',
    title: 'Date',
    sortable: true,
    render: (value: string) =>
    <div className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy')}
          <div className="text-xs text-gray-500">
            {format(new Date(value), 'h:mm a')}
          </div>
        </div>

  },
  {
    key: 'movement_type',
    title: 'Type',
    render: (value: string, movement: Movement) => {
      const config = getMovementTypeConfig(value);
      const Icon = config.icon;
      return (
        <div className="flex items-center space-x-2">
            <Icon className={`h-4 w-4 text-${config.color}-500`} />
            <Badge variant="outline" className={`text-${config.color}-600`}>
              {config.label}
            </Badge>
          </div>);

    }
  },
  {
    key: 'item_id',
    title: 'Item',
    render: (value: number, movement: Movement) => {
      const item = getItemDetails(value);
      return (
        <div>
            <div className="font-medium">{item?.name || 'Unknown'}</div>
            <div className="text-sm text-gray-500">SKU: {item?.sku || 'N/A'}</div>
          </div>);

    }
  },
  {
    key: 'quantity',
    title: 'Quantity',
    sortable: true,
    render: (value: number, movement: Movement) => {
      const item = getItemDetails(movement.item_id);
      const isPositive = value > 0;
      return (
        <div className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{value} {item?.unit_of_measure || ''}
          </div>);

    }
  },
  {
    key: 'from_location_id',
    title: 'Movement',
    render: (value: number, movement: Movement) => {
      const fromLocation = getLocationName(value);
      const toLocation = getLocationName(movement.to_location_id);

      if (movement.movement_type === 'transfer') {
        return (
          <div className="flex items-center text-sm">
              <span className="text-gray-600">{fromLocation}</span>
              <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
              <span className="text-gray-600">{toLocation}</span>
            </div>);

      }

      return (
        <div className="text-sm">
            {movement.movement_type === 'receipt' ? toLocation :
          movement.movement_type === 'issue' ? fromLocation :
          fromLocation || toLocation}
          </div>);

    }
  },
  {
    key: 'total_cost',
    title: 'Value',
    sortable: true,
    render: (value: number) =>
    <div className="text-sm font-medium">
          {formatCurrency(Math.abs(value))}
        </div>

  },
  {
    key: 'reference_number',
    title: 'Reference',
    render: (value: string, movement: Movement) =>
    <div>
          <div className="text-sm font-mono">{value || 'N/A'}</div>
          {movement.reference_type &&
      <div className="text-xs text-gray-500 capitalize">
              {movement.reference_type.replace('_', ' ')}
            </div>
      }
        </div>

  }];


  // Calculate summary statistics
  const summaryStats = {
    totalMovements: movements.length,
    receipts: movements.filter((m) => m.movement_type === 'receipt').length,
    issues: movements.filter((m) => m.movement_type === 'issue').length,
    transfers: movements.filter((m) => m.movement_type === 'transfer').length,
    adjustments: movements.filter((m) => m.movement_type === 'adjustment').length,
    totalValue: movements.reduce((sum, m) => sum + Math.abs(m.total_cost || 0), 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Movement History</h1>
          <p className="text-gray-600">Track all inventory movements and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold">{summaryStats.totalMovements}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{summaryStats.receipts}</div>
              <div className="text-xs text-gray-600">Receipts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{summaryStats.issues}</div>
              <div className="text-xs text-gray-600">Issues</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{summaryStats.transfers}</div>
              <div className="text-xs text-gray-600">Transfers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{summaryStats.adjustments}</div>
              <div className="text-xs text-gray-600">Adjustments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{formatCurrency(summaryStats.totalValue)}</div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />

              </div>
            </div>
            
            <div>
              <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Movement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {movementTypes.map((type) =>
                  <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={itemFilter} onValueChange={setItemFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {items.slice(0, 50).map((item) =>
                  <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) =>
                  <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFrom ? format(dateFrom, 'MMM dd') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus />

                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateTo ? format(dateTo, 'MMM dd') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus />

                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {(dateFrom || dateTo || movementTypeFilter !== 'all' || itemFilter !== 'all' || locationFilter !== 'all' || searchTerm) &&
          <div className="mt-4 flex items-center gap-2">
              <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom(undefined);
                setDateTo(undefined);
                setMovementTypeFilter('all');
                setItemFilter('all');
                setLocationFilter('all');
                setSearchTerm('');
              }}>

                Clear Filters
              </Button>
              <Badge variant="outline">
                {movements.length} movements found
              </Badge>
            </div>
          }
        </CardContent>
      </Card>

      {/* Movement History Table */}
      <DataTable
        title="Movement History"
        data={movements}
        columns={columns}
        loading={loading}
        onView={(movement) => {
          const item = getItemDetails(movement.item_id);
          toast({
            title: "Movement Details",
            description: `${item?.name} - ${movement.movement_type} of ${movement.quantity} units`
          });
        }} />

    </div>);

};

export default MovementHistory;