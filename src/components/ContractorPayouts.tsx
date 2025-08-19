
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DataTable from  '@/components/DataTable';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Send, 
  DollarSign, 
  Calendar, 
  User, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Building2,
  Banknote
} from 'lucide-react';

const ContractorPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [stripeAccounts, setStripeAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    contractor_user_id: '',
    amount: '',
    description: '',
    project_id: ''
  });

  useEffect(() => {
    loadPayouts();
    loadContractors();
    loadStripeAccounts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('33730', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'transaction_type', op: 'Equal', value: 'payout' }
        ]
      });

      if (error) throw error;
      setPayouts(data.List || []);
    } catch (error) {
      console.error('Error loading payouts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payouts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContractors = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('32233', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setContractors(data.List || []);
    } catch (error) {
      console.error('Error loading contractors:', error);
    }
  };

  const loadStripeAccounts = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('33733', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });

      if (error) throw error;
      setStripeAccounts(data.List || []);
    } catch (error) {
      console.error('Error loading stripe accounts:', error);
    }
  };

  const processPayout = async () => {
    try {
      if (!formData.contractor_user_id || !formData.amount) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const contractor = contractors.find(c => c.id.toString() === formData.contractor_user_id);
      const stripeAccount = stripeAccounts.find(a => a.user_id.toString() === formData.contractor_user_id);

      if (!stripeAccount) {
        toast({
          title: 'Error',
          description: 'Contractor must have a connected Stripe account for payouts',
          variant: 'destructive'
        });
        return;
      }

      const amount = Math.round(parseFloat(formData.amount) * 100);

      // Create payout with Stripe
      const { data: payoutData, error: payoutError } = await window.ezsite.apis.run({
        path: 'createPayout',
        param: [amount, 'USD', stripeAccount.stripe_account_id, {
          contractor_id: formData.contractor_user_id,
          project_id: formData.project_id
        }]
      });

      if (payoutError) throw payoutError;

      // Record transaction
      const transactionData = {
        transaction_id: `txn_payout_${Date.now()}`,
        stripe_payment_intent_id: payoutData.id,
        transaction_type: 'payout',
        amount: amount,
        currency: 'USD',
        status: 'completed',
        payment_method: 'bank_transfer',
        connected_account_id: stripeAccount.stripe_account_id,
        project_id: parseInt(formData.project_id) || 0,
        payee_user_id: parseInt(formData.contractor_user_id),
        description: formData.description || `Payout to ${contractor?.name}`,
        processed_at: new Date().toISOString()
      };

      const { error: transactionError } = await window.ezsite.apis.tableCreate('33730', transactionData);
      if (transactionError) throw transactionError;

      // Record ledger entries
      const ledgerEntries = [
        {
          account_type: 'accounts_payable',
          account_id: `contractor_${formData.contractor_user_id}`,
          entry_type: 'debit',
          amount: amount,
          description: 'Contractor payout'
        },
        {
          account_type: 'cash',
          account_id: 'company_cash',
          entry_type: 'credit',
          amount: amount,
          description: 'Cash outflow for payout'
        }
      ];

      const { data: ledgerData, error: ledgerError } = await window.ezsite.apis.run({
        path: 'recordLedgerEntry',
        param: [transactionData.transaction_id, ledgerEntries]
      });

      if (ledgerError) throw ledgerError;

      // Insert ledger entries
      for (const entry of ledgerData.entries) {
        await window.ezsite.apis.tableCreate('33731', entry);
      }

      // Send notification email
      const { error: emailError } = await window.ezsite.apis.sendEmail({
        from: 'Laguna Bay Development <noreply@lagunabay.com>',
        to: [`contractor${formData.contractor_user_id}@example.com`],
        subject: 'Payout Processed - Laguna Bay Development',
        html: `
          <h2>Payout Processed</h2>
          <p>A payout of $${(amount / 100).toFixed(2)} has been processed to your connected account.</p>
          <p>Expected arrival: ${new Date(payoutData.arrival_date).toLocaleDateString()}</p>
          <p>Description: ${formData.description}</p>
          <p>Transaction ID: ${transactionData.transaction_id}</p>
        `
      });

      if (emailError) {
        console.error('Email notification error:', emailError);
      }

      toast({
        title: 'Payout Processed',
        description: `Payout of $${(amount / 100).toFixed(2)} sent to ${contractor?.name}`
      });

      setShowCreateDialog(false);
      resetForm();
      loadPayouts();
    } catch (error) {
      console.error('Payout error:', error);
      toast({
        title: 'Payout Failed',
        description: error.toString(),
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      contractor_user_id: '',
      amount: '',
      description: '',
      project_id: ''
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const payoutColumns = [
    {
      key: 'transaction_id',
      label: 'Transaction ID',
      render: (value: string) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>
      )
    },
    {
      key: 'payee_user_id',
      label: 'Contractor',
      render: (value: number) => {
        const contractor = contractors.find(c => c.id === value);
        return contractor?.name || `User ${value}`;
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => (
        <span className="font-medium text-green-600">-{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value || 'No description'}
        </span>
      )
    },
    {
      key: 'processed_at',
      label: 'Date',
      render: (value: string) => (
        <span className="text-sm">{formatDate(value)}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contractor Payouts</h2>
          <p className="text-muted-foreground">
            Process payments to contractors with connected accounts
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Payout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Contractor Payout</DialogTitle>
              <DialogDescription>
                Send payment to a contractor's connected Stripe account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="contractor">Contractor</Label>
                <Select value={formData.contractor_user_id} onValueChange={(value) => 
                  setFormData({...formData, contractor_user_id: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors.map((contractor: any) => {
                      const hasAccount = stripeAccounts.some(a => a.user_id === contractor.id);
                      return (
                        <SelectItem 
                          key={contractor.id} 
                          value={contractor.id.toString()}
                          disabled={!hasAccount}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{contractor.name}</span>
                            {hasAccount ? (
                              <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-500 ml-2" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Only contractors with connected Stripe accounts can receive payouts
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Payment for work completed..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <Banknote className="h-4 w-4 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Secure Payout</div>
                  <div>Funds typically arrive in 1-2 business days</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={processPayout} className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Send Payout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connected Accounts Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Contractor Stripe account status for payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractors.map((contractor: any) => {
              const stripeAccount = stripeAccounts.find(a => a.user_id === contractor.id);
              return (
                <div key={contractor.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{contractor.name}</div>
                      <div className="text-sm text-muted-foreground">{contractor.email}</div>
                    </div>
                    {stripeAccount ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Payout History
          </CardTitle>
          <CardDescription>
            All processed contractor payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={payouts}
            columns={payoutColumns}
            loading={loading}
            emptyMessage="No payouts found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorPayouts;
