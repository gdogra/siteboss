import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ChartBarIcon,
  CloudIcon,
  TruckIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { aiService, RiskAssessment, RiskFactor } from '../../services/aiService';

interface RiskAssessmentPanelProps {
  projectId: string;
  onRiskUpdate?: (assessment: RiskAssessment) => void;
}

const riskCategoryIcons = {
  weather: CloudIcon,
  supply: TruckIcon,
  permit: DocumentCheckIcon,
  financial: CurrencyDollarIcon,
  labor: UserGroupIcon,
  safety: ShieldExclamationIcon
};

const riskCategoryColors = {
  weather: 'bg-blue-100 text-blue-800',
  supply: 'bg-green-100 text-green-800',
  permit: 'bg-purple-100 text-purple-800',
  financial: 'bg-yellow-100 text-yellow-800',
  labor: 'bg-indigo-100 text-indigo-800',
  safety: 'bg-red-100 text-red-800'
};

const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({ 
  projectId, 
  onRiskUpdate 
}) => {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);

  useEffect(() => {
    loadRiskAssessment();
  }, [projectId]);

  const loadRiskAssessment = async () => {
    try {
      setLoading(true);
      const result = await aiService.analyzeProjectRisk({ id: projectId });
      setAssessment(result);
      onRiskUpdate?.(result);
    } catch (error) {
      console.error('Failed to load risk assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAssessment = async () => {
    try {
      setRefreshing(true);
      const result = await aiService.analyzeProjectRisk({ id: projectId });
      setAssessment(result);
      onRiskUpdate?.(result);
    } catch (error) {
      console.error('Failed to refresh risk assessment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactLevel = (impact: number) => {
    if (impact >= 8) return { label: 'Critical', color: 'text-red-600' };
    if (impact >= 6) return { label: 'High', color: 'text-orange-600' };
    if (impact >= 4) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-green-600' };
  };

  const getProbabilityLevel = (probability: number) => {
    if (probability >= 0.8) return { label: 'Very Likely', color: 'text-red-600' };
    if (probability >= 0.6) return { label: 'Likely', color: 'text-orange-600' };
    if (probability >= 0.4) return { label: 'Possible', color: 'text-yellow-600' };
    return { label: 'Unlikely', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Unable to load risk assessment</p>
        <button
          onClick={loadRiskAssessment}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-500" />
              Project Risk Assessment
            </h3>
            <button
              onClick={refreshAssessment}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-3 w-3 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overall Risk Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(assessment.riskLevel)}`}>
                {assessment.riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  assessment.overallScore > 7 ? 'bg-red-500' :
                  assessment.overallScore > 5 ? 'bg-orange-500' :
                  assessment.overallScore > 3 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(assessment.overallScore / 10) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Low Risk</span>
              <span className="font-medium">{assessment.overallScore.toFixed(1)}/10</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Risk Factors</h4>
              <div className="space-y-4">
                {assessment.factors.map((factor, index) => {
                  const IconComponent = riskCategoryIcons[factor.category];
                  const impact = getImpactLevel(factor.impact);
                  const probability = getProbabilityLevel(factor.probability);
                  
                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 cursor-pointer hover:border-primary-300 transition-colors"
                      onClick={() => setSelectedFactor(factor)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${riskCategoryColors[factor.category]}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium text-gray-900 capitalize">
                              {factor.category} Risk
                            </h5>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${impact.color}`}>
                                {impact.label}
                              </span>
                              <span className={`text-xs font-medium ${probability.color}`}>
                                {probability.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                          
                          {/* Risk Score Bars */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 w-16">Impact:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    factor.impact >= 8 ? 'bg-red-500' :
                                    factor.impact >= 6 ? 'bg-orange-500' :
                                    factor.impact >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${(factor.impact / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 w-8">{factor.impact}/10</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 w-16">Probability:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    factor.probability >= 0.8 ? 'bg-red-500' :
                                    factor.probability >= 0.6 ? 'bg-orange-500' :
                                    factor.probability >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${factor.probability * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 w-8">{Math.round(factor.probability * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">AI Recommendations</h4>
              <div className="space-y-3">
                {assessment.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>

              {/* Risk Trend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Risk Trend
                </h5>
                <div className="flex items-center space-x-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    Risk level has increased 15% since last assessment
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {assessment.updatedAt.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Risk Factor Details Modal */}
      {selectedFactor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {selectedFactor.category} Risk Details
              </h3>
              <button
                onClick={() => setSelectedFactor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedFactor.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Impact Level</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          selectedFactor.impact >= 8 ? 'bg-red-500' :
                          selectedFactor.impact >= 6 ? 'bg-orange-500' :
                          selectedFactor.impact >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(selectedFactor.impact / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{selectedFactor.impact}/10</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Probability</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          selectedFactor.probability >= 0.8 ? 'bg-red-500' :
                          selectedFactor.probability >= 0.6 ? 'bg-orange-500' :
                          selectedFactor.probability >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${selectedFactor.probability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(selectedFactor.probability * 100)}%</span>
                  </div>
                </div>
              </div>

              {selectedFactor.mitigationStrategy && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mitigation Strategy</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800">{selectedFactor.mitigationStrategy}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <button
                  onClick={() => setSelectedFactor(null)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentPanel;