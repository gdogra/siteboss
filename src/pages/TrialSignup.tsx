import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle,
  Shield,
  Gift,
  ArrowRight,
  Sparkles,
  Crown,
  AlertCircle } from
'lucide-react';

const TrialSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    jobTitle: '',
    companySize: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (step === 2) {
      if (!formData.company.trim()) newErrors.company = 'Company name is required';
      if (!formData.companySize) newErrors.companySize = 'Company size is required';
    } else if (step === 3) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Register user first
      const { error: registerError } = await window.ezsite.apis.register({
        email: formData.email,
        password: formData.password
      });

      if (registerError) {
        throw new Error(registerError);
      }

      // Get user info after registration
      const { data: userInfo, error: userInfoError } = await window.ezsite.apis.getUserInfo();
      if (userInfoError) {
        throw new Error('Failed to get user information: ' + userInfoError);
      }

      if (!userInfo || !userInfo.ID) {
        throw new Error('User not found after registration');
      }

      const userId = userInfo.ID;
      const now = new Date().toISOString();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);
      const trialEnd = trialEndDate.toISOString();

      // Find the Professional plan
      const { data: plansData, error: plansError } = await window.ezsite.apis.tablePage('35510', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: true,
        Filters: [{ name: 'plan_code', op: 'Equal', value: 'professional' }]
      });

      let planId = 2; // Default fallback
      if (plansData && plansData.List && plansData.List.length > 0) {
        planId = plansData.List[0].id;
      }

      // Create trial management record
      const { error: trialError } = await window.ezsite.apis.tableCreate('35515', {
        user_id: userId,
        plan_id: planId,
        trial_type: 'free',
        source: 'signup',
        start_date: now,
        end_date: trialEnd,
        status: 'active',
        days_remaining: 30,
        extended_days: 0,
        converted_to_paid: false,
        created_at: now,
        updated_at: now
      });

      if (trialError) {
        throw new Error('Failed to create trial record: ' + trialError);
      }

      // Create user subscription record
      const { error: subscriptionError } = await window.ezsite.apis.tableCreate('35511', {
        user_id: userId,
        plan_id: planId,
        status: 'trial',
        is_trial: true,
        start_date: now,
        trial_start: now,
        trial_end: trialEnd,
        amount: 0,
        currency: 'USD',
        created_at: now,
        updated_at: now
      });

      if (subscriptionError) {
        throw new Error('Failed to create subscription record: ' + subscriptionError);
      }

      // Create user trials tracking record
      const { error: userTrialError } = await window.ezsite.apis.tableCreate('35522', {
        user_id: userId,
        trial_plan_id: planId,
        trial_length_days: 30,
        features_used: JSON.stringify([]),
        onboarding_completed: false,
        signup_source: 'trial_page',
        engagement_score: 0,
        onboarding_progress: 0,
        conversion_probability: 0.3,
        follow_up_emails_sent: 0,
        last_activity_date: now,
        created_at: now,
        updated_at: now
      });

      if (userTrialError) {
        console.warn('Failed to create user trial record:', userTrialError);
        // Don't throw error for this non-critical record
      }

      toast({
        title: "Welcome to SiteBoss!",
        description: "Your free trial has started. Check your email for next steps."
      });

      // Redirect to verification page
      navigate('/onauthsuccess');

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const features = [
  "30-day free trial",
  "No credit card required",
  "Full feature access",
  "Unlimited projects",
  "Team collaboration",
  "Mobile app access",
  "24/7 support",
  "Cancel anytime"];


  const plans = [
  {
    name: "Starter",
    price: "$49",
    originalPrice: "$59",
    popular: false,
    features: [
    "Up to 5 projects",
    "10 team members",
    "5GB storage",
    "Basic support"]

  },
  {
    name: "Professional",
    price: "$99",
    originalPrice: "$119",
    popular: true,
    features: [
    "Unlimited projects",
    "25 team members",
    "25GB storage",
    "Priority support",
    "Advanced analytics",
    "Custom branding"]

  },
  {
    name: "Enterprise",
    price: "$199",
    originalPrice: "$239",
    popular: false,
    features: [
    "Unlimited everything",
    "Unlimited members",
    "Unlimited storage",
    "24/7 phone support",
    "White-label solution",
    "API access"]

  }];


  const renderError = (fieldName: string) => {
    if (errors[fieldName]) {
      return (
        <div className="flex items-center text-red-500 text-sm mt-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[fieldName]}
        </div>);

    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SiteBoss</h1>
                <p className="text-xs text-muted-foreground">Construction Management Made Simple</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Already have an account?</span>
              <Link to="/admin-login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20">
              <Gift className="w-4 h-4 mr-2" />
              Free Month Trial • No Credit Card Required
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Start Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                {" "}Free Month{" "}
              </span>
              Today
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of construction professionals who trust SiteBoss to manage 
              their projects efficiently and profitably. Get full access for 30 days, completely free.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              
              {/* Trial Features */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span>What's Included in Your Free Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature, index) =>
                    <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Preview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span>Choose Your Plan After Trial</span>
                  </CardTitle>
                  <CardDescription>
                    All plans include a 20% annual billing discount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.map((plan, index) =>
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${plan.popular ? 'border-primary bg-primary/5' : 'border-border'}`}>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-foreground">{plan.name}</h4>
                            {plan.popular &&
                          <Badge className="bg-blue-500 text-white text-xs">Most Popular</Badge>
                          }
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline space-x-1">
                              <span className="text-lg font-bold text-foreground">{plan.price}</span>
                              <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                              <span className="text-sm text-muted-foreground">/month</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.slice(0, 3).map((feature, fIndex) =>
                        <span key={fIndex} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {feature}
                            </span>
                        )}
                          {plan.features.length > 3 &&
                        <span className="text-xs text-slate-500">
                              +{plan.features.length - 3} more
                            </span>
                        }
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Signup Form */}
            <Card className="border-0 shadow-2xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Create Your Free Account
                </CardTitle>
                <CardDescription className="text-center">
                  Step {currentStep} of 3 • Takes less than 2 minutes
                </CardDescription>
                
                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-2 mt-4">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentStep / 3 * 100}%` }}>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 &&
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="John"
                            className="pl-10"
                            required />

                          </div>
                          {renderError('firstName')}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Doe"
                          required />

                          {renderError('lastName')}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Work Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john@company.com"
                          className="pl-10"
                          required />

                        </div>
                        {renderError('email')}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="pl-10"
                          required />

                        </div>
                        {renderError('phone')}
                      </div>

                      <Button type="button" onClick={nextStep} className="w-full">
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  }

                  {/* Step 2: Company Information */}
                  {currentStep === 2 &&
                  <div className="space-y-4">
                      <div>
                        <Label htmlFor="company">Company Name *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="ABC Construction Co."
                          className="pl-10"
                          required />

                        </div>
                        {renderError('company')}
                      </div>

                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Project Manager" />

                      </div>

                      <div>
                        <Label htmlFor="companySize">Company Size *</Label>
                        <select
                        id="companySize"
                        value={formData.companySize}
                        onChange={(e) => handleInputChange('companySize', e.target.value)}
                        className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                        required>

                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201+">201+ employees</option>
                        </select>
                        {renderError('companySize')}
                      </div>

                      <div className="flex space-x-3">
                        <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep} className="flex-1">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  }

                  {/* Step 3: Security & Terms */}
                  {currentStep === 3 &&
                  <div className="space-y-4">
                      <div>
                        <Label htmlFor="password">Create Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="••••••••"
                          className="pl-10"
                          required
                          minLength={8} />

                        </div>
                        {renderError('password')}
                        <p className="text-xs text-slate-500 mt-1">
                          Minimum 8 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="••••••••"
                          className="pl-10"
                          required />

                        </div>
                        {renderError('confirmPassword')}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)} />

                          <Label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                            I agree to the{' '}
                            <Link to="/terms" className="text-blue-600 hover:underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-blue-600 hover:underline">
                              Privacy Policy
                            </Link>
                          </Label>
                        </div>
                        {renderError('agreeToTerms')}

                        <div className="flex items-start space-x-2">
                          <Checkbox
                          id="newsletter"
                          checked={formData.subscribeNewsletter}
                          onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', !!checked)} />

                          <Label htmlFor="newsletter" className="text-sm text-slate-600">
                            Subscribe to SiteBoss updates and construction industry insights
                          </Label>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                          Back
                        </Button>
                        <Button
                        type="submit"
                        disabled={loading || !formData.agreeToTerms}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">

                          {loading ?
                        <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Creating account...</span>
                            </div> :

                        <>
                              Start Free Trial
                              <Sparkles className="w-4 h-4 ml-2" />
                            </>
                        }
                        </Button>
                      </div>
                    </div>
                  }
                </form>

                <div className="text-center mt-6 text-xs text-slate-500">
                  <p className="flex items-center justify-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Your data is secure and encrypted</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);

};

export default TrialSignup;