import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  StarIcon as StarIconOutline,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface PerformanceMetric {
  id: string;
  contractor_id: string;
  metric_type: 'quality' | 'timeliness' | 'safety' | 'communication' | 'budget';
  value: number;
  max_value: number;
  period: string;
  notes?: string;
  created_at: Date;
}

interface ContractorReview {
  id: string;
  contractor_id: string;
  project_id: string;
  project_name: string;
  reviewer_name: string;
  overall_rating: number;
  quality_rating: number;
  timeliness_rating: number;
  communication_rating: number;
  would_hire_again: boolean;
  comments: string;
  created_at: Date;
}

interface SafetyIncident {
  id: string;
  contractor_id: string;
  project_id: string;
  project_name: string;
  incident_type: 'minor' | 'major' | 'near_miss';
  severity: number;
  description: string;
  corrective_actions: string;
  reported_at: Date;
}

interface ContractorPerformanceProps {
  contractorId: string;
  contractorName: string;
}

const ContractorPerformance: React.FC<ContractorPerformanceProps> = ({ contractorId, contractorName }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [reviews, setReviews] = useState<ContractorReview[]>([]);
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '90d' | '1y' | 'all'>('90d');

  useEffect(() => {
    fetchPerformanceData();
  }, [contractorId, selectedPeriod]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Mock performance metrics
      const mockMetrics: PerformanceMetric[] = [
        {
          id: '1',
          contractor_id: contractorId,
          metric_type: 'quality',
          value: 4.7,
          max_value: 5.0,
          period: selectedPeriod,
          notes: 'Consistently high-quality work across all projects',
          created_at: new Date('2024-01-15')
        },
        {
          id: '2',
          contractor_id: contractorId,
          metric_type: 'timeliness',
          value: 92,
          max_value: 100,
          period: selectedPeriod,
          notes: '92% on-time completion rate',
          created_at: new Date('2024-01-15')
        },
        {
          id: '3',
          contractor_id: contractorId,
          metric_type: 'safety',
          value: 98,
          max_value: 100,
          period: selectedPeriod,
          notes: '2 minor incidents in the last 90 days',
          created_at: new Date('2024-01-15')
        },
        {
          id: '4',
          contractor_id: contractorId,
          metric_type: 'communication',
          value: 4.5,
          max_value: 5.0,
          period: selectedPeriod,
          notes: 'Good responsiveness and clear communication',
          created_at: new Date('2024-01-15')
        },
        {
          id: '5',
          contractor_id: contractorId,
          metric_type: 'budget',
          value: 95,
          max_value: 100,
          period: selectedPeriod,
          notes: 'Generally stays within budget with minimal overruns',
          created_at: new Date('2024-01-15')
        }
      ];

      // Mock reviews
      const mockReviews: ContractorReview[] = [
        {
          id: '1',
          contractor_id: contractorId,
          project_id: 'p1',
          project_name: 'Downtown Office Building',
          reviewer_name: 'John Smith',
          overall_rating: 5,
          quality_rating: 5,
          timeliness_rating: 4,
          communication_rating: 5,
          would_hire_again: true,
          comments: 'Excellent work quality and professionalism. Delivered on time and exceeded expectations.',
          created_at: new Date('2024-01-10')
        },
        {
          id: '2',
          contractor_id: contractorId,
          project_id: 'p2',
          project_name: 'Residential Complex',
          reviewer_name: 'Sarah Johnson',
          overall_rating: 4,
          quality_rating: 4,
          timeliness_rating: 5,
          communication_rating: 4,
          would_hire_again: true,
          comments: 'Good work overall. Completed ahead of schedule. Minor quality issues were quickly resolved.',
          created_at: new Date('2024-01-05')
        },
        {
          id: '3',
          contractor_id: contractorId,
          project_id: 'p3',
          project_name: 'Shopping Mall Renovation',
          reviewer_name: 'Mike Davis',
          overall_rating: 5,
          quality_rating: 5,
          timeliness_rating: 5,
          communication_rating: 4,
          would_hire_again: true,
          comments: 'Outstanding contractor. High-quality work, excellent attention to detail, and great communication.',
          created_at: new Date('2023-12-20')
        }
      ];

      // Mock safety incidents
      const mockIncidents: SafetyIncident[] = [
        {
          id: '1',
          contractor_id: contractorId,
          project_id: 'p1',
          project_name: 'Downtown Office Building',
          incident_type: 'minor',
          severity: 2,
          description: 'Worker slipped on wet surface, minor bruise sustained',
          corrective_actions: 'Added additional wet floor signage and improved cleanup procedures',
          reported_at: new Date('2024-01-08')
        },
        {
          id: '2',
          contractor_id: contractorId,
          project_id: 'p2',
          project_name: 'Residential Complex',
          incident_type: 'near_miss',
          severity: 1,
          description: 'Power tool nearly fell from scaffold, no injuries',
          corrective_actions: 'Implemented additional tool tethering requirements and safety training',
          reported_at: new Date('2023-12-15')
        }
      ];

      setPerformanceMetrics(mockMetrics);
      setReviews(mockReviews);
      setSafetyIncidents(mockIncidents);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'quality': return TrophyIcon;
      case 'timeliness': return ClockIcon;
      case 'safety': return ShieldCheckIcon;
      case 'communication': return DocumentTextIcon;
      case 'budget': return CurrencyDollarIcon;
      default: return ChartBarIcon;
    }
  };

  const getMetricColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getIncidentColor = (type: string) => {
    switch (type) {
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      case 'major': return 'text-red-600 bg-red-100';
      case 'near_miss': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Performance Dashboard - {contractorName}
        </h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => {
          const IconComponent = getMetricIcon(metric.metric_type);
          const colorClass = getMetricColor(metric.value, metric.max_value);
          const percentage = metric.metric_type === 'quality' || metric.metric_type === 'communication' 
            ? (metric.value / metric.max_value) * 100 
            : metric.value;

          return (
            <div key={metric.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {metric.metric_type}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.metric_type === 'quality' || metric.metric_type === 'communication'
                        ? metric.value.toFixed(1)
                        : `${metric.value}%`
                      }
                    </span>
                    {metric.metric_type === 'quality' || metric.metric_type === 'communication' ? (
                      <span className="text-sm text-gray-500">/ {metric.max_value}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              {metric.notes && (
                <p className="mt-3 text-sm text-gray-600">{metric.notes}</p>
              )}
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Project Reviews</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-l-4 border-blue-400 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{review.project_name}</h4>
                    <p className="text-sm text-gray-600">Reviewed by {review.reviewer_name}</p>
                  </div>
                  <div className="text-right">
                    {renderRating(review.overall_rating)}
                    <p className="text-sm text-gray-500 mt-1">
                      {review.created_at.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-600">Quality:</span> {renderRating(review.quality_rating)}
                  </div>
                  <div>
                    <span className="text-gray-600">Timeliness:</span> {renderRating(review.timeliness_rating)}
                  </div>
                  <div>
                    <span className="text-gray-600">Communication:</span> {renderRating(review.communication_rating)}
                  </div>
                  <div>
                    <span className="text-gray-600">Would hire again:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      review.would_hire_again 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {review.would_hire_again ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">"{review.comments}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Incidents */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Safety Record</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              safetyIncidents.length === 0 
                ? 'bg-green-100 text-green-800' 
                : safetyIncidents.length <= 2 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {safetyIncidents.length} incident(s) in {selectedPeriod}
            </span>
          </div>
        </div>
        <div className="p-6">
          {safetyIncidents.length === 0 ? (
            <div className="text-center py-6">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Safety Incidents</h3>
              <p className="mt-1 text-gray-500">Excellent safety record for the selected period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safetyIncidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getIncidentColor(incident.incident_type)}`}>
                          {incident.incident_type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-600">Severity: {incident.severity}/5</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mt-1">{incident.project_name}</h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      {incident.reported_at.toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{incident.description}</p>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">
                      <strong>Corrective Actions:</strong> {incident.corrective_actions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorPerformance;