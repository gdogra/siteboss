import React from 'react';
import Navigation from '@/components/Navigation';
import TicketingSystem from '@/components/TicketingSystem';
import AuthGuard from '@/components/AuthGuard';

const TicketsPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <TicketingSystem />
        </main>
      </div>
    </AuthGuard>
  );
};

export default TicketsPage;