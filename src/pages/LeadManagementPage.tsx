
import React from 'react';
import Header from  '@/components/Header';
import LeadKanbanBoard from '@/components/LeadKanbanBoard';
import AuthGuard from '@/components/AuthGuard';

const LeadManagementPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <LeadKanbanBoard />
        </main>
      </div>
    </AuthGuard>
  );
};

export default LeadManagementPage;
