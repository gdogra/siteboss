
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  FolderOpen,
  FileText,
  Upload,
  MessageSquare,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp } from
'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ClientPortalLayout from '@/components/ClientPortalLayout';
import { useToast } from '@/hooks/use-toast';
import TrialProgressIndicator from '@/components/TrialProgressIndicator';
import UpgradePrompt from '@/components/UpgradePrompt';

const ClientDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    loadUserInfo();

    // Check if coming from onboarding
    if (searchParams.get('onboarding') === 'completed') {
      setShowOnboardingSuccess(true);
      toast({
        title: "🎉 Welcome to ContractPro!",
        description: "Your account is ready. Start exploring your new construction management platform!",
        duration: 5000
      });
    }
  }, [searchParams]);

  const loadUserInfo = async () => {
    try {
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (!error && data) {
        setUserInfo(data);
        loadTrialStatus(data.ID);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadTrialStatus = async (userId) => {
    try {
      // Check if user has active trial
      const { data: trialData, error } = await window.ezsite.apis.tablePage(35522, {
        PageNo: 1,
        PageSize: 1,
        Filters: [
        { name: "user_id", op: "Equal", value: userId },
        { name: "trial_status", op: "Equal", value: "active" }]

      });

      if (!error && trialData?.List?.length > 0) {
        const trial = trialData.List[0];
        const endDate = new Date(trial.trial_end_date);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        setTrialStatus({
          ...trial,
          daysRemaining: Math.max(0, daysRemaining),
          isActive: daysRemaining > 0
        });
      }
    } catch (error) {
      console.error('Error loading trial status:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw new Error(userError);
      setUser(userInfo);

      // Fetch projects
      const { data: projectData, error: projectError } = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });
      if (!projectError && projectData?.List) {
        setProjects(projectData.List);
      }

      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await window.ezsite.apis.tablePage(33734, {
        PageNo: 1,
        PageSize: 5,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });
      if (!invoiceError && invoiceData?.List) {
        setInvoices(invoiceData.List);
      }

      // Fetch documents
      const { data: documentData, error: documentError } = await window.ezsite.apis.tablePage(32236, {
        PageNo: 1,
        PageSize: 5,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });
      if (!documentError && documentData?.List) {
        setDocuments(documentData.List);
      }

      // Fetch messages
      const { data: messageData, error: messageError } = await window.ezsite.apis.tablePage(34883, {
        PageNo: 1,
        PageSize: 5,
        OrderByField: "id",
        IsAsc: false,
        Filters: [
        { name: "receiver_id", op: "Equal", value: userInfo.ID }]

      });
      if (!messageError && messageData?.List) {
        setMessages(messageData.List);
      }

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateProjectProgress = (project: any) => {
    // Simple calculation based on status
    switch (project.status?.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 60;
      case 'pending':
        return 20;
      default:
        return 0;
    }
  };

  const stats = [
  {
    title: 'Active Projects',
    value: projects.filter((p) => p.status !== 'completed').length,
    icon: FolderOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    title: 'Pending Invoices',
    value: invoices.filter((i) => i.status === 'pending').length,
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    title: 'Documents',
    value: documents.length,
    icon: Upload,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    title: 'Unread Messages',
    value: messages.filter((m) => !m.read_status).length,
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }];


  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ClientPortalLayout>);

  }

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.Name || 'Client'}!
          </h1>
          <p className="opacity-90">
            Here's an overview of your projects and recent activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) =>
          <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trial Status & Onboarding Success */}
          {trialStatus?.isActive &&
          <TrialProgressIndicator
            userId={userInfo?.ID}
            showUpgradePrompt={trialStatus.daysRemaining <= 14} />

          }

          {/* Upgrade Prompt for Low Trial Time */}
          {trialStatus?.isActive && trialStatus.daysRemaining <= 7 &&
          <UpgradePrompt
            urgency={trialStatus.daysRemaining <= 3 ? 'high' : 'medium'}
            daysRemaining={trialStatus.daysRemaining} />

          }
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Recent Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) =>
                <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{project.name}</h3>
                      {getProjectStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{calculateProjectProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProjectProgress(project)} />
                    </div>
                  </div>
                )}
                {projects.length > 3 &&
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/client/projects')}>

                    View All Projects
                  </Button>
                }
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.slice(0, 3).map((invoice) =>
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Invoice #{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount || '0.00'}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                )}
                {invoices.length > 3 &&
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/client/invoices')}>

                    View All Invoices
                  </Button>
                }
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.slice(0, 3).map((message) =>
                <div key={message.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{message.subject}</p>
                      {!message.read_status &&
                    <Badge variant="destructive" className="text-xs">New</Badge>
                    }
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {message.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {messages.length === 0 &&
                <p className="text-muted-foreground text-center py-4">
                    No messages yet
                  </p>
                }
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/client/messages')}>

                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/client/documents')}>

                  <Upload className="h-6 w-6 mb-2" />
                  Upload Document
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/client/messages')}>

                  <MessageSquare className="h-6 w-6 mb-2" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/client/invoices')}>

                  <DollarSign className="h-6 w-6 mb-2" />
                  Pay Invoice
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => navigate('/client/projects')}>

                  <TrendingUp className="h-6 w-6 mb-2" />
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientPortalLayout>);

};

export default ClientDashboard;