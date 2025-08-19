
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, AlertTriangle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LeadDrawer from './LeadDrawer';
import LeadForm from './LeadForm';

interface Lead {
  ID: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company: string;
  address: string;
  project_type: string;
  project_description: string;
  budget_min: number;
  budget_max: number;
  lead_source: string;
  status: string;
  owner_id: number;
  score: number;
  notes: string;
  next_action_at: string;
  converted_project_id: number;
  created_at: string;
  updated_at: string;
}

const PIPELINE_STAGES = [
{ key: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
{ key: 'QUALIFYING', label: 'Qualifying', color: 'bg-yellow-100 text-yellow-800' },
{ key: 'CONTACTED', label: 'Contacted', color: 'bg-purple-100 text-purple-800' },
{ key: 'ESTIMATE_SENT', label: 'Estimate Sent', color: 'bg-indigo-100 text-indigo-800' },
{ key: 'NEGOTIATING', label: 'Negotiating', color: 'bg-orange-100 text-orange-800' },
{ key: 'WON', label: 'Won', color: 'bg-green-100 text-green-800' },
{ key: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' }];


const LeadKanbanBoard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchLeads();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (error) throw error;
      setCurrentUser(data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(33726, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      // Filter leads based on user permissions
      let filteredLeads = data.List;
      if (currentUser?.Roles?.includes('Sales') && !currentUser?.Roles?.includes('Administrator')) {
        // Sales can see their own leads + read others
        filteredLeads = data.List; // For now, show all for read access
      } else if (currentUser?.Roles?.includes('r-QpoZrh')) {// Contractor
        filteredLeads = []; // Contractors have no access
      }

      setLeads(filteredLeads);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const lead = leads.find((l) => l.ID === leadId);
      if (!lead) return;

      // Calculate next action date
      const { data: nextActionAt } = await window.ezsite.apis.run({
        path: "calculateNextActionAt",
        param: [newStatus]
      });

      const updatedData = {
        ID: leadId,
        status: newStatus,
        next_action_at: nextActionAt,
        updated_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableUpdate(33726, updatedData);
      if (error) throw error;

      // Create activity log
      await window.ezsite.apis.tableCreate(33727, {
        lead_id: leadId,
        user_id: currentUser?.ID || 0,
        activity_type: 'STATUS_CHANGE',
        title: 'Status Changed',
        description: `Status changed from ${lead.status} to ${newStatus}`,
        old_value: lead.status,
        new_value: newStatus,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Lead status updated successfully"
      });

      fetchLeads();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(lead));
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadData = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (leadData.status !== status) {
      handleStatusChange(leadData.ID, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getSLAStatus = (lead: Lead) => {
    if (!lead.next_action_at || lead.status === 'WON' || lead.status === 'LOST') return null;

    const now = new Date();
    const nextAction = new Date(lead.next_action_at);
    const hoursUntilDue = (nextAction.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) return 'overdue';
    if (hoursUntilDue < 6) return 'critical';
    if (hoursUntilDue < 12) return 'warning';
    return 'good';
  };

  const getSLABadge = (slaStatus: string | null) => {
    if (!slaStatus) return null;

    const badges = {
      overdue: <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>,
      critical: <Badge variant="destructive" className="text-xs"><Clock className="w-3 h-3 mr-1" />Due Soon</Badge>,
      warning: <Badge variant="outline" className="text-xs text-orange-600"><Clock className="w-3 h-3 mr-1" />Due Today</Badge>,
      good: null
    };

    return badges[slaStatus];
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.project_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === 'all' || lead.lead_source === sourceFilter;
    const matchesOwner = ownerFilter === 'all' || lead.owner_id.toString() === ownerFilter;

    return matchesSearch && matchesSource && matchesOwner;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading leads...</div>;
  }

  // Check permissions
  if (currentUser?.Roles?.includes('r-QpoZrh')) {// Contractor
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view leads.</p>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lead Pipeline</h2>
        <Button onClick={() => setShowLeadForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10" />

        </div>
        
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="google_ads">Google Ads</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="cold_call">Cold Call</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-1" />
          More Filters
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 min-h-screen">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((lead) => lead.status === stage.key);
          const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.budget_max || 0), 0);

          return (
            <div
              key={stage.key}
              className="bg-gray-50 rounded-lg p-4"
              onDrop={(e) => handleDrop(e, stage.key)}
              onDragOver={handleDragOver}>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{stage.label}</h3>
                  <Badge variant="outline" className="text-xs">
                    {stageLeads.length}
                  </Badge>
                </div>
                {totalValue > 0 &&
                <p className="text-sm text-gray-500">
                    {formatCurrency(totalValue)}
                  </p>
                }
              </div>
              
              <div className="space-y-3">
                {stageLeads.map((lead) => {
                  const slaStatus = getSLAStatus(lead);
                  const slaDisplay = getSLABadge(slaStatus);

                  return (
                    <Card
                      key={lead.ID}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onClick={() => setSelectedLead(lead)}>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{lead.contact_name}</h4>
                            {lead.score > 0 &&
                            <Badge variant="outline" className="text-xs">
                                {lead.score}
                              </Badge>
                            }
                          </div>
                          
                          {lead.company &&
                          <p className="text-xs text-gray-500">{lead.company}</p>
                          }
                          
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {lead.project_type}
                          </p>
                          
                          {(lead.budget_min > 0 || lead.budget_max > 0) &&
                          <p className="text-xs font-medium text-green-600">
                              {lead.budget_min > 0 && lead.budget_max > 0 ?
                            `${formatCurrency(lead.budget_min)} - ${formatCurrency(lead.budget_max)}` :
                            formatCurrency(lead.budget_max || lead.budget_min)
                            }
                            </p>
                          }
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-gray-400">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                            {slaDisplay}
                          </div>
                        </div>
                      </CardContent>
                    </Card>);

                })}
              </div>
            </div>);

        })}
      </div>

      {/* Lead Drawer */}
      {selectedLead &&
      <LeadDrawer
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={fetchLeads}
        currentUser={currentUser} />

      }

      {/* New Lead Form */}
      {showLeadForm &&
      <LeadForm
        isOpen={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        onSuccess={fetchLeads}
        currentUser={currentUser} />

      }
    </div>);

};

export default LeadKanbanBoard;