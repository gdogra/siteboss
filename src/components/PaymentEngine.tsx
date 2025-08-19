
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CreditCard, DollarSign, Receipt, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface PaymentEngineProps {
  mode: 'payment' | 'payout';
  invoice?: any;
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
}

const PaymentEngine: React.FC<PaymentEngineProps> = ({ mode, invoice, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amount, setAmount] = useState(invoice?.total_amount || 0);
  const [paymentIntentId, setPaymentIntentId] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('33732', {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
        { name: 'is_active', op: 'Equal', value: true }]

      });

      if (error) throw error;
      setPaymentMethods(data.List || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment methods',
        variant: 'destructive'
      });
    }
  };

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.run({
        path: 'createPaymentIntent',
        param: [amount, 'USD', 'cus_demo_customer', { invoice_id: invoice?.id }]
      });

      if (error) throw error;
      setPaymentIntentId(data.id);
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // Create payment intent if not exists
      let intentId = paymentIntentId;
      if (!intentId) {
        const intent = await createPaymentIntent();
        intentId = intent.id;
      }

      // Confirm payment
      const { data: paymentData, error: paymentError } = await window.ezsite.apis.run({
        path: 'confirmPayment',
        param: [intentId, selectedPaymentMethod]
      });

      if (paymentError) throw paymentError;

      // Record transaction
      const transactionData = {
        transaction_id: `txn_${Date.now()}`,
        stripe_payment_intent_id: intentId,
        transaction_type: 'payment',
        amount: amount,
        currency: 'USD',
        status: 'completed',
        payment_method: 'card',
        project_id: invoice?.project_id || 0,
        invoice_id: invoice?.id || 0,
        description: `Payment for invoice ${invoice?.invoice_number || 'N/A'}`,
        processed_at: new Date().toISOString()
      };

      const { error: transactionError } = await window.ezsite.apis.tableCreate('33730', transactionData);
      if (transactionError) throw transactionError;

      // Record ledger entries
      const ledgerEntries = [
      {
        account_type: 'cash',
        account_id: 'company_cash',
        entry_type: 'debit',
        amount: amount,
        description: 'Payment received'
      },
      {
        account_type: 'accounts_receivable',
        account_id: `invoice_${invoice?.id}`,
        entry_type: 'credit',
        amount: amount,
        description: 'Invoice payment'
      }];


      const { data: ledgerData, error: ledgerError } = await window.ezsite.apis.run({
        path: 'recordLedgerEntry',
        param: [transactionData.transaction_id, ledgerEntries]
      });

      if (ledgerError) throw ledgerError;

      // Insert ledger entries
      for (const entry of ledgerData.entries) {
        await window.ezsite.apis.tableCreate('33731', entry);
      }

      // Update invoice status
      if (invoice?.id) {
        await window.ezsite.apis.tableUpdate('33734', {
          id: invoice.id,
          status: 'paid',
          paid_at: new Date().toISOString()
        });
      }

      toast({
        title: 'Payment Successful',
        description: `Payment of $${(amount / 100).toFixed(2)} processed successfully`
      });

      if (onSuccess) {
        onSuccess(transactionData);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.toString(),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'payment' ? <CreditCard className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
          {mode === 'payment' ? 'Make Payment' : 'Process Payout'}
        </CardTitle>
        <CardDescription>
          {mode === 'payment' ?
          'Secure payment processing with Stripe' :
          'Send payout to contractor account'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {invoice &&
        <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Invoice #{invoice.invoice_number}</span>
              <Badge variant="outline">{invoice.status}</Badge>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(invoice.total_amount)}</div>
            <div className="text-sm text-muted-foreground">{invoice.description}</div>
          </div>
        }

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount / 100}
                onChange={(e) => setAmount(Math.round(parseFloat(e.target.value || '0') * 100))}
                className="pl-10"
                disabled={!!invoice} />

            </div>
          </div>

          {mode === 'payment' &&
          <div>
              <Label>Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_card">+ Add New Card</SelectItem>
                  {paymentMethods.map((method: any) =>
                <SelectItem key={method.id} value={method.stripe_payment_method_id}>
                      {method.brand} •••• {method.last_four}
                    </SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          }
        </div>

        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">Secure Payment</div>
            <div>Protected by 256-bit SSL encryption</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          onClick={confirmPayment}
          disabled={loading || !amount}
          className="flex-1">

          {loading && <Clock className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'payment' ? `Pay ${formatCurrency(amount)}` : `Send ${formatCurrency(amount)}`}
        </Button>
        
        {onCancel &&
        <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        }
      </CardFooter>
    </Card>);

};

export default PaymentEngine;