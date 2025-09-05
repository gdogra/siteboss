import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CloudIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { aiService, RiskAssessment, WeatherImpact, CostEstimation } from '../../services/aiService';

interface AIInsightsDashboardProps {
  projectId: string;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ projectId }) => {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [weatherImpacts, setWeatherImpacts] = useState<WeatherImpact[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<CostEstimation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIInsights();
  }, [projectId]);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      
      // Load risk assessment
      const risk = await aiService.analyzeProjectRisk({ id: projectId });
      setRiskAssessment(risk);

      // Load weather impacts
      const weather = await aiService.analyzeWeatherImpact('New York, NY', {
        start: new Date(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      setWeatherImpacts(weather);

      // Load cost analysis
      const cost = await aiService.generateCostEstimate({
        type: 'commercial',
        location: 'New York, NY',
        squareFootage: 5000
      });
      setCostAnalysis(cost);

    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <LightBulbIcon className="h-8 w-8 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Insights Dashboard</h2>
          <p className="text-gray-600">Intelligent analysis and recommendations for your project</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {riskAssessment && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                    {riskAssessment.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {riskAssessment.overallScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {costAnalysis && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Cost Confidence</p>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    {(costAnalysis.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-600">
                    ${costAnalysis.totalEstimate.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Weather Impact</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {weatherImpacts.length > 0 ? Math.round(weatherImpacts[0].workabilityScore) : 'N/A'}
                </span>
                <span className="text-sm text-gray-600">workability</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">AI Recommendations</p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {riskAssessment?.recommendations.length || 0}
                </span>
                <span className="text-sm text-gray-600">active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      {riskAssessment && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-500" />
              Risk Assessment
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                <div className="space-y-3">
                  {riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        factor.impact > 7 ? 'bg-red-500' : 
                        factor.impact > 5 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {factor.category} Risk
                        </p>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                        {factor.mitigationStrategy && (
                          <p className="text-sm text-blue-600 mt-1">
                            <strong>Mitigation:</strong> {factor.mitigationStrategy}
                          </p>
                        )}
                        <div className="flex space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Impact: {factor.impact}/10
                          </span>
                          <span className="text-xs text-gray-500">
                            Probability: {(factor.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
                <div className="space-y-2">
                  {riskAssessment.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <LightBulbIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Impact */}
      {weatherImpacts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CloudIcon className="h-5 w-5 mr-2 text-blue-500" />
              Weather Impact Analysis
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherImpacts.slice(0, 3).map((impact, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {impact.date.toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      impact.workabilityScore >= 8 ? 'bg-green-100 text-green-800' :
                      impact.workabilityScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {impact.workabilityScore}/10
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>🌡️ {impact.temperature}°F</p>
                    <p>🌧️ {(impact.precipitation * 100).toFixed(0)}% chance</p>
                    <p>💨 {impact.windSpeed} mph</p>
                    <p className="capitalize">☀️ {impact.conditions}</p>
                  </div>
                  {impact.affectedTasks.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Affected Tasks:</p>
                      <div className="flex flex-wrap gap-1">
                        {impact.affectedTasks.map((task, taskIndex) => (
                          <span key={taskIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis */}
      {costAnalysis && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-500" />
              AI Cost Analysis
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Materials</span>
                    <span className="text-sm font-medium">
                      ${costAnalysis.materials.reduce((sum, m) => sum + m.totalCost, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Labor</span>
                    <span className="text-sm font-medium">
                      ${costAnalysis.labor.reduce((sum, l) => sum + l.totalCost, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overhead</span>
                    <span className="text-sm font-medium">${costAnalysis.overhead.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className="text-sm font-medium">${costAnalysis.profit.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total Estimate</span>
                      <span className="text-base font-bold text-gray-900">
                        ${costAnalysis.totalEstimate.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Materials</h4>
                <div className="space-y-3">
                  {costAnalysis.materials.slice(0, 3).map((material, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <WrenchScrewdriverIcon className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{material.item}</p>
                        <p className="text-xs text-gray-600">
                          {material.quantity} units @ ${material.unitCost} each
                        </p>
                        {material.availability && (
                          <div className="flex items-center mt-1">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              material.availability === 'in-stock' ? 'bg-green-500' :
                              material.availability === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-xs text-gray-500 capitalize">
                              {material.availability.replace('-', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">${material.totalCost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recommended Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🚨 Immediate (Today)</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Review permit status with city office</li>
              <li>• Schedule safety equipment inspection</li>
              <li>• Confirm material delivery schedules</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📅 This Week</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Implement weather contingency plans</li>
              <li>• Update project timeline based on risks</li>
              <li>• Conduct team safety briefing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;