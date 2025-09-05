import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  UserPlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  StarIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import CreateLeadModal from './CreateLeadModal';
import LeadDetailModal from './LeadDetailModal';
import EmailModal from './EmailModal';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: number;
  value: number;
  expected_close_date: Date;
  assigned_to: string;
  created_at: Date;
  notes: string;
  last_activity?: Date;
}

interface LeadFilters {
  status: string;
  source: string;
  assigned_to: string;
  score_min: number;
}

const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LeadFilters>({
    status: 'all',
    source: 'all',
    assigned_to: 'all',
    score_min: 0
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [leadForEmail, setLeadForEmail] = useState<Lead | null>(null);

  // Mock data - in production, this would come from API
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        company: 'Johnson Construction',
        email: 'sarah@johnsonconstruction.com',
        phone: '(555) 123-4567',
        source: 'Website',
        status: 'new',
        score: 85,
        value: 45000,
        expected_close_date: new Date('2024-02-15'),
        assigned_to: 'John Smith',
        created_at: new Date('2024-01-10'),
        notes: 'Interested in kitchen renovation. High budget potential.',
        last_activity: new Date('2024-01-12')
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        company: 'Rodriguez Real Estate',
        email: 'mike@rodriguezre.com',
        phone: '(555) 234-5678',
        source: 'Referral',
        status: 'qualified',
        score: 92,
        value: 120000,
        expected_close_date: new Date('2024-03-01'),
        assigned_to: 'Sarah Wilson',
        created_at: new Date('2024-01-05'),
        notes: 'Multiple property renovation project. Very motivated buyer.',
        last_activity: new Date('2024-01-14')
      },
      {
        id: '3',
        name: 'Lisa Chen',
        company: 'Tech Startup Inc',
        email: 'lisa@techstartup.com',
        phone: '(555) 345-6789',
        source: 'Social Media',
        status: 'contacted',
        score: 67,
        value: 28000,
        expected_close_date: new Date('2024-02-28'),
        assigned_to: 'Mike Johnson',
        created_at: new Date('2024-01-08'),
        notes: 'Office renovation for growing startup. Budget conscious.',
        last_activity: new Date('2024-01-11')
      },
      {
        id: '4',
        name: 'David Thompson',
        company: 'Thompson Holdings',
        email: 'david@thompsonholdings.com',
        phone: '(555) 456-7890',
        source: 'Google Ads',
        status: 'proposal',
        score: 78,
        value: 85000,
        expected_close_date: new Date('2024-02-20'),
        assigned_to: 'John Smith',
        created_at: new Date('2024-01-01'),
        notes: 'Commercial space renovation. Reviewing our proposal.',
        last_activity: new Date('2024-01-13')
      }
    ];

    setTimeout(() => {
      setLeads(mockLeads);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = leads;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Apply source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    // Apply assigned to filter
    if (filters.assigned_to !== 'all') {
      filtered = filtered.filter(lead => lead.assigned_to === filters.assigned_to);
    }

    // Apply score filter
    if (filters.score_min > 0) {
      filtered = filtered.filter(lead => lead.score >= filters.score_min);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, filters]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderScoreStars = (score: number) => {
    const stars = Math.floor(score / 20); // Convert to 5-star scale
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          star <= stars ? (
            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLeadStats = () => {
    const total = leads.length;
    const new_leads = leads.filter(l => l.status === 'new').length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const total_value = leads.reduce((sum, lead) => sum + lead.value, 0);
    
    return { total, new_leads, qualified, total_value };
  };

  const stats = getLeadStats();

  // CRUD Operations
  const handleCreateLead = (leadData: Partial<Lead>) => {
    const newLead: Lead = {
      id: Date.now().toString(),
      created_at: new Date(),
      last_activity: new Date(),
      ...leadData as Omit<Lead, 'id' | 'created_at' | 'last_activity'>
    };
    
    setLeads(prev => [...prev, newLead]);
    setIsCreateModalOpen(false);
  };

  const handleEditLead = (leadData: Partial<Lead>) => {
    if (!editingLead) return;
    
    setLeads(prev => prev.map(lead => 
      lead.id === editingLead.id 
        ? { ...lead, ...leadData, last_activity: new Date() }
        : lead
    ));
    
    setEditingLead(null);
    setIsCreateModalOpen(false);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
        setIsDetailModalOpen(false);
      }
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setSelectedLead(null);
      setIsDetailModalOpen(false);
    } else {
      setEditingLead(null);
    }
    setIsCreateModalOpen(true);
  };

  const handleCallLead = (lead: Lead) => {
    // TODO: Integrate with communication system
    console.log('Calling lead:', lead.name);
  };

  const handleEmailLead = (lead: Lead) => {
    setLeadForEmail(lead);
    setShowEmailModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your sales opportunities</p>
        </div>
        <button
          onClick={() => handleEditClick()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Qualified</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">New This Week</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.new_leads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FunnelIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pipeline Value</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_value)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>

          {/* Source Filter */}
          <select
            value={filters.source}
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Google Ads">Google Ads</option>
          </select>

          {/* Assigned To Filter */}
          <select
            value={filters.assigned_to}
            onChange={(e) => setFilters(prev => ({ ...prev, assigned_to: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Team Members</option>
            <option value="John Smith">John Smith</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
            <option value="Mike Johnson">Mike Johnson</option>
          </select>

          {/* Score Filter */}
          <select
            value={filters.score_min}
            onChange={(e) => setFilters(prev => ({ ...prev, score_min: Number(e.target.value) }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="0">Any Score</option>
            <option value="80">High Score (80+)</option>
            <option value="60">Medium Score (60+)</option>
            <option value="40">Low Score (40+)</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.company}</div>
                      <div className="text-xs text-gray-400">{lead.source}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                      {renderScoreStars(lead.score)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(lead.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.expected_close_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.assigned_to}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleCallLead(lead)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="Call Lead"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEmailLead(lead)}
                        className="text-primary-600 hover:text-primary-900 p-1"
                        title="Email Lead"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleViewLead(lead)}
                        className="text-primary-600 hover:text-primary-900 px-2 py-1 text-xs border border-primary-200 rounded"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLeads.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filters.status !== 'all' ? 'Try adjusting your filters' : 'Get started by adding a new lead'}
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={editingLead ? handleEditLead : handleCreateLead}
        editLead={editingLead}
      />

      <LeadDetailModal
        lead={selectedLead}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLead(null);
        }}
        onEdit={() => handleEditClick(selectedLead!)}
        onDelete={() => {
          if (selectedLead) {
            handleDeleteLead(selectedLead.id);
          }
        }}
      />

      {/* Email Modal */}
      {showEmailModal && leadForEmail && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setLeadForEmail(null);
          }}
          contact={{
            id: leadForEmail.id,
            firstName: leadForEmail.name.split(' ')[0] || leadForEmail.name,
            lastName: leadForEmail.name.split(' ').slice(1).join(' ') || '',
            company: leadForEmail.company,
            title: 'Lead', // Default title for leads
            email: leadForEmail.email,
            phone: leadForEmail.phone,
            type: 'lead' as const
          }}
          onSend={(emailData) => {
            console.log('Sending email:', emailData);
            // TODO: Integrate with email service
            setShowEmailModal(false);
            setLeadForEmail(null);
          }}
        />
      )}
    </div>
  );
};

export default LeadManagement;