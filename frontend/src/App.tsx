import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RBACProvider } from './contexts/RBACContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectManagement from './components/ProjectManagement/ProjectManagement';
import BudgetManagement from './components/BudgetManagement/BudgetManagement';
import TaskManagement from './components/TaskManagement/TaskManagement';
import TimeTracking from './components/TimeTracking/TimeTracking';
import Documents from './components/Documents/Documents';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import TeamManagement from './components/Team/TeamManagement';
import ContractorsManagement from './components/Contractors/ContractorsManagement';
import AdminPanel from './components/Admin/AdminPanel';
import UserProfile from './components/Profile/UserProfile';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import EmailConfirmation from './components/Auth/EmailConfirmation';
import LeadManagement from './components/CRM/LeadManagement';
import SalesPipeline from './components/CRM/SalesPipeline';
import ContactsAndCommunications from './components/CRM/ContactsAndCommunications';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import TenantSettings from './components/Tenant/TenantSettings';
import SubscriptionPlans from './components/Billing/SubscriptionPlans';
import PaywallModal from './components/Billing/PaywallModal';
import { usePaywall } from './hooks/usePaywall';
import AIAssistant from './components/AI/AIAssistant';
import { AIProvider } from './contexts/AIContext';
import { TenantProvider } from './contexts/TenantContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <LoginForm onSuccess={() => {
    // Small delay to ensure auth state is updated
    setTimeout(() => navigate('/dashboard'), 100);
  }} />;
};

const RegisterWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <RegisterForm onSuccess={() => {
    // Small delay to ensure auth state is updated
    setTimeout(() => navigate('/dashboard'), 100);
  }} />;
};

const AppContent: React.FC = () => {
  const [isAIOpen, setIsAIOpen] = React.useState(false);
  const { activePaywall, closePaywall } = usePaywall();
  
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginWrapper />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterWrapper />
            </PublicRoute>
          }
        />
        <Route
          path="/email-confirmation"
          element={<EmailConfirmation />}
        />
        <Route
          path="/dashboard"
          element={
            <AuthProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <AuthProtectedRoute>
              <Layout>
                <ProjectManagement />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <AuthProtectedRoute>
              <Layout>
                <TaskManagement />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <AuthProtectedRoute>
              <Layout>
                <BudgetManagement />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/time-tracking"
          element={
            <AuthProtectedRoute>
              <Layout>
                <TimeTracking />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/contractors"
          element={
            <AuthProtectedRoute>
              <Layout>
                <ContractorsManagement />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <AuthProtectedRoute>
              <Layout>
                <TeamManagement />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <AuthProtectedRoute>
              <Layout>
                <Documents />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <AuthProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthProtectedRoute>
              <Layout>
                <AdminPanel />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <AuthProtectedRoute>
              <Layout>
                <LeadManagement />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <AuthProtectedRoute>
              <Layout>
                <SalesPipeline />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <AuthProtectedRoute>
              <Layout>
                <ContactsAndCommunications />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <AuthProtectedRoute>
              <Layout>
                <AnalyticsDashboard />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/tenant-settings"
          element={
            <AuthProtectedRoute>
              <Layout>
                <TenantSettings />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/subscription-plans"
          element={
            <AuthProtectedRoute>
              <Layout>
                <SubscriptionPlans />
              </Layout>
            </AuthProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      
      {/* AI Assistant - Available on all authenticated routes */}
      <AIAssistant 
        isOpen={isAIOpen}
        onToggle={() => setIsAIOpen(!isAIOpen)}
      />
      
      {/* Global Paywall Modal */}
      {activePaywall && (
        <PaywallModal
          isOpen={true}
          onClose={closePaywall}
          feature={activePaywall.name}
          requiredPlan={activePaywall.requiredPlan}
          description={activePaywall.description}
        />
      )}
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <RBACProvider>
              <AIProvider>
                <AppContent />
              </AIProvider>
            </RBACProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;