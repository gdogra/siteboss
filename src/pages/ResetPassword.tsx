import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive"
      });
      navigate('/admin-login');
    }
  }, [token, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.password || !passwords.confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter both password fields",
        variant: "destructive"
      });
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwords.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await window.ezsite.apis.resetPassword({
        token: token!,
        password: passwords.password
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSuccess(true);
      toast({
        title: "Success",
        description: "Password reset successfully"
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin-login');
      }, 3000);

    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Password Reset Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button onClick={() => navigate('/admin-login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Please enter a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6} />

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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6} />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>

                    {showConfirmPassword ?
                    <EyeOff className="h-4 w-4" /> :

                    <Eye className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/admin-login')}
                className="text-sm">

                ← Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default ResetPassword;