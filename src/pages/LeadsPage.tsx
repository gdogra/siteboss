import React from 'react';
import LeadManagement from '@/components/LeadManagement';
import Navigation from '@/components/Navigation';

const LeadsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="header" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">
            Capture, track, and convert leads into profitable construction projects.
          </p>
        </div>
        <LeadManagement />
      </div>
    </div>
  );
};

export default LeadsPage;