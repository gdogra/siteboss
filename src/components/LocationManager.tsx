import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  MapPin,
  Plus,
  Search,
  Building,
  Truck,
  Home,
  Factory,
  Edit,
  Trash2,
  Eye,
  Navigation,
  Phone,
  User } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';

interface Location {
  id: number;
  name: string;
  code: string;
  type: string;
  address: string;
  gps_coordinates: string;
  contact_person: string;
  contact_phone: string;
  parent_location_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

interface LocationStock {
  location_id: number;
  total_items: number;
  total_value: number;
  unique_items: number;
}

const LocationManager: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationStocks, setLocationStocks] = useState<LocationStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const { toast } = useToast();

  const locationTypes = [
  { value: 'warehouse', label: 'Warehouse', icon: Building },
  { value: 'jobsite', label: 'Job Site', icon: Factory },
  { value: 'vehicle', label: 'Vehicle', icon: Truck },
  { value: 'office', label: 'Office', icon: Home },
  { value: 'supplier', label: 'Supplier', icon: Building },
  { value: 'customer', label: 'Customer', icon: User }];


  const loadData = async () => {
    try {
      setLoading(true);

      // Load locations
      const filters = [];
      if (typeFilter !== 'all') {
        filters.push({ name: "type", op: "Equal", value: typeFilter });
      }
      if (searchTerm) {
        filters.push({ name: "name", op: "StringContains", value: searchTerm });
      }

      const { data: locationsData, error: locationsError } = await window.ezsite.apis.tablePage(35428, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "name",
        IsAsc: true,
        Filters: filters
      });

      if (locationsError) throw locationsError;

      // Load stock levels for each location to get summary data
      const { data: stockData, error: stockError } = await window.ezsite.apis.tablePage(35429, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "location_id",
        IsAsc: true,
        Filters: []
      });

      if (stockError) throw stockError;

      // Calculate stock summaries by location
      const stockSummaries: {[key: number]: LocationStock;} = {};
      if (stockData?.List) {
        stockData.List.forEach((stock: any) => {
          if (!stockSummaries[stock.location_id]) {
            stockSummaries[stock.location_id] = {
              location_id: stock.location_id,
              total_items: 0,
              total_value: 0,
              unique_items: 0
            };
          }
          stockSummaries[stock.location_id].total_items += stock.quantity_on_hand || 0;
          stockSummaries[stock.location_id].total_value += stock.total_value || 0;
          stockSummaries[stock.location_id].unique_items += 1;
        });
      }

      setLocations(locationsData?.List || []);
      setLocationStocks(Object.values(stockSummaries));

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load location data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, typeFilter]);

  const handleAddLocation = async () => {
    try {
      const now = new Date().toISOString();
      const locationData = {
        ...formData,
        created_at: now,
        updated_at: now,
        created_by: 1, // Would get from auth context
        updated_by: 1,
        is_active: formData.is_active !== false,
        code: formData.code || generateLocationCode(formData.name || '', formData.type || '')
      };

      const { error } = await window.ezsite.apis.tableCreate(35428, locationData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Location added successfully"
      });

      setShowAddDialog(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive"
      });
    }
  };

  const handleEditLocation = async () => {
    try {
      if (!selectedLocation) return;

      const locationData = {
        ...formData,
        id: selectedLocation.id,
        updated_at: new Date().toISOString(),
        updated_by: 1
      };

      const { error } = await window.ezsite.apis.tableUpdate(35428, locationData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Location updated successfully"
      });

      setShowEditDialog(false);
      setSelectedLocation(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    try {
      // Check if location has stock
      const stockForLocation = locationStocks.find((s) => s.location_id === location.id);
      if (stockForLocation && stockForLocation.total_items > 0) {
        toast({
          title: "Cannot Delete",
          description: "Location has inventory items. Please move items before deleting.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await window.ezsite.apis.tableDelete(35428, { ID: location.id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Location deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      });
    }
  };

  const generateLocationCode = (name: string, type: string) => {
    const nameCode = name.substring(0, 3).toUpperCase();
    const typeCode = type.substring(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${nameCode}${typeCode}${random}`;
  };

  const getLocationStock = (locationId: number) => {
    return locationStocks.find((s) => s.location_id === locationId);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = locationTypes.find((t) => t.value === type);
    return typeConfig?.icon || MapPin;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getParentLocationName = (parentId: number) => {
    const parent = locations.find((l) => l.id === parentId);
    return parent?.name || '';
  };

  const columns = [
  {
    key: 'name',
    title: 'Location',
    sortable: true,
    render: (value: string, location: Location) => {
      const Icon = getTypeIcon(location.type);
      return (
        <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-sm text-gray-500">
                Code: {location.code} | {location.type}
              </div>
            </div>
          </div>);

    }
  },
  {
    key: 'address',
    title: 'Address',
    render: (value: string, location: Location) =>
    <div>
          <div className="text-sm">{value || 'No address'}</div>
          {location.gps_coordinates &&
      <div className="text-xs text-gray-500 flex items-center mt-1">
              <Navigation className="h-3 w-3 mr-1" />
              {location.gps_coordinates}
            </div>
      }
        </div>

  },
  {
    key: 'contact_person',
    title: 'Contact',
    render: (value: string, location: Location) =>
    <div>
          <div className="text-sm">{value || 'No contact'}</div>
          {location.contact_phone &&
      <div className="text-xs text-gray-500 flex items-center mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {location.contact_phone}
            </div>
      }
        </div>

  },
  {
    key: 'id',
    title: 'Inventory',
    render: (value: number) => {
      const stock = getLocationStock(value);
      return (
        <div>
            <div className="text-sm font-medium">
              {stock?.unique_items || 0} items
            </div>
            <div className="text-xs text-gray-500">
              {formatCurrency(stock?.total_value || 0)}
            </div>
          </div>);

    }
  },
  {
    key: 'parent_location_id',
    title: 'Parent Location',
    render: (value: number) =>
    <div className="text-sm">
          {value ? getParentLocationName(value) : 'None'}
        </div>

  },
  {
    key: 'is_active',
    title: 'Status',
    render: (value: boolean) =>
    <Badge variant={value ? "default" : "secondary"}>
          {value ? 'Active' : 'Inactive'}
        </Badge>

  }];


  const LocationForm = ({ isEdit = false }: {isEdit?: boolean;}) =>
  <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Location Name *</Label>
          <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter location name" />

        </div>
        <div>
          <Label htmlFor="code">Location Code</Label>
          <Input
          id="code"
          value={formData.code || ''}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Auto-generated if empty" />

        </div>
      </div>

      <div>
        <Label htmlFor="type">Location Type *</Label>
        <Select
        value={formData.type || ''}
        onValueChange={(value) => setFormData({ ...formData, type: value })}>

          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {locationTypes.map((type) =>
          <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
          )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
        id="address"
        value={formData.address || ''}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        placeholder="Enter address"
        rows={2} />

      </div>

      <div>
        <Label htmlFor="gps">GPS Coordinates</Label>
        <Input
        id="gps"
        value={formData.gps_coordinates || ''}
        onChange={(e) => setFormData({ ...formData, gps_coordinates: e.target.value })}
        placeholder="e.g., 40.7128, -74.0060" />

      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
          id="contact_person"
          value={formData.contact_person || ''}
          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          placeholder="Contact name" />

        </div>
        <div>
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
          id="contact_phone"
          value={formData.contact_phone || ''}
          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
          placeholder="Phone number" />

        </div>
      </div>

      <div>
        <Label htmlFor="parent">Parent Location</Label>
        <Select
        value={formData.parent_location_id?.toString() || ''}
        onValueChange={(value) => setFormData({ ...formData, parent_location_id: value ? parseInt(value) : undefined })}>

          <SelectTrigger>
            <SelectValue placeholder="Select parent location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {locations.filter((l) => l.id !== selectedLocation?.id).map((location) =>
          <SelectItem key={location.id} value={location.id.toString()}>
                {location.name} ({location.code})
              </SelectItem>
          )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
        id="is_active"
        checked={formData.is_active !== false}
        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />

        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>;


  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.is_active).length;
  const totalInventoryValue = locationStocks.reduce((sum, s) => sum + s.total_value, 0);
  const totalInventoryItems = locationStocks.reduce((sum, s) => sum + s.total_items, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-gray-600">Manage warehouse locations and storage areas</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <LocationForm />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLocation}>
                Add Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalLocations}</div>
              <div className="text-sm text-gray-600">Total Locations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeLocations}</div>
              <div className="text-sm text-gray-600">Active Locations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalInventoryItems.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Inventory</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalInventoryValue)}</div>
              <div className="text-sm text-gray-600">Inventory Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />

              </div>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {locationTypes.map((type) =>
                  <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <DataTable
        title="Locations"
        data={locations}
        columns={columns}
        loading={loading}
        onEdit={(location) => {
          setSelectedLocation(location);
          setFormData(location);
          setShowEditDialog(true);
        }}
        onDelete={handleDeleteLocation}
        onView={(location) => {
          const stock = getLocationStock(location.id);
          toast({
            title: "Location Details",
            description: `${location.name} - ${stock?.unique_items || 0} unique items`
          });
        }} />


      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <LocationForm isEdit />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLocation}>
              Update Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default LocationManager;