import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CheckCircle,
  ArrowLeft,
  Mail,
  User,
  Phone,
  Building,
  CreditCard
} from 'lucide-react';

const TrialSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { createAccount } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    projectVolume: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user account based on form data
      const success = await createAccount(formData);
      
      if (success) {
        // Show success message
        alert(`Welcome ${formData.firstName}! Your trial account has been created.`);
        
        // Navigate to dashboard
        navigate('/');
      } else {
        alert('Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SiteBoss</span>
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
            🎉 30-Day Free Trial
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Free SiteBoss Trial
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get full access to enterprise construction management features. 
            No credit card required, cancel anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sign Up Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Fill out the form below to get started with your free trial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="projectVolume">Annual Project Volume</Label>
                  <select 
                    id="projectVolume"
                    name="projectVolume"
                    value={formData.projectVolume}
                    onChange={(e) => setFormData({...formData, projectVolume: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select range</option>
                    <option value="under-1m">Under $1M</option>
                    <option value="1m-5m">$1M - $5M</option>
                    <option value="5m-25m">$5M - $25M</option>
                    <option value="25m-100m">$25M - $100M</option>
                    <option value="over-100m">Over $100M</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={loading}
                >
                  {loading ? 'Setting up your account...' : 'Start Free Trial'}
                </Button>

                <p className="text-sm text-gray-600 text-center">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Project Management</div>
                    <div className="text-sm text-gray-600">Gantt charts, task dependencies, milestone tracking</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Financial Management</div>
                    <div className="text-sm text-gray-600">Budget tracking, cost codes, change orders</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Team Collaboration</div>
                    <div className="text-sm text-gray-600">Real-time updates, document sharing, messaging</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Mobile App</div>
                    <div className="text-sm text-gray-600">iOS/Android apps, offline sync, photo capture</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Unlimited Users</div>
                    <div className="text-sm text-gray-600">Add your entire team at no extra cost</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">24/7 Support</div>
                    <div className="text-sm text-gray-600">Phone, email, and chat support included</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    $0 for 30 Days
                  </div>
                  <div className="text-sm text-green-600 mb-4">
                    Then starting at $49/month
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialSignupPage;