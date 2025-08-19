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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>;

export default App;