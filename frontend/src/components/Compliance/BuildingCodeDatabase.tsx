import React, { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface BuildingCode {
  id: string;
  code: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: string;
  effectiveDate: Date;
  lastUpdated: Date;
  requirements: string[];
  penalties: string[];
  relatedCodes: string[];
  complianceChecklist: ComplianceItem[];
}

interface ComplianceItem {
  id: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'not-applicable';
  notes?: string;
  inspectionRequired: boolean;
  deadline?: Date;
}

interface ProjectComplianceCheck {
  projectId: string;
  projectType: string;
  location: string;
  applicableCodes: BuildingCode[];
  overallCompliance: number;
  criticalIssues: number;
  lastChecked: Date;
}

export const BuildingCodeDatabase: React.FC = () => {
  const [codes, setCodes] = useState<BuildingCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [projectCompliance, setProjectCompliance] = useState<ProjectComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<BuildingCode | null>(null);

  useEffect(() => {
    loadBuildingCodes();
    loadProjectCompliance();
  }, []);

  const loadBuildingCodes = async () => {
    // Simulate API call to building code database
    const mockCodes: BuildingCode[] = [
      {
        id: 'ibc-2021-fire',
        code: 'IBC 2021 - Chapter 9',
        title: 'Fire Protection and Life Safety Systems',
        description: 'Requirements for fire protection, detection, and suppression systems',
        jurisdiction: 'International',
        category: 'Fire Safety',
        effectiveDate: new Date('2021-01-01'),
        lastUpdated: new Date('2024-03-15'),
        requirements: [
          'Fire sprinkler systems required in buildings over 5,000 sq ft',
          'Emergency egress lighting and exit signs',
          'Fire-rated assemblies for structural elements',
          'Smoke detection systems in common areas'
        ],
        penalties: ['$500-$5,000 fines', 'Stop work orders', 'Certificate of occupancy denial'],
        relatedCodes: ['NFPA 13', 'NFPA 72', 'IFC 2021'],
        complianceChecklist: [
          {
            id: 'sprinkler-1',
            requirement: 'Install NFPA 13 compliant sprinkler system',
            status: 'pending',
            inspectionRequired: true,
            deadline: new Date('2024-10-15')
          },
          {
            id: 'egress-1',
            requirement: 'Emergency lighting with 90-minute battery backup',
            status: 'compliant',
            inspectionRequired: true
          }
        ]
      },
      {
        id: 'ada-2010',
        code: 'ADA 2010 Standards',
        title: 'Accessibility Guidelines',
        description: 'Americans with Disabilities Act accessibility requirements',
        jurisdiction: 'Federal',
        category: 'Accessibility',
        effectiveDate: new Date('2010-03-15'),
        lastUpdated: new Date('2024-01-10'),
        requirements: [
          'Wheelchair accessible entrances and paths',
          'ADA compliant restrooms and fixtures',
          'Proper door widths and hardware heights',
          'Accessible parking spaces with proper signage'
        ],
        penalties: ['Federal lawsuits', 'Up to $75,000 first violation', 'Up to $150,000 subsequent violations'],
        relatedCodes: ['IBC Accessibility', 'Section 504', 'Fair Housing Act'],
        complianceChecklist: [
          {
            id: 'entrance-1',
            requirement: '32-inch minimum door width at main entrance',
            status: 'compliant',
            inspectionRequired: false
          },
          {
            id: 'parking-1',
            requirement: 'ADA parking spaces with van accessible space',
            status: 'non-compliant',
            notes: 'Missing van accessible signage',
            inspectionRequired: true,
            deadline: new Date('2024-09-30')
          }
        ]
      },
      {
        id: 'ca-title24-energy',
        code: 'California Title 24 - Part 6',
        title: 'Energy Efficiency Standards',
        description: 'California Building Energy Efficiency Standards',
        jurisdiction: 'California',
        category: 'Energy Efficiency',
        effectiveDate: new Date('2023-01-01'),
        lastUpdated: new Date('2024-02-20'),
        requirements: [
          'High-performance windows and insulation',
          'HVAC system efficiency requirements',
          'LED lighting with occupancy sensors',
          'Solar-ready construction requirements'
        ],
        penalties: ['Plan rejection', 'Certificate of occupancy delays', '$1,000-$10,000 fines'],
        relatedCodes: ['ASHRAE 90.1', 'IECC 2021', 'CALGreen'],
        complianceChecklist: [
          {
            id: 'windows-1',
            requirement: 'U-factor ≤ 0.30 for windows',
            status: 'compliant',
            inspectionRequired: true
          },
          {
            id: 'hvac-1',
            requirement: 'HVAC system SEER rating ≥ 16',
            status: 'pending',
            inspectionRequired: true,
            deadline: new Date('2024-11-01')
          }
        ]
      }
    ];

    setCodes(mockCodes);
    setLoading(false);
  };

  const loadProjectCompliance = async () => {
    // Simulate API call for project compliance checks
    const mockProjectCompliance: ProjectComplianceCheck[] = [
      {
        projectId: 'proj-001',
        projectType: 'Commercial Office Building',
        location: 'San Francisco, CA',
        applicableCodes: codes.filter(c => ['ibc-2021-fire', 'ada-2010', 'ca-title24-energy'].includes(c.id)),
        overallCompliance: 78,
        criticalIssues: 2,
        lastChecked: new Date('2024-08-25')
      },
      {
        projectId: 'proj-002',
        projectType: 'Residential Multi-Family',
        location: 'Los Angeles, CA',
        applicableCodes: codes.filter(c => ['ada-2010', 'ca-title24-energy'].includes(c.id)),
        overallCompliance: 92,
        criticalIssues: 0,
        lastChecked: new Date('2024-08-28')
      }
    ];

    setProjectCompliance(mockProjectCompliance);
  };

  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJurisdiction = selectedJurisdiction === 'all' || code.jurisdiction === selectedJurisdiction;
    const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
    
    return matchesSearch && matchesJurisdiction && matchesCategory;
  });

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'non-compliant':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <CalendarIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpenIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Building Code Database</h2>
            <p className="text-gray-600">Comprehensive building code compliance management</p>
          </div>
        </div>
      </div>

      {/* Project Compliance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Project Compliance</h3>
        <div className="space-y-4">
          {projectCompliance.map((project) => (
            <div key={project.projectId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{project.projectType}</span>
                  <span className="text-gray-500">• {project.location}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(project.overallCompliance)}`}>
                  {project.overallCompliance}% Compliant
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{project.applicableCodes.length} applicable codes</span>
                {project.criticalIssues > 0 && (
                  <span className="text-red-600 font-medium">
                    {project.criticalIssues} critical issues
                  </span>
                )}
                <span>Last checked: {project.lastChecked.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search building codes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedJurisdiction}
            onChange={(e) => setSelectedJurisdiction(e.target.value)}
          >
            <option value="all">All Jurisdictions</option>
            <option value="International">International</option>
            <option value="Federal">Federal</option>
            <option value="California">California</option>
            <option value="New York">New York</option>
            <option value="Texas">Texas</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Fire Safety">Fire Safety</option>
            <option value="Accessibility">Accessibility</option>
            <option value="Energy Efficiency">Energy Efficiency</option>
            <option value="Structural">Structural</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
          </select>
        </div>
      </div>

      {/* Building Codes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCodes.map((code) => (
          <div key={code.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{code.code}</h3>
                  <p className="text-gray-600">{code.title}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {code.category}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{code.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Jurisdiction:</span>
                  <span className="font-medium">{code.jurisdiction}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Effective Date:</span>
                  <span className="font-medium">{code.effectiveDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{code.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Key Requirements:</h4>
                <ul className="space-y-1">
                  {code.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {req}
                    </li>
                  ))}
                  {code.requirements.length > 3 && (
                    <li className="text-sm text-blue-600">
                      +{code.requirements.length - 3} more requirements
                    </li>
                  )}
                </ul>
              </div>

              {/* Compliance Checklist Preview */}
              {code.complianceChecklist.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Compliance Status:</h4>
                  <div className="space-y-2">
                    {code.complianceChecklist.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getComplianceStatusIcon(item.status)}
                          <span className="text-sm text-gray-700 truncate">{item.requirement}</span>
                        </div>
                        {item.deadline && (
                          <span className="text-xs text-gray-500">
                            Due {item.deadline.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => setSelectedCode(code)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  Add to Project
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No building codes found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Code Detail Modal */}
      {selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCode.code}</h2>
                  <p className="text-gray-600">{selectedCode.title}</p>
                </div>
                <button 
                  onClick={() => setSelectedCode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedCode.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedCode.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Compliance Checklist</h3>
                <div className="space-y-3">
                  {selectedCode.complianceChecklist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getComplianceStatusIcon(item.status)}
                          <span className="font-medium">{item.requirement}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'compliant' ? 'bg-green-100 text-green-800' :
                          item.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mb-2">{item.notes}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Inspection required: {item.inspectionRequired ? 'Yes' : 'No'}</span>
                        {item.deadline && (
                          <span>Deadline: {item.deadline.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Potential Penalties</h3>
                <ul className="space-y-1">
                  {selectedCode.penalties.map((penalty, index) => (
                    <li key={index} className="flex items-start">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{penalty}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Related Codes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCode.relatedCodes.map((relatedCode, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {relatedCode}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingCodeDatabase;