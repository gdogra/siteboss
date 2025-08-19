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
  MapPin,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Users,
  Crown,
  Gift,
  ArrowRight,
  Sparkles } from
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both password fields match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Register user
      const { error } = await window.ezsite.apis.register({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Start free trial
      await window.ezsite.apis.run({
        path: "activateFreeTrial",
        param: [{
          email: formData.email,
          company: formData.company,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          companySize: formData.companySize,
          plan: 'professional',
          trialDays: 30
        }]
      });

      toast({
        title: "Welcome to SiteBoss!",
        description: "Your free trial has started. Check your email for next steps."
      });

      // Redirect to verification page
      navigate('/onauthsuccess');

    } catch (error) {
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
    if (currentStep < 3) {
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SiteBoss</h1>
                <p className="text-xs text-slate-600">Construction Management Made Simple</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Already have an account?</span>
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
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
              <Gift className="w-4 h-4 mr-2" />
              Free Month Trial • No Credit Card Required
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Start Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}Free Month{" "}
              </span>
              Today
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
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
                        <span className="text-sm text-slate-600">{feature}</span>
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
                      className={`p-4 border rounded-lg ${plan.popular ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                            {plan.popular &&
                          <Badge className="bg-blue-500 text-white text-xs">Most Popular</Badge>
                          }
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline space-x-1">
                              <span className="text-lg font-bold text-slate-900">{plan.price}</span>
                              <span className="text-sm text-slate-500 line-through">{plan.originalPrice}</span>
                              <span className="text-sm text-slate-600">/month</span>
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
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
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
                          <Label htmlFor="firstName">First Name</Label>
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
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Doe"
                          required />

                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Work Email</Label>
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
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="pl-10" />

                        </div>
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
                        <Label htmlFor="company">Company Name</Label>
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
                        <Label htmlFor="companySize">Company Size</Label>
                        <select
                        id="companySize"
                        value={formData.companySize}
                        onChange={(e) => handleInputChange('companySize', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md"
                        required>

                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201+">201+ employees</option>
                        </select>
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
                        <Label htmlFor="password">Create Password</Label>
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
                        <p className="text-xs text-slate-500 mt-1">
                          Minimum 8 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                          id="terms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)} />

                          <Label htmlFor="terms" className="text-sm text-slate-600">
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

                        <div className="flex items-center space-x-2">
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