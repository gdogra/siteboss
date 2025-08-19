import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  Gift,
  Zap } from
'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

const HomePage: React.FC = () => {
  const { tenant } = useTenant();
  const navigate = useNavigate();

  // Initialize subscription plans on app load
  useEffect(() => {
    const initializePlans = async () => {
      try {
        await window.ezsite.apis.run({
          path: "initializeSubscriptionPlans",
          param: []
        });
      } catch (error) {
        console.warn('Failed to initialize subscription plans:', error);
      }
    };

    initializePlans();
  }, []);

  const features = [
  {
    icon: Building2,
    title: "Project Management",
    description: "Organize and track all your construction projects in one place"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Keep your entire team connected and coordinated"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get insights into project performance and profitability"
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Track work hours and manage labor costs effectively"
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Store and share project documents securely"
  },
  {
    icon: DollarSign,
    title: "Financial Management",
    description: "Handle invoicing, payments, and project budgets"
  }];


  const testimonials = [
  {
    name: "Mike Johnson",
    company: "Johnson Construction",
    quote: "SiteBoss transformed how we manage our projects. We've increased efficiency by 40%.",
    rating: 5
  },
  {
    name: "Sarah Davis",
    company: "Davis & Associates",
    quote: "The best investment we've made. The mobile app keeps our field teams connected.",
    rating: 5
  },
  {
    name: "Tom Wilson",
    company: "Wilson Builders",
    quote: "Customer support is exceptional. They helped us migrate all our data seamlessly.",
    rating: 5
  }];


  const handleStartTrial = () => {
    navigate('/trial-signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {tenant?.name || 'SiteBoss'}
                </h1>
                <p className="text-xs text-muted-foreground">Construction Management Made Simple</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
              <Link to="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link to="#testimonials" className="text-muted-foreground hover:text-foreground">Reviews</Link>
              <Link to="/admin-login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Button onClick={handleStartTrial} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Gift className="w-4 h-4 mr-2" />
                Start Free Trial
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            30-Day Free Trial • No Credit Card Required
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            Construction Management
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 block">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Streamline your construction projects with powerful tools for project management, 
            team collaboration, and business growth. Trusted by thousands of construction professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleStartTrial}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg">

              <Gift className="w-5 h-5 mr-2" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button variant="outline" size="lg" asChild className="px-8 py-3 text-lg">
              <Link to="/get-quote">
                Get Quote
                <Zap className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Manage Construction Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed specifically for construction professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>);

            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted by Construction Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say about SiteBoss
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) =>
            <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) =>
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                  </div>
                  <CardDescription className="text-base italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Construction Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of construction professionals who are already using SiteBoss 
            to manage their projects more efficiently.
          </p>
          
          <Button
            size="lg"
            onClick={handleStartTrial}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg font-semibold">

            <Gift className="w-5 h-5 mr-2" />
            Start Your Free Trial Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-blue-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Mobile App Included</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">SiteBoss</h3>
              </div>
              <p className="text-slate-400">
                The complete construction management solution for modern contractors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/features" className="hover:text-white">Project Management</Link></li>
                <li><Link to="/features" className="hover:text-white">Team Collaboration</Link></li>
                <li><Link to="/features" className="hover:text-white">Time Tracking</Link></li>
                <li><Link to="/features" className="hover:text-white">Financial Management</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SiteBoss. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>);

};

export default HomePage;