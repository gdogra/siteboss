import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenant } = useTenant();

  useEffect(() => {
    // Apply tenant branding
    if (tenant?.branding?.login_background) {
      document.body.style.backgroundImage = `url(${tenant.branding.login_background})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }
  }, [tenant]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await window.ezsite.apis.login({ email, password });
      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: `Successfully logged in to ${tenant?.branding?.company_name || 'SiteBoss'}`
      });
      navigate('/admin-dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigate('/admin-dashboard');
    toast({
      title: "Demo Mode",
      description: "You're now using SiteBoss in demo mode"
    });
  };

  const features = [
  {
    icon: Building2,
    title: "Project Management",
    description: "Complete project lifecycle management"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Real-time team coordination tools"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security"
  }];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding and Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{
                  background: tenant?.primary_color ?
                  `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.accent_color || tenant.primary_color})` :
                  'linear-gradient(135deg, #0f172a, #3b82f6)'
                }}>

                {tenant?.logo_url ?
                <img src={tenant.logo_url} alt="Logo" className="w-8 h-8 rounded" /> :

                <Building2 className="w-7 h-7" />
                }
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {tenant?.branding?.company_name || 'SiteBoss'}
                </h1>
                <p className="text-slate-600">
                  {tenant?.branding?.tagline || 'Construction Management Made Simple'}
                </p>
              </div>
            </div>

            <p className="text-lg text-slate-700 leading-relaxed">
              The complete construction management platform that streamlines your projects, 
              empowers your team, and grows your business.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) =>
            <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-slate-900">Free Month Trial</span>
            </div>
            <p className="text-slate-700 text-sm mb-4">
              Get full access to all SiteBoss features for 30 days. No credit card required.
            </p>
            <Link to="/trial-signup">
              <Button variant="outline" className="w-full">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 lg:hidden">
                <div className="flex items-center justify-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{
                      background: tenant?.primary_color ?
                      `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.accent_color || tenant.primary_color})` :
                      'linear-gradient(135deg, #0f172a, #3b82f6)'
                    }}>

                    <Building2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {tenant?.branding?.company_name || 'SiteBoss'}
                  </h2>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to your {tenant?.branding?.company_name || 'SiteBoss'} account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="pl-10 h-12"
                      required />

                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12"
                      required />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 px-3"
                      onClick={() => setShowPassword(!showPassword)}>

                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300" />

                    <Label htmlFor="remember" className="text-sm text-slate-600">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium">

                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                  disabled={loading}>

                  {loading ?
                  <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div> :

                  <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  }
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleDemoLogin}>

                <Zap className="w-4 h-4 mr-2 text-amber-500" />
                Try Demo
              </Button>

              <div className="text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/trial-signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Start free trial
                </Link>
              </div>

              <div className="text-center">
                <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
                  ← Back to homepage
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-xs text-slate-500">
            © 2024 {tenant?.branding?.company_name || 'SiteBoss'}. All rights reserved.
          </div>
        </div>
      </div>
    </div>);

};

export default AdminLogin;