import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { Header } from '@/components/Header';
import TenantManagement from '@/components/TenantManagement';

const TenantManagementPage: React.FC = () => {
  return (
    <AuthGuard requiredRole="admin">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TenantManagement />
      </main>
    </AuthGuard>);

};

export default TenantManagementPage;