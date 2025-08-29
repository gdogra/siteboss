import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import CreateDealModal from './CreateDealModal';
import DealCard from './DealCard';
import EmailModal from './EmailModal';
import SMSModal from './SMSModal';

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  probability: number;
  stage: string;
  expected_close_date: Date;
  assigned_to: string;
  created_at: Date;
  description: string;
  last_activity?: Date;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  deals: Deal[];
}

interface PipelineStats {
  totalValue: number;
  totalDeals: number;
  weightedValue: number;
  averageDealSize: number;
  conversionRate: number;
}

const SalesPipeline: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('discovery');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);

  // Mock data
  useEffect(() => {
    const mockDeals: Deal[] = [
      {
        id: '1',
        title: 'Johnson Kitchen Renovation',
        customer: 'Sarah Johnson',
        value: 45000,
        probability: 80,
        stage: 'proposal',
        expected_close_date: new Date('2024-02-15'),
        assigned_to: 'John Smith',
        created_at: new Date('2024-01-10'),
        description: 'Complete kitchen renovation including cabinets, countertops, and appliances.',
        last_activity: new Date('2024-01-12')
      },
      {
        id: '2',
        title: 'Rodriguez Property Portfolio',
        customer: 'Mike Rodriguez',
        value: 120000,
        probability: 90,
        stage: 'negotiation',
        expected_close_date: new Date('2024-03-01'),
        assigned_to: 'Sarah Wilson',
        created_at: new Date('2024-01-05'),
        description: 'Multiple property renovation project for real estate portfolio.',
        last_activity: new Date('2024-01-14')
      },
      {
        id: '3',
        title: 'Tech Startup Office',
        customer: 'Lisa Chen',
        value: 28000,
        probability: 60,
        stage: 'qualified',
        expected_close_date: new Date('2024-02-28'),
        assigned_to: 'Mike Johnson',
        created_at: new Date('2024-01-08'),
        description: 'Office renovation for growing startup company.',
        last_activity: new Date('2024-01-11')
      },
      {
        id: '4',
        title: 'Thompson Commercial Space',
        customer: 'David Thompson',
        value: 85000,
        probability: 70,
        stage: 'proposal',
        expected_close_date: new Date('2024-02-20'),
        assigned_to: 'John Smith',
        created_at: new Date('2024-01-01'),
        description: 'Commercial space renovation for Thompson Holdings.',
        last_activity: new Date('2024-01-13')
      },
      {
        id: '5',
        title: 'Wilson Bathroom Remodel',
        customer: 'Amanda Wilson',
        value: 18000,
        probability: 50,
        stage: 'discovery',
        expected_close_date: new Date('2024-03-10'),
        assigned_to: 'Sarah Wilson',
        created_at: new Date('2024-01-12'),
        description: 'Master bathroom remodel with luxury fixtures.',
        last_activity: new Date('2024-01-14')
      },
      {
        id: '6',
        title: 'Green Energy Office Build',
        customer: 'EcoTech Solutions',
        value: 95000,
        probability: 85,
        stage: 'closed-won',
        expected_close_date: new Date('2024-01-30'),
        assigned_to: 'Mike Johnson',
        created_at: new Date('2023-12-15'),
        description: 'Sustainable office building with solar panels and energy-efficient systems.',
        last_activity: new Date('2024-01-15')
      }
    ];

    const mockStages: Stage[] = [
      {
        id: 'lead',
        name: 'Lead',
        color: 'bg-gray-500',
        order: 1,
        deals: []
      },
      {
        id: 'discovery',
        name: 'Discovery',
        color: 'bg-blue-500',
        order: 2,
        deals: []
      },
      {
        id: 'qualified',
        name: 'Qualified',
        color: 'bg-yellow-500',
        order: 3,
        deals: []
      },
      {
        id: 'proposal',
        name: 'Proposal',
        color: 'bg-orange-500',
        order: 4,
        deals: []
      },
      {
        id: 'negotiation',
        name: 'Negotiation',
        color: 'bg-purple-500',
        order: 5,
        deals: []
      },
      {
        id: 'closed-won',
        name: 'Closed Won',
        color: 'bg-green-500',
        order: 6,
        deals: []
      },
      {
        id: 'closed-lost',
        name: 'Closed Lost',
        color: 'bg-red-500',
        order: 7,
        deals: []
      }
    ];

    // Organize deals by stage
    const organizedStages = mockStages.map(stage => ({
      ...stage,
      deals: mockDeals.filter(deal => deal.stage === stage.id)
    }));

    setTimeout(() => {
      setDeals(mockDeals);
      setStages(organizedStages);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter deals
  useEffect(() => {
    let filtered = deals;

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(deal => deal.assigned_to === selectedAssignee);
    }

    setFilteredDeals(filtered);

    // Update stages with filtered deals
    const updatedStages = stages.map(stage => ({
      ...stage,
      deals: filtered.filter(deal => deal.stage === stage.id)
    }));
    
    if (stages.length > 0) {
      setStages(updatedStages);
    }
  }, [deals, searchTerm, selectedAssignee]);

  // Pipeline Statistics
  const getPipelineStats = (): PipelineStats => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const totalDeals = deals.length;
    const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const wonDeals = deals.filter(deal => deal.stage === 'closed-won').length;
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    return {
      totalValue,
      totalDeals,
      weightedValue,
      averageDealSize,
      conversionRate
    };
  };

  // CRUD Operations
  const handleCreateDeal = (dealData: Partial<Deal>) => {
    const newDeal: Deal = {
      id: Date.now().toString(),
      created_at: new Date(),
      last_activity: new Date(),
      ...dealData as Omit<Deal, 'id' | 'created_at' | 'last_activity'>
    };
    
    setDeals(prev => [...prev, newDeal]);
    setIsCreateModalOpen(false);
  };

  const handleEditDeal = (dealData: Partial<Deal>) => {
    if (!editingDeal) return;
    
    setDeals(prev => prev.map(deal => 
      deal.id === editingDeal.id 
        ? { ...deal, ...dealData, last_activity: new Date() }
        : deal
    ));
    
    setEditingDeal(null);
    setIsCreateModalOpen(false);
  };

  const handleDeleteDeal = (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
    }
  };

  const handleViewDeal = (deal: Deal) => {
    // TODO: Open deal detail modal or navigate to deal page
    console.log('Viewing deal:', deal.title);
  };

  const handleEmailDeal = (deal: Deal) => {
    setCurrentDeal(deal);
    setIsEmailModalOpen(true);
  };

  const handleSMSDeal = (deal: Deal) => {
    setCurrentDeal(deal);
    setIsSMSModalOpen(true);
  };

  const handleEmailSend = (emailData: any) => {
    // In a real app, this would send the email via API
    console.log('Sending email:', emailData);
    alert(`Email sent successfully to ${emailData.to.join(', ')}`);
    
    // Update deal's last activity
    if (currentDeal) {
      setDeals(prev => prev.map(d => 
        d.id === currentDeal.id 
          ? { ...d, last_activity: new Date() }
          : d
      ));
    }
  };

  const handleSMSSend = (smsData: any) => {
    // In a real app, this would send the SMS via API
    console.log('Sending SMS:', smsData);
    alert(`SMS sent successfully to ${smsData.to.join(', ')}`);
    
    // Update deal's last activity
    if (currentDeal) {
      setDeals(prev => prev.map(d => 
        d.id === currentDeal.id 
          ? { ...d, last_activity: new Date() }
          : d
      ));
    }
  };

  const handleEditClick = (deal?: Deal, stage?: string) => {
    if (deal) {
      setEditingDeal(deal);
    } else {
      setEditingDeal(null);
      setSelectedStage(stage || 'discovery');
    }
    setIsCreateModalOpen(true);
  };

  // Drag and Drop
  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    
    const dealId = e.dataTransfer.getData('text/plain');
    const deal = deals.find(d => d.id === dealId);
    
    if (deal && deal.stage !== stageId) {
      setDeals(prev => prev.map(d => 
        d.id === dealId 
          ? { ...d, stage: stageId, last_activity: new Date() }
          : d
      ));
    }
    
    setDraggedDeal(null);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = getPipelineStats();

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
          <div className="grid grid-cols-7 gap-4 h-96">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">Track and manage your deals through the sales process</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg ${viewMode === 'compact' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => handleEditClick()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FunnelIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Pipeline</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Weighted Value</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weightedValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Deals</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Deal Size</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageDealSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow border mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Team Members</option>
            <option value="John Smith">John Smith</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
            <option value="Mike Johnson">Mike Johnson</option>
            <option value="Emily Davis">Emily Davis</option>
          </select>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-7 gap-4 h-full overflow-hidden">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="bg-gray-50 rounded-lg overflow-hidden flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className={`${stage.color} text-white p-4 flex items-center justify-between`}>
              <div>
                <h3 className="font-semibold text-sm">{stage.name}</h3>
                <p className="text-xs opacity-90">{stage.deals.length} deals</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">
                  {formatCurrency(stage.deals.reduce((sum, deal) => sum + deal.value, 0))}
                </p>
                <button
                  onClick={() => handleEditClick(undefined, stage.id)}
                  className="mt-1 p-1 hover:bg-white hover:bg-opacity-20 rounded"
                  title="Add Deal"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Deals */}
            <div className="flex-1 p-2 space-y-3 overflow-y-auto">
              {stage.deals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onEdit={() => handleEditClick(deal)}
                  onDelete={() => handleDeleteDeal(deal.id)}
                  onView={() => handleViewDeal(deal)}
                  onEmail={handleEmailDeal}
                  onSMS={handleSMSDeal}
                  isDragging={draggedDeal?.id === deal.id}
                />
              ))}
              
              {stage.deals.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <FunnelIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No deals in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Deal Modal */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingDeal(null);
        }}
        onSubmit={editingDeal ? handleEditDeal : handleCreateDeal}
        editDeal={editingDeal}
        initialStage={selectedStage}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setCurrentDeal(null);
        }}
        deal={currentDeal || undefined}
        contact={undefined}
        onSend={handleEmailSend}
      />

      {/* SMS Modal */}
      <SMSModal
        isOpen={isSMSModalOpen}
        onClose={() => {
          setIsSMSModalOpen(false);
          setCurrentDeal(null);
        }}
        deal={currentDeal || undefined}
        contact={undefined}
        onSend={handleSMSSend}
      />
    </div>
  );
};

export default SalesPipeline;