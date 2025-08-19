
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const WebformIntake: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    projectType: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required fields.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await window.ezsite.apis.run({
        path: "processWebformLead",
        param: [
          {
            ...formData,
            source: 'website'
          },
          null // signature - not implemented for demo
        ]
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit lead:', error);
      alert('Failed to submit your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">
            Your information has been submitted successfully. Our team will contact you within 24 hours to discuss your project.
          </p>
          <Button onClick={() => {
            setSubmitted(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              company: '',
              address: '',
              projectType: '',
              description: '',
              budgetMin: '',
              budgetMax: '',
              notes: ''
            });
          }}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Get a Free Project Quote</CardTitle>
        <p className="text-gray-600">
          Tell us about your project and we'll provide you with a detailed quote within 24 hours.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Project Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Street address, city, state, zip"
              />
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Information</h3>
            
            <div>
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={formData.projectType} onValueChange={(value) => handleChange('projectType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential Construction</SelectItem>
                  <SelectItem value="commercial">Commercial Construction</SelectItem>
                  <SelectItem value="industrial">Industrial Construction</SelectItem>
                  <SelectItem value="renovation">Renovation/Remodeling</SelectItem>
                  <SelectItem value="maintenance">Maintenance & Repair</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                placeholder="Please describe your project in detail..."
              />
            </div>
            
            <div>
              <Label className="text-base font-medium">Estimated Budget Range (Optional)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="budgetMin" className="text-sm">From ($)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    min="0"
                    value={formData.budgetMin}
                    onChange={(e) => handleChange('budgetMin', e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="budgetMax" className="text-sm">To ($)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    min="0"
                    value={formData.budgetMax}
                    onChange={(e) => handleChange('budgetMax', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Any specific requirements, timeline, or questions?"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Get My Free Quote'}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              By submitting this form, you agree to be contacted about your project. We respect your privacy.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WebformIntake;
