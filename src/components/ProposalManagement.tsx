import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Filter, FileText, Edit, Eye, Send, 
  CheckCircle, XCircle, Clock, AlertCircle, Download,
  TrendingUp, Users, DollarSign, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProposalCreator from './ProposalCreator';
import ProposalEditor from './ProposalEditor';
import ProposalAnalytics from './ProposalAnalytics';
import ProposalWorkflow from './ProposalWorkflow';

interface Proposal {
  id: number;
  proposal_number: string;
  title: string;
  client_name: string;
  client_email: string;
  status: string;
  total_amount: number;
  currency: string;
  valid_until: string;
  created_at: string;
  sent_at?: string;
  viewed_at?: string;
  signed_at?: string;
  priority: string;
  assigned_to: number;
}

const ProposalManagement: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    viewed: 0,
    signed: 0,
    rejected: 0,
    totalValue: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProposals();
    fetchStats();
  }, []);

  useEffect(() => {
    filterProposals();
  }, [proposals, searchTerm, statusFilter, priorityFilter]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(35433, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setProposals(data?.List || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35433, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: true,
        Filters: []
      });

      if (error) throw error;
      const proposals = data?.List || [];
      
      const newStats = {
        total: proposals.length,
        draft: proposals.filter((p: Proposal) => p.status === 'draft').length,
        sent: proposals.filter((p: Proposal) => p.status === 'sent').length,
        viewed: proposals.filter((p: Proposal) => p.status === 'viewed').length,
        signed: proposals.filter((p: Proposal) => p.status === 'signed').length,
        rejected: proposals.filter((p: Proposal) => p.status === 'rejected').length,
        totalValue: proposals.reduce((sum: number, p: Proposal) => sum + (p.total_amount || 0), 0)
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterProposals = () => {
    let filtered = proposals;

    if (searchTerm) {
      filtered = filtered.filter(proposal => 
        proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.priority === priorityFilter);
    }

    setFilteredProposals(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'viewed': 'bg-yellow-100 text-yellow-800',
      'signed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'draft': <Edit className="w-4 h-4" />,
      'sent': <Send className="w-4 h-4" />,
      'viewed': <Eye className="w-4 h-4" />,
      'signed': <CheckCircle className="w-4 h-4" />,
      'rejected': <XCircle className="w-4 h-4" />,
      'expired': <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const handleSendProposal = async (proposal: Proposal) => {
    try {
      // Update proposal status to sent
      const { error } = await window.ezsite.apis.tableUpdate(35433, {
        ID: proposal.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      if (error) throw error;

      // Send email notification
      await window.ezsite.apis.sendEmail({
        from: 'proposals@yourcompany.com',
        to: [proposal.client_email],
        subject: `Proposal: ${proposal.title}`,
        html: `
          <h2>New Proposal: ${proposal.title}</h2>
          <p>Dear ${proposal.client_name},</p>
          <p>We have prepared a proposal for your review.</p>
          <p><strong>Proposal Number:</strong> ${proposal.proposal_number}</p>
          <p><strong>Total Amount:</strong> ${formatCurrency(proposal.total_amount, proposal.currency)}</p>
          <p><a href="${window.location.origin}/proposal/${proposal.id}/view" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Proposal</a></p>
          <p>This proposal is valid until: ${new Date(proposal.valid_until).toLocaleDateString()}</p>
          <p>Thank you for your business!</p>
        `
      });

      toast({
        title: 'Success',
        description: 'Proposal sent successfully'
      });

      fetchProposals();
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to send proposal',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Signed</p>
                <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.viewed}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setShowCreator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>

          {/* Proposals List */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading proposals...</p>
                </CardContent>
              </Card>
            ) : filteredProposals.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No proposals found</p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{proposal.title}</h3>
                          <Badge className={getStatusColor(proposal.status)}>
                            {getStatusIcon(proposal.status)}
                            <span className="ml-1 capitalize">{proposal.status}</span>
                          </Badge>
                          {proposal.priority !== 'normal' && (
                            <Badge variant="outline" className={
                              proposal.priority === 'high' ? 'border-orange-500 text-orange-700' :
                              proposal.priority === 'urgent' ? 'border-red-500 text-red-700' :
                              'border-gray-500 text-gray-700'
                            }>
                              {proposal.priority}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Proposal #:</strong> {proposal.proposal_number}</p>
                          <p><strong>Client:</strong> {proposal.client_name}</p>
                          <p><strong>Amount:</strong> {formatCurrency(proposal.total_amount, proposal.currency)}</p>
                          <p><strong>Valid Until:</strong> {new Date(proposal.valid_until).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setShowEditor(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/proposal/${proposal.id}/view`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>

                        {proposal.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => handleSendProposal(proposal)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ProposalAnalytics />
        </TabsContent>

        <TabsContent value="workflow">
          <ProposalWorkflow />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Template management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
          </DialogHeader>
          <ProposalCreator 
            onSuccess={() => {
              setShowCreator(false);
              fetchProposals();
            }}
            onCancel={() => setShowCreator(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Proposal</DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <ProposalEditor 
              proposalId={selectedProposal.id}
              onSuccess={() => {
                setShowEditor(false);
                fetchProposals();
              }}
              onCancel={() => setShowEditor(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalManagement;