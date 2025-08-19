
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Rocket,
  CheckCircle,
  Building2,
  Mail,
  User,
  Phone,
  MapPin,
  Star,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Sparkles } from
'lucide-react';

const TrialSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    companySize: '',
    currentSoftware: '',
    primaryChallenge: '',
    agreeToTerms: false,
    subscribeToUpdates: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const companySizes = [
  '1-5 employees',
  '6-20 employees',
  '21-50 employees',
  '51-100 employees',
  '100+ employees'];


  const primaryChallenges = [
  'Project management and tracking',
  'Invoice and payment processing',
  'Team communication',
  'Document management',
  'Cost tracking and budgeting',
  'Client communication',
  'Scheduling and timelines',
  'Quality control'];


  const trialBenefits = [
  { icon: CheckCircle, text: 'Full access to all features for 30 days' },
  { icon: Shield, text: 'No credit card required' },
  { icon: Zap, text: 'Setup completed in under 5 minutes' },
  { icon: Clock, text: 'Cancel anytime with one click' },
  { icon: Star, text: 'Dedicated onboarding support' },
  { icon: Mail, text: 'Personalized training resources' }];


  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.email && formData.company;
      case 2:
        return formData.companySize && formData.primaryChallenge;
      case 3:
        return formData.agreeToTerms;
      default:
        return true;
    }
  };

  const activateFreeTrial = async () => {
    try {
      setIsLoading(true);

      // Register the user
      const { error: registerError } = await window.ezsite.apis.register({
        email: formData.email,
        password: generateTempPassword(),
        name: formData.name
      });

      if (registerError) {
        throw new Error(registerError);
      }

      // Get user info after registration
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw new Error(userError);

      // Create trial record
      const trialData = {
        user_id: userInfo.ID,
        trial_status: 'active',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        plan_name: 'Professional Trial',
        company_name: formData.company,
        company_size: formData.companySize,
        phone: formData.phone,
        current_software: formData.currentSoftware,
        primary_challenge: formData.primaryChallenge,
        utm_source: searchParams.get('utm_source') || 'direct',
        utm_campaign: searchParams.get('utm_campaign') || 'trial_signup'
      };

      const { error: trialError } = await window.ezsite.apis.tableCreate(35522, trialData);
      if (trialError) throw new Error(trialError);

      // Create onboarding progress record
      const onboardingData = {
        user_id: userInfo.ID,
        current_step: 1,
        total_steps: 5,
        completed_steps: JSON.stringify([]),
        progress_percentage: 0,
        onboarding_status: 'started',
        started_at: new Date().toISOString()
      };

      const { error: onboardingError } = await window.ezsite.apis.tableCreate(35524, onboardingData);
      if (onboardingError) console.error('Error creating onboarding record:', onboardingError);

      // Send welcome email
      await sendWelcomeEmail(userInfo);

      // Schedule trial emails
      await scheduleTrialEmails(userInfo.ID);

      toast({
        title: "🎉 Welcome to ContractPro!",
        description: "Your 30-day free trial is now active. Let's get you set up!",
        duration: 5000
      });

      // Redirect to onboarding
      navigate('/onboarding?step=1&trial=true');

    } catch (error: any) {
      console.error('Trial activation error:', error);
      toast({
        title: "Trial Activation Failed",
        description: error.message || "There was an error starting your trial. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
  };

  const sendWelcomeEmail = async (userInfo: any) => {
    try {
      await window.ezsite.apis.sendEmail({
        to: [userInfo.Email],
        subject: "🚀 Welcome to ContractPro - Your Free Trial Starts Now!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to ContractPro!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your 30-day free trial is now active</p>
            </div>
            
            <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
              <p>Hi ${userInfo.Name},</p>
              
              <p>Congratulations! Your ContractPro trial is ready to use. Here's what you get for the next 30 days:</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">✅ Full Access Includes:</h3>
                <ul style="color: #374151; line-height: 1.6;">
                  <li>Unlimited projects and team members</li>
                  <li>AI-powered project insights</li>
                  <li>Advanced reporting and analytics</li>
                  <li>Mobile app with offline capabilities</li>
                  <li>Invoice automation and payment processing</li>
                  <li>Document management and storage</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/onboarding?step=1" 
                   style="background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Start Your Onboarding Journey →
                </a>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ol style="color: #374151; line-height: 1.6;">
                <li>Complete your 5-minute onboarding</li>
                <li>Import your first project</li>
                <li>Invite your team members</li>
                <li>Explore our mobile app</li>
              </ol>
              
              <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #047857; margin: 0;"><strong>💡 Pro Tip:</strong> Check your email over the next few days for personalized tips and best practices from our customer success team.</p>
              </div>
              
              <p>Questions? Reply to this email or call us at (949) 555-WAVE. We're here to help!</p>
              
              <p>Welcome to the team,<br>
              <strong>The ContractPro Team</strong></p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  const scheduleTrialEmails = async (userId: number) => {
    try {
      const emailSequences = [
      {
        user_id: userId,
        sequence_name: 'trial_onboarding',
        email_type: 'onboarding_tips',
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Day 1
        subject: 'Quick Setup Tips - Get the Most from ContractPro',
        status: 'scheduled'
      },
      {
        user_id: userId,
        sequence_name: 'trial_onboarding',
        email_type: 'feature_highlight',
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Day 3
        subject: 'Discover: AI-Powered Project Insights',
        status: 'scheduled'
      },
      {
        user_id: userId,
        sequence_name: 'trial_onboarding',
        email_type: 'success_story',
        scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Day 7
        subject: 'How Metro Construction Saved $50K in 3 Months',
        status: 'scheduled'
      },
      {
        user_id: userId,
        sequence_name: 'trial_onboarding',
        email_type: 'mid_trial_check',
        scheduled_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Day 14
        subject: 'How\'s your trial going? Let\'s optimize your setup',
        status: 'scheduled'
      },
      {
        user_id: userId,
        sequence_name: 'trial_onboarding',
        email_type: 'upgrade_reminder',
        scheduled_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), // Day 23
        subject: '7 Days Left - Secure Your ContractPro Discount',
        status: 'scheduled'
      },
      {
        user_id: userId,
        sequence_name: 'trial_onboarding',
        email_type: 'final_reminder',
        scheduled_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(), // Day 29
        subject: 'Last Chance - Your Trial Expires Tomorrow',
        status: 'scheduled'
      }];


      for (const email of emailSequences) {
        await window.ezsite.apis.tableCreate(35525, email);
      }
    } catch (error) {
      console.error('Error scheduling trial emails:', error);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast({
        title: "Please complete all fields",
        description: "All fields in this step are required to continue.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-2">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">ContractPro</span>
            </div>
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              30-Day Free Trial
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                {[1, 2, 3].map((i) =>
                <React.Fragment key={i}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  i <= step ?
                  'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-600'}`
                  }>
                      {i < step ? <CheckCircle className="w-5 h-5" /> : i}
                    </div>
                    {i < 3 &&
                  <div className={`w-16 h-2 mx-2 rounded-full ${
                  i < step ? 'bg-blue-600' : 'bg-gray-200'}`
                  } />
                  }
                  </React.Fragment>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Step {step} of 3</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-6">
                  <div className="text-center">
                    <CardTitle className="text-3xl font-bold mb-2">
                      {step === 1 && "Let's get started!"}
                      {step === 2 && "Tell us about your business"}
                      {step === 3 && "You're almost ready!"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {step === 1 && "Create your free ContractPro account"}
                      {step === 2 && "This helps us customize your experience"}
                      {step === 3 && "Review and activate your trial"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {step === 1 &&
                  <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
                          <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="mt-2 h-12"
                          placeholder="John Smith" />

                        </div>
                        <div>
                          <Label htmlFor="email" className="text-base font-medium">Work Email *</Label>
                          <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-2 h-12"
                          placeholder="john@company.com" />

                        </div>
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-base font-medium">Company Name *</Label>
                        <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="mt-2 h-12"
                        placeholder="Acme Construction Co." />

                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">Phone Number (Optional)</Label>
                        <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-2 h-12"
                        placeholder="(555) 123-4567" />

                      </div>
                    </>
                  }

                  {step === 2 &&
                  <>
                      <div>
                        <Label className="text-base font-medium">Company Size *</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          {companySizes.map((size) =>
                        <Button
                          key={size}
                          variant={formData.companySize === size ? "default" : "outline"}
                          className={`justify-start h-12 ${
                          formData.companySize === size ?
                          "bg-blue-600 hover:bg-blue-700" :
                          "hover:bg-blue-50"}`
                          }
                          onClick={() => handleInputChange('companySize', size)}>

                              <User className="w-4 h-4 mr-2" />
                              {size}
                            </Button>
                        )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">What's your biggest challenge right now? *</Label>
                        <div className="space-y-2 mt-3">
                          {primaryChallenges.map((challenge) =>
                        <Button
                          key={challenge}
                          variant={formData.primaryChallenge === challenge ? "default" : "outline"}
                          className={`w-full justify-start h-auto p-4 ${
                          formData.primaryChallenge === challenge ?
                          "bg-blue-600 hover:bg-blue-700" :
                          "hover:bg-blue-50"}`
                          }
                          onClick={() => handleInputChange('primaryChallenge', challenge)}>

                              {challenge}
                            </Button>
                        )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="currentSoftware" className="text-base font-medium">
                          Current Software (Optional)
                        </Label>
                        <Input
                        id="currentSoftware"
                        value={formData.currentSoftware}
                        onChange={(e) => handleInputChange('currentSoftware', e.target.value)}
                        className="mt-2 h-12"
                        placeholder="Excel, QuickBooks, etc." />

                      </div>
                    </>
                  }

                  {step === 3 &&
                  <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-4 text-blue-900">
                          Your 30-Day Free Trial Includes:
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {trialBenefits.map((benefit, index) => {
                          const IconComponent = benefit.icon;
                          return (
                            <div key={index} className="flex items-center gap-3">
                                <IconComponent className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{benefit.text}</span>
                              </div>);

                        })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                          className="mt-1" />

                          <Label htmlFor="terms" className="text-sm leading-5">
                            I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                          </Label>
                        </div>

                        <div className="flex items-start gap-3">
                          <Checkbox
                          id="updates"
                          checked={formData.subscribeToUpdates}
                          onCheckedChange={(checked) => handleInputChange('subscribeToUpdates', checked)}
                          className="mt-1" />

                          <Label htmlFor="updates" className="text-sm leading-5">
                            Send me helpful tips, best practices, and product updates (recommended)
                          </Label>
                        </div>
                      </div>
                    </div>
                  }

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                      className="px-8">

                      Previous
                    </Button>

                    {step < 3 ?
                    <Button
                      onClick={nextStep}
                      disabled={!validateStep(step)}
                      className="px-8 bg-blue-600 hover:bg-blue-700">

                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button> :

                    <Button
                      onClick={activateFreeTrial}
                      disabled={!validateStep(step) || isLoading}
                      className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">

                        {isLoading ?
                      <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Activating Trial...
                          </> :

                      <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Start My Free Trial
                          </>
                      }
                      </Button>
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-8">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">30-Day Free Trial</CardTitle>
                  <CardDescription>Everything you need to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">No credit card required</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Cancel anytime</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Setup support included</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">What happens next?</h4>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <span>Account activated instantly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <span>5-minute guided onboarding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <span>Import your first project</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                        <span>Start saving time & money</span>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default TrialSignup;