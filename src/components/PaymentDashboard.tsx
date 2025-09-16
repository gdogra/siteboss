import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaymentEngine from './PaymentEngine';
import {
  CreditCard,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Download,
  Plus,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  X
} from 'lucide-react';

interface Payment {
  id: string;
  type: 'invoice' | 'payment' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  date: string;
  dueDate?: string;
  client?: string;
  project?: string;
  method?: 'card' | 'ach' | 'wire' | 'check';
  reference?: string;
}

interface PaymentDashboardProps {
  projectId?: string;
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentEngine, setShowPaymentEngine] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    description: '',
    dueDate: '',
    project: projectId || ''
  });

  // Mock payment data
  const payments: Payment[] = [
    {
      id: 'INV-001',
      type: 'invoice',
      amount: 125000,
      description: 'Progress Payment #4 - Foundation Complete',
      status: 'pending',
      date: '2024-12-01',
      dueDate: '2024-12-15',
      client: 'ABC Development Corp',
      project: 'Downtown Office Building',
      reference: 'INV-2024-001'
    },
    {
      id: 'PAY-001',
      type: 'payment',
      amount: -85000,
      description: 'Material Supplier Payment',
      status: 'completed',
      date: '2024-11-28',
      method: 'ach',
      reference: 'PAY-2024-001'
    },
    {
      id: 'INV-002',
      type: 'invoice',
      amount: 200000,
      description: 'Milestone Payment - Structural Frame',
      status: 'processing',
      date: '2024-11-25',
      dueDate: '2025-01-10',
      client: 'XYZ Construction LLC',
      project: 'Residential Complex',
      reference: 'INV-2024-002'
    },
    {
      id: 'PAY-002',
      type: 'payment',
      amount: -120000,
      description: 'Subcontractor Payment - Electrical',
      status: 'completed',
      date: '2024-11-20',
      method: 'wire',
      reference: 'PAY-2024-002'
    }
  ];

  // Payment statistics
  const paymentStats = {
    totalReceivables: payments.filter(p => p.type === 'invoice' && p.amount > 0).reduce((sum, p) => sum + p.amount, 0),
    totalPayables: Math.abs(payments.filter(p => p.type === 'payment' && p.amount < 0).reduce((sum, p) => sum + p.amount, 0)),
    pendingInvoices: payments.filter(p => p.type === 'invoice' && p.status === 'pending').length,
    overdueInvoices: payments.filter(p => p.type === 'invoice' && p.status === 'pending' && p.dueDate && new Date(p.dueDate) < new Date()).length,
    netCashFlow: payments.reduce((sum, p) => sum + p.amount, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'refund':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCreateInvoice = () => {
    console.log('Creating invoice:', newInvoice);
    setShowInvoiceModal(false);
    setNewInvoice({
      client: '',
      amount: '',
      description: '',
      dueDate: '',
      project: projectId || ''
    });
  };

  const handlePayInvoice = (invoice: Payment) => {
    setSelectedInvoice({
      id: invoice.id,
      invoice_number: invoice.reference,
      total_amount: invoice.amount * 100, // Convert to cents
      description: invoice.description,
      status: invoice.status
    });
    setShowPaymentEngine(true);
  };

  const handlePaymentSuccess = (transaction: any) => {
    console.log('Payment successful:', transaction);
    setShowPaymentEngine(false);
    setSelectedInvoice(null);
    // Refresh data here
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (showPaymentEngine) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Process Payment</h2>
          <Button variant="outline" onClick={() => setShowPaymentEngine(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
        <PaymentEngine
          mode="payment"
          invoice={selectedInvoice}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentEngine(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paymentStats.totalReceivables)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(paymentStats.totalPayables)}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${paymentStats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {paymentStats.netCashFlow >= 0 ? '+' : ''}{formatCurrency(paymentStats.netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{paymentStats.overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowInvoiceModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(payment.type)}
                        <div>
                          <div className="font-medium text-sm">{payment.description}</div>
                          <div className="text-xs text-gray-500">
                            {payment.reference} • {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.amount >= 0 ? '+' : ''}{formatCurrency(payment.amount)}
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Accepted payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Credit Cards</div>
                        <div className="text-sm text-gray-500">Visa, MasterCard, AMEX</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-medium">ACH Transfer</div>
                        <div className="text-sm text-gray-500">Bank to bank transfer</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Wire Transfer</div>
                        <div className="text-sm text-gray-500">International payments</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage project invoices and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPayments.filter(p => p.type === 'invoice').map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{invoice.description}</div>
                        <div className="text-sm text-gray-500">
                          {invoice.client} • Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">{invoice.reference}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(invoice.amount)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {invoice.status === 'pending' && (
                          <Button size="sm" onClick={() => handlePayInvoice(invoice)}>
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(payment.type)}
                      <div>
                        <div className="font-medium">{payment.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString()}
                          {payment.method && ` • ${payment.method.toUpperCase()}`}
                        </div>
                        <div className="text-xs text-gray-400">{payment.reference}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`text-lg font-bold ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {payment.amount >= 0 ? '+' : ''}{formatCurrency(payment.amount)}
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate payment and billing reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Payment Summary Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Outstanding Invoices Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Cash Flow Statement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Tax Summary Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
                <CardDescription>Payment trends and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Payment Success Rate</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Payment Time</span>
                      <span>12 days</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Invoice Accuracy</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Invoice</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={newInvoice.client}
                    onChange={(e) => setNewInvoice({...newInvoice, client: e.target.value})}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    placeholder="Invoice description"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice}>
                  Create Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;