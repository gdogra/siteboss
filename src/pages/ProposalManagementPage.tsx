import React from 'react';
import AuthGuard from  '@/components/AuthGuard';
import Header from  '@/components/Header';
import ProposalManagement from '@/components/ProposalManagement';

const ProposalManagementPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <ProposalManagement />
        </main>
      </div>
    </AuthGuard>
  );
};

export default ProposalManagementPage;