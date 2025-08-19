
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle } from
'lucide-react';

const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayouts: 0,
    pendingPayments: 0,
    completedTransactions: 0
  });

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const filters = [];

      if (filter !== 'all') {
        filters.push({ name: 'status', op: 'Equal', value: filter });
      }

      if (searchTerm) {
        filters.push({ name: 'description', op: 'StringContains', value: searchTerm });
      }

      const { data, error } = await window.ezsite.apis.tablePage('33730', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;
      setTransactions(data.List || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load all transactions for stats calculation
      const { data, error } = await window.ezsite.apis.tablePage('33730', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      const allTransactions = data.List || [];

      const totalRevenue = allTransactions.
      filter((t) => t.transaction_type === 'payment' && t.status === 'completed').
      reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalPayouts = allTransactions.
      filter((t) => t.transaction_type === 'payout' && t.status === 'completed').
      reduce((sum, t) => sum + (t.amount || 0), 0);

      const pendingPayments = allTransactions.
      filter((t) => t.status === 'pending').
      reduce((sum, t) => sum + (t.amount || 0), 0);

      const completedTransactions = allTransactions.
      filter((t) => t.status === 'completed').length;

      setStats({
        totalRevenue,
        totalPayouts,
        pendingPayments,
        completedTransactions
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const processRefund = async (transaction: any) => {
    try {
      if (!transaction.stripe_payment_intent_id) {
        throw new Error('No payment intent found for this transaction');
      }

      const { data, error } = await window.ezsite.apis.run({
        path: 'createRefund',
        param: [transaction.stripe_payment_intent_id, transaction.amount, 'requested_by_customer']
      });

      if (error) throw error;

      // Record refund transaction
      const refundData = {
        transaction_id: `txn_refund_${Date.now()}`,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        transaction_type: 'refund',
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'completed',
        payment_method: transaction.payment_method,
        project_id: transaction.project_id,
        invoice_id: transaction.invoice_id,
        description: `Refund for transaction ${transaction.transaction_id}`,
        processed_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableCreate('33730', refundData);

      // Update original transaction status
      await window.ezsite.apis.tableUpdate('33730', {
        id: transaction.id,
        status: 'refunded'
      });

      toast({
        title: 'Refund Processed',
        description: `Refund of $${(transaction.amount / 100).toFixed(2)} initiated successfully`
      });

      loadTransactions();
      loadStats();
    } catch (error) {
      console.error('Refund error:', error);
      toast({
        title: 'Refund Failed',
        description: error.toString(),
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
      case 'disputed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const transactionColumns = [
  {
    key: 'transaction_id',
    label: 'Transaction ID',
    render: (value: string) =>
    <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>

  },
  {
    key: 'transaction_type',
    label: 'Type',
    render: (value: string) =>
    <Badge variant="outline" className="capitalize">
          {value}
        </Badge>

  },
  {
    key: 'amount',
    label: 'Amount',
    render: (value: number, row: any) =>
    <div className="font-medium">
          {row.transaction_type === 'payout' && '-'}
          {formatCurrency(value)}
        </div>

  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) =>
    <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge variant={getStatusVariant(value)} className="capitalize">
            {value}
          </Badge>
        </div>

  },
  {
    key: 'payment_method',
    label: 'Method',
    render: (value: string) =>
    <span className="capitalize">{value}</span>

  },
  {
    key: 'processed_at',
    label: 'Date',
    render: (value: string) =>
    <span className="text-sm">{formatDate(value)}</span>

  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_: any, row: any) =>
    <div className="flex gap-2">
          {row.transaction_type === 'payment' && row.status === 'completed' &&
      <Button
        size="sm"
        variant="outline"
        onClick={() => processRefund(row)}>

              <RefreshCw className="h-3 w-3" />
            </Button>
      }
        </div>

  }];


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.totalPayouts)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.pendingPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-4 w-4 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.completedTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All payment transactions, payouts, and refunds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1" />

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadTransactions} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <DataTable
            data={transactions}
            columns={transactionColumns}
            loading={loading}
            emptyMessage="No transactions found" />

        </CardContent>
      </Card>
    </div>);

};

export default TransactionDashboard;