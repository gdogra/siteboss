import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

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

const SalesPipeline: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    ];

    // Organize deals by stage
    const stagesWithDeals = mockStages.map(stage => ({
      ...stage,
      deals: mockDeals.filter(deal => deal.stage === stage.id)
    }));

    setTimeout(() => {
      setDeals(mockDeals);
      setStages(stagesWithDeals);
      setLoading(false);
    }, 1000);
  }, []);

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
      day: 'numeric'
    });
  };

  const getPipelineStats = () => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    const totalDeals = deals.length;
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

    return { totalValue, weightedValue, totalDeals, avgDealSize };
  };

  const getStageStats = (stageDeals: Deal[]) => {
    const count = stageDeals.length;
    const value = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
    return { count, value };
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    
    if (!draggedDeal) return;

    // Update deal stage
    const updatedDeals = deals.map(deal =>
      deal.id === draggedDeal.id ? { ...deal, stage: targetStageId } : deal
    );

    // Update stages with new deal distribution
    const updatedStages = stages.map(stage => ({
      ...stage,
      deals: updatedDeals.filter(deal => deal.stage === stage.id)
    }));

    setDeals(updatedDeals);
    setStages(updatedStages);
    setDraggedDeal(null);
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
          <div className="grid grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 h-96 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">Track deals through your sales process</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <PlusIcon className="h-5 w-5" />
          <span>Add Deal</span>
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
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
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Weighted Pipeline</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weightedValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Deals</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Deal Size</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgDealSize)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[600px]">
          {stages.map((stage) => {
            const stageStats = getStageStats(stage.deals);
            
            return (
              <div
                key={stage.id}
                className="bg-white rounded-lg p-4 shadow border"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <h3 className="font-medium text-gray-900">{stage.name}</h3>
                    </div>
                    <span className="text-sm text-gray-500">{stageStats.count}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(stageStats.value)}
                  </p>
                </div>

                {/* Deals */}
                <div className="space-y-3">
                  {stage.deals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      className="bg-gray-50 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{deal.customer}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {deal.probability}%
                          </span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(deal.expected_close_date)}
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {deal.assigned_to}
                        </div>

                        {/* Probability bar */}
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${stage.color}`}
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {stage.deals.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No deals in this stage</p>
                    </div>
                  )}
                </div>

                {/* Add Deal Button */}
                <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors">
                  <PlusIcon className="h-4 w-4 mx-auto" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Insights */}
      <div className="mt-6 bg-white rounded-lg p-6 shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Conversion Rate</h4>
            <p className="text-2xl font-bold text-blue-600">68%</p>
            <p className="text-sm text-blue-700">From lead to close</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Avg Sales Cycle</h4>
            <p className="text-2xl font-bold text-green-600">45 days</p>
            <p className="text-sm text-green-700">Time to close</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">Win Rate</h4>
            <p className="text-2xl font-bold text-purple-600">74%</p>
            <p className="text-sm text-purple-700">Qualified to close</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPipeline;