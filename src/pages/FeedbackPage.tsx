import React from 'react';
import Navigation from '@/components/Navigation';
import FeedbackCollection from '@/components/FeedbackCollection';
import AuthGuard from '@/components/AuthGuard';

const FeedbackPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <FeedbackCollection />
        </main>
      </div>
    </AuthGuard>
  );
};

export default FeedbackPage;