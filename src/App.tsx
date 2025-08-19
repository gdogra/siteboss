import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import InvoiceSubmissionPage from "./pages/InvoiceSubmissionPage";
import LeadManagementPage from "./pages/LeadManagementPage";
import LeadIntakePage from "./pages/LeadIntakePage";
import PaymentsPage from "./pages/PaymentsPage";
import OnAuthSuccess from "./pages/OnAuthSuccess";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
// Import client portal pages
import ClientLogin from "./pages/ClientLogin";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProjects from "./pages/ClientProjects";
import ClientInvoices from "./pages/ClientInvoices";
import ClientDocuments from "./pages/ClientDocuments";
import ClientMessages from "./pages/ClientMessages";
import CustomerPortalDashboard from "./pages/CustomerPortalDashboard";
import AnalyticsPage from "./pages/AnalyticsPage";

const PlatformAdminDashboard = React.lazy(() => import("./pages/PlatformAdminDashboard"));
const InventoryManagementPage = React.lazy(() => import("./pages/InventoryManagementPage"));
const ProposalManagementPage = React.lazy(() => import("./pages/ProposalManagementPage"));
const ProposalViewPage = React.lazy(() => import("./pages/ProposalViewPage"));
const AdvancedTimeTrackingPage = React.lazy(() => import("./pages/AdvancedTimeTrackingPage"));
const SubscriptionManagementPage = React.lazy(() => import("./pages/SubscriptionManagementPage"));
const PermitManagementPage = React.lazy(() => import("./pages/PermitManagementPage"));
import ClientAuthGuard from "./components/ClientAuthGuard";
import FloatingChatWidget from "./components/FloatingChatWidget";
import TrialSignup from "./pages/TrialSignup";
import OnboardingWizard from "./components/OnboardingWizard";
import TenantManagementPage from "./pages/TenantManagementPage";

const queryClient = new QueryClient();

const App = () =>
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <TenantProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/invoice-submission" element={<InvoiceSubmissionPage />} />
          <Route path="/leads" element={<LeadManagementPage />} />
          <Route path="/get-quote" element={<LeadIntakePage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/onauthsuccess" element={<OnAuthSuccess />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/signup" element={<TrialSignup />} />
          <Route path="/trial-signup" element={<TrialSignup />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          
          {/* Client Portal Routes */}
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client-login" element={<Navigate to="/client/login" replace />} />
          <Route path="/client/dashboard" element={
              <ClientAuthGuard>
              <ClientDashboard />
            </ClientAuthGuard>
              } />
          <Route path="/client-dashboard" element={<Navigate to="/client/dashboard" replace />} />
          <Route path="/client/projects" element={
              <ClientAuthGuard>
              <ClientProjects />
            </ClientAuthGuard>
              } />
          <Route path="/client-projects" element={<Navigate to="/client/projects" replace />} />
          <Route path="/client/invoices" element={
              <ClientAuthGuard>
              <ClientInvoices />
            </ClientAuthGuard>
              } />
          <Route path="/client-invoices" element={<Navigate to="/client/invoices" replace />} />
          <Route path="/client/documents" element={
              <ClientAuthGuard>
              <ClientDocuments />
            </ClientAuthGuard>
              } />
          <Route path="/client-documents" element={<Navigate to="/client/documents" replace />} />
          <Route path="/client/messages" element={
              <ClientAuthGuard>
              <ClientMessages />
            </ClientAuthGuard>
              } />
          <Route path="/customer-portal" element={
              <ClientAuthGuard>
              <CustomerPortalDashboard />
            </ClientAuthGuard>
              } />
          <Route path="/platform-admin" element={
              <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>}>
              <PlatformAdminDashboard />
            </React.Suspense>
              } />
          <Route path="/inventory" element={
              <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>}>
              <InventoryManagementPage />
            </React.Suspense>
              } />
          <Route path="/proposals" element={
              <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div></div>}>
              <ProposalManagementPage />
            </React.Suspense>
              } />
          <Route path="/proposal/:id/view" element={
              <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div></div>}>
              <ProposalViewPage />
            </React.Suspense>
              } />
          <Route path="/permit-management" element={
              <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div></div>}>
              <PermitManagementPage />
            </React.Suspense>
              } />
          <Route path="/advanced-time-tracking" element={<AdvancedTimeTrackingPage />} />
          <Route path="/subscription-management" element={<SubscriptionManagementPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/client-messages" element={<Navigate to="/client/messages" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <FloatingChatWidget />
      </TenantProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>;

export default App;