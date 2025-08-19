import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Save, Plus, Trash2, Eye, History, FileText,
  User, DollarSign, Clock, Edit3 } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposalVersion {
  id: number;
  proposal_id: number;
  version_number: number;
  content: string;
  sections: string;
  line_items: string;
  pricing_data: string;
  terms_conditions: string;
  attachments: string;
  total_amount: number;
  is_current: boolean;
  change_summary: string;
  created_at: string;
  created_by: number;
}

interface Proposal {
  id: number;
  proposal_number: string;
  title: string;
  template_id: number;
  lead_id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  status: string;
  priority: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  currency: string;
  valid_until: string;
  created_at: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ProposalEditorProps {
  proposalId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ proposalId, onSuccess, onCancel }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<ProposalVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    priority: 'normal',
    status: 'draft',
    currency: 'USD',
    valid_until: '',
    terms_conditions: ''
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
  { description: '', quantity: 1, unit_price: 0, total: 0 }]
  );

  const [pricingData, setPricingData] = useState({
    tax_rate: 0,
    discount_amount: 0
  });

  const [changeSummary, setChangeSummary] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchProposal();
    fetchVersions();
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35433, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: true,
        Filters: [
        { name: 'id', op: 'Equal', value: proposalId }]

      });

      if (error) throw error;

      const proposalData = data?.List?.[0];
      if (proposalData) {
        setProposal(proposalData);
        setFormData({
          title: proposalData.title,
          client_name: proposalData.client_name,
          client_email: proposalData.client_email,
          client_phone: proposalData.client_phone,
          client_address: proposalData.client_address,
          priority: proposalData.priority,
          status: proposalData.status,
          currency: proposalData.currency,
          valid_until: proposalData.valid_until?.split('T')[0] || '',
          terms_conditions: ''
        });
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposal',
        variant: 'destructive'
      });
    }
  };

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(35434, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'version_number',
        IsAsc: false,
        Filters: [
        { name: 'proposal_id', op: 'Equal', value: proposalId }]

      });

      if (error) throw error;

      const versionList = data?.List || [];
      setVersions(versionList);

      const current = versionList.find((v: ProposalVersion) => v.is_current);
      if (current) {
        setCurrentVersion(current);
        loadVersionData(current);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposal versions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersionData = (version: ProposalVersion) => {
    try {
      // Load line items
      if (version.line_items) {
        const items = JSON.parse(version.line_items);
        setLineItems(items);
      }

      // Load pricing data
      if (version.pricing_data) {
        const pricing = JSON.parse(version.pricing_data);
        setPricingData({
          tax_rate: pricing.tax_rate || 0,
          discount_amount: (pricing.discount_amount || 0) / 100
        });
      }

      // Load terms and conditions
      setFormData((prev) => ({
        ...prev,
        terms_conditions: version.terms_conditions || ''
      }));
    } catch (error) {
      console.error('Error parsing version data:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setLineItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
      }

      return newItems;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (pricingData.tax_rate / 100);
    const total = subtotal + taxAmount - pricingData.discount_amount;

    return {
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      total: Math.round(total * 100)
    };
  };

  const saveAsNewVersion = async () => {
    if (!changeSummary.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a summary of changes',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const totals = calculateTotals();

      // Mark current version as not current
      if (currentVersion) {
        await window.ezsite.apis.tableUpdate(35434, {
          ID: currentVersion.id,
          is_current: false
        });
      }

      // Create new version
      const newVersionNumber = (currentVersion?.version_number || 0) + 1;

      const versionData = {
        proposal_id: proposalId,
        version_number: newVersionNumber,
        content: JSON.stringify({
          title: formData.title,
          client_info: {
            name: formData.client_name,
            email: formData.client_email,
            phone: formData.client_phone,
            address: formData.client_address
          }
        }),
        sections: JSON.stringify([]),
        line_items: JSON.stringify(lineItems),
        pricing_data: JSON.stringify({
          subtotal: totals.subtotal,
          tax_amount: totals.taxAmount,
          tax_rate: pricingData.tax_rate,
          discount_amount: Math.round(pricingData.discount_amount * 100),
          total: totals.total
        }),
        terms_conditions: formData.terms_conditions,
        attachments: JSON.stringify([]),
        total_amount: totals.total,
        is_current: true,
        change_summary: changeSummary,
        created_at: new Date().toISOString(),
        created_by: 1 // TODO: Get from auth
      };

      const { error: versionError } = await window.ezsite.apis.tableCreate(35434, versionData);

      if (versionError) throw versionError;

      // Update proposal
      const proposalUpdateData = {
        ID: proposalId,
        title: formData.title,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        client_address: formData.client_address,
        priority: formData.priority,
        status: formData.status,
        total_amount: totals.total,
        tax_amount: totals.taxAmount,
        discount_amount: Math.round(pricingData.discount_amount * 100),
        net_amount: totals.total,
        currency: formData.currency,
        valid_until: new Date(formData.valid_until).toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: 1
      };

      const { error: proposalError } = await window.ezsite.apis.tableUpdate(35433, proposalUpdateData);

      if (proposalError) throw proposalError;

      toast({
        title: 'Success',
        description: `Version ${newVersionNumber} saved successfully`
      });

      setChangeSummary('');
      fetchVersions();
    } catch (error) {
      console.error('Error saving version:', error);
      toast({
        title: 'Error',
        description: 'Failed to save new version',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const loadVersion = (version: ProposalVersion) => {
    setCurrentVersion(version);
    loadVersionData(version);
    setShowVersionHistory(false);
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading proposal...</span>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{proposal?.proposal_number}</h3>
          <p className="text-gray-600">
            Current Version: {currentVersion?.version_number || 1}
            {currentVersion &&
            <span className="ml-2 text-sm">
                • {new Date(currentVersion.created_at).toLocaleDateString()}
              </span>
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowVersionHistory(true)}>
            <History className="w-4 h-4 mr-2" />
            Version History
          </Button>
          <Button variant="outline" onClick={() => window.open(`/proposal/${proposalId}/view`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)} />

                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="viewed">Viewed</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => handleInputChange('valid_until', e.target.value)} />

                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)} />

                </div>

                <div>
                  <Label htmlFor="client_email">Email</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange('client_email', e.target.value)} />

                </div>

                <div>
                  <Label htmlFor="client_phone">Phone</Label>
                  <Input
                    id="client_phone"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)} />

                </div>

                <div>
                  <Label htmlFor="client_address">Address</Label>
                  <Textarea
                    id="client_address"
                    value={formData.client_address}
                    onChange={(e) => handleInputChange('client_address', e.target.value)}
                    rows={3} />

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item, index) =>
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Input
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Item description..." />

                  </div>
                  
                  <div>
                    <Label>Quantity</Label>
                    <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} />

                  </div>
                  
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)} />

                  </div>
                  
                  <div>
                    <Label>Total</Label>
                    <Input
                    type="number"
                    value={item.total.toFixed(2)}
                    readOnly
                    className="bg-gray-50" />

                  </div>
                  
                  <div className="flex items-end">
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}>

                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button type="button" variant="outline" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={pricingData.tax_rate}
                    onChange={(e) => setPricingData((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))} />

                </div>

                <div>
                  <Label htmlFor="discount_amount">Discount Amount</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricingData.discount_amount}
                    onChange={(e) => setPricingData((prev) => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))} />

                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(totals.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${(totals.taxAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${pricingData.discount_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${(totals.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.terms_conditions}
                onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                placeholder="Enter terms and conditions..."
                rows={12} />

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Save New Version</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="change_summary">Change Summary *</Label>
                <Textarea
                  id="change_summary"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  rows={3} />

              </div>
              
              <Button onClick={saveAsNewVersion} disabled={saving || !changeSummary.trim()}>
                {saving ? 'Saving...' : 'Save as New Version'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={saveAsNewVersion} disabled={saving || !changeSummary.trim()}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Version'}
        </Button>
      </div>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {versions.map((version) =>
            <Card key={version.id} className={version.is_current ? 'ring-2 ring-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Version {version.version_number}
                        {version.is_current &&
                      <Badge className="ml-2" variant="default">Current</Badge>
                      }
                      </h4>
                      <p className="text-sm text-gray-600">{version.change_summary}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(version.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {!version.is_current &&
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadVersion(version)}>

                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                  }
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default ProposalEditor;