import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
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
import ClientAuthGuard from "./components/ClientAuthGuard";
import FloatingChatWidget from "./components/FloatingChatWidget";

const queryClient = new QueryClient();

const App = () =>
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="/client-messages" element={<Navigate to="/client/messages" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <FloatingChatWidget />
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>;

export default App;