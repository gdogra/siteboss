import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TenantProvider as SbTenantProvider } from '@/contexts/TenantContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { FinancialsProvider } from '@/contexts/FinancialsContext';
import { DocumentsProvider } from '@/contexts/DocumentsContext';
import { LeadsProvider } from '@/contexts/LeadsContext';
import { FeedbackProvider } from '@/contexts/FeedbackContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import NewProjectPage from './pages/NewProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import TrialSignupPage from './pages/TrialSignupPage';
import GetQuotePage from './pages/GetQuotePage';
import AdminLoginPage from './pages/AdminLoginPage';
import EnterpriseProjectDashboard from './pages/EnterpriseProjectDashboard';
import PaymentsPage from './pages/PaymentsPage';
import LeadsPage from './pages/LeadsPage';
import FeedbackPage from './pages/FeedbackPage';
import TicketsPage from './pages/TicketsPage';
import PlaceholderPage from './components/PlaceholderPage';
import AITaskWizardPage from './pages/AITaskWizardPage';
import GlobalTooltipLayer from './components/GlobalTooltipLayer';

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <SbTenantProvider>
                <FeedbackProvider>
                  <LeadsProvider>
                    <ProjectsProvider>
                    <TasksProvider>
                      <FinancialsProvider>
                        <DocumentsProvider>
                          <BrowserRouter>
                            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/new" element={<NewProjectPage />} />
                <Route path="/projects/:projectId/edit" element={<EditProjectPage />} />
                <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />
                <Route path="/trial-signup" element={<TrialSignupPage />} />
                <Route path="/get-quote" element={<GetQuotePage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/project/:projectId/dashboard" element={<EnterpriseProjectDashboard />} />
                <Route path="/projects/:projectId/ai-wizard" element={<AITaskWizardPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                
                {/* Placeholder pages for footer and other links */}
                <Route path="/features" element={<PlaceholderPage title="Features" description="Comprehensive construction management features" />} />
                <Route path="/about" element={<PlaceholderPage title="About Us" description="Learn more about SiteBoss and our mission" />} />
                <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with our team" />} />
                <Route path="/careers" element={<PlaceholderPage title="Careers" description="Join the SiteBoss team" />} />
                <Route path="/blog" element={<PlaceholderPage title="Blog" description="Construction industry insights and news" />} />
                <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="How we protect your data" />} />
                <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Terms and conditions" />} />
                <Route path="/security" element={<PlaceholderPage title="Security" description="How we keep your data secure" />} />
                
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                    </div>
                  </div>
                } />
                            </Routes>
                          </BrowserRouter>
                          <GlobalTooltipLayer />
                        </DocumentsProvider>
                      </FinancialsProvider>
                      </TasksProvider>
                    </ProjectsProvider>
                  </LeadsProvider>
                </FeedbackProvider>
              </SbTenantProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
