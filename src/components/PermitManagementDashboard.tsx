
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  FileText,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PermitApplication {
  id: number;
  application_number: string;
  permit_type_id: number;
  applicant_user_id: number;
  status: string;
  priority: string;
  property_address: string;
  work_description: string;
  estimated_value: number;
  contractor_name: string;
  submitted_at: string;
  expires_at: string;
  fee_paid: boolean;
}

interface PermitType {
  id: number;
  name: string;
  code: string;
  description: string;
  fee_amount: number;
  inspection_required: boolean;
  processing_time_days: number;
  is_active: boolean;
}

interface PermitInspection {
  id: number;
  permit_application_id: number;
  inspection_type: string;
  inspector_user_id: number;
  scheduled_at: string;
  completed_at: string;
  status: string;
  result: string;
  reinspection_required: boolean;
}

const PermitManagementDashboard = () => {
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [inspections, setInspections] = useState<PermitInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load applications
      const { data: applicationsData, error: applicationsError } = await window.ezsite.apis.tablePage(35423, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData?.List || []);

      // Load permit types
      const { data: typesData, error: typesError } = await window.ezsite.apis.tablePage(35422, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (typesError) throw typesError;
      setPermitTypes(typesData?.List || []);

      // Load recent inspections
      const { data: inspectionsData, error: inspectionsError } = await window.ezsite.apis.tablePage(35424, {
        PageNo: 1,
        PageSize: 30,
        OrderByField: 'scheduled_at',
        IsAsc: false,
        Filters: []
      });

      if (inspectionsError) throw inspectionsError;
      setInspections(inspectionsData?.List || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':return 'bg-green-100 text-green-800';
      case 'pending':return 'bg-yellow-100 text-yellow-800';
      case 'under_review':return 'bg-blue-100 text-blue-800';
      case 'rejected':return 'bg-red-100 text-red-800';
      case 'draft':return 'bg-gray-100 text-gray-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':return 'bg-red-100 text-red-800';
      case 'medium':return 'bg-yellow-100 text-yellow-800';
      case 'low':return 'bg-green-100 text-green-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate dashboard stats
  const stats = {
    totalApplications: applications.length,
    pendingReview: applications.filter((app) => app.status === 'pending' || app.status === 'under_review').length,
    approvedApplications: applications.filter((app) => app.status === 'approved').length,
    scheduledInspections: inspections.filter((insp) => insp.status === 'scheduled').length,
    completedInspections: inspections.filter((insp) => insp.status === 'completed').length,
    expiringSoon: applications.filter((app) => {
      if (!app.expires_at) return false;
      const daysUntilExpiry = Math.ceil((new Date(app.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = !searchTerm ||
    app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.contractor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Permit Management Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{stats.pendingReview}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{stats.approvedApplications}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{stats.scheduledInspections}</p>
              <p className="text-sm text-gray-600">Scheduled Inspections</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{stats.completedInspections}</p>
              <p className="text-sm text-gray-600">Completed Inspections</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Applications</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="permit-types">Permit Types</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />

            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredApplications.map((application) =>
            <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">#{application.application_number}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(application.priority)}>
                          {application.priority?.toUpperCase()} PRIORITY
                        </Badge>
                        {application.fee_paid &&
                      <Badge className="bg-green-100 text-green-800">
                            <DollarSign className="w-3 h-3 mr-1" />
                            PAID
                          </Badge>
                      }
                      </div>
                      <p className="text-gray-600">{application.property_address}</p>
                      <p className="text-sm">{application.work_description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Contractor: {application.contractor_name}</span>
                        <span>Submitted: {new Date(application.submitted_at).toLocaleDateString()}</span>
                        <span>Value: ${(application.estimated_value / 100).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Inspection Schedule</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Inspection
            </Button>
          </div>

          <div className="grid gap-4">
            {inspections.map((inspection) =>
            <Card key={inspection.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{inspection.inspection_type}</h3>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status?.toUpperCase()}
                        </Badge>
                        {inspection.reinspection_required &&
                      <Badge className="bg-orange-100 text-orange-800">
                            REINSPECTION REQUIRED
                          </Badge>
                      }
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Scheduled: {new Date(inspection.scheduled_at).toLocaleString()}</span>
                        {inspection.completed_at &&
                      <span>Completed: {new Date(inspection.completed_at).toLocaleString()}</span>
                      }
                      </div>
                      {inspection.result &&
                    <p className="text-sm">Result: {inspection.result}</p>
                    }
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Permit Types Tab */}
        <TabsContent value="permit-types" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Permit Types Configuration</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Permit Type
            </Button>
          </div>

          <div className="grid gap-4">
            {permitTypes.map((type) =>
            <Card key={type.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{type.name}</h3>
                        <Badge variant="outline">{type.code}</Badge>
                        {type.inspection_required &&
                      <Badge className="bg-blue-100 text-blue-800">
                            INSPECTION REQUIRED
                          </Badge>
                      }
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Fee: ${(type.fee_amount / 100).toFixed(2)}</span>
                        <span>Processing: {type.processing_time_days} days</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Applications Submitted</span>
                    <span className="font-semibold">{stats.totalApplications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applications Approved</span>
                    <span className="font-semibold">{stats.approvedApplications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inspections Completed</span>
                    <span className="font-semibold">{stats.completedInspections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiring This Month</span>
                    <span className="font-semibold">{stats.expiringSoon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Applications Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Inspection Schedule Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Violations Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>);

};

export default PermitManagementDashboard;