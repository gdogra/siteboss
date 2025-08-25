import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ContractorOnboarding from './ContractorOnboarding';
import ContractorPerformance from './ContractorPerformance';

interface Contractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  license_number: string;
  specialties: string[];
  rating: number;
  reviews_count: number;
  projects_completed: number;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  insurance_expiry: Date;
  license_expiry: Date;
  hourly_rate?: number;
  joined_date: Date;
  last_project_date?: Date;
  total_earnings: number;
  certifications: string[];
  availability_status: 'available' | 'busy' | 'unavailable';
}

interface ContractorProject {
  id: string;
  contractor_id: string;
  project_name: string;
  start_date: Date;
  end_date?: Date;
  status: 'active' | 'completed' | 'cancelled';
  contract_value: number;
  completion_percentage: number;
  rating?: number;
}

const ContractorsManagement: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [contractorProjects, setContractorProjects] = useState<ContractorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'pending'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      
      // Mock contractors data
      const mockContractors: Contractor[] = [
        {
          id: '1',
          company_name: 'Elite Construction Services',
          contact_name: 'John Smith',
          email: 'john@eliteconstruction.com',
          phone: '(555) 123-4567',
          address: '123 Builder St, Construction City, CC 12345',
          license_number: 'LIC-2024-001',
          specialties: ['General Construction', 'Electrical', 'Plumbing'],
          rating: 4.8,
          reviews_count: 42,
          projects_completed: 28,
          status: 'active',
          insurance_expiry: new Date('2025-06-15'),
          license_expiry: new Date('2025-12-31'),
          hourly_rate: 85,
          joined_date: new Date('2023-03-15'),
          last_project_date: new Date('2024-01-20'),
          total_earnings: 125000,
          certifications: ['OSHA 30', 'EPA Certified', 'First Aid/CPR'],
          availability_status: 'available'
        },
        {
          id: '2',
          company_name: 'Precision Electrical Works',
          contact_name: 'Sarah Johnson',
          email: 'sarah@precisionelectrical.com',
          phone: '(555) 234-5678',
          address: '456 Voltage Ave, Electric City, EC 23456',
          license_number: 'ELC-2024-002',
          specialties: ['Electrical', 'Solar Installation', 'Smart Home'],
          rating: 4.9,
          reviews_count: 35,
          projects_completed: 45,
          status: 'active',
          insurance_expiry: new Date('2025-08-20'),
          license_expiry: new Date('2025-11-30'),
          hourly_rate: 95,
          joined_date: new Date('2022-11-10'),
          last_project_date: new Date('2024-01-18'),
          total_earnings: 187500,
          certifications: ['Master Electrician', 'NABCEP Certified', 'OSHA 10'],
          availability_status: 'busy'
        },
        {
          id: '3',
          company_name: 'Pro Plumbing Solutions',
          contact_name: 'Mike Rodriguez',
          email: 'mike@proplumbing.com',
          phone: '(555) 345-6789',
          address: '789 Water Way, Flow City, FC 34567',
          license_number: 'PLB-2024-003',
          specialties: ['Plumbing', 'HVAC', 'Gas Lines'],
          rating: 4.7,
          reviews_count: 38,
          projects_completed: 52,
          status: 'active',
          insurance_expiry: new Date('2025-04-10'),
          license_expiry: new Date('2025-09-15'),
          hourly_rate: 80,
          joined_date: new Date('2023-01-20'),
          last_project_date: new Date('2024-01-15'),
          total_earnings: 98000,
          certifications: ['Master Plumber', 'Backflow Prevention', 'Green Plumbing'],
          availability_status: 'available'
        },
        {
          id: '4',
          company_name: 'Advanced Roofing Co.',
          contact_name: 'Lisa Chen',
          email: 'lisa@advancedroofing.com',
          phone: '(555) 456-7890',
          address: '321 Shingle Blvd, Roof City, RC 45678',
          license_number: 'ROF-2024-004',
          specialties: ['Roofing', 'Gutters', 'Siding'],
          rating: 4.6,
          reviews_count: 29,
          projects_completed: 34,
          status: 'pending',
          insurance_expiry: new Date('2025-07-25'),
          license_expiry: new Date('2025-10-20'),
          hourly_rate: 90,
          joined_date: new Date('2024-01-05'),
          total_earnings: 45000,
          certifications: ['GAF Certified', 'OSHA 30', 'Fall Protection'],
          availability_status: 'available'
        },
        {
          id: '5',
          company_name: 'Heritage Masonry Works',
          contact_name: 'Robert Williams',
          email: 'robert@heritagemasonry.com',
          phone: '(555) 567-8901',
          address: '654 Stone St, Brick City, BC 56789',
          license_number: 'MAS-2024-005',
          specialties: ['Masonry', 'Stone Work', 'Brick Repair'],
          rating: 4.9,
          reviews_count: 51,
          projects_completed: 67,
          status: 'active',
          insurance_expiry: new Date('2025-05-30'),
          license_expiry: new Date('2025-12-15'),
          hourly_rate: 75,
          joined_date: new Date('2022-08-12'),
          last_project_date: new Date('2024-01-22'),
          total_earnings: 156000,
          certifications: ['Mason Contractor', 'Historic Preservation', 'OSHA 10'],
          availability_status: 'unavailable'
        }
      ];

      // Mock contractor projects data
      const mockProjects: ContractorProject[] = [
        {
          id: '1',
          contractor_id: '1',
          project_name: 'Downtown Office Building',
          start_date: new Date('2024-01-15'),
          end_date: new Date('2024-03-30'),
          status: 'active',
          contract_value: 45000,
          completion_percentage: 75,
          rating: 5
        },
        {
          id: '2',
          contractor_id: '2',
          project_name: 'Residential Complex - Phase 1',
          start_date: new Date('2024-01-10'),
          status: 'active',
          contract_value: 62000,
          completion_percentage: 60
        },
        {
          id: '3',
          contractor_id: '3',
          project_name: 'Shopping Mall Renovation',
          start_date: new Date('2023-12-01'),
          end_date: new Date('2024-01-15'),
          status: 'completed',
          contract_value: 28000,
          completion_percentage: 100,
          rating: 4.8
        }
      ];
      
      setContractors(mockContractors);
      setContractorProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteContractor = () => {
    setIsInviteModalOpen(true);
  };

  const handleStartOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = (contractorData: any) => {
    const newContractor: Contractor = {
      id: `new-${Date.now()}`,
      ...contractorData,
      joined_date: new Date(),
      last_project_date: undefined,
      total_earnings: 0,
      certifications: [],
    };
    
    setContractors(prev => [...prev, newContractor]);
    setIsOnboardingOpen(false);
  };

  const handleViewDetails = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsDetailsModalOpen(true);
  };

  const handleViewPerformance = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsPerformanceModalOpen(true);
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    const matchesSpecialty = specialtyFilter === 'all' || contractor.specialties.includes(specialtyFilter);
    
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-orange-600 bg-orange-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
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
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  const specialties = ['General Construction', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Masonry', 'Painting', 'Flooring'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1">Manage your contractor network and relationships</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-3">
            <button
              onClick={handleStartOnboarding}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Contractor
            </button>
            <button
              onClick={handleInviteContractor}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" />
              Invite Existing
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Contractors</p>
              <p className="text-2xl font-bold text-gray-900">{contractors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Contractors</p>
              <p className="text-2xl font-bold text-gray-900">
                {contractors.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {contractors.filter(c => c.availability_status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {contractors.length > 0 ? 
                  (contractors.reduce((sum, c) => sum + c.rating, 0) / contractors.length).toFixed(1) : 
                  '0.0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-1">
                <div className="bg-current"></div>
                <div className="bg-current"></div>
                <div className="bg-current"></div>
                <div className="bg-current"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="w-4 h-4 flex flex-col space-y-1">
                <div className="bg-current h-1"></div>
                <div className="bg-current h-1"></div>
                <div className="bg-current h-1"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Contractors Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContractors.map((contractor) => (
            <div key={contractor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{contractor.company_name}</h3>
                      <p className="text-sm text-gray-500">{contractor.contact_name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}>
                      {contractor.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  {renderRating(contractor.rating)}
                  <p className="text-xs text-gray-500 mt-1">{contractor.reviews_count} reviews • {contractor.projects_completed} projects</p>
                </div>
                
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {contractor.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {specialty}
                      </span>
                    ))}
                    {contractor.specialties.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        +{contractor.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      ${contractor.hourly_rate}/hr
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(contractor.availability_status)}`}>
                      {contractor.availability_status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleViewDetails(contractor)}
                    className="bg-primary-600 text-white text-xs font-medium py-2 px-2 rounded-md hover:bg-primary-700"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleViewPerformance(contractor)}
                    className="bg-blue-600 text-white text-xs font-medium py-2 px-2 rounded-md hover:bg-blue-700"
                  >
                    Performance
                  </button>
                  <button className="bg-gray-100 text-gray-700 text-xs font-medium py-2 px-2 rounded-md hover:bg-gray-200">
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contractor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contractor.company_name}</div>
                        <div className="text-sm text-gray-500">{contractor.contact_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contractor.email}</div>
                    <div className="text-sm text-gray-500">{contractor.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contractor.specialties.slice(0, 2).map((specialty, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderRating(contractor.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}>
                      {contractor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${contractor.hourly_rate}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(contractor)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      View
                    </button>
                    <button className="text-primary-600 hover:text-primary-900">
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsInviteModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Invite Contractor</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialties</label>
                    <select multiple className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-24">
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
                    <textarea
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      rows={3}
                      placeholder="Welcome message for the contractor"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    alert('Contractor invitation sent successfully!');
                    setIsInviteModalOpen(false);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contractor Details Modal */}
      {isDetailsModalOpen && selectedContractor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsDetailsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl leading-6 font-medium text-gray-900">{selectedContractor.company_name}</h3>
                    <p className="text-gray-600">{selectedContractor.contact_name}</p>
                  </div>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{selectedContractor.email}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{selectedContractor.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{selectedContractor.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Business Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Business Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">License Number:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedContractor.license_number}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Hourly Rate:</span>
                        <span className="ml-2 text-sm text-gray-900">${selectedContractor.hourly_rate}/hour</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Projects Completed:</span>
                        <span className="ml-2 text-sm text-gray-900">{selectedContractor.projects_completed}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Total Earnings:</span>
                        <span className="ml-2 text-sm text-gray-900">${selectedContractor.total_earnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContractor.specialties.map((specialty, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContractor.certifications.map((cert, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Performance</h4>
                    <div className="space-y-2">
                      {renderRating(selectedContractor.rating)}
                      <p className="text-sm text-gray-600">{selectedContractor.reviews_count} reviews</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Status</h4>
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedContractor.status)}`}>
                        {selectedContractor.status}
                      </span>
                      <br />
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(selectedContractor.availability_status)}`}>
                        {selectedContractor.availability_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                    Send Message
                  </button>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    Assign to Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contractor Onboarding Modal */}
      <ContractorOnboarding
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Performance Modal */}
      {isPerformanceModalOpen && selectedContractor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Performance Dashboard</h3>
              <button
                onClick={() => setIsPerformanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <ContractorPerformance 
              contractorId={selectedContractor.id}
              contractorName={selectedContractor.company_name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorsManagement;