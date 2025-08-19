
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Users, 
  Building, 
  Settings, 
  Rocket,
  ArrowRight,
  ArrowLeft,
  Upload,
  Mail,
  Sparkles,
  Target,
  Zap,
  Brain,
  Shield,
  Award,
  PlayCircle
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState({
    companyProfile: {
      industry: '',
      employeeCount: '',
      currentSoftware: '',
      mainGoal: ''
    },
    firstProject: {
      name: '',
      description: '',
      budget: '',
      startDate: ''
    },
    teamMembers: [] as any[],
    integrations: [] as string[],
    preferences: {
      notifications: true,
      weeklyReports: true,
      mobileApp: true
    }
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isTrialUser, setIsTrialUser] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Company Profile',
      description: 'Tell us about your construction business',
      icon: Building,
      completed: completedSteps.includes(1)
    },
    {
      id: 2,
      title: 'First Project',
      description: 'Create your first project to get started',
      icon: Target,
      completed: completedSteps.includes(2)
    },
    {
      id: 3,
      title: 'Invite Team',
      description: 'Add team members and set permissions',
      icon: Users,
      completed: completedSteps.includes(3)
    },
    {
      id: 4,
      title: 'Connect Tools',
      description: 'Integrate with your existing software',
      icon: Zap,
      completed: completedSteps.includes(4)
    },
    {
      id: 5,
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings,
      completed: completedSteps.includes(5)
    }
  ];

  useEffect(() => {
    loadUserInfo();
    const stepParam = searchParams.get('step');
    const trialParam = searchParams.get('trial');
    
    if (stepParam) {
      setCurrentStep(parseInt(stepParam));
    }
    
    if (trialParam === 'true') {
      setIsTrialUser(true);
    }
  }, [searchParams]);

  const loadUserInfo = async () => {
    try {
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (!error && data) {
        setUserInfo(data);
        loadOnboardingProgress(data.ID);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadOnboardingProgress = async (userId: number) => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35524, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: userId }]
      });

      if (!error && data?.List?.length > 0) {
        const progress = data.List[0];
        setCurrentStep(progress.current_step || 1);
        setCompletedSteps(JSON.parse(progress.completed_steps || '[]'));
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const updateProgress = async (step: number, completed: boolean = false) => {
    if (!userInfo) return;

    try {
      const newCompletedSteps = completed && !completedSteps.includes(step) 
        ? [...completedSteps, step]
        : completedSteps;

      const progressData = {
        user_id: userInfo.ID,
        current_step: step,
        total_steps: 5,
        completed_steps: JSON.stringify(newCompletedSteps),
        progress_percentage: Math.round((newCompletedSteps.length / 5) * 100),
        onboarding_status: newCompletedSteps.length === 5 ? 'completed' : 'in_progress',
        last_updated: new Date().toISOString()
      };

      // Check if record exists
      const { data: existingData } = await window.ezsite.apis.tablePage(35524, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: userInfo.ID }]
      });

      if (existingData?.List?.length > 0) {
        await window.ezsite.apis.tableUpdate(35524, {
          ID: existingData.List[0].ID,
          ...progressData
        });
      } else {
        await window.ezsite.apis.tableCreate(35524, progressData);
      }

      if (completed) {
        setCompletedSteps(newCompletedSteps);
        
        // Show celebration for completed step
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);

        toast({
          title: `✅ Step ${step} Complete!`,
          description: `Great job! You're making excellent progress.`,
          duration: 3000
        });
      }

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleStepComplete = async () => {
    await updateProgress(currentStep, true);
    
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await updateProgress(nextStep);
    } else {
      // Onboarding complete
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      // Send completion email
      if (userInfo?.Email) {
        await sendOnboardingCompleteEmail();
      }

      // Track feature highlights
      await trackOnboardingCompletion();

      toast({
        title: "🎉 Onboarding Complete!",
        description: "Welcome to ContractPro! Your account is ready to use.",
        duration: 5000
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/client/dashboard?onboarding=completed');
      }, 2000);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      navigate('/client/dashboard');
    }
  };

  const sendOnboardingCompleteEmail = async () => {
    try {
      await window.ezsite.apis.sendEmail({
        to: [userInfo.Email],
        subject: "🎉 You're All Set! Welcome to ContractPro",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your ContractPro account is ready!</p>
            </div>
            
            <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              <p>Hi ${userInfo.Name},</p>
              
              <p>Amazing work completing your onboarding! You're now ready to experience the full power of ContractPro.</p>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #047857; margin-top: 0;">🚀 What's Next?</h3>
                <ul style="color: #374151; line-height: 1.8; margin-bottom: 0;">
                  <li>Start adding your projects and tracking progress</li>
                  <li>Invite team members to collaborate</li>
                  <li>Upload important documents</li>
                  <li>Download our mobile app for field access</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/client/dashboard" 
                   style="background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Go to Dashboard →
                </a>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0;"><strong>💡 Pro Tip:</strong> Watch for our daily tips over the next week to maximize your productivity!</p>
              </div>
              
              <p>Questions? We're here to help at (949) 555-WAVE or reply to this email.</p>
              
              <p>Welcome to the ContractPro family!<br>
              <strong>The ContractPro Team</strong></p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('Error sending onboarding complete email:', error);
    }
  };

  const trackOnboardingCompletion = async () => {
    try {
      if (!userInfo) return;

      const featureHighlight = {
        user_id: userInfo.ID,
        feature_name: 'onboarding_completed',
        feature_type: 'milestone',
        highlight_text: 'Congratulations! You\'ve completed onboarding and can now access all ContractPro features.',
        action_text: 'Explore Dashboard',
        action_url: '/client/dashboard',
        priority: 'high',
        shown: false,
        created_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableCreate(35527, featureHighlight);
    } catch (error) {
      console.error('Error tracking onboarding completion:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tell us about your company</h2>
              <p className="text-gray-600">This helps us customize ContractPro for your business</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-base font-medium">Industry Focus</Label>
                <select 
                  className="w-full mt-2 p-3 border rounded-lg"
                  value={onboardingData.companyProfile.industry}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    companyProfile: { ...prev.companyProfile, industry: e.target.value }
                  }))}
                >
                  <option value="">Select your industry</option>
                  <option value="residential">Residential Construction</option>
                  <option value="commercial">Commercial Construction</option>
                  <option value="remodeling">Remodeling & Renovation</option>
                  <option value="specialty">Specialty Contracting</option>
                  <option value="general">General Contracting</option>
                </select>
              </div>
              
              <div>
                <Label className="text-base font-medium">Team Size</Label>
                <select 
                  className="w-full mt-2 p-3 border rounded-lg"
                  value={onboardingData.companyProfile.employeeCount}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    companyProfile: { ...prev.companyProfile, employeeCount: e.target.value }
                  }))}
                >
                  <option value="">Select team size</option>
                  <option value="1-5">1-5 employees</option>
                  <option value="6-20">6-20 employees</option>
                  <option value="21-50">21-50 employees</option>
                  <option value="50+">50+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Current Software (if any)</Label>
              <Input
                className="mt-2 h-12"
                placeholder="Excel, QuickBooks, BuilderTrend, etc."
                value={onboardingData.companyProfile.currentSoftware}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  companyProfile: { ...prev.companyProfile, currentSoftware: e.target.value }
                }))}
              />
            </div>

            <div>
              <Label className="text-base font-medium">Main Goal with ContractPro</Label>
              <Textarea
                className="mt-2"
                placeholder="What do you hope to achieve? (e.g., better project tracking, faster invoicing, improved team communication)"
                value={onboardingData.companyProfile.mainGoal}
                onChange={(e) => setOnboardingData(prev => ({
                  ...prev,
                  companyProfile: { ...prev.companyProfile, mainGoal: e.target.value }
                }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Create your first project</h2>
              <p className="text-gray-600">Let's get you started with a sample project</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Demo Project</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    We'll create a sample project to show you how ContractPro works. You can modify or delete it anytime.
                  </p>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Use Demo Project
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500 py-4">
              <span>— or create your own project —</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Project Name</Label>
                <Input
                  className="mt-2 h-12"
                  placeholder="Kitchen Renovation - Smith House"
                  value={onboardingData.firstProject.name}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    firstProject: { ...prev.firstProject, name: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <Label className="text-base font-medium">Description</Label>
                <Textarea
                  className="mt-2"
                  placeholder="Brief description of the project scope and objectives"
                  value={onboardingData.firstProject.description}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    firstProject: { ...prev.firstProject, description: e.target.value }
                  }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">Estimated Budget</Label>
                  <Input
                    className="mt-2 h-12"
                    placeholder="$50,000"
                    value={onboardingData.firstProject.budget}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      firstProject: { ...prev.firstProject, budget: e.target.value }
                    }))}
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium">Start Date</Label>
                  <Input
                    type="date"
                    className="mt-2 h-12"
                    value={onboardingData.firstProject.startDate}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      firstProject: { ...prev.firstProject, startDate: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Invite your team</h2>
              <p className="text-gray-600">Add team members and collaborate better</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3">Why invite team members?</h3>
              <ul className="text-purple-800 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Real-time project updates and communication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Role-based access and permissions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Mobile app access for field teams
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Team Member Email</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    className="h-12 flex-1"
                    placeholder="teammate@company.com"
                  />
                  <Button className="px-8">
                    <Mail className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>

              <div className="text-center py-6">
                <Button variant="ghost" className="text-gray-600">
                  Skip for now - I'll invite team members later
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Zap className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connect your tools</h2>
              <p className="text-gray-600">Integrate with your existing software</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'QuickBooks', description: 'Sync invoices and expenses', icon: '📊' },
                { name: 'Google Calendar', description: 'Schedule and track appointments', icon: '📅' },
                { name: 'Dropbox', description: 'Store and share documents', icon: '📁' },
                { name: 'Slack', description: 'Team communication', icon: '💬' }
              ].map((integration) => (
                <div key={integration.name} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{integration.icon}</span>
                    <h3 className="font-semibold">{integration.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center py-4">
              <Button variant="ghost" className="text-gray-600">
                Skip integrations - I'll set these up later
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Customize your experience</h2>
              <p className="text-gray-600">Set your preferences and notifications</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Project Updates</p>
                      <p className="text-sm text-gray-600">Get notified when project status changes</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-gray-600">Receive weekly summary emails</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mobile App Notifications</p>
                      <p className="text-sm text-gray-600">Push notifications on your phone</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Download Mobile App</h3>
                    <p className="text-blue-800 text-sm mb-4">
                      Get the ContractPro mobile app for on-site access to your projects, time tracking, and more.
                    </p>
                    <div className="flex gap-3">
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                        iOS App Store
                      </Button>
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                        Google Play
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.companyProfile.industry && onboardingData.companyProfile.employeeCount;
      case 2:
        return true; // Always allow to proceed from project step
      case 3:
        return true; // Always allow to proceed from team step
      case 4:
        return true; // Always allow to proceed from integrations step
      case 5:
        return true; // Always allow to proceed from preferences step
      default:
        return true;
    }
  };

  const progressPercentage = ((currentStep - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Step Complete!</h3>
            <p className="text-gray-600">Great job! Keep going!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                <Building className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">ContractPro Setup</span>
            </div>
            <div className="flex items-center gap-4">
              {isTrialUser && (
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Free Trial Active
                </Badge>
              )}
              <Badge variant="outline" className="px-3 py-1">
                Step {currentStep} of 5
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step.id < currentStep 
                      ? 'bg-green-500 text-white' 
                      : step.id === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-medium text-gray-600 mt-2 text-center max-w-20">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-center text-gray-600 mt-2">
              {Math.round(progressPercentage)}% Complete
            </p>
          </div>

          {/* Main Content */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {renderStepContent()}
              
              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                  disabled={currentStep === 1}
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button
                  onClick={handleStepComplete}
                  disabled={!canProceed()}
                  className={`px-8 ${
                    currentStep === 5 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {currentStep === 5 ? (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need help getting started?</p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" size="sm">
                <PlayCircle className="w-4 h-4 mr-2" />
                Watch Video Guide
              </Button>
              <Button variant="ghost" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
