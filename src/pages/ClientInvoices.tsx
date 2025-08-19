
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  DollarSign, 
  Calendar,
  Download,
  Eye,
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientPortalLayout from '@/components/ClientPortalLayout';
import { useToast } from '@/hooks/use-toast';

const ClientInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
    fetchPayments();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(33734, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);
      setInvoices(data?.List || []);
    } catch (error: any) {
      toast({
        title: "Error loading invoices",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32235, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (!error && data?.List) {
        setPayments(data.List);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInvoicePayments = (invoiceId: number) => {
    return payments.filter(payment => payment.invoice_id === invoiceId);
  };

  const calculateTotalPaid = (invoiceId: number) => {
    return getInvoicePayments(invoiceId).reduce((total, payment) => {
      return total + (parseFloat(payment.amount) || 0);
    }, 0);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePayInvoice = async (invoice: any) => {
    setPaymentLoading(true);
    try {
      // Create payment intent
      const { data: paymentData, error: paymentError } = await window.ezsite.apis.run({
        path: "createPaymentIntent",
        param: [parseFloat(invoice.amount) * 100, 'usd', `Payment for Invoice #${invoice.id}`]
      });

      if (paymentError) throw new Error(paymentError);

      // In a real implementation, you would integrate with Stripe or another payment processor
      // For now, we'll simulate a payment
      toast({
        title: "Payment initiated",
        description: "Redirecting to payment processor...",
      });

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Create payment record
          await window.ezsite.apis.tableCreate(32235, {
            invoice_id: invoice.id,
            amount: invoice.amount,
            payment_method: 'card',
            status: 'completed',
            created_at: new Date().toISOString()
          });

          // Update invoice status
          await window.ezsite.apis.tableUpdate(33734, {
            id: invoice.id,
            status: 'paid'
          });

          toast({
            title: "Payment successful",
            description: `Invoice #${invoice.id} has been paid successfully.`,
          });

          fetchInvoices();
          fetchPayments();
          setIsPaymentModalOpen(false);
        } catch (error: any) {
          toast({
            title: "Payment failed",
            description: error.message,
            variant: "destructive"
          });
        }
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              View and pay your invoices
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${filteredInvoices
                      .filter(i => i.status !== 'paid')
                      .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${filteredInvoices
                      .filter(i => i.status === 'paid')
                      .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold">
                    {filteredInvoices.filter(i => i.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Invoice #{invoice.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {invoice.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${parseFloat(invoice.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getInvoiceStatusBadge(invoice.status)}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {invoice.status !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsPaymentModalOpen(true);
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                {getInvoicePayments(invoice.id).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Payment History</h4>
                    <div className="space-y-1">
                      {getInvoicePayments(invoice.id).map((payment) => (
                        <div key={payment.id} className="text-sm text-muted-foreground">
                          ${parseFloat(payment.amount).toFixed(2)} paid on{' '}
                          {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No invoices message */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No invoices match your search criteria.' 
                : 'You don\'t have any invoices yet.'}
            </p>
          </div>
        )}

        {/* Invoice Details Modal */}
        {selectedInvoice && !isPaymentModalOpen && (
          <Dialog open={true} onOpenChange={() => setSelectedInvoice(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Invoice #{selectedInvoice.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Invoice Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedInvoice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    {getInvoiceStatusBadge(selectedInvoice.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-lg font-semibold">
                      ${parseFloat(selectedInvoice.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount Paid</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${calculateTotalPaid(selectedInvoice.id).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.description || 'No description provided'}
                  </p>
                </div>

                {getInvoicePayments(selectedInvoice.id).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Payment History</p>
                    <div className="space-y-2">
                      {getInvoicePayments(selectedInvoice.id).map((payment) => (
                        <div key={payment.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex justify-between">
                            <span>${parseFloat(payment.amount).toFixed(2)}</span>
                            <span>{new Date(payment.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Method: {payment.payment_method} | Status: {payment.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Payment Modal */}
        {isPaymentModalOpen && selectedInvoice && (
          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pay Invoice #{selectedInvoice.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Invoice Amount:</span>
                    <span className="font-semibold">${parseFloat(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">${calculateTotalPaid(selectedInvoice.id).toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Amount Due:</span>
                    <span>${(parseFloat(selectedInvoice.amount) - calculateTotalPaid(selectedInvoice.id)).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Click "Pay Now" to proceed to secure payment processing.
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePayInvoice(selectedInvoice)}
                    disabled={paymentLoading}
                    className="flex-1"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPaymentModalOpen(false)}
                    disabled={paymentLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ClientPortalLayout>
  );
};

export default ClientInvoices;
