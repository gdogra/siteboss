import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  Calendar, 
  Download, 
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  expectedCompletion: string;
  manager: {
    name: string;
    phone: string;
    email: string;
  };
  description: string;
}

interface Milestone {
  id: string;
  projectId: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  notes?: string;
  photos?: string[];
}

interface Invoice {
  id: string;
  projectId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  milestones: string[];
}

const CustomerPortal: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // Get customer info
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) {
        throw new Error(userError);
      }
      setCustomer(userInfo);

      // Load customer projects
      const { data: projectsData, error: projectsError } = await window.ezsite.apis.tablePage('35601', {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'client_id', op: 'Equal', value: userInfo.ID }
        ]
      });

      if (!projectsError && projectsData?.List) {
        setProjects(projectsData.List);
      }

      // Load project milestones
      const { data: milestonesData, error: milestonesError } = await window.ezsite.apis.tablePage('35602', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'due_date',
        IsAsc: true,
        Filters: []
      });

      if (!milestonesError && milestonesData?.List) {
        setMilestones(milestonesData.List);
      }

      // Load invoices
      const { data: invoicesData, error: invoicesError } = await window.ezsite.apis.tablePage('33734', {
        PageNo: 1,
        PageSize: 20,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'client_id', op: 'Equal', value: userInfo.ID }
        ]
      });

      if (!invoicesError && invoicesData?.List) {
        setInvoices(invoicesData.List);
      }

    } catch (error: any) {
      console.error('Error loading customer data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your project information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': case 'on-hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': case 'on-hold': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-gray-600">Welcome back, {customer?.Name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {customer?.Name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Milestones</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="grid gap-6">
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-600">Your projects will appear here once they're created.</p>
                  </CardContent>
                </Card>
              ) : (
                projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <p className="text-gray-600 mt-1">{project.description}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-2 capitalize">{project.status.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium">{formatDate(project.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expected Completion</p>
                          <p className="font-medium">{formatDate(project.expectedCompletion)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Project Manager</p>
                          <div className="space-y-1">
                            <p className="font-medium flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {project.manager.name}
                            </p>
                            <p className="text-gray-600 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {project.manager.phone}
                            </p>
                            <p className="text-gray-600 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {project.manager.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message Team
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          View Documents
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <div className="grid gap-4">
              {milestones.filter(m => projects.some(p => p.id === m.projectId)).map((milestone) => {
                const project = projects.find(p => p.id === milestone.projectId);
                return (
                  <Card key={milestone.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{milestone.name}</h4>
                          {project && (
                            <p className="text-sm text-gray-600 mt-1">
                              <Building2 className="w-3 h-3 inline mr-1" />
                              {project.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Due: {formatDate(milestone.dueDate)}
                          </p>
                          {milestone.notes && (
                            <p className="text-sm text-gray-700 mt-2">{milestone.notes}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(milestone.status)}>
                          {getStatusIcon(milestone.status)}
                          <span className="ml-2 capitalize">{milestone.status.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Invoices/Payments Tab */}
          <TabsContent value="invoices">
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{invoice.description}</h4>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(invoice.amount)}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusIcon(invoice.status)}
                              <span className="ml-2 capitalize">{invoice.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Due: {formatDate(invoice.dueDate)}
                        </p>
                        {invoice.milestones.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Milestones:</strong> {invoice.milestones.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    {invoice.status !== 'paid' && (
                      <div className="mt-4 pt-4 border-t">
                        <Button className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-600">Your project documents will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerPortal;