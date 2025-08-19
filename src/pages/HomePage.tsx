import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Clock, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Palette
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Project Management",
      description: "Streamline your construction projects from start to finish with comprehensive tracking and management tools."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Connect your entire team with real-time communication, task assignments, and progress updates."
    },
    {
      icon: FileText,
      title: "Document Control",
      description: "Centralize all project documents, contracts, and permits with version control and easy access."
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track expenses, manage invoices, and monitor project profitability with integrated accounting tools."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Make data-driven decisions with comprehensive analytics and customizable reporting dashboards."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Monitor labor hours, track productivity, and ensure accurate payroll with GPS-enabled time tracking."
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small construction teams",
      features: [
        "Up to 5 projects",
        "10 team members",
        "Basic reporting",
        "Document storage (5GB)",
        "Mobile app access",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Ideal for growing construction companies",
      features: [
        "Unlimited projects",
        "25 team members",
        "Advanced analytics",
        "Document storage (25GB)",
        "GPS time tracking",
        "Priority support",
        "API access",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large construction organizations",
      features: [
        "Unlimited everything",
        "Unlimited team members",
        "White-label solution",
        "Unlimited storage",
        "Advanced integrations",
        "24/7 phone support",
        "Custom development",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Mike Johnson",
      company: "Johnson Construction Co.",
      rating: 5,
      text: "SiteBoss transformed how we manage our construction projects. The real-time collaboration features alone saved us hours every week."
    },
    {
      name: "Sarah Williams",
      company: "Elite Builders",
      rating: 5,
      text: "The time tracking and GPS features ensure our crews are productive and accountable. ROI was immediate."
    },
    {
      name: "David Chen",
      company: "Metro Development",
      rating: 5,
      text: "Finally, a construction management platform that understands our industry. The document control is game-changing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {tenant?.branding?.company_name || 'SiteBoss'}
                </h1>
                <p className="text-sm text-slate-600">
                  {tenant?.branding?.tagline || 'Construction Management Made Simple'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin-login')}
                className="text-slate-600 hover:text-slate-900"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/trial-signup')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Zap className="w-4 h-4 mr-2" />
              New: Multi-Tenant & White-Label Solutions Available
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Build Smarter with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}SiteBoss
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The all-in-one construction management platform that streamlines your projects, 
              empowers your team, and grows your business. From permits to payroll, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/trial-signup')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
              >
                Start Your Free Month
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/admin-login')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg"
              >
                View Demo
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              ✨ No credit card required • Full access for 30 days • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Construction Projects
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From project planning to final delivery, SiteBoss provides all the tools 
              your construction business needs to succeed in one integrated platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your business. Start with a free month and upgrade as you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative border-0 shadow-lg ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-slate-900">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate('/trial-signup')}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Trusted by Construction Professionals
            </h3>
            <p className="text-xl text-slate-600">
              See what our customers are saying about SiteBoss
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">
            Ready to Transform Your Construction Business?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of construction professionals who trust SiteBoss to manage 
            their projects efficiently and profitably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate('/trial-signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Start Your Free Month Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
                <h4 className="text-xl font-bold">SiteBoss</h4>
              </div>
              <p className="text-slate-400">
                Construction management made simple. Build smarter, grow faster.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SiteBoss. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;