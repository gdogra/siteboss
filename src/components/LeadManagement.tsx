import React, { useState } from 'react';
import { useLeads, Lead } from '@/contexts/LeadsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Home,
  Wrench,
  X,
  Save
} from 'lucide-react';

interface LeadManagementProps {
  className?: string;
}

const LeadManagement: React.FC<LeadManagementProps> = ({ className }) => {
  const {
    leads,
    pipeline,
    addLead,
    updateLead,
    addNote,
    getLeadsByStatus,
    searchLeads,
    getLeadMetrics,
    convertLeadToProject
  } = useLeads();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'website' as Lead['source'],
    projectType: 'residential_remodel' as Lead['projectType'],
    projectDescription: '',
    estimatedBudget: 0,
    timeline: 'within_3_months' as Lead['timeline'],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'new' as Lead['status'],
    priority: 'warm' as Lead['priority'],
    preferredContactMethod: 'email' as Lead['preferredContactMethod'],
    bestContactTime: '',
    tags: [] as string[],
    decisionMakers: [] as string[]
  });

  const metrics = getLeadMetrics();

  const getSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'website': return <Target className="w-4 h-4" />;
      case 'referral': return <Users className="w-4 h-4" />;
      case 'social_media': return <MessageSquare className="w-4 h-4" />;
      case 'google_ads': return <Search className="w-4 h-4" />;
      case 'trade_show': return <Building2 className="w-4 h-4" />;
      default: return <UserPlus className="w-4 h-4" />;
    }
  };

  const getProjectTypeIcon = (projectType: Lead['projectType']) => {
    switch (projectType) {
      case 'residential_remodel': return <Home className="w-4 h-4" />;
      case 'commercial_build': return <Building2 className="w-4 h-4" />;
      case 'addition': return <Plus className="w-4 h-4" />;
      case 'repair': return <Wrench className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal_sent': return 'bg-purple-100 text-purple-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'nurturing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.projectDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddLead = () => {
    const leadId = addLead({
      ...newLead,
      estimatedValue: newLead.estimatedBudget,
      assignedTo: 'user_001',
      assignedToName: 'John Smith'
    });
    
    setNewLead({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      projectType: 'residential_remodel',
      projectDescription: '',
      estimatedBudget: 0,
      timeline: 'within_3_months',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      status: 'new',
      priority: 'warm',
      preferredContactMethod: 'email',
      bestContactTime: '',
      tags: [],
      decisionMakers: []
    });
    setShowAddLeadModal(false);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleCallLead = (lead: Lead) => {
    window.open(`tel:${lead.phone}`, '_self');
  };

  const handleEmailLead = (lead: Lead) => {
    const subject = encodeURIComponent(`Regarding your ${lead.projectType.replace('_', ' ')} project`);
    const body = encodeURIComponent(`Hi ${lead.firstName},\n\nThank you for your interest in our construction services. I'd like to discuss your ${lead.projectType.replace('_', ' ')} project.\n\nBest regards,\n${lead.assignedToName || 'Your Construction Team'}`);
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_self');
  };

  const handleScheduleMeeting = (lead: Lead) => {
    const title = encodeURIComponent(`Meeting with ${lead.firstName} ${lead.lastName}`);
    const details = encodeURIComponent(`Project discussion: ${lead.projectDescription}`);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(10, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(11, 0, 0, 0);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${details}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const handleConvertToProject = (lead: Lead) => {
    const confirmed = window.confirm(`Convert ${lead.firstName} ${lead.lastName} to a project? This will create a new project and mark the lead as won.`);
    if (confirmed) {
      convertLeadToProject(lead.id);
      updateLead(lead.id, { status: 'won' });
      setShowLeadDetails(false);
      alert(`Lead successfully converted to project!`);
    }
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    updateLead(leadId, { status: newStatus });
    if (newStatus === 'won') {
      convertLeadToProject(leadId);
    }
  };

  const renderLeadCard = (lead: Lead) => (
    <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {getProjectTypeIcon(lead.projectType)}
              <CardTitle className="text-sm font-medium">
                {lead.firstName} {lead.lastName}
              </CardTitle>
              {lead.company && (
                <Badge variant="outline" className="text-xs">
                  {lead.company}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{lead.projectDescription}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={getPriorityColor(lead.priority)} variant="outline">
              {lead.priority}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
              <Star className="w-3 h-3 mr-1" />
              {lead.leadScore}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getSourceIcon(lead.source)}
            <span className="text-gray-600 capitalize">{lead.source.replace('_', ' ')}</span>
          </div>
          <span className="font-semibold text-green-600">{formatCurrency(lead.estimatedBudget)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-600">
            <Mail className="w-3 h-3 mr-2" />
            <span>{lead.email}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Phone className="w-3 h-3 mr-2" />
            <span>{lead.phone}</span>
          </div>
          {lead.city && (
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="w-3 h-3 mr-2" />
              <span>{lead.city}, {lead.state}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Timeline: {lead.timeline.replace('_', ' ')}</span>
          <span>{lead.conversionProbability}% likely</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Select
            value={lead.status}
            onValueChange={(newStatus) => handleUpdateLeadStatus(lead.id, newStatus as Lead['status'])}
          >
            <SelectTrigger className="h-8 text-xs flex-1 mr-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="nurturing">Nurturing</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleCallLead(lead);
              }}
              className="h-8 w-8 p-0"
              title="Call Lead"
            >
              <Phone className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleEmailLead(lead);
              }}
              className="h-8 w-8 p-0"
              title="Email Lead"
            >
              <Mail className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleViewLead(lead);
              }}
              className="h-8 w-8 p-0"
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Lead Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Active prospects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Ready for proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Lead to project rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground">
              Potential revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Value</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageLeadValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per lead potential
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="leads">All Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowAddLeadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Pipeline Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipeline.map((stage) => (
              <Card key={stage.stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stage.stage}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{stage.count}</span>
                    <span className="text-xs text-muted-foreground">{stage.conversionRate}%</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm font-medium text-green-600">
                    {formatCurrency(stage.value)}
                  </div>
                  <Progress value={stage.conversionRate} className="mt-2 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pipeline Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating'].map((status) => {
              const statusLeads = getLeadsByStatus(status as Lead['status']);
              return (
                <div key={status} className="space-y-3">
                  <h3 className="font-semibold text-sm capitalize border-b pb-2">
                    {status.replace('_', ' ')} ({statusLeads.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {statusLeads.map(lead => renderLeadCard(lead))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="nurturing">Nurturing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(lead => renderLeadCard(lead))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources Performance</CardTitle>
                <CardDescription>Where your best leads come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['website', 'referral', 'google_ads', 'social_media', 'trade_show'].map((source) => {
                    const sourceLeads = leads.filter(lead => lead.source === source);
                    const sourceValue = sourceLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
                    const maxValue = Math.max(...['website', 'referral', 'google_ads', 'social_media', 'trade_show']
                      .map(s => leads.filter(l => l.source === s).reduce((sum, lead) => sum + lead.estimatedValue, 0)));
                    
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{source.replace('_', ' ')}</span>
                          <span>{sourceLeads.length} leads • {formatCurrency(sourceValue)}</span>
                        </div>
                        <Progress value={(sourceValue / maxValue) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Lead progression through pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipeline.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{stage.stage}</span>
                          <span>{stage.count} leads</span>
                        </div>
                        <Progress value={stage.conversionRate} className="h-2 mt-1" />
                      </div>
                      <span className="text-sm text-green-600 font-medium">
                        {stage.conversionRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Add New Lead</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAddLeadModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newLead.firstName}
                      onChange={(e) => setNewLead({...newLead, firstName: e.target.value})}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newLead.lastName}
                      onChange={(e) => setNewLead({...newLead, lastName: e.target.value})}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                    placeholder="Company name (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Lead Source</Label>
                    <Select
                      value={newLead.source}
                      onValueChange={(value) => setNewLead({...newLead, source: value as Lead['source']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="google_ads">Google Ads</SelectItem>
                        <SelectItem value="trade_show">Trade Show</SelectItem>
                        <SelectItem value="homeadvisor">HomeAdvisor</SelectItem>
                        <SelectItem value="angies_list">Angie's List</SelectItem>
                        <SelectItem value="cold_call">Cold Call</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="projectType">Project Type</Label>
                    <Select
                      value={newLead.projectType}
                      onValueChange={(value) => setNewLead({...newLead, projectType: value as Lead['projectType']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential_remodel">Residential Remodel</SelectItem>
                        <SelectItem value="commercial_build">Commercial Build</SelectItem>
                        <SelectItem value="renovation">Renovation</SelectItem>
                        <SelectItem value="addition">Addition</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="custom_home">Custom Home</SelectItem>
                        <SelectItem value="multi_family">Multi-Family</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={newLead.projectDescription}
                    onChange={(e) => setNewLead({...newLead, projectDescription: e.target.value})}
                    placeholder="Describe the project in detail"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedBudget">Estimated Budget</Label>
                    <Input
                      id="estimatedBudget"
                      type="number"
                      value={newLead.estimatedBudget}
                      onChange={(e) => setNewLead({...newLead, estimatedBudget: parseInt(e.target.value) || 0})}
                      placeholder="Enter budget amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Select
                      value={newLead.timeline}
                      onValueChange={(value) => setNewLead({...newLead, timeline: value as Lead['timeline']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="within_1_month">Within 1 Month</SelectItem>
                        <SelectItem value="within_3_months">Within 3 Months</SelectItem>
                        <SelectItem value="within_6_months">Within 6 Months</SelectItem>
                        <SelectItem value="over_6_months">Over 6 Months</SelectItem>
                        <SelectItem value="planning_stage">Planning Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddLeadModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddLead}
                  disabled={!newLead.firstName || !newLead.lastName || !newLead.email || !newLead.phone}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(selectedLead.status)}>
                      {selectedLead.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(selectedLead.priority)} variant="outline">
                      {selectedLead.priority}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1" />
                      Score: {selectedLead.leadScore}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowLeadDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedLead.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedLead.phone}</span>
                      </div>
                      {selectedLead.company && (
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span>{selectedLead.company}</span>
                        </div>
                      )}
                      {selectedLead.address && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>
                            {selectedLead.address}, {selectedLead.city}, {selectedLead.state} {selectedLead.zipCode}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="font-medium">Type: </span>
                        <span className="capitalize">{selectedLead.projectType.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Budget: </span>
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(selectedLead.estimatedBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Timeline: </span>
                        <span className="capitalize">{selectedLead.timeline.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Description: </span>
                        <p className="text-gray-700 mt-1">{selectedLead.projectDescription}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lead Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Lead Score:</span>
                        <span className="font-semibold">{selectedLead.leadScore}/100</span>
                      </div>
                      <Progress value={selectedLead.leadScore} className="h-2" />
                      
                      <div className="flex justify-between">
                        <span>Conversion Probability:</span>
                        <span className="font-semibold">{selectedLead.conversionProbability}%</span>
                      </div>
                      <Progress value={selectedLead.conversionProbability} className="h-2" />
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Source:</span>
                          <span className="capitalize">{selectedLead.source.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Created:</span>
                          <span>{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                        </div>
                        {selectedLead.lastContactDate && (
                          <div className="flex justify-between text-sm">
                            <span>Last Contact:</span>
                            <span>{new Date(selectedLead.lastContactDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleCallLead(selectedLead)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Lead
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleEmailLead(selectedLead)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleScheduleMeeting(selectedLead)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button 
                        className="w-full"
                        onClick={() => handleConvertToProject(selectedLead)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Convert to Project
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;