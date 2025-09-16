import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  source: 'website' | 'referral' | 'social_media' | 'trade_show' | 'cold_call' | 'google_ads' | 'homeadvisor' | 'angies_list' | 'other';
  projectType: 'residential_remodel' | 'commercial_build' | 'renovation' | 'addition' | 'repair' | 'custom_home' | 'multi_family' | 'industrial';
  projectDescription: string;
  estimatedBudget: number;
  timeline: 'immediate' | 'within_1_month' | 'within_3_months' | 'within_6_months' | 'over_6_months' | 'planning_stage';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost' | 'nurturing';
  priority: 'hot' | 'warm' | 'cold';
  leadScore: number; // 0-100
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes: LeadNote[];
  activities: LeadActivity[];
  tags: string[];
  referralSource?: string;
  marketingCampaign?: string;
  estimatedValue: number;
  conversionProbability: number; // 0-100
  competitorInfo?: string;
  decisionMakers: string[];
  preferredContactMethod: 'email' | 'phone' | 'text' | 'in_person';
  bestContactTime: string;
}

export interface LeadNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  type: 'call' | 'email' | 'meeting' | 'site_visit' | 'general';
}

export interface LeadActivity {
  id: string;
  type: 'created' | 'called' | 'emailed' | 'met' | 'site_visit' | 'proposal_sent' | 'follow_up' | 'status_changed';
  description: string;
  createdAt: string;
  createdBy: string;
  metadata?: any;
}

export interface LeadPipeline {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

interface LeadsContextType {
  leads: Lead[];
  pipeline: LeadPipeline[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'leadScore' | 'conversionProbability' | 'notes' | 'activities'>) => string;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  addNote: (leadId: string, note: Omit<LeadNote, 'id' | 'createdAt'>) => void;
  addActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'createdAt'>) => void;
  getLeadsByStatus: (status: Lead['status']) => Lead[];
  getLeadsByAssignee: (assigneeId: string) => Lead[];
  searchLeads: (query: string) => Lead[];
  calculateLeadScore: (lead: Lead) => number;
  getLeadById: (leadId: string) => Lead | undefined;
  convertLeadToProject: (leadId: string) => void;
  bulkUpdateLeads: (leadIds: string[], updates: Partial<Lead>) => void;
  getLeadMetrics: () => {
    totalLeads: number;
    qualifiedLeads: number;
    conversionRate: number;
    averageLeadValue: number;
    totalPipelineValue: number;
  };
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

interface LeadsProviderProps {
  children: React.ReactNode;
}

export const LeadsProvider: React.FC<LeadsProviderProps> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: 'lead_001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        source: 'website',
        projectType: 'residential_remodel',
        projectDescription: 'Kitchen renovation with new cabinets, countertops, and flooring',
        estimatedBudget: 75000,
        timeline: 'within_3_months',
        address: '123 Main St',
        city: 'Springfield',
        state: 'CA',
        zipCode: '90210',
        status: 'qualified',
        priority: 'hot',
        leadScore: 85,
        assignedTo: 'user_001',
        assignedToName: 'John Smith',
        createdAt: '2024-11-15T10:30:00Z',
        lastContactDate: '2024-11-18T14:15:00Z',
        nextFollowUpDate: '2024-12-15T09:00:00Z',
        notes: [],
        activities: [],
        tags: ['kitchen', 'high-budget', 'referral'],
        estimatedValue: 75000,
        conversionProbability: 75,
        decisionMakers: ['Sarah Johnson', 'Mike Johnson'],
        preferredContactMethod: 'email',
        bestContactTime: 'evenings'
      },
      {
        id: 'lead_002',
        firstName: 'Robert',
        lastName: 'Chen',
        email: 'robert.chen@techcorp.com',
        phone: '(555) 987-6543',
        company: 'TechCorp Solutions',
        source: 'google_ads',
        projectType: 'commercial_build',
        projectDescription: 'New office building construction - 20,000 sq ft',
        estimatedBudget: 2500000,
        timeline: 'within_6_months',
        address: '456 Business Blvd',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        status: 'proposal_sent',
        priority: 'hot',
        leadScore: 92,
        assignedTo: 'user_001',
        assignedToName: 'John Smith',
        createdAt: '2024-11-10T08:45:00Z',
        lastContactDate: '2024-11-20T11:30:00Z',
        nextFollowUpDate: '2024-12-20T10:00:00Z',
        notes: [],
        activities: [],
        tags: ['commercial', 'large-project', 'tech-company'],
        estimatedValue: 2500000,
        conversionProbability: 65,
        decisionMakers: ['Robert Chen', 'Lisa Wang - CFO'],
        preferredContactMethod: 'email',
        bestContactTime: 'business hours'
      },
      {
        id: 'lead_003',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@gmail.com',
        phone: '(555) 246-8135',
        source: 'referral',
        projectType: 'addition',
        projectDescription: 'Two-story addition with master suite and office',
        estimatedBudget: 150000,
        timeline: 'within_1_month',
        address: '789 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90068',
        status: 'contacted',
        priority: 'warm',
        leadScore: 70,
        assignedTo: 'user_001',
        assignedToName: 'John Smith',
        createdAt: '2024-11-20T16:20:00Z',
        lastContactDate: '2024-11-21T09:15:00Z',
        nextFollowUpDate: '2024-12-05T14:00:00Z',
        notes: [],
        activities: [],
        tags: ['addition', 'referral', 'urgent'],
        referralSource: 'Previous client - Thompson family',
        estimatedValue: 150000,
        conversionProbability: 80,
        decisionMakers: ['Maria Rodriguez', 'Carlos Rodriguez'],
        preferredContactMethod: 'phone',
        bestContactTime: 'weekends'
      },
      {
        id: 'lead_004',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@startup.io',
        phone: '(555) 369-2580',
        company: 'StartupSpace Inc',
        source: 'trade_show',
        projectType: 'commercial_build',
        projectDescription: 'Modern office space renovation with open floor plan',
        estimatedBudget: 350000,
        timeline: 'planning_stage',
        address: '321 Innovation Drive',
        city: 'Palo Alto',
        state: 'CA',
        zipCode: '94301',
        status: 'nurturing',
        priority: 'cold',
        leadScore: 45,
        assignedTo: 'user_001',
        assignedToName: 'John Smith',
        createdAt: '2024-11-05T12:00:00Z',
        lastContactDate: '2024-11-08T15:45:00Z',
        nextFollowUpDate: '2025-01-15T10:00:00Z',
        notes: [],
        activities: [],
        tags: ['startup', 'long-term', 'modern-design'],
        estimatedValue: 350000,
        conversionProbability: 35,
        decisionMakers: ['David Kim', 'CFO TBD'],
        preferredContactMethod: 'email',
        bestContactTime: 'business hours'
      }
    ];

    setLeads(mockLeads);
  }, []);

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'leadScore' | 'conversionProbability' | 'notes' | 'activities'>) => {
    const leadId = `lead_${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id: leadId,
      createdAt: new Date().toISOString(),
      leadScore: calculateLeadScore({ ...leadData } as Lead),
      conversionProbability: calculateConversionProbability({ ...leadData } as Lead),
      notes: [],
      activities: [
        {
          id: `activity_${Date.now()}`,
          type: 'created',
          description: 'Lead created',
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        }
      ]
    };

    setLeads(prev => [...prev, newLead]);
    return leadId;
  };

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = { ...lead, ...updates };
        // Recalculate scores if relevant fields changed
        if (updates.estimatedBudget || updates.timeline || updates.projectType) {
          updatedLead.leadScore = calculateLeadScore(updatedLead);
          updatedLead.conversionProbability = calculateConversionProbability(updatedLead);
        }
        return updatedLead;
      }
      return lead;
    }));
  };

  const deleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  };

  const addNote = (leadId: string, noteData: Omit<LeadNote, 'id' | 'createdAt'>) => {
    const note: LeadNote = {
      ...noteData,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, notes: [...lead.notes, note] }
        : lead
    ));
  };

  const addActivity = (leadId: string, activityData: Omit<LeadActivity, 'id' | 'createdAt'>) => {
    const activity: LeadActivity = {
      ...activityData,
      id: `activity_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, activities: [...lead.activities, activity] }
        : lead
    ));
  };

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const getLeadsByAssignee = (assigneeId: string) => {
    return leads.filter(lead => lead.assignedTo === assigneeId);
  };

  const searchLeads = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return leads.filter(lead => 
      lead.firstName.toLowerCase().includes(lowerQuery) ||
      lead.lastName.toLowerCase().includes(lowerQuery) ||
      lead.email.toLowerCase().includes(lowerQuery) ||
      lead.phone.includes(query) ||
      lead.projectDescription.toLowerCase().includes(lowerQuery) ||
      lead.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const calculateLeadScore = (lead: Lead): number => {
    let score = 0;

    // Budget scoring (0-30 points)
    if (lead.estimatedBudget >= 1000000) score += 30;
    else if (lead.estimatedBudget >= 500000) score += 25;
    else if (lead.estimatedBudget >= 100000) score += 20;
    else if (lead.estimatedBudget >= 50000) score += 15;
    else if (lead.estimatedBudget >= 25000) score += 10;
    else score += 5;

    // Timeline scoring (0-25 points)
    switch (lead.timeline) {
      case 'immediate': score += 25; break;
      case 'within_1_month': score += 20; break;
      case 'within_3_months': score += 15; break;
      case 'within_6_months': score += 10; break;
      case 'over_6_months': score += 5; break;
      case 'planning_stage': score += 2; break;
    }

    // Source scoring (0-20 points)
    switch (lead.source) {
      case 'referral': score += 20; break;
      case 'website': score += 15; break;
      case 'google_ads': score += 12; break;
      case 'social_media': score += 10; break;
      case 'trade_show': score += 8; break;
      case 'homeadvisor': score += 6; break;
      case 'angies_list': score += 6; break;
      case 'cold_call': score += 3; break;
      case 'other': score += 5; break;
    }

    // Project type scoring (0-15 points)
    switch (lead.projectType) {
      case 'commercial_build': score += 15; break;
      case 'custom_home': score += 12; break;
      case 'multi_family': score += 12; break;
      case 'addition': score += 10; break;
      case 'residential_remodel': score += 8; break;
      case 'renovation': score += 8; break;
      case 'industrial': score += 15; break;
      case 'repair': score += 5; break;
    }

    // Contact completeness (0-10 points)
    if (lead.phone) score += 3;
    if (lead.email) score += 3;
    if (lead.address) score += 2;
    if (lead.company) score += 2;

    return Math.min(100, score);
  };

  const calculateConversionProbability = (lead: Lead): number => {
    let probability = lead.leadScore * 0.6; // Base on lead score

    // Adjust based on status
    switch (lead.status) {
      case 'qualified': probability += 15; break;
      case 'proposal_sent': probability += 10; break;
      case 'negotiating': probability += 20; break;
      case 'contacted': probability += 5; break;
      case 'nurturing': probability -= 10; break;
      case 'new': probability += 0; break;
    }

    // Adjust based on response time
    if (lead.lastContactDate) {
      const daysSinceContact = Math.floor((Date.now() - new Date(lead.lastContactDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceContact > 7) probability -= 5;
      if (daysSinceContact > 14) probability -= 10;
      if (daysSinceContact > 30) probability -= 20;
    }

    return Math.max(0, Math.min(100, probability));
  };

  const getLeadById = (leadId: string) => {
    return leads.find(lead => lead.id === leadId);
  };

  const convertLeadToProject = (leadId: string) => {
    updateLead(leadId, { status: 'won' });
    // In a real app, this would create a new project from the lead data
  };

  const bulkUpdateLeads = (leadIds: string[], updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      leadIds.includes(lead.id) ? { ...lead, ...updates } : lead
    ));
  };

  const getLeadMetrics = () => {
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(lead => 
      ['qualified', 'proposal_sent', 'negotiating', 'won'].includes(lead.status)
    ).length;
    const wonLeads = leads.filter(lead => lead.status === 'won').length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    const averageLeadValue = totalLeads > 0 
      ? leads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / totalLeads 
      : 0;
    const totalPipelineValue = leads
      .filter(lead => !['won', 'lost'].includes(lead.status))
      .reduce((sum, lead) => sum + lead.estimatedValue, 0);

    return {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      averageLeadValue,
      totalPipelineValue
    };
  };

  const pipeline: LeadPipeline[] = [
    {
      stage: 'New',
      count: getLeadsByStatus('new').length,
      value: getLeadsByStatus('new').reduce((sum, lead) => sum + lead.estimatedValue, 0),
      conversionRate: 25
    },
    {
      stage: 'Contacted',
      count: getLeadsByStatus('contacted').length,
      value: getLeadsByStatus('contacted').reduce((sum, lead) => sum + lead.estimatedValue, 0),
      conversionRate: 45
    },
    {
      stage: 'Qualified',
      count: getLeadsByStatus('qualified').length,
      value: getLeadsByStatus('qualified').reduce((sum, lead) => sum + lead.estimatedValue, 0),
      conversionRate: 65
    },
    {
      stage: 'Proposal Sent',
      count: getLeadsByStatus('proposal_sent').length,
      value: getLeadsByStatus('proposal_sent').reduce((sum, lead) => sum + lead.estimatedValue, 0),
      conversionRate: 75
    },
    {
      stage: 'Negotiating',
      count: getLeadsByStatus('negotiating').length,
      value: getLeadsByStatus('negotiating').reduce((sum, lead) => sum + lead.estimatedValue, 0),
      conversionRate: 85
    }
  ];

  const value: LeadsContextType = {
    leads,
    pipeline,
    addLead,
    updateLead,
    deleteLead,
    addNote,
    addActivity,
    getLeadsByStatus,
    getLeadsByAssignee,
    searchLeads,
    calculateLeadScore,
    getLeadById,
    convertLeadToProject,
    bulkUpdateLeads,
    getLeadMetrics
  };

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  );
};

export default LeadsContext;