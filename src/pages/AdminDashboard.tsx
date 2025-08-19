import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TrialManager from '@/components/TrialManager';
import Header from '@/components/Header';
import ProjectForm from '@/components/ProjectForm';
import LogForm from '@/components/LogForm';
import PaymentForm from '@/components/PaymentForm';
import SubcontractorForm from '@/components/SubcontractorForm';
import DocumentForm from '@/components/DocumentForm';
import WorkPeriodForm from '@/components/WorkPeriodForm';
import UserManagement from '@/components/UserManagement';
import LeadSummary from '@/components/LeadSummary';
import RoleBasedDashboard from '@/components/RoleBasedDashboard';

interface Project {
  id: number;
  name: string;
  client_name: string;
  client_email: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  address: string;
}

interface Log {
  id: number;
  project_id: number;
  date: string;
  labor_hours: number;
  labor_cost: number;
  materials_cost: number;
  activities: string;
}

interface Payment {
  id: number;
  project_id: number;
  amount: number;
  payment_type: string;
  date_paid: string;
  status: string;
  description: string;
}

interface Subcontractor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hourly_rate: number;
}

interface Document {
  id: number;
  project_id: number;
  title: string;
  category: string;
  file_id: number;
  description: string;
  upload_date: string;
  is_client_visible: boolean;
}

interface WorkPeriod {
  id: number;
  project_id: number;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  team_members: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workPeriods, setWorkPeriods] = useState<WorkPeriod[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Form modals state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSubcontractorForm, setShowSubcontractorForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showWorkPeriodForm, setShowWorkPeriodForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const response = await window.ezsite.apis.getUserInfo();
      if (response.error) {
        throw new Error('Not authenticated');
      }
      setUserInfo(response.data);
      loadDashboardData();
    } catch (error) {
      console.error('Authentication check failed:', error);
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the admin dashboard',
        variant: 'destructive'
      });
      navigate('/admin-login');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load projects
      const projectsResponse = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false
      });

      if (projectsResponse.error) throw projectsResponse.error;
      const projectsData = projectsResponse.data?.List || [];
      setProjects(projectsData);

      // Load recent logs
      const logsResponse = await window.ezsite.apis.tablePage(32234, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'date',
        IsAsc: false
      });

      if (logsResponse.error) throw logsResponse.error;
      setRecentLogs(logsResponse.data?.List || []);

      // Load recent payments
      const paymentsResponse = await window.ezsite.apis.tablePage(32235, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: 'date_paid',
        IsAsc: false
      });

      if (paymentsResponse.error) throw paymentsResponse.error;
      setRecentPayments(paymentsResponse.data?.List || []);

      // Load subcontractors
      const subcontractorsResponse = await window.ezsite.apis.tablePage(32233, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'name',
        IsAsc: true
      });

      if (subcontractorsResponse.error) throw subcontractorsResponse.error;
      setSubcontractors(subcontractorsResponse.data?.List || []);

      // Load documents
      const documentsResponse = await window.ezsite.apis.tablePage(32236, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'upload_date',
        IsAsc: false
      });

      if (documentsResponse.error) throw documentsResponse.error;
      setDocuments(documentsResponse.data?.List || []);

      // Load work periods
      const workPeriodsResponse = await window.ezsite.apis.tablePage(33268, {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'start_date',
        IsAsc: false
      });

      if (workPeriodsResponse.error) throw workPeriodsResponse.error;
      setWorkPeriods(workPeriodsResponse.data?.List || []);

      // Calculate stats
      const activeProjects = projectsData.filter((p: Project) => p.status === 'In Progress').length;
      const completedProjects = projectsData.filter((p: Project) => p.status === 'Completed').length;
      const totalRevenue = projectsData.
      filter((p: Project) => p.status === 'Completed').
      reduce((sum: number, p: Project) => sum + (p.budget || 0), 0);

      setStats({
        totalProjects: projectsData.length,
        activeProjects,
        completedProjects,
        totalRevenue,
        pendingPayments: (paymentsResponse.data?.List || []).
        filter((p: Payment) => p.status === 'Pending').length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      // Add a small delay to ensure UI updates properly
      setTimeout(() => {
        setLoading(false);
      }, 100);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':return 'bg-blue-100 text-blue-800';
      case 'In Progress':return 'bg-green-100 text-green-800';
      case 'Completed':return 'bg-gray-100 text-gray-800';
      case 'On Hold':return 'bg-yellow-100 text-yellow-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleEdit = (type: string, item: any) => {
    setEditingItem(item);
    switch (type) {
      case 'project':
        setShowProjectForm(true);
        break;
      case 'log':
        setShowLogForm(true);
        break;
      case 'payment':
        setShowPaymentForm(true);
        break;
      case 'subcontractor':
        setShowSubcontractorForm(true);
        break;
      case 'document':
        setShowDocumentForm(true);
        break;
      case 'workperiod':
        setShowWorkPeriodForm(true);
        break;
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      let tableId;
      switch (type) {
        case 'project':
          tableId = 32232;
          break;
        case 'log':
          tableId = 32234;
          break;
        case 'payment':
          tableId = 32235;
          break;
        case 'subcontractor':
          tableId = 32233;
          break;
        case 'document':
          tableId = 32236;
          break;
        case 'workperiod':
          tableId = 33268;
          break;
        default:
          return;
      }

      const response = await window.ezsite.apis.tableDelete(tableId, { ID: id });
      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully'
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  const closeForm = () => {
    setShowProjectForm(false);
    setShowLogForm(false);
    setShowPaymentForm(false);
    setShowSubcontractorForm(false);
    setShowDocumentForm(false);
    setShowWorkPeriodForm(false);
    setEditingItem(null);
  };

  const onFormSuccess = () => {
    loadDashboardData();
  };

  const getRoleDisplay = (roles: string) => {
    if (!roles) return 'User';

    const roleArray = roles.split(',');
    if (roleArray.includes('Administrator')) return 'Admin/Manager';
    if (roleArray.includes('r-QpoZrh')) return 'Sales/Accountant';
    if (roleArray.includes('GeneralUser')) return 'Viewer';
    return 'User';
  };

  const getRoleColor = (roles: string) => {
    if (!roles) return 'bg-gray-100 text-gray-800';

    const roleArray = roles.split(',');
    if (roleArray.includes('Administrator')) return 'bg-red-100 text-red-800';
    if (roleArray.includes('r-QpoZrh')) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const hasRole = (requiredRole: string) => {
    if (!userInfo?.Roles) return false;
    const userRoles = userInfo.Roles.split(',');
    return userRoles.includes(requiredRole);
  };

  const isAdmin = () => hasRole('Administrator');
  const isSalesOrAccountant = () => hasRole('r-QpoZrh');
  const isViewer = () => hasRole('GeneralUser');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            {/* Trial Status */}
            <div className="mb-8">
              <TrialManager compact={false} />
            </div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {userInfo &&
              <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {userInfo.Name?.slice(0, 2).toUpperCase() || userInfo.Email?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {userInfo.Name || userInfo.Email}
                    </p>
                    <Badge className={`text-xs ${getRoleColor(userInfo.Roles)}`}>
                      {getRoleDisplay(userInfo.Roles)}
                    </Badge>
                  </div>
                </div>
              }
            </div>
            <p className="text-gray-600">Manage your construction projects and operations</p>
          </div>

          {/* Quick Navigation Cards - Role Based */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(isAdmin() || isSalesOrAccountant()) &&
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leads')}>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Lead Management</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage leads & pipeline</p>
                </CardContent>
              </Card>
            }
            
            {(isAdmin() || isSalesOrAccountant()) &&
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/payments')}>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Payments</h3>
                  <p className="text-sm text-gray-600 mt-1">Financial management</p>
                </CardContent>
              </Card>
            }
            
            {(isAdmin() || isSalesOrAccountant()) &&
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/invoice-submission')}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium">Invoices</h3>
                  <p className="text-sm text-gray-600 mt-1">Invoice management</p>
                </CardContent>
              </Card>
            }
            
            {(isAdmin() || isSalesOrAccountant()) &&
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowProjectForm(true)}>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-medium">New Project</h3>
                  <p className="text-sm text-gray-600 mt-1">Create project</p>
                </CardContent>
              </Card>
            }
            
            {isViewer() &&
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <h3 className="font-medium">View Only Access</h3>
                  <p className="text-sm text-gray-600 mt-1">Read-only dashboard</p>
                </CardContent>
              </Card>
            }
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeProjects}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs - Role Based */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {(isAdmin() || isSalesOrAccountant()) && <TabsTrigger value="projects">Projects</TabsTrigger>}
              {(isAdmin() || isSalesOrAccountant()) && <TabsTrigger value="logs">Logs</TabsTrigger>}
              {(isAdmin() || isSalesOrAccountant()) && <TabsTrigger value="payments">Payments</TabsTrigger>}
              {isAdmin() && <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>}
              {(isAdmin() || isSalesOrAccountant()) && <TabsTrigger value="documents">Documents</TabsTrigger>}
              {isAdmin() && <TabsTrigger value="workperiods">Work Periods</TabsTrigger>}
              {isAdmin() && <TabsTrigger value="users">Users</TabsTrigger>}
            </TabsList>

            {/* Overview Tab - Role Based */}
            <TabsContent value="overview" className="space-y-6">
              <RoleBasedDashboard userInfo={userInfo} stats={stats} />
              {(isAdmin() || isSalesOrAccountant()) && <LeadSummary currentUser={userInfo} />}
            </TabsContent>
            
            {(isAdmin() || isSalesOrAccountant()) &&
            <TabsContent value="projects" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Projects</h2>
                  {(isAdmin() || isSalesOrAccountant()) &&
                <Button onClick={() => setShowProjectForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Project
                    </Button>
                }
                </div>

              <div className="grid gap-6">
                {projects.length === 0 ?
                <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first project.</p>
                        <Button onClick={() => setShowProjectForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card> :

                projects.map((project) =>
                <Card key={project.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{project.name}</CardTitle>
                            <CardDescription className="mt-1">
                              Client: {project.client_name} • {project.address}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" title="View Project">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit('project', project)} title="Edit Project">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('project', project.id)} title="Delete Project">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-medium">{formatDate(project.start_date)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-medium">{formatDate(project.end_date)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Budget</p>
                            <p className="font-medium">{formatCurrency(project.budget)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Client Email</p>
                            <p className="font-medium text-sm">{project.client_email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
                }
              </div>
              </TabsContent>
            }

            {/* Work Periods Tab - Admin Only */}
            {isAdmin() &&
            <TabsContent value="workperiods" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Work Periods</h2>
                  <Button onClick={() => setShowWorkPeriodForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Work Period
                  </Button>
                </div>

              <div className="grid gap-4">
                {workPeriods.length === 0 ?
                <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No work periods yet</h3>
                        <p className="text-gray-500 mb-4">Schedule work periods with date ranges and team assignments.</p>
                        <Button onClick={() => setShowWorkPeriodForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Work Period
                        </Button>
                      </div>
                    </CardContent>
                  </Card> :

                workPeriods.map((workPeriod) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Planned':return 'bg-blue-100 text-blue-800';
                      case 'Active':return 'bg-green-100 text-green-800';
                      case 'Completed':return 'bg-gray-100 text-gray-800';
                      case 'Cancelled':return 'bg-red-100 text-red-800';
                      default:return 'bg-gray-100 text-gray-800';
                    }
                  };

                  const getDaysBetween = (startDate: string, endDate: string) => {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  };

                  return (
                    <Card key={workPeriod.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Project ID: {workPeriod.project_id}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {formatDate(workPeriod.start_date)} - {formatDate(workPeriod.end_date)}
                              <span className="ml-2 text-sm">
                                ({getDaysBetween(workPeriod.start_date, workPeriod.end_date)} days)
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(workPeriod.status)}>
                              {workPeriod.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" title="View Work Period">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit('workperiod', workPeriod)} title="Edit Work Period">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('workperiod', workPeriod.id)} title="Delete Work Period">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {workPeriod.description &&
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="text-sm">{workPeriod.description}</p>
                          </div>
                        }
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {workPeriod.team_members &&
                          <div>
                              <p className="text-sm text-gray-600">Team Members</p>
                              <p className="font-medium text-sm">{workPeriod.team_members}</p>
                            </div>
                          }
                          <div>
                            <p className="text-sm text-gray-600">Estimated Hours</p>
                            <p className="font-medium">{workPeriod.estimated_hours || 0}h</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Actual Hours</p>
                            <p className="font-medium">{workPeriod.actual_hours || 0}h</p>
                            {workPeriod.estimated_hours > 0 &&
                            <p className="text-xs text-gray-500">
                                {((workPeriod.actual_hours || 0) / workPeriod.estimated_hours * 100).toFixed(1)}% of estimate
                              </p>
                            }
                          </div>
                        </div>
                      </CardContent>
                    </Card>);

                })
                }
              </div>
              </TabsContent>
            }

            {/* Daily Logs Tab */}
            {(isAdmin() || isSalesOrAccountant()) &&
            <TabsContent value="logs" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Recent Daily Logs</h2>
                  <Button onClick={() => setShowLogForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Log Entry
                  </Button>
                </div>

              <div className="grid gap-4">
                {recentLogs.length === 0 ?
                <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
                        <p className="text-gray-500 mb-4">Start tracking daily activities and expenses.</p>
                        <Button onClick={() => setShowLogForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Log Entry
                        </Button>
                      </div>
                    </CardContent>
                  </Card> :

                recentLogs.map((log) =>
                <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">Project ID: {log.project_id}</h3>
                            <p className="text-sm text-gray-600">{formatDate(log.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Total Cost</p>
                              <p className="font-medium">{formatCurrency(log.labor_cost + log.materials_cost)}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit('log', log)} title="Edit Log">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('log', log.id)} title="Delete Log">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Labor Hours</p>
                            <p className="font-medium">{log.labor_hours}h</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Labor Cost</p>
                            <p className="font-medium">{formatCurrency(log.labor_cost)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Materials Cost</p>
                            <p className="font-medium">{formatCurrency(log.materials_cost)}</p>
                          </div>
                        </div>
                        {log.activities &&
                    <div>
                            <p className="text-sm text-gray-600 mb-1">Activities</p>
                            <p className="text-sm">{log.activities}</p>
                          </div>
                    }
                      </CardContent>
                    </Card>
                )
                }
              </div>
              </TabsContent>
            }

            {/* Payments Tab */}
            {(isAdmin() || isSalesOrAccountant()) &&
            <TabsContent value="payments" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Recent Payments</h2>
                  <Button onClick={() => setShowPaymentForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Payment
                  </Button>
                </div>

              <div className="grid gap-4">
                {recentPayments.length === 0 ?
                <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                        <p className="text-gray-500 mb-4">Track payments and financial transactions.</p>
                        <Button onClick={() => setShowPaymentForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Record Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card> :

                recentPayments.map((payment) =>
                <Card key={payment.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{payment.description || 'Payment'}</h3>
                            <p className="text-sm text-gray-600">
                              {payment.payment_type} • {formatDate(payment.date_paid)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-medium text-lg">{formatCurrency(payment.amount)}</p>
                              <Badge className={payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {payment.status}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit('payment', payment)} title="Edit Payment">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('payment', payment.id)} title="Delete Payment">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
                }
              </div>
              </TabsContent>
            }

            {/* Subcontractors Tab - Admin Only */}
            {isAdmin() &&
            <TabsContent value="subcontractors" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Subcontractors</h2>
                  <Button onClick={() => setShowSubcontractorForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subcontractor
                  </Button>
                </div>

              <div className="grid gap-4">
                {subcontractors.length === 0 ?
                <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No subcontractors yet</h3>
                        <p className="text-gray-500 mb-4">Add your trusted subcontractors and vendors.</p>
                        <Button onClick={() => setShowSubcontractorForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subcontractor
                        </Button>
                      </div>
                    </CardContent>
                  </Card> :

                subcontractors.map((subcontractor) =>
                <Card key={subcontractor.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {subcontractor.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{subcontractor.name}</h3>
                              <p className="text-sm text-gray-600">{subcontractor.specialty}</p>
                              <p className="text-sm text-gray-600">{subcontractor.email}</p>
                              <p className="text-sm text-gray-600">{subcontractor.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Hourly Rate</p>
                              <p className="font-medium">{formatCurrency(subcontractor.hourly_rate)}/hr</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEdit('subcontractor', subcontractor)} title="Edit Subcontractor">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete('subcontractor', subcontractor.id)} title="Delete Subcontractor">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
                }
              </div>
              </TabsContent>
            }

            {/* Documents Tab */}
            {(isAdmin() || isSalesOrAccountant()) &&
            <TabsContent value="documents" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Documents</h2>
                  <Button onClick={() => setShowDocumentForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

              <div className="grid gap-4">
                {documents.length === 0 ?
                <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                        <p className="text-gray-500 mb-4">Upload permits, contracts, and project documents.</p>
                        <Button onClick={() => setShowDocumentForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    </CardContent>
                  </Card> :

                documents.map((doc) =>
                <Card key={doc.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium">{doc.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs">
                                  {doc.category}
                                </Badge>
                                {doc.is_client_visible &&
                            <Badge variant="outline" className="text-xs">
                                    Client Visible
                                  </Badge>
                            }
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Project ID: {doc.project_id} • Uploaded: {formatDate(doc.upload_date)}
                            </p>
                            {doc.description &&
                        <p className="text-sm text-gray-500">{doc.description}</p>
                        }
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button size="sm" variant="outline" onClick={() => handleEdit('document', doc)} title="Edit Document">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete('document', doc.id)} title="Delete Document">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
                }
              </div>
            </TabsContent>
            }

            {/* Users Tab - Admin Only */}
            {isAdmin() &&
            <TabsContent value="users" className="space-y-6">
                <UserManagement />
              </TabsContent>
            }
          </Tabs>

          {/* Form Modals */}
          {showProjectForm &&
          <ProjectForm
            project={editingItem}
            onClose={closeForm}
            onSuccess={onFormSuccess} />

          }

          {showLogForm &&
          <LogForm
            log={editingItem}
            onClose={closeForm}
            onSuccess={onFormSuccess} />

          }

          {showPaymentForm &&
          <PaymentForm
            payment={editingItem}
            onClose={closeForm}
            onSuccess={onFormSuccess} />

          }

          {showSubcontractorForm &&
          <SubcontractorForm
            subcontractor={editingItem}
            onClose={closeForm}
            onSuccess={onFormSuccess} />

          }

          {showDocumentForm &&
          <DocumentForm
            document={editingItem}
            onClose={closeForm}
            onSuccess={onFormSuccess} />

          }

          {showWorkPeriodForm &&
          <WorkPeriodForm
            workPeriod={editingItem}
            onClose={closeForm}
            onSuccess={onFormSuccess} />

          }
        </div>
      </main>
    </div>);

};

export default AdminDashboard;