import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Bell,
  LogOut,
  Plus,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [userType, setUserType] = useState<'admin' | 'contractor'>('admin');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType') as 'admin' | 'contractor';
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/admin');
  };

  const handleApproveInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Approved",
      description: `Invoice ${invoiceId} has been approved for payment processing.`
    });
  };

  const handleRejectInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Rejected",
      description: `Invoice ${invoiceId} has been rejected. The contractor will be notified.`,
      variant: "destructive"
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast({
      title: "Opening Invoice",
      description: `Viewing details for invoice ${invoiceId}.`
    });
  };

  const handleDownloadReport = (reportName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportName}...`
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Monthly report has been generated successfully."
    });
  };

  // Mock data
  const adminStats = [
  { title: 'Total Revenue', value: '$2.4M', change: '+12%', icon: DollarSign },
  { title: 'Active Invoices', value: '24', change: '+3', icon: FileText },
  { title: 'Contractors', value: '18', change: '+2', icon: Users },
  { title: 'Growth Rate', value: '23%', change: '+5%', icon: TrendingUp }];


  const contractorStats = [
  { title: 'Pending Invoices', value: '3', change: '+1', icon: FileText },
  { title: 'Total Earned', value: '$45,600', change: '+$3,200', icon: DollarSign },
  { title: 'Active Projects', value: '2', change: '0', icon: Users },
  { title: 'Success Rate', value: '96%', change: '+2%', icon: TrendingUp }];


  const invoices = [
  {
    id: 'INV-001',
    contractor: 'ABC Construction',
    amount: '$12,500',
    status: 'pending',
    date: '2024-01-15',
    project: 'Oceanview Residences'
  },
  {
    id: 'INV-002',
    contractor: 'Elite Electrical',
    amount: '$8,750',
    status: 'approved',
    date: '2024-01-14',
    project: 'Sunset Villas'
  },
  {
    id: 'INV-003',
    contractor: 'Premium Plumbing',
    amount: '$6,200',
    status: 'paid',
    date: '2024-01-13',
    project: 'Marina Heights'
  },
  {
    id: 'INV-004',
    contractor: 'Luxury Landscaping',
    amount: '$15,300',
    status: 'rejected',
    date: '2024-01-12',
    project: 'Oceanview Residences'
  }];


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':return <XCircle className="h-4 w-4 text-red-600" />;
      case 'paid':return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':return 'bg-green-100 text-green-800';
      case 'rejected':return 'bg-red-100 text-red-800';
      case 'paid':return 'bg-blue-100 text-blue-800';
      default:return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = userType === 'admin' ? adminStats : contractorStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 luxury-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold">LB</span>
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold text-gray-900">
                {userType === 'admin' ? 'Admin' : 'Contractor'} Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {userType === 'admin' ? 'Administrator' : 'John Doe'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarFallback className="luxury-gradient text-white">
                {userType === 'admin' ? 'AD' : 'JD'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) =>
          <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 luxury-gradient rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button
                  className="luxury-gradient text-white hover:opacity-90"
                  onClick={() => {
                    if (userType === 'contractor') {
                      navigate('/admin/submit-invoice');
                    } else {
                      toast({
                        title: "Add Invoice",
                        description: "Invoice creation form will open here."
                      });
                    }
                  }}>

                  <Plus className="h-4 w-4 mr-2" />
                  {userType === 'admin' ? 'Add Invoice' : 'Submit Invoice'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) =>
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium text-gray-900">{invoice.id}</p>
                          <p className="text-sm text-gray-600">{invoice.contractor}</p>
                          <p className="text-xs text-gray-500">{invoice.project}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{invoice.amount}</p>
                          <p className="text-sm text-gray-600">{invoice.date}</p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.id)}>

                            <Eye className="h-4 w-4" />
                          </Button>
                          {userType === 'admin' && invoice.status === 'pending' &&
                        <>
                              <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApproveInvoice(invoice.id)}>

                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRejectInvoice(invoice.id)}>

                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                        }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-gray-900">Oceanview Residences</h3>
                    <p className="text-sm text-gray-600">Phase 2 Development</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                      <span className="text-sm text-gray-500">Due: March 2024</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-gray-900">Sunset Villas</h3>
                    <p className="text-sm text-gray-600">Luxury Villa Construction</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">On Track</Badge>
                      <span className="text-sm text-gray-500">Due: June 2024</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Monthly Reports</CardTitle>
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}>

                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">January 2024 Report</h3>
                      <p className="text-sm text-gray-600">Financial summary and project status</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadReport("January 2024 Report")}>

                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">December 2023 Report</h3>
                      <p className="text-sm text-gray-600">Year-end summary and analytics</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadReport("January 2024 Report")}>

                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>);

};

export default AdminDashboard;