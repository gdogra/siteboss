
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DataTable from '@/components/DataTable';
import PaymentEngine from '@/components/PaymentEngine';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  FileText,
  Send,
  DollarSign,
  Calendar,
  User,
  Building2,
  Edit,
  Trash2,
  Eye } from
'lucide-react';

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    client_user_id: '',
    contractor_user_id: '',
    amount: '',
    tax_amount: '',
    description: '',
    line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    due_date: ''
  });

  useEffect(() => {
    loadInvoices();
    loadProjects();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('33734', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setInvoices(data.List || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('32232', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setProjects(data.List || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const calculateTotals = () => {
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = parseFloat(formData.tax_amount) || 0;
    return {
      amount: Math.round(amount * 100),
      tax_amount: Math.round(taxAmount * 100),
      total_amount: Math.round((amount + taxAmount) * 100)
    };
  };

  const createInvoice = async () => {
    try {
      if (!formData.project_id || !formData.amount || !formData.due_date) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const totals = calculateTotals();
      const invoiceNumber = `INV-${Date.now()}`;

      const invoiceData = {
        project_id: parseInt(formData.project_id),
        invoice_number: invoiceNumber,
        client_user_id: parseInt(formData.client_user_id) || 1,
        contractor_user_id: parseInt(formData.contractor_user_id) || 1,
        amount: totals.amount,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        currency: 'USD',
        status: 'draft',
        description: formData.description,
        line_items: JSON.stringify(formData.line_items),
        due_date: new Date(formData.due_date).toISOString()
      };

      const { error } = await window.ezsite.apis.tableCreate('33734', invoiceData);
      if (error) throw error;

      toast({
        title: 'Invoice Created',
        description: `Invoice ${invoiceNumber} created successfully`
      });

      setShowCreateDialog(false);
      resetForm();
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive'
      });
    }
  };

  const sendInvoice = async (invoice: any) => {
    try {
      await window.ezsite.apis.tableUpdate('33734', {
        id: invoice.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      // In a real implementation, you would send email notification here
      const { error: emailError } = await window.ezsite.apis.sendEmail({
        from: 'Laguna Bay Development <noreply@lagunabay.com>',
        to: [`client${invoice.client_user_id}@example.com`],
        subject: `Invoice ${invoice.invoice_number} from Laguna Bay Development`,
        html: `
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p>Amount Due: $${(invoice.total_amount / 100).toFixed(2)}</p>
          <p>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
          <p>Description: ${invoice.description}</p>
          <p>Please log in to your account to view and pay this invoice.</p>
        `
      });

      if (emailError) {
        console.error('Email error:', emailError);
      }

      toast({
        title: 'Invoice Sent',
        description: `Invoice ${invoice.invoice_number} has been sent to client`
      });

      loadInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      client_user_id: '',
      contractor_user_id: '',
      amount: '',
      tax_amount: '',
      description: '',
      line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      due_date: ''
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'sent':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const invoiceColumns = [
  {
    key: 'invoice_number',
    label: 'Invoice #',
    render: (value: string) =>
    <code className="font-medium">{value}</code>

  },
  {
    key: 'project_id',
    label: 'Project',
    render: (value: number) => {
      const project = projects.find((p) => p.id === value);
      return project?.name || `Project ${value}`;
    }
  },
  {
    key: 'total_amount',
    label: 'Amount',
    render: (value: number) =>
    <span className="font-medium">{formatCurrency(value)}</span>

  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) =>
    <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>

  },
  {
    key: 'due_date',
    label: 'Due Date',
    render: (value: string) => formatDate(value)
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_: any, row: any) =>
    <div className="flex gap-2">
          {row.status === 'draft' &&
      <Button size="sm" variant="outline" onClick={() => sendInvoice(row)}>
              <Send className="h-3 w-3" />
            </Button>
      }
          {(row.status === 'sent' || row.status === 'overdue') &&
      <Button
        size="sm"
        onClick={() => {
          setSelectedInvoice(row);
          setShowPaymentDialog(true);
        }}>

              <DollarSign className="h-3 w-3" />
            </Button>
      }
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3" />
          </Button>
        </div>

  }];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoice Management</h2>
          <p className="text-muted-foreground">
            Create, send, and track project invoices
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a new invoice for project work
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project">Project</Label>
                  <Select value={formData.project_id} onValueChange={(value) =>
                  setFormData({ ...formData, project_id: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project: any) =>
                      <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />

                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />

                </div>
                
                <div>
                  <Label htmlFor="tax_amount">Tax Amount ($)</Label>
                  <Input
                    id="tax_amount"
                    type="number"
                    step="0.01"
                    value={formData.tax_amount}
                    onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })} />

                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the work performed..." />

              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(calculateTotals().total_amount)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createInvoice}>
                    Create Invoice
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Secure payment processing for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice &&
          <PaymentEngine
            mode="payment"
            invoice={selectedInvoice}
            onSuccess={() => {
              setShowPaymentDialog(false);
              loadInvoices();
            }}
            onCancel={() => setShowPaymentDialog(false)} />

          }
        </DialogContent>
      </Dialog>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>
            Manage and track all project invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invoices}
            columns={invoiceColumns}
            loading={loading}
            emptyMessage="No invoices found" />

        </CardContent>
      </Card>
    </div>);

};

export default InvoiceManagement;