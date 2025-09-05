import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  CameraIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { aiService, SafetyViolation } from '../../services/aiService';

interface SafetyInspection {
  id: string;
  inspectorId: string;
  inspectorName: string;
  date: Date;
  area: string;
  type: 'routine' | 'spot-check' | 'incident' | 'compliance';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  violations: SafetyViolation[];
  photos: string[];
  notes: string;
  score: number;
  nextInspectionDue?: Date;
}

interface SafetyMetrics {
  totalInspections: number;
  passRate: number;
  criticalViolations: number;
  averageScore: number;
  trendsImproving: boolean;
  daysWithoutIncident: number;
}

interface SafetyRequirement {
  id: string;
  category: string;
  requirement: string;
  regulation: string;
  mandatory: boolean;
  frequency: string;
  lastChecked?: Date;
  status: 'compliant' | 'non-compliant' | 'needs-attention';
  evidence?: string[];
}

interface SafetyAlert {
  id: string;
  type: 'violation' | 'inspection-due' | 'training-required' | 'equipment-check';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  createdAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

const SafetyComplianceMonitor: React.FC = () => {
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [requirements, setRequirements] = useState<SafetyRequirement[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'inspections' | 'requirements' | 'alerts'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState<SafetyInspection | null>(null);

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading safety data
      const [inspectionsData, metricsData, requirementsData, alertsData] = await Promise.all([
        loadInspections(),
        loadMetrics(),
        loadRequirements(),
        loadAlerts()
      ]);
      
      setInspections(inspectionsData);
      setMetrics(metricsData);
      setRequirements(requirementsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInspections = async (): Promise<SafetyInspection[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            inspectorId: 'inspector-1',
            inspectorName: 'Mike Safety',
            date: new Date(),
            area: 'Construction Site - Zone A',
            type: 'routine',
            status: 'completed',
            violations: [
              {
                type: 'PPE Compliance',
                severity: 'warning',
                description: 'Worker without hard hat in active construction zone',
                regulation: 'OSHA 29 CFR 1926.95',
                requiredAction: 'Immediate PPE compliance required'
              }
            ],
            photos: ['/api/photos/inspection-1-1.jpg', '/api/photos/inspection-1-2.jpg'],
            notes: 'Overall good compliance, minor PPE issue addressed immediately',
            score: 85,
            nextInspectionDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            inspectorId: 'inspector-2',
            inspectorName: 'Sarah Compliance',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            area: 'Equipment Storage',
            type: 'spot-check',
            status: 'completed',
            violations: [],
            photos: ['/api/photos/inspection-2-1.jpg'],
            notes: 'Excellent safety standards maintained',
            score: 98
          },
          {
            id: '3',
            inspectorId: 'inspector-1',
            inspectorName: 'Mike Safety',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            area: 'Electrical Work Area',
            type: 'compliance',
            status: 'pending',
            violations: [],
            photos: [],
            notes: '',
            score: 0,
            nextInspectionDue: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        ]);
      }, 800);
    });
  };

  const loadMetrics = async (): Promise<SafetyMetrics> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalInspections: 45,
          passRate: 92.3,
          criticalViolations: 2,
          averageScore: 89.5,
          trendsImproving: true,
          daysWithoutIncident: 127
        });
      }, 600);
    });
  };

  const loadRequirements = async (): Promise<SafetyRequirement[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            category: 'Personal Protective Equipment',
            requirement: 'All workers must wear hard hats in construction zones',
            regulation: 'OSHA 29 CFR 1926.95',
            mandatory: true,
            frequency: 'Daily verification',
            lastChecked: new Date(),
            status: 'compliant',
            evidence: ['daily-ppe-checklist.pdf', 'training-records.pdf']
          },
          {
            id: '2',
            category: 'Fall Protection',
            requirement: 'Guardrails required on elevated platforms over 6 feet',
            regulation: 'OSHA 29 CFR 1926.501',
            mandatory: true,
            frequency: 'Weekly inspection',
            lastChecked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'needs-attention',
            evidence: ['fall-protection-inspect.pdf']
          },
          {
            id: '3',
            category: 'Electrical Safety',
            requirement: 'GFCI protection for all temporary electrical installations',
            regulation: 'OSHA 29 CFR 1926.416',
            mandatory: true,
            frequency: 'Monthly testing',
            lastChecked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: 'non-compliant'
          },
          {
            id: '4',
            category: 'Emergency Procedures',
            requirement: 'Emergency evacuation plan posted and reviewed',
            regulation: 'OSHA 29 CFR 1926.95',
            mandatory: true,
            frequency: 'Quarterly review',
            lastChecked: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            status: 'compliant',
            evidence: ['evacuation-drill-report.pdf']
          }
        ]);
      }, 500);
    });
  };

  const loadAlerts = async (): Promise<SafetyAlert[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'violation',
            severity: 'high',
            title: 'Critical PPE Violation',
            description: 'Multiple workers observed without proper fall protection equipment',
            location: 'Building A - 3rd Floor',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            assignedTo: 'Site Supervisor'
          },
          {
            id: '2',
            type: 'inspection-due',
            severity: 'medium',
            title: 'Monthly Safety Inspection Due',
            description: 'Electrical systems safety inspection is overdue',
            location: 'Electrical Panel Room',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            assignedTo: 'Mike Safety'
          },
          {
            id: '3',
            type: 'training-required',
            severity: 'medium',
            title: 'Safety Training Required',
            description: '5 new workers need safety orientation',
            location: 'Training Room',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            assignedTo: 'HR Department'
          }
        ]);
      }, 400);
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'completed': return 'bg-green-100 text-green-800';
      case 'needs-attention': case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'needs-attention': case 'in-progress':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'non-compliant': case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Safety Compliance Monitor</h2>
            <p className="text-gray-600">AI-powered safety monitoring and compliance management</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <CameraIcon className="h-4 w-4 mr-2" />
            Photo Inspection
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
            New Inspection
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.passRate.toFixed(1)}%</p>
                {metrics.trendsImproving && (
                  <p className="text-sm text-green-600">↗ Improving</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Critical Violations</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.criticalViolations}</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Days w/o Incident</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.daysWithoutIncident}</p>
                <p className="text-sm text-green-600">Safety record</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Inspection avg</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
              { id: 'inspections', name: 'Inspections', icon: ClipboardDocumentCheckIcon },
              { id: 'requirements', name: 'Requirements', icon: DocumentTextIcon },
              { id: 'alerts', name: 'Alerts', icon: BellIcon, count: alerts.filter(a => !a.resolvedAt).length }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`${
                    selectedView === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count && tab.count > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard View */}
          {selectedView === 'dashboard' && (
            <div className="space-y-6">
              {/* Recent Violations */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Safety Issues</h3>
                <div className="space-y-3">
                  {inspections
                    .filter(i => i.violations.length > 0)
                    .slice(0, 3)
                    .map((inspection) => (
                      <div key={inspection.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPinIcon className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">{inspection.area}</span>
                              <span className="text-sm text-gray-500">
                                {inspection.date.toLocaleDateString()}
                              </span>
                            </div>
                            {inspection.violations.map((violation, index) => (
                              <div key={index} className="flex items-start space-x-2 mb-2">
                                <ExclamationTriangleIcon className={`h-4 w-4 mt-0.5 ${
                                  violation.severity === 'critical' ? 'text-red-500' :
                                  violation.severity === 'violation' ? 'text-orange-500' :
                                  'text-yellow-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{violation.type}</p>
                                  <p className="text-sm text-gray-600">{violation.description}</p>
                                  <p className="text-xs text-blue-600 mt-1">{violation.regulation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                            inspection.violations[0]?.severity || 'low'
                          )}`}>
                            {inspection.violations[0]?.severity || 'resolved'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Compliance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
                  <div className="space-y-3">
                    {requirements.slice(0, 4).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(req.status)}
                          <div>
                            <p className="font-medium text-gray-900">{req.category}</p>
                            <p className="text-sm text-gray-600">{req.frequency}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Inspections</h3>
                  <div className="space-y-3">
                    {inspections
                      .filter(i => i.status === 'pending')
                      .map((inspection) => (
                        <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-gray-900">{inspection.area}</p>
                              <p className="text-sm text-gray-600 capitalize">{inspection.type} inspection</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {inspection.nextInspectionDue?.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">{inspection.inspectorName}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inspections View */}
          {selectedView === 'inspections' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Safety Inspections</h3>
                <div className="flex space-x-2">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Types</option>
                    <option>Routine</option>
                    <option>Spot Check</option>
                    <option>Compliance</option>
                    <option>Incident</option>
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedInspection(inspection)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{inspection.area}</h4>
                        <p className="text-sm text-gray-600 capitalize">{inspection.type} inspection</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Inspector:</span>
                        <span className="font-medium">{inspection.inspectorName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{inspection.date.toLocaleDateString()}</span>
                      </div>
                      {inspection.score > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Score:</span>
                          <span className={`font-medium ${
                            inspection.score >= 90 ? 'text-green-600' :
                            inspection.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {inspection.score}/100
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Violations:</span>
                        <span className={`font-medium ${
                          inspection.violations.length === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {inspection.violations.length}
                        </span>
                      </div>
                    </div>

                    {inspection.violations.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-1 text-xs text-red-600">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          <span>
                            {inspection.violations.filter(v => v.severity === 'critical').length} critical,{' '}
                            {inspection.violations.filter(v => v.severity === 'violation').length} violations
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements View */}
          {selectedView === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Safety Requirements</h3>
              
              <div className="space-y-4">
                {requirements.map((requirement) => (
                  <div key={requirement.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(requirement.status)}
                          <h4 className="font-medium text-gray-900">{requirement.category}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(requirement.status)}`}>
                            {requirement.status.replace('-', ' ')}
                          </span>
                          {requirement.mandatory && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{requirement.requirement}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>📋 {requirement.regulation}</span>
                          <span>🔄 {requirement.frequency}</span>
                          {requirement.lastChecked && (
                            <span>✅ Last: {requirement.lastChecked.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {requirement.evidence && requirement.evidence.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Evidence & Documentation</h5>
                        <div className="flex flex-wrap gap-2">
                          {requirement.evidence.map((doc, index) => (
                            <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                              <DocumentTextIcon className="h-3 w-3 text-gray-500" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts View */}
          {selectedView === 'alerts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Safety Alerts</h3>
              
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`border-l-4 rounded-r-lg p-4 ${
                    alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {alert.type === 'violation' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
                          {alert.type === 'inspection-due' && <ClipboardDocumentCheckIcon className="h-5 w-5 text-yellow-500" />}
                          {alert.type === 'training-required' && <UserGroupIcon className="h-5 w-5 text-blue-500" />}
                          {alert.type === 'equipment-check' && <WrenchScrewdriverIcon className="h-5 w-5 text-purple-500" />}
                          
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{alert.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {alert.location}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {alert.createdAt.toLocaleString()}
                          </span>
                          {alert.assignedTo && (
                            <span className="flex items-center">
                              <UserGroupIcon className="h-3 w-3 mr-1" />
                              {alert.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                          Resolve
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Safety Inspection Details - {selectedInspection.area}
              </h3>
              <button
                onClick={() => setSelectedInspection(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Inspection Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Inspection Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inspector:</span>
                      <span className="font-medium">{selectedInspection.inspectorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{selectedInspection.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedInspection.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedInspection.status)}`}>
                        {selectedInspection.status.replace('-', ' ')}
                      </span>
                    </div>
                    {selectedInspection.score > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score:</span>
                        <span className="font-medium">{selectedInspection.score}/100</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location & Notes</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Area:</strong> {selectedInspection.area}</p>
                    {selectedInspection.notes && (
                      <div>
                        <strong>Notes:</strong>
                        <p className="mt-1 text-gray-700">{selectedInspection.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Violations */}
              {selectedInspection.violations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Safety Violations</h4>
                  <div className="space-y-3">
                    {selectedInspection.violations.map((violation, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{violation.type}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                            {violation.severity}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{violation.description}</p>
                        <p className="text-sm text-blue-600 mb-2">
                          <strong>Regulation:</strong> {violation.regulation}
                        </p>
                        <div className="bg-yellow-50 p-3 rounded">
                          <p className="text-sm font-medium text-yellow-800">Required Action:</p>
                          <p className="text-sm text-yellow-700">{violation.requiredAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedInspection.photos.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Inspection Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedInspection.photos.map((photo, index) => (
                      <div key={index} className="border rounded-lg p-2">
                        <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
                          <CameraIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Photo {index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t">
                <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-medium">
                  Generate Report
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium">
                  Schedule Follow-up
                </button>
                <button
                  onClick={() => setSelectedInspection(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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

export default SafetyComplianceMonitor;