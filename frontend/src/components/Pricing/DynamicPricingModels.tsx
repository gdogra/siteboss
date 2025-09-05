import React, { useState, useEffect } from 'react';
import { 
  CalculatorIcon,
  ChartBarIcon,
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  CalendarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  BanknotesIcon,
  ScaleIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  LightBulbIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface PricingModel {
  id: string;
  name: string;
  type: 'cost_plus' | 'fixed_price' | 'unit_price' | 'time_materials' | 'performance_based' | 'value_based';
  description: string;
  baseMarkup: number;
  riskAdjustment: number;
  marketAdjustment: number;
  complexityMultiplier: number;
  seasonalAdjustment: number;
  competitionFactor: number;
  profitMargin: number;
  isActive: boolean;
  lastUpdated: Date;
  projectsUsed: number;
  averageWinRate: number;
  averageMargin: number;
}

interface ProjectEstimate {
  id: string;
  projectName: string;
  client: string;
  projectType: string;
  scope: string;
  baseCost: number;
  laborHours: number;
  materialCosts: number;
  equipmentCosts: number;
  overheadCosts: number;
  riskFactors: RiskFactor[];
  marketConditions: MarketCondition[];
  competitorsCount: number;
  clientBudget: number;
  timeline: number; // days
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  location: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  relationshipValue: 'new' | 'existing' | 'strategic' | 'repeat';
}

interface RiskFactor {
  type: string;
  description: string;
  impact: number; // percentage
  probability: number; // 0-1
  mitigation: string;
}

interface MarketCondition {
  factor: string;
  impact: number; // percentage
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
}

interface PricingRecommendation {
  modelId: string;
  modelName: string;
  recommendedPrice: number;
  confidence: number;
  profitMargin: number;
  winProbability: number;
  competitivePosition: 'aggressive' | 'competitive' | 'premium';
  breakdown: PriceBreakdown;
  reasoning: string[];
  risks: string[];
  opportunities: string[];
}

interface PriceBreakdown {
  baseCost: number;
  markup: number;
  riskPremium: number;
  marketAdjustment: number;
  competitiveAdjustment: number;
  finalPrice: number;
}

interface PricingAnalytics {
  totalProposals: number;
  averageWinRate: number;
  averageProfitMargin: number;
  pricingAccuracy: number;
  modelPerformance: ModelPerformance[];
  marketTrends: MarketTrend[];
  competitiveIntelligence: CompetitiveData[];
}

interface ModelPerformance {
  modelId: string;
  modelName: string;
  proposalsCount: number;
  winRate: number;
  averageMargin: number;
  accuracy: number;
  revenueGenerated: number;
}

interface MarketTrend {
  category: string;
  trend: number; // percentage change
  period: string;
  impact: 'high' | 'medium' | 'low';
}

interface CompetitiveData {
  competitor: string;
  marketShare: number;
  averagePricing: 'low' | 'medium' | 'high';
  winRate: number;
  strengths: string[];
}

const DynamicPricingModels: React.FC = () => {
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [currentEstimate, setCurrentEstimate] = useState<ProjectEstimate | null>(null);
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
  
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModel, setSelectedModel] = useState<PricingModel | null>(null);
  const [showEstimateForm, setShowEstimateForm] = useState(false);

  useEffect(() => {
    // Generate mock data
    const mockModels: PricingModel[] = [
      {
        id: '1',
        name: 'Standard Cost-Plus Model',
        type: 'cost_plus',
        description: 'Traditional cost-plus pricing with market adjustments',
        baseMarkup: 25.0,
        riskAdjustment: 5.0,
        marketAdjustment: 3.0,
        complexityMultiplier: 1.2,
        seasonalAdjustment: 0.0,
        competitionFactor: -2.0,
        profitMargin: 18.5,
        isActive: true,
        lastUpdated: new Date('2024-02-15'),
        projectsUsed: 45,
        averageWinRate: 72,
        averageMargin: 19.2
      },
      {
        id: '2',
        name: 'Value-Based Premium Model',
        type: 'value_based',
        description: 'Value-based pricing for high-complexity projects',
        baseMarkup: 35.0,
        riskAdjustment: 8.0,
        marketAdjustment: 5.0,
        complexityMultiplier: 1.5,
        seasonalAdjustment: 2.0,
        competitionFactor: -1.0,
        profitMargin: 28.5,
        isActive: true,
        lastUpdated: new Date('2024-02-10'),
        projectsUsed: 23,
        averageWinRate: 58,
        averageMargin: 26.8
      },
      {
        id: '3',
        name: 'Competitive Bidding Model',
        type: 'fixed_price',
        description: 'Aggressive pricing for competitive markets',
        baseMarkup: 15.0,
        riskAdjustment: 3.0,
        marketAdjustment: 1.0,
        complexityMultiplier: 1.1,
        seasonalAdjustment: -1.0,
        competitionFactor: -5.0,
        profitMargin: 12.8,
        isActive: true,
        lastUpdated: new Date('2024-02-18'),
        projectsUsed: 67,
        averageWinRate: 85,
        averageMargin: 13.5
      }
    ];

    const mockEstimate: ProjectEstimate = {
      id: '1',
      projectName: 'Metro Plaza Office Complex',
      client: 'Metro Development Corp',
      projectType: 'Commercial Office',
      scope: '50,000 sq ft office complex with parking structure',
      baseCost: 2500000,
      laborHours: 12000,
      materialCosts: 1200000,
      equipmentCosts: 300000,
      overheadCosts: 250000,
      riskFactors: [
        {
          type: 'Weather Risk',
          description: 'Potential weather delays during winter months',
          impact: 8,
          probability: 0.6,
          mitigation: 'Weather protection and indoor scheduling'
        },
        {
          type: 'Material Price Volatility',
          description: 'Steel and concrete price fluctuations',
          impact: 12,
          probability: 0.8,
          mitigation: 'Fixed-price material contracts'
        }
      ],
      marketConditions: [
        {
          factor: 'Labor Shortage',
          impact: 15,
          trend: 'increasing',
          description: 'Skilled labor shortage driving up costs'
        },
        {
          factor: 'Material Inflation',
          impact: 10,
          trend: 'stable',
          description: 'Material costs stabilizing after recent increases'
        }
      ],
      competitorsCount: 4,
      clientBudget: 3200000,
      timeline: 180,
      complexity: 'high',
      location: 'Downtown Metro Area',
      season: 'winter',
      urgency: 'medium',
      relationshipValue: 'strategic'
    };

    const mockAnalytics: PricingAnalytics = {
      totalProposals: 135,
      averageWinRate: 68.5,
      averageProfitMargin: 19.8,
      pricingAccuracy: 87.2,
      modelPerformance: mockModels.map(model => ({
        modelId: model.id,
        modelName: model.name,
        proposalsCount: model.projectsUsed,
        winRate: model.averageWinRate,
        averageMargin: model.averageMargin,
        accuracy: 85 + Math.random() * 10,
        revenueGenerated: model.projectsUsed * 450000
      })),
      marketTrends: [
        { category: 'Labor Costs', trend: 8.5, period: 'YoY', impact: 'high' },
        { category: 'Material Costs', trend: 3.2, period: 'YoY', impact: 'medium' },
        { category: 'Competition', trend: -2.1, period: 'YoY', impact: 'medium' },
        { category: 'Demand', trend: 12.3, period: 'YoY', impact: 'high' }
      ],
      competitiveIntelligence: [
        {
          competitor: 'BuildCorp Solutions',
          marketShare: 23.5,
          averagePricing: 'medium',
          winRate: 71,
          strengths: ['Fast delivery', 'Cost efficiency']
        },
        {
          competitor: 'Premier Construction',
          marketShare: 18.2,
          averagePricing: 'high',
          winRate: 65,
          strengths: ['Quality reputation', 'Complex projects']
        }
      ]
    };

    setPricingModels(mockModels);
    setCurrentEstimate(mockEstimate);
    setAnalytics(mockAnalytics);

    // Generate pricing recommendations
    const mockRecommendations: PricingRecommendation[] = mockModels.map(model => {
      const baseCostWithOverhead = mockEstimate.baseCost + mockEstimate.overheadCosts;
      const markup = baseCostWithOverhead * (model.baseMarkup / 100);
      const riskPremium = baseCostWithOverhead * (model.riskAdjustment / 100);
      const marketAdj = baseCostWithOverhead * (model.marketAdjustment / 100);
      const compAdj = baseCostWithOverhead * (model.competitionFactor / 100);
      const finalPrice = baseCostWithOverhead + markup + riskPremium + marketAdj + compAdj;
      
      return {
        modelId: model.id,
        modelName: model.name,
        recommendedPrice: finalPrice,
        confidence: 75 + Math.random() * 20,
        profitMargin: ((finalPrice - mockEstimate.baseCost) / finalPrice) * 100,
        winProbability: model.averageWinRate / 100,
        competitivePosition: finalPrice > 3000000 ? 'premium' : finalPrice > 2800000 ? 'competitive' : 'aggressive',
        breakdown: {
          baseCost: baseCostWithOverhead,
          markup,
          riskPremium,
          marketAdjustment: marketAdj,
          competitiveAdjustment: compAdj,
          finalPrice
        },
        reasoning: [
          `Applied ${model.baseMarkup}% base markup for ${model.type.replace('_', ' ')} model`,
          `Added ${model.riskAdjustment}% risk premium for identified project risks`,
          `Market conditions adjustment: ${model.marketAdjustment}%`,
          `Competition factor: ${model.competitionFactor}%`
        ],
        risks: [
          'Weather delays could impact timeline and costs',
          'Material price volatility may affect profitability',
          'Strong competition may pressure pricing'
        ],
        opportunities: [
          'Strategic client relationship may support premium pricing',
          'High-profile project could enhance reputation',
          'Potential for change orders and scope expansion'
        ]
      };
    });

    setRecommendations(mockRecommendations);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cost_plus': return 'bg-blue-100 text-blue-800';
      case 'fixed_price': return 'bg-green-100 text-green-800';
      case 'unit_price': return 'bg-purple-100 text-purple-800';
      case 'time_materials': return 'bg-yellow-100 text-yellow-800';
      case 'performance_based': return 'bg-red-100 text-red-800';
      case 'value_based': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitivePositionColor = (position: string) => {
    switch (position) {
      case 'aggressive': return 'bg-red-100 text-red-800';
      case 'competitive': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const bestRecommendation = recommendations.reduce((best, current) => 
    (current.confidence * current.winProbability * current.profitMargin) > 
    (best.confidence * best.winProbability * best.profitMargin) ? current : best
  , recommendations[0]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing Models</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEstimateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <CalculatorIcon className="w-4 h-4 mr-2" />
            New Estimate
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Analysis
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Win Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.averageWinRate.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Profit Margin</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.averageProfitMargin.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pricing Accuracy</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.pricingAccuracy.toFixed(1)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Proposals</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics?.totalProposals}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Recommendation Highlight */}
      {bestRecommendation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <LightBulbIcon className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-blue-900">Recommended Pricing Strategy</h3>
              </div>
              <p className="text-blue-800">{bestRecommendation.modelName}</p>
              <div className="flex items-center space-x-4 text-sm text-blue-700">
                <span>Price: ${bestRecommendation.recommendedPrice.toLocaleString()}</span>
                <span>Margin: {bestRecommendation.profitMargin.toFixed(1)}%</span>
                <span>Win Probability: {(bestRecommendation.winProbability * 100).toFixed(0)}%</span>
                <span>Confidence: {bestRecommendation.confidence.toFixed(0)}%</span>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompetitivePositionColor(bestRecommendation.competitivePosition)}`}>
              {bestRecommendation.competitivePosition}
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['models', 'recommendations', 'analytics', 'market'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'models' ? 'Pricing Models' : 
               tab === 'recommendations' ? 'Recommendations' : 
               tab === 'analytics' ? 'Performance Analytics' : 'Market Intelligence'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pricingModels.map((model) => (
              <div key={model.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedModel(model)}>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{model.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(model.type)}`}>
                          {model.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${model.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{model.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Base Markup:</span>
                        <span className="ml-1">{model.baseMarkup}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Profit Margin:</span>
                        <span className="ml-1">{model.profitMargin}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Win Rate:</span>
                        <span className="ml-1">{model.averageWinRate}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Projects:</span>
                        <span className="ml-1">{model.projectsUsed}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Updated {model.lastUpdated.toLocaleDateString()}</span>
                        <span>Avg Margin: {model.averageMargin}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && currentEstimate && (
        <div className="space-y-6">
          {/* Project Summary */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Project Estimate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{currentEstimate.projectName}</h4>
                    <p className="text-gray-600">{currentEstimate.client}</p>
                    <p className="text-sm text-gray-500">{currentEstimate.scope}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Type: {currentEstimate.projectType}</div>
                    <div>Timeline: {currentEstimate.timeline} days</div>
                    <div>
                      <span>Complexity: </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(currentEstimate.complexity)}`}>
                        {currentEstimate.complexity}
                      </span>
                    </div>
                    <div>Competitors: {currentEstimate.competitorsCount}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Cost:</span>
                    <span className="font-medium">${currentEstimate.baseCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor (${currentEstimate.laborHours.toLocaleString()} hrs):</span>
                    <span className="font-medium">${((currentEstimate.baseCost * 0.6)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials:</span>
                    <span className="font-medium">${currentEstimate.materialCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment:</span>
                    <span className="font-medium">${currentEstimate.equipmentCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Client Budget:</span>
                    <span className="font-bold">${currentEstimate.clientBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Recommendations */}
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.modelId} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{rec.modelName}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompetitivePositionColor(rec.competitivePosition)}`}>
                          {rec.competitivePosition}
                        </span>
                        <span className="text-sm text-gray-500">Confidence: {rec.confidence.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${rec.recommendedPrice.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {rec.profitMargin.toFixed(1)}% margin • {(rec.winProbability * 100).toFixed(0)}% win rate
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Price Breakdown */}
                    <div>
                      <h5 className="font-medium mb-2">Price Breakdown</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Base Cost:</span>
                          <span>${rec.breakdown.baseCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Markup:</span>
                          <span>+${rec.breakdown.markup.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Premium:</span>
                          <span>+${rec.breakdown.riskPremium.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Adj:</span>
                          <span>{rec.breakdown.marketAdjustment >= 0 ? '+' : ''}${rec.breakdown.marketAdjustment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Competition:</span>
                          <span>{rec.breakdown.competitiveAdjustment >= 0 ? '+' : ''}${rec.breakdown.competitiveAdjustment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-medium">
                          <span>Final Price:</span>
                          <span>${rec.breakdown.finalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                      <h5 className="font-medium mb-2">Pricing Logic</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {rec.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risks & Opportunities */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium mb-1 text-red-700">Key Risks</h5>
                        <ul className="text-xs text-red-600 space-y-1">
                          {rec.risks.slice(0, 2).map((risk, idx) => (
                            <li key={idx}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1 text-green-700">Opportunities</h5>
                        <ul className="text-xs text-green-600 space-y-1">
                          {rec.opportunities.slice(0, 2).map((opp, idx) => (
                            <li key={idx}>• {opp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Performance */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Model Performance</h3>
              <div className="space-y-4">
                {analytics.modelPerformance.map((model) => (
                  <div key={model.modelId} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{model.modelName}</h4>
                      <span className="text-sm text-gray-500">{model.proposalsCount} proposals</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Win Rate:</span>
                        <span className="ml-1 font-medium">{model.winRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Margin:</span>
                        <span className="ml-1 font-medium">{model.averageMargin.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="ml-1 font-medium">{model.accuracy.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Revenue Generated:</span>
                      <span className="ml-1 font-bold text-green-600">${model.revenueGenerated.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Trends */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Market Trends</h3>
              <div className="space-y-3">
                {analytics.marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{trend.category}</div>
                      <div className="text-sm text-gray-500">{trend.period}</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center font-medium ${trend.trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {trend.trend >= 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(trend.trend).toFixed(1)}%
                      </div>
                      <div className={`text-xs ${trend.impact === 'high' ? 'text-red-500' : trend.impact === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {trend.impact} impact
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Win Rate & Margin Trends</h3>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">Chart showing model performance trends over time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'market' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competitive Intelligence */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Competitive Intelligence</h3>
              <div className="space-y-4">
                {analytics.competitiveIntelligence.map((competitor, index) => (
                  <div key={index} className="border border-gray-200 rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{competitor.competitor}</h4>
                      <div className="text-right">
                        <div className="text-sm font-medium">{competitor.marketShare.toFixed(1)}% market share</div>
                        <div className="text-xs text-gray-500">{competitor.winRate}% win rate</div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Pricing: </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        competitor.averagePricing === 'high' ? 'bg-red-100 text-red-800' :
                        competitor.averagePricing === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {competitor.averagePricing}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Key Strengths:</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.strengths.map((strength, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Positioning */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Market Positioning Analysis</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">Competitive Advantages</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Higher average profit margins than market</li>
                    <li>• Strong track record in complex projects</li>
                    <li>• Advanced pricing optimization tools</li>
                    <li>• Flexible delivery models</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                  <h5 className="font-medium text-yellow-800 mb-2">Market Opportunities</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Growing demand for sustainable construction</li>
                    <li>• Technology adoption in construction industry</li>
                    <li>• Labor shortage creating premium pricing opportunities</li>
                    <li>• Increased focus on project delivery speed</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded border border-red-200">
                  <h5 className="font-medium text-red-800 mb-2">Market Threats</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Increasing material costs reducing margins</li>
                    <li>• New competitors with aggressive pricing</li>
                    <li>• Economic uncertainty affecting project volume</li>
                    <li>• Client pressure for cost reductions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getTypeColor(selectedModel.type)}`}>
                    {selectedModel.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Model Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Markup:</span>
                        <span className="font-medium">{selectedModel.baseMarkup}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Adjustment:</span>
                        <span className="font-medium">{selectedModel.riskAdjustment}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Adjustment:</span>
                        <span className="font-medium">{selectedModel.marketAdjustment}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Complexity Multiplier:</span>
                        <span className="font-medium">{selectedModel.complexityMultiplier}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seasonal Adjustment:</span>
                        <span className="font-medium">{selectedModel.seasonalAdjustment}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Competition Factor:</span>
                        <span className="font-medium">{selectedModel.competitionFactor}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Projects Used:</span>
                        <span className="font-medium">{selectedModel.projectsUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Win Rate:</span>
                        <span className="font-medium">{selectedModel.averageWinRate}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Average Margin:</span>
                        <span className="font-medium">{selectedModel.averageMargin}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-medium">{selectedModel.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedModel.description}</p>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700">
                    Edit Model
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50">
                    Duplicate
                  </button>
                  <button 
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      selectedModel.isActive 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedModel.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPricingModels;