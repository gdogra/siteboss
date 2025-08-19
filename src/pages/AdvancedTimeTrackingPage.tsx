
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MapPin, 
  Smartphone, 
  BarChart3, 
  Shield, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Target,
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import all the time tracking components
import TimeTrackingDashboard from '@/components/TimeTrackingDashboard';
import MobileTimeTracker from '@/components/MobileTimeTracker';
import GPSLocationTracker from '@/components/GPSLocationTracker';
import GeofenceManager from '@/components/GeofenceManager';
import SessionVerificationWorkflow from '@/components/SessionVerificationWorkflow';
import TimeAnalyticsDashboard from '@/components/TimeAnalyticsDashboard';
import TimesheetGenerator from '@/components/TimesheetGenerator';
import AuthGuard from  '@/components/AuthGuard';
import Header from  '@/components/Header';

const AdvancedTimeTrackingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is on mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load user role
    loadUserRole();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadUserRole = async () => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.data?.Roles) {
        setUserRole(userInfo.data.Roles);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  // Auto-switch to mobile tracker on mobile devices
  useEffect(() => {
    if (isMobile && activeTab === 'dashboard') {
      setActiveTab('mobile');
    }
  }, [isMobile]);

  const isAdmin = userRole.includes('Administrator');
  const isContractor = userRole.includes('Contractor') || userRole.includes('r-QpoZrh');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <TimeTrackingDashboard userRole={userRole} />;
      case 'mobile':
        return <MobileTimeTracker />;
      case 'gps':
        return <GPSLocationTracker showRealTime={true} />;
      case 'geofences':
        return <GeofenceManager />;
      case 'verification':
        return <SessionVerificationWorkflow />;
      case 'analytics':
        return <TimeAnalyticsDashboard />;
      case 'timesheets':
        return <TimesheetGenerator />;
      default:
        return <TimeTrackingDashboard userRole={userRole} />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Time Tracking</h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive time tracking with GPS monitoring, geofencing, and analytics
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  GPS Enabled
                </Badge>
                {isAdmin && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Access
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* System Status Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>System Status:</strong> All time tracking features are active. 
              GPS accuracy monitoring and geofencing violations are being tracked in real-time.
              {isMobile && ' Mobile-optimized interface is active for field workers.'}
            </AlertDescription>
          </Alert>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
              <TabsTrigger value="dashboard" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Mobile</span>
              </TabsTrigger>
              <TabsTrigger value="gps" className="flex items-center gap-1">
                <Navigation className="h-4 w-4" />
                <span className="hidden sm:inline">GPS</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="geofences" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Geofences</span>
                </TabsTrigger>
              )}
              {(isAdmin || isContractor) && (
                <TabsTrigger value="verification" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Verify</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="timesheets" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Timesheets</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {renderTabContent()}
            </div>
          </Tabs>

          {/* Feature Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Real-time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Continuous GPS location monitoring during work sessions with accuracy validation
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Geofencing
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Automatic detection of boundary violations with configurable tolerance periods
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Comprehensive productivity metrics, trends analysis, and performance insights
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Supervisor approval workflow with detailed session review and audit trails
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AdvancedTimeTrackingPage;
