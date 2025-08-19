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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Barcode,
  Upload,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  category_id: number;
  manufacturer: string;
  model_number: string;
  unit_of_measure: string;
  unit_cost: number;
  unit_price: number;
  weight: number;
  dimensions: string;
  minimum_stock_level: number;
  maximum_stock_level: number;
  reorder_point: number;
  reorder_quantity: number;
  lead_time_days: number;
  supplier_name: string;
  supplier_part_number: string;
  is_active: boolean;
  is_serialized: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

const ItemManagement: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await window.ezsite.apis.tablePage(35426, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "name",
        IsAsc: true,
        Filters: [{ name: "is_active", op: "Equal", value: true }]
      });

      if (categoriesError) throw categoriesError;

      // Load items
      const filters = [];
      if (selectedCategory !== 'all') {
        filters.push({ name: "category_id", op: "Equal", value: parseInt(selectedCategory) });
      }
      if (searchTerm) {
        filters.push({ name: "name", op: "StringContains", value: searchTerm });
      }

      const { data: itemsData, error: itemsError } = await window.ezsite.apis.tablePage(35427, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "name",
        IsAsc: true,
        Filters: filters
      });

      if (itemsError) throw itemsError;

      setCategories(categoriesData?.List || []);
      setItems(itemsData?.List || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchTerm]);

  const handleAddItem = async () => {
    try {
      const now = new Date().toISOString();
      const itemData = {
        ...formData,
        created_at: now,
        updated_at: now,
        created_by: 1, // Would get from auth context
        updated_by: 1,
        is_active: formData.is_active !== false
      };

      const { error } = await window.ezsite.apis.tableCreate(35427, itemData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added successfully"
      });

      setShowAddDialog(false);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const handleEditItem = async () => {
    try {
      if (!selectedItem) return;

      const itemData = {
        ...formData,
        id: selectedItem.id,
        updated_at: new Date().toISOString(),
        updated_by: 1
      };

      const { error } = await window.ezsite.apis.tableUpdate(35427, itemData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Item updated successfully"
      });

      setShowEditDialog(false);
      setSelectedItem(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      const { error } = await window.ezsite.apis.tableDelete(35427, { ID: item.id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
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

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const columns = [
    {
      key: 'sku',
      title: 'SKU',
      sortable: true,
      render: (value: string, item: InventoryItem) => (
        <div className="font-mono text-sm">{value}</div>
      )
    },
    {
      key: 'name',
      title: 'Item Name',
      sortable: true,
      render: (value: string, item: InventoryItem) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{getCategoryName(item.category_id)}</div>
        </div>
      )
    },
    {
      key: 'manufacturer',
      title: 'Manufacturer',
      sortable: true
    },
    {
      key: 'unit_cost',
      title: 'Cost',
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'unit_price',
      title: 'Price',
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'reorder_point',
      title: 'Reorder Point',
      sortable: true,
      render: (value: number, item: InventoryItem) => (
        <Badge variant={value > 0 ? "default" : "secondary"}>
          {value} {item.unit_of_measure}
        </Badge>
      )
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

  const ItemForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Enter SKU"
          />
        </div>
        <div>
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter item name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer || ''}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            placeholder="Enter manufacturer"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="unit_cost">Unit Cost ($)</Label>
          <Input
            id="unit_cost"
            type="number"
            step="0.01"
            value={formData.unit_cost ? (formData.unit_cost / 100).toFixed(2) : ''}
            onChange={(e) => setFormData({ ...formData, unit_cost: Math.round(parseFloat(e.target.value) * 100) })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="unit_price">Unit Price ($)</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            value={formData.unit_price ? (formData.unit_price / 100).toFixed(2) : ''}
            onChange={(e) => setFormData({ ...formData, unit_price: Math.round(parseFloat(e.target.value) * 100) })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="unit_of_measure">Unit of Measure</Label>
          <Input
            id="unit_of_measure"
            value={formData.unit_of_measure || ''}
            onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
            placeholder="e.g., EA, BOX, LB"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reorder_point">Reorder Point</Label>
          <Input
            id="reorder_point"
            type="number"
            value={formData.reorder_point || ''}
            onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
          <Input
            id="reorder_quantity"
            type="number"
            value={formData.reorder_quantity || ''}
            onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) })}
            placeholder="0"
          />
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Item Management</h1>
          <p className="text-gray-600">Manage your inventory items and products</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Items
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <ItemForm />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
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
            <div className="w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <DataTable
        title="Inventory Items"
        data={items}
        columns={columns}
        loading={loading}
        onEdit={(item) => {
          setSelectedItem(item);
          setFormData(item);
          setShowEditDialog(true);
        }}
        onDelete={handleDeleteItem}
        onView={(item) => {
          // Implement view details
          toast({
            title: "View Item",
            description: `Viewing details for ${item.name}`
          });
        }}
      />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemForm isEdit />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemManagement;