import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'contractor'>('admin');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation for demo
    if (formData.email && formData.password) {
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${userType}!`
      });

      // Store user type in localStorage for demo
      localStorage.setItem('userType', userType);
      localStorage.setItem('isLoggedIn', 'true');

      navigate('/admin/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter valid credentials.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Demo credentials
  const demoCredentials = {
    admin: { email: 'admin@lagunabaydeveloping.com', password: 'admin123' },
    contractor: { email: 'contractor@example.com', password: 'contractor123' }
  };

  const fillDemoCredentials = (type: 'admin' | 'contractor') => {
    setUserType(type);
    setFormData(demoCredentials[type]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group">

          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-heading font-bold text-xl">LB</span>
            </div>
            <CardTitle className="font-heading text-2xl text-gray-900">
              Admin Portal
            </CardTitle>
            <p className="text-gray-600">Sign in to manage projects and invoices</p>
          </CardHeader>

          <CardContent>
            {/* User Type Toggle */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'admin' ?
                'bg-white text-gray-900 shadow-sm' :
                'text-gray-600 hover:text-gray-900'}`
                }>

                Administrator
              </button>
              <button
                type="button"
                onClick={() => setUserType('contractor')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'contractor' ?
                'bg-white text-gray-900 shadow-sm' :
                'text-gray-600 hover:text-gray-900'}`
                }>

                Contractor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-2"
                  placeholder="your.email@example.com" />

              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                    placeholder="Enter your password" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">

                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full luxury-gradient text-white hover:opacity-90 py-3">

                Sign In as {userType === 'admin' ? 'Administrator' : 'Contractor'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-3">Demo Credentials:</p>
              <div className="space-y-2">
                <button
                  onClick={() => fillDemoCredentials('admin')}
                  className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 p-2 bg-white rounded border hover:bg-blue-50 transition-colors">

                  <strong>Admin:</strong> admin@lagunabaydeveloping.com / admin123
                </button>
                <button
                  onClick={() => fillDemoCredentials('contractor')}
                  className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 p-2 bg-white rounded border hover:bg-blue-50 transition-colors">

                  <strong>Contractor:</strong> contractor@example.com / contractor123
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/admin/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-900">

                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default AdminLogin;