import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await window.ezsite.apis.getUserInfo();
      if (!response.error) {
        // User is already logged in, redirect to dashboard
        navigate('/admin-dashboard');
      }
    } catch (error) {






      // User is not logged in, stay on login page
    }};const handleInputChange = (field: string, value: string) => {setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await window.ezsite.apis.login({
        email: credentials.email,
        password: credentials.password
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Login successful"
      });

      navigate('/admin-dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both email and password to register",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await window.ezsite.apis.register({
        email: credentials.email,
        password: credentials.password
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account"
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestUsers = async () => {
    setLoading(true);
    try {
      // Create administrator test user
      const adminResponse = await window.ezsite.apis.register({
        email: 'administrator@test.com',
        password: 'admin123'
      });

      // Create contractor test user
      const contractorResponse = await window.ezsite.apis.register({
        email: 'contractor@test.com',
        password: 'contractor123'
      });

      if (!adminResponse.error && !contractorResponse.error) {
        toast({
          title: "Test Users Created",
          description: "Administrator and Contractor test accounts have been created successfully. You can now use the test login credentials.",
          variant: "default"
        });
      } else {
        toast({
          title: "Test Users Already Exist",
          description: "Test user accounts already exist. You can use the test login credentials.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Test user creation error:', error);
      toast({
        title: "Info",
        description: "Test user accounts may already exist. Try using the test login credentials.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-600 mt-2">Construction Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the construction management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@example.com"
                  required />

              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}>

                    {showPassword ?
                    <EyeOff className="h-4 w-4" /> :

                    <Eye className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-500">or</span>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full">

                  Create Admin Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm">

                ← Back to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Login Credentials Section */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">Test Login Credentials</CardTitle>
            <CardDescription className="text-center">
              For easy testing and development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setCredentials({ email: 'administrator@test.com', password: 'admin123' })}>

                <div className="text-left">
                  <div className="font-medium">Administrator</div>
                  <div className="text-sm text-gray-500">administrator@test.com / admin123</div>
                </div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setCredentials({ email: 'contractor@test.com', password: 'contractor123' })}>

                <div className="text-left">
                  <div className="font-medium">Contractor</div>
                  <div className="text-sm text-gray-500">contractor@test.com / contractor123</div>
                </div>
              </Button>
            </div>
            
            <div className="text-xs text-center text-gray-400 pt-2">
              Click any button above to auto-fill login credentials
            </div>
            
            <div className="pt-3 border-t">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={createTestUsers}
                disabled={loading}>
                Create Test Users
              </Button>
              <div className="text-xs text-center text-gray-400 mt-1">
                Click if test credentials don't work
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>For demo purposes, you can use test credentials above or create your own admin account.</p>
        </div>
      </div>
    </div>);

};

export default AdminLogin;