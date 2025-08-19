import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, FileText, User, DollarSign } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  content_template: string;
  sections: string;
  pricing_template: string;
  terms_template: string;
}

interface Lead {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ProposalCreatorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProposalCreator: React.FC<ProposalCreatorProps> = ({ onSuccess, onCancel }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [validUntil, setValidUntil] = useState<Date>(addDays(new Date(), 30));

  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    priority: 'normal',
    currency: 'USD',
    tax_rate: 0,
    discount_amount: 0,
    terms_conditions: ''
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
    fetchLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        client_name: selectedLead.contact_name,
        client_email: selectedLead.email,
        client_phone: selectedLead.phone,
        client_address: selectedLead.address
      }));
    }
  }, [selectedLead]);

  useEffect(() => {
    if (selectedTemplate) {
      try {
        const template = JSON.parse(selectedTemplate.content_template || '{}');
        const pricing = JSON.parse(selectedTemplate.pricing_template || '{}');
        
        setFormData(prev => ({
          ...prev,
          title: template.title || '',
          terms_conditions: selectedTemplate.terms_template || ''
        }));

        if (pricing.line_items && Array.isArray(pricing.line_items)) {
          setLineItems(pricing.line_items);
        }
      } catch (error) {
        console.error('Error parsing template:', error);
      }
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35432, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });

      if (error) throw error;
      setTemplates(data?.List || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive'
      });
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(33726, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setLeads(data?.List || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setLineItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate total for this line item
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
      }
      
      return newItems;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (formData.tax_rate / 100);
    const total = subtotal + taxAmount - formData.discount_amount;
    
    return {
      subtotal: Math.round(subtotal * 100), // Convert to cents
      taxAmount: Math.round(taxAmount * 100),
      total: Math.round(total * 100)
    };
  };

  const generateProposalNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROP-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a proposal title',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.client_name.trim() || !formData.client_email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter client name and email',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const totals = calculateTotals();
      const proposalNumber = generateProposalNumber();
      
      // Create proposal
      const proposalData = {
        proposal_number: proposalNumber,
        title: formData.title,
        template_id: selectedTemplate?.id || 0,
        lead_id: selectedLead?.id || 0,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        client_address: formData.client_address,
        status: 'draft',
        priority: formData.priority,
        total_amount: totals.total,
        tax_amount: totals.taxAmount,
        discount_amount: Math.round(formData.discount_amount * 100),
        net_amount: totals.total,
        currency: formData.currency,
        valid_until: validUntil.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 1, // TODO: Get from auth
        updated_by: 1
      };

      const { data: proposalResult, error: proposalError } = await window.ezsite.apis.tableCreate(35433, proposalData);
      
      if (proposalError) throw proposalError;

      // Create initial version
      const versionData = {
        proposal_id: proposalResult.ID,
        version_number: 1,
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
          tax_rate: formData.tax_rate,
          discount_amount: Math.round(formData.discount_amount * 100),
          total: totals.total
        }),
        terms_conditions: formData.terms_conditions,
        attachments: JSON.stringify([]),
        total_amount: totals.total,
        is_current: true,
        change_summary: 'Initial version',
        created_at: new Date().toISOString(),
        created_by: 1
      };

      const { error: versionError } = await window.ezsite.apis.tableCreate(35434, versionData);
      
      if (versionError) throw versionError;

      toast({
        title: 'Success',
        description: 'Proposal created successfully'
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create proposal',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Selection (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template">Choose Template</Label>
                <Select onValueChange={(value) => {
                  const template = templates.find(t => t.id.toString() === value);
                  setSelectedTemplate(template || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div className="flex flex-col">
                          <span>{template.name}</span>
                          <span className="text-xs text-gray-500">{template.category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="lead">Link to Lead (Optional)</Label>
                <Select onValueChange={(value) => {
                  const lead = leads.find(l => l.id.toString() === value);
                  setSelectedLead(lead || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>
                        <div className="flex flex-col">
                          <span>{lead.contact_name}</span>
                          <span className="text-xs text-gray-500">{lead.company_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedTemplate && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">{selectedTemplate.name}</h4>
                <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {selectedTemplate.category}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Proposal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter proposal title..."
                  required
                />
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
                <Label>Valid Until</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validUntil ? format(validUntil, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={(date) => date && setValidUntil(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  placeholder="Enter client name..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                  placeholder="client@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="client_phone">Phone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
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

              <div className="md:col-span-2">
                <Label htmlFor="client_address">Address</Label>
                <Textarea
                  id="client_address"
                  value={formData.client_address}
                  onChange={(e) => handleInputChange('client_address', e.target.value)}
                  placeholder="Enter client address..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Item description..."
                  />
                </div>
                
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label>Total</Label>
                  <Input
                    type="number"
                    value={item.total.toFixed(2)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

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
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="discount_amount">Discount Amount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                />
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
                  <span>-${formData.discount_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${(totals.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.terms_conditions}
              onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
              placeholder="Enter terms and conditions..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Proposal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProposalCreator;