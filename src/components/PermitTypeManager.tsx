
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PermitType {
  id?: number;
  name: string;
  description: string;
  code: string;
  required_documents: string;
  inspection_required: boolean;
  processing_time_days: number;
  fee_amount: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

const defaultDocumentTypes = [
  'Site Plans',
  'Building Plans', 
  'Structural Drawings',
  'Electrical Plans',
  'Plumbing Plans',
  'Environmental Impact Statement',
  'Property Survey',
  'Insurance Certificate',
  'Contractor License',
  'Material Specifications'
];

const PermitTypeManager = () => {
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [editingType, setEditingType] = useState<PermitType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPermitTypes();
  }, []);

  const loadPermitTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(35422, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: []
      });

      if (error) throw error;
      setPermitTypes(data?.List || []);
    } catch (error) {
      console.error('Error loading permit types:', error);
      toast({
        title: "Error",
        description: "Failed to load permit types",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingType({
      name: '',
      description: '',
      code: '',
      required_documents: '[]',
      inspection_required: false,
      processing_time_days: 14,
      fee_amount: 0,
      is_active: true
    });
    setSelectedDocuments([]);
    setDialogOpen(true);
  };

  const openEditDialog = (permitType: PermitType) => {
    setEditingType(permitType);
    try {
      const docs = JSON.parse(permitType.required_documents || '[]');
      setSelectedDocuments(docs);
    } catch {
      setSelectedDocuments([]);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingType) return;

    try {
      setLoading(true);

      const userInfo = await window.ezsite.apis.getUserInfo();
      const permitTypeData = {
        ...editingType,
        required_documents: JSON.stringify(selectedDocuments),
        updated_at: new Date().toISOString(),
        updated_by: userInfo.data?.ID
      };

      if (editingType.id) {
        // Update existing
        const { error } = await window.ezsite.apis.tableUpdate(35422, permitTypeData);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await window.ezsite.apis.tableCreate(35422, {
          ...permitTypeData,
          created_at: new Date().toISOString(),
          created_by: userInfo.data?.ID
        });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Permit type ${editingType.id ? 'updated' : 'created'} successfully`,
      });

      setDialogOpen(false);
      setEditingType(null);
      loadPermitTypes();
    } catch (error) {
      console.error('Error saving permit type:', error);
      toast({
        title: "Error",
        description: "Failed to save permit type",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permit type?')) return;

    try {
      setLoading(true);
      const { error } = await window.ezsite.apis.tableDelete(35422, { ID: id });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Permit type deleted successfully",
      });

      loadPermitTypes();
    } catch (error) {
      console.error('Error deleting permit type:', error);
      toast({
        title: "Error", 
        description: "Failed to delete permit type",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelection = (doc: string) => {
    if (selectedDocuments.includes(doc)) {
      setSelectedDocuments(prev => prev.filter(d => d !== doc));
    } else {
      setSelectedDocuments(prev => [...prev, doc]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Permit Type Configuration</h2>
          <p className="text-gray-600">Manage available permit types and their requirements</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Permit Type
        </Button>
      </div>

      {/* Permit Types List */}
      <div className="grid gap-4">
        {permitTypes.map((type) => (
          <Card key={type.id} className={!type.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{type.name}</h3>
                    <Badge variant="outline">{type.code}</Badge>
                    {!type.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {type.inspection_required && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Inspection Required
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600">{type.description}</p>
                  
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Fee: ${(type.fee_amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Processing: {type.processing_time_days} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span>
                        {(() => {
                          try {
                            const docs = JSON.parse(type.required_documents || '[]');
                            return `${docs.length} required documents`;
                          } catch {
                            return '0 required documents';
                          }
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Required Documents Preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(() => {
                      try {
                        const docs = JSON.parse(type.required_documents || '[]');
                        return docs.slice(0, 3).map((doc: string) => (
                          <Badge key={doc} variant="secondary" className="text-xs">
                            {doc}
                          </Badge>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                    {(() => {
                      try {
                        const docs = JSON.parse(type.required_documents || '[]');
                        if (docs.length > 3) {
                          return (
                            <Badge variant="secondary" className="text-xs">
                              +{docs.length - 3} more
                            </Badge>
                          );
                        }
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(type)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(type.id!)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType?.id ? 'Edit' : 'Create'} Permit Type
            </DialogTitle>
          </DialogHeader>

          {editingType && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={editingType.name}
                      onChange={(e) => setEditingType(prev => prev ? {
                        ...prev,
                        name: e.target.value
                      } : null)}
                      placeholder="e.g., Residential Building Permit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={editingType.code}
                      onChange={(e) => setEditingType(prev => prev ? {
                        ...prev,
                        code: e.target.value.toUpperCase()
                      } : null)}
                      placeholder="e.g., RBP-001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={editingType.description}
                    onChange={(e) => setEditingType(prev => prev ? {
                      ...prev,
                      description: e.target.value
                    } : null)}
                    placeholder="Describe what this permit is for..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fee">Fee Amount (USD) *</Label>
                    <Input
                      id="fee"
                      type="number"
                      step="0.01"
                      value={editingType.fee_amount / 100}
                      onChange={(e) => setEditingType(prev => prev ? {
                        ...prev,
                        fee_amount: Math.round(parseFloat(e.target.value || '0') * 100)
                      } : null)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="processing-time">Processing Time (Days) *</Label>
                    <Input
                      id="processing-time"
                      type="number"
                      value={editingType.processing_time_days}
                      onChange={(e) => setEditingType(prev => prev ? {
                        ...prev,
                        processing_time_days: parseInt(e.target.value || '0')
                      } : null)}
                      placeholder="14"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inspection-required"
                      checked={editingType.inspection_required}
                      onCheckedChange={(checked) => setEditingType(prev => prev ? {
                        ...prev,
                        inspection_required: checked
                      } : null)}
                    />
                    <Label htmlFor="inspection-required">Inspection Required</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={editingType.is_active}
                      onCheckedChange={(checked) => setEditingType(prev => prev ? {
                        ...prev,
                        is_active: checked
                      } : null)}
                    />
                    <Label htmlFor="is-active">Active</Label>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <h3 className="text-lg font-medium">Required Documents</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {defaultDocumentTypes.map((docType) => (
                    <div key={docType} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`doc-${docType}`}
                        checked={selectedDocuments.includes(docType)}
                        onChange={() => toggleDocumentSelection(docType)}
                        className="rounded"
                      />
                      <Label htmlFor={`doc-${docType}`} className="text-sm">
                        {docType}
                      </Label>
                    </div>
                  ))}
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Selected Documents ({selectedDocuments.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDocuments.map((doc) => (
                      <Badge key={doc} variant="secondary" className="text-xs">
                        {doc}
                        <button
                          onClick={() => toggleDocumentSelection(doc)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !editingType.name || !editingType.code}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermitTypeManager;
