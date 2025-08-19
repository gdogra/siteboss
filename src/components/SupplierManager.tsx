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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Truck,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  payment_terms: string;
  lead_time_days: number;
  minimum_order_amount: number;
  discount_percentage: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

interface SupplierStats {
  supplier_id: number;
  total_orders: number;
  total_value: number;
  average_delivery_time: number;
  on_time_delivery_rate: number;
  last_order_date: string;
}

const SupplierManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierStats, setSupplierStats] = useState<SupplierStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({});
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters = [];
      if (statusFilter !== 'all') {
        filters.push({ name: "is_active", op: "Equal", value: statusFilter === 'active' });
      }
      if (ratingFilter !== 'all') {
        const rating = parseInt(ratingFilter);
        filters.push({ name: "rating", op: "GreaterThanOrEqual", value: rating });
      }
      if (searchTerm) {
        filters.push({ name: "name", op: "StringContains", value: searchTerm });
      }

      const { data: suppliersData, error: suppliersError } = await window.ezsite.apis.tablePage(35471, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "name",
        IsAsc: true,
        Filters: filters
      });

      if (suppliersError) throw suppliersError;

      // Load purchase orders to calculate supplier statistics
      const { data: purchaseOrdersData, error: poError } = await window.ezsite.apis.tablePage(35472, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "order_date",
        IsAsc: false,
        Filters: []
      });

      if (poError) throw poError;

      // Calculate supplier statistics
      const statsMap: { [key: number]: SupplierStats } = {};
      const purchaseOrders = purchaseOrdersData?.List || [];

      purchaseOrders.forEach((po: any) => {
        if (!statsMap[po.supplier_id]) {
          statsMap[po.supplier_id] = {
            supplier_id: po.supplier_id,
            total_orders: 0,
            total_value: 0,
            average_delivery_time: 0,
            on_time_delivery_rate: 0,
            last_order_date: po.order_date
          };
        }

        const stats = statsMap[po.supplier_id];
        stats.total_orders++;
        stats.total_value += po.total_amount || 0;
        
        if (new Date(po.order_date) > new Date(stats.last_order_date)) {
          stats.last_order_date = po.order_date;
        }

        // Calculate delivery performance (simplified)
        if (po.actual_delivery_date && po.expected_delivery_date) {
          const expectedDate = new Date(po.expected_delivery_date);
          const actualDate = new Date(po.actual_delivery_date);
          const deliveryTime = Math.ceil((actualDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          stats.average_delivery_time = (stats.average_delivery_time + Math.abs(deliveryTime)) / 2;
          
          if (actualDate <= expectedDate) {
            stats.on_time_delivery_rate = ((stats.on_time_delivery_rate * (stats.total_orders - 1)) + 1) / stats.total_orders;
          } else {
            stats.on_time_delivery_rate = (stats.on_time_delivery_rate * (stats.total_orders - 1)) / stats.total_orders;
          }
        }
      });

      setSuppliers(suppliersData?.List || []);
      setSupplierStats(Object.values(statsMap));

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load supplier data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, ratingFilter]);

  const handleAddSupplier = async () => {
    try {
      const now = new Date().toISOString();
      const supplierData = {
        ...formData,
        created_at: now,
        updated_at: now,
        created_by: 1, // Would get from auth context
        updated_by: 1,
        is_active: formData.is_active !== false,
        rating: formData.rating || 0,
        minimum_order_amount: formData.minimum_order_amount || 0,
        discount_percentage: formData.discount_percentage || 0,
        lead_time_days: formData.lead_time_days || 7
      };

      const { error } = await window.ezsite.apis.tableCreate(35471, supplierData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier added successfully"
      });

      setShowAddDialog(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive"
      });
    }
  };

  const handleEditSupplier = async () => {
    try {
      if (!selectedSupplier) return;

      const supplierData = {
        ...formData,
        id: selectedSupplier.id,
        updated_at: new Date().toISOString(),
        updated_by: 1
      };

      const { error } = await window.ezsite.apis.tableUpdate(35471, supplierData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier updated successfully"
      });

      setShowEditDialog(false);
      setSelectedSupplier(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    try {
      // Check if supplier has any purchase orders
      const stats = supplierStats.find(s => s.supplier_id === supplier.id);
      if (stats && stats.total_orders > 0) {
        toast({
          title: "Cannot Delete",
          description: "Supplier has existing purchase orders. Deactivate instead.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await window.ezsite.apis.tableDelete(35471, { ID: supplier.id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
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

  const getSupplierStats = (supplierId: number) => {
    return supplierStats.find(s => s.supplier_id === supplierId);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const columns = [
    {
      key: 'name',
      title: 'Supplier',
      sortable: true,
      render: (value: string, supplier: Supplier) => (
        <div className="flex items-center space-x-3">
          <Building2 className="h-5 w-5 text-gray-400" />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{supplier.contact_person}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Contact',
      render: (value: string, supplier: Supplier) => (
        <div>
          <div className="text-sm flex items-center">
            <Mail className="h-3 w-3 mr-1 text-gray-400" />
            {value || 'No email'}
          </div>
          <div className="text-sm flex items-center mt-1">
            <Phone className="h-3 w-3 mr-1 text-gray-400" />
            {supplier.phone || 'No phone'}
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          {renderStars(value)}
          <span className="text-sm text-gray-600 ml-2">({value})</span>
        </div>
      )
    },
    {
      key: 'lead_time_days',
      title: 'Lead Time',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center text-sm">
          <Clock className="h-3 w-3 mr-1 text-gray-400" />
          {value} days
        </div>
      )
    },
    {
      key: 'id',
      title: 'Performance',
      render: (value: number) => {
        const stats = getSupplierStats(value);
        return (
          <div>
            <div className="text-sm font-medium">
              {stats ? `${stats.total_orders} orders` : '0 orders'}
            </div>
            <div className="text-xs text-gray-500">
              {stats ? formatCurrency(stats.total_value) : '$0.00'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'minimum_order_amount',
      title: 'Min Order',
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const SupplierForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter supplier name"
          />
        </div>
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person || ''}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            placeholder="Contact person name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="supplier@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter full address"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://supplier.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms || ''}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            placeholder="Net 30, COD, etc."
          />
        </div>
        <div>
          <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
          <Input
            id="lead_time_days"
            type="number"
            min="0"
            value={formData.lead_time_days || ''}
            onChange={(e) => setFormData({ ...formData, lead_time_days: parseInt(e.target.value) })}
            placeholder="7"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="minimum_order_amount">Min Order ($)</Label>
          <Input
            id="minimum_order_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.minimum_order_amount ? (formData.minimum_order_amount / 100).toFixed(2) : ''}
            onChange={(e) => setFormData({ ...formData, minimum_order_amount: Math.round(parseFloat(e.target.value) * 100) })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="discount_percentage">Discount %</Label>
          <Input
            id="discount_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.discount_percentage || ''}
            onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
            placeholder="0.0"
          />
        </div>
        <div>
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Select
            value={formData.rating?.toString() || '0'}
            onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No Rating</SelectItem>
              <SelectItem value="1">⭐ (1)</SelectItem>
              <SelectItem value="2">⭐⭐ (2)</SelectItem>
              <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active !== false}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>
  );

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.is_active).length;
  const averageRating = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length 
    : 0;
  const totalOrderValue = supplierStats.reduce((sum, s) => sum + s.total_value, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplier Management</h1>
          <p className="text-gray-600">Manage suppliers and vendor relationships</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSupplier}>
                Add Supplier
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
              <div className="text-2xl font-bold text-blue-600">{totalSuppliers}</div>
              <div className="text-sm text-gray-600">Total Suppliers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
              <div className="text-sm text-gray-600">Active Suppliers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{formatCurrency(totalOrderValue)}</div>
              <div className="text-sm text-gray-600">Total Order Value</div>
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
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                  <SelectItem value="1">1+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <DataTable
        title="Suppliers"
        data={suppliers}
        columns={columns}
        loading={loading}
        onEdit={(supplier) => {
          setSelectedSupplier(supplier);
          setFormData(supplier);
          setShowEditDialog(true);
        }}
        onDelete={handleDeleteSupplier}
        onView={(supplier) => {
          const stats = getSupplierStats(supplier.id);
          toast({
            title: "Supplier Details",
            description: `${supplier.name} - ${stats ? `${stats.total_orders} orders` : 'No orders'}`
          });
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm isEdit />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSupplier}>
              Update Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManager;