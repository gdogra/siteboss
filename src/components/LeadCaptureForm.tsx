import React, { useState } from 'react';
import { useLeads, Lead } from '@/contexts/LeadsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calculator,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface LeadCaptureFormProps {
  title?: string;
  description?: string;
  variant?: 'full' | 'compact' | 'popup';
  onSuccess?: (leadId: string) => void;
  className?: string;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  title = "Get Your Free Construction Estimate",
  description = "Tell us about your project and we'll provide a detailed estimate within 24 hours.",
  variant = 'full',
  onSuccess,
  className
}) => {
  const { addLead } = useLeads();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectType: 'residential_remodel' as Lead['projectType'],
    projectDescription: '',
    estimatedBudget: 0,
    timeline: 'within_3_months' as Lead['timeline'],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    preferredContactMethod: 'email' as Lead['preferredContactMethod'],
    bestContactTime: '',
    agreeToTerms: false,
    source: 'website' as Lead['source']
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const leadId = addLead({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        projectType: formData.projectType,
        projectDescription: formData.projectDescription,
        estimatedBudget: formData.estimatedBudget,
        timeline: formData.timeline,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        preferredContactMethod: formData.preferredContactMethod,
        bestContactTime: formData.bestContactTime,
        source: formData.source,
        status: 'new',
        priority: 'warm',
        estimatedValue: formData.estimatedBudget,
        assignedTo: 'user_001',
        assignedToName: 'John Smith',
        tags: ['website', 'estimate-request'],
        decisionMakers: [`${formData.firstName} ${formData.lastName}`]
      });

      setIsSubmitted(true);
      if (onSuccess) onSuccess(leadId);
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.projectType && formData.projectDescription && formData.estimatedBudget > 0;
      case 3:
        return formData.timeline && formData.agreeToTerms;
      default:
        return false;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            We've received your project information and will contact you within 24 hours with a detailed estimate.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900">What happens next?</p>
            <ul className="text-blue-800 mt-2 space-y-1">
              <li>• We'll review your project details</li>
              <li>• A project manager will contact you to discuss specifics</li>
              <li>• You'll receive a detailed written estimate</li>
              <li>• We'll schedule a site visit if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
          <Input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          <Input
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          <Textarea
            placeholder="Briefly describe your project..."
            value={formData.projectDescription}
            onChange={(e) => handleInputChange('projectDescription', e.target.value)}
            rows={2}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms-compact"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
            />
            <Label htmlFor="terms-compact" className="text-xs">
              I agree to be contacted about my project
            </Label>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={!isStepValid(1) || !formData.projectDescription || !formData.agreeToTerms || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Get Free Estimate'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mt-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {num}
              </div>
              {num < 3 && <div className={`w-8 h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Contact Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="ZIP"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Project Details
            </h3>

            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => handleInputChange('projectType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential_remodel">Residential Remodel</SelectItem>
                  <SelectItem value="commercial_build">Commercial Build</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="addition">Addition</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="custom_home">Custom Home</SelectItem>
                  <SelectItem value="multi_family">Multi-Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectDescription">Project Description *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder="Please describe your project in detail. Include materials, size, specific requirements, etc."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedBudget">Estimated Budget *</Label>
              <Select
                value={formData.estimatedBudget.toString()}
                onValueChange={(value) => handleInputChange('estimatedBudget', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25000">$25,000 - $50,000</SelectItem>
                  <SelectItem value="75000">$50,000 - $100,000</SelectItem>
                  <SelectItem value="150000">$100,000 - $200,000</SelectItem>
                  <SelectItem value="300000">$200,000 - $400,000</SelectItem>
                  <SelectItem value="500000">$400,000 - $600,000</SelectItem>
                  <SelectItem value="750000">$600,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">Project Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter the project address"
              />
            </div>
          </div>
        )}

        {/* Step 3: Timeline & Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Timeline & Preferences
            </h3>

            <div>
              <Label htmlFor="timeline">When would you like to start? *</Label>
              <Select
                value={formData.timeline}
                onValueChange={(value) => handleInputChange('timeline', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediately</SelectItem>
                  <SelectItem value="within_1_month">Within 1 Month</SelectItem>
                  <SelectItem value="within_3_months">Within 3 Months</SelectItem>
                  <SelectItem value="within_6_months">Within 6 Months</SelectItem>
                  <SelectItem value="over_6_months">Over 6 Months</SelectItem>
                  <SelectItem value="planning_stage">Still Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select
                value={formData.preferredContactMethod}
                onValueChange={(value) => handleInputChange('preferredContactMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How would you like us to contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bestContactTime">Best Time to Contact</Label>
              <Input
                id="bestContactTime"
                value={formData.bestContactTime}
                onChange={(e) => handleInputChange('bestContactTime', e.target.value)}
                placeholder="e.g., Weekday mornings, After 6 PM, Weekends"
              />
            </div>

            {/* Project Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Project Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Contact:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Project:</strong> {formData.projectType.replace('_', ' ')}</p>
                <p><strong>Budget:</strong> {formatCurrency(formData.estimatedBudget)}+</p>
                <p><strong>Timeline:</strong> {formData.timeline.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to be contacted about my project and consent to receive communications from SiteBoss. 
                I understand this is not a binding contract.
              </Label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={handleNextStep}
              disabled={!isStepValid(step)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(step) || isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSubmitting ? 'Submitting...' : 'Get My Free Estimate'}
              <Calculator className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCaptureForm;