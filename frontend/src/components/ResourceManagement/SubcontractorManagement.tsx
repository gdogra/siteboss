import React, { useState } from 'react';
import { PlusIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Subcontractor {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  services: string[];
  hourly_rate?: number;
  status: 'active' | 'inactive';
}

const SubcontractorManagement: React.FC = () => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([
    {
      id: '1',
      company_name: 'ABC Electrical',
      contact_person: 'John Smith',
      email: 'john@abcelectrical.com',
      phone: '(555) 123-4567',
      services: ['Electrical', 'Lighting'],
      hourly_rate: 85,
      status: 'active'
    },
    {
      id: '2',
      company_name: 'Prime Plumbing',
      contact_person: 'Sarah Johnson',
      email: 'sarah@primeplumbing.com',
      phone: '(555) 987-6543',
      services: ['Plumbing', 'HVAC'],
      hourly_rate: 75,
      status: 'active'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <UserGroupIcon className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subcontractors</h2>
            <p className="text-gray-600">Manage your subcontractor network</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Subcontractor
        </button>
      </div>

      {/* Subcontractor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcontractors.map((subcontractor) => (
          <div key={subcontractor.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{subcontractor.company_name}</h3>
                  <p className="text-sm text-gray-500">{subcontractor.contact_person}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                subcontractor.status === 'active' 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                {subcontractor.status}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-sm">
                <p className="text-gray-600">Email: {subcontractor.email}</p>
                <p className="text-gray-600">Phone: {subcontractor.phone}</p>
                {subcontractor.hourly_rate && (
                  <p className="text-gray-600">Rate: ${subcontractor.hourly_rate}/hr</p>
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">Services:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {subcontractor.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {subcontractors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subcontractors</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first subcontractor.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Subcontractor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractorManagement;