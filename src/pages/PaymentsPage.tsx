
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthGuard from  '@/components/AuthGuard';
import Header from  '@/components/Header';
import TransactionDashboard from '@/components/TransactionDashboard';
import InvoiceManagement from '@/components/InvoiceManagement';
import ContractorPayouts from '@/components/ContractorPayouts';
import { DollarSign, FileText, Send, TrendingUp, Shield, CreditCard, Users } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Payment Engine</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Secure payment processing for client invoices and contractor payouts with comprehensive transaction tracking
              </p>
            </div>

            {/* Feature Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Client Payments</h3>
                      <p className="text-sm text-muted-foreground">
                        Accept payments via card, ACH, and digital wallets
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Contractor Payouts</h3>
                      <p className="text-sm text-muted-foreground">
                        Automated payouts to connected accounts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure & Compliant</h3>
                      <p className="text-sm text-muted-foreground">
                        PCI compliant with dispute resolution
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="payouts" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Payouts
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Transactions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Processing</CardTitle>
                      <CardDescription>
                        How the payment engine works
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Invoice Creation</h4>
                          <p className="text-sm text-muted-foreground">
                            Create professional invoices with line items and tax calculations
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Secure Payment</h4>
                          <p className="text-sm text-muted-foreground">
                            Clients pay using multiple payment methods with Stripe security
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Automated Tracking</h4>
                          <p className="text-sm text-muted-foreground">
                            Double-entry bookkeeping with automatic ledger updates
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          4
                        </div>
                        <div>
                          <h4 className="font-medium">Contractor Payouts</h4>
                          <p className="text-sm text-muted-foreground">
                            Automated payouts to contractor connected accounts
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security Features</CardTitle>
                      <CardDescription>
                        Built-in security and compliance measures
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">PCI DSS Compliant</h4>
                          <p className="text-sm text-muted-foreground">
                            Stripe handles all sensitive payment data
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">256-bit SSL Encryption</h4>
                          <p className="text-sm text-muted-foreground">
                            All transactions encrypted in transit
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Fraud Detection</h4>
                          <p className="text-sm text-muted-foreground">
                            Advanced fraud prevention and monitoring
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Dispute Management</h4>
                          <p className="text-sm text-muted-foreground">
                            Automated dispute handling and resolution
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <TransactionDashboard />
              </TabsContent>

              <TabsContent value="invoices">
                <InvoiceManagement />
              </TabsContent>

              <TabsContent value="payouts">
                <ContractorPayouts />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default PaymentsPage;
