
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  FileText,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Waves,
  Star,
  Zap,
  Globe,
  BarChart3,
  Smartphone,
  Brain,
  Timer,
  DollarSign,
  PlayCircle,
  Award,
  Sparkles,
  TrendingUp,
  Target,
  Rocket
} from 'lucide-react';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadPricingPlans();
  }, []);

  const loadPricingPlans = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35521, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: "monthly_price",
        IsAsc: true,
        Filters: [{ name: "is_active", op: "Equal", value: true }]
      });
      
      if (!error && data?.List) {
        setPricingPlans(data.List.map(plan => ({
          ...plan,
          features: JSON.parse(plan.features || '[]')
        })));
      } else {
        // Fallback pricing if no plans in database
        setPricingPlans([
          {
            id: 1,
            plan_name: 'Starter',
            monthly_price: 49,
            annual_price: 490,
            is_popular: false,
            features: [
              'Up to 5 projects',
              'Basic invoice management',
              'Document storage (5GB)',
              'Email support',
              'Mobile app access',
              'Basic reporting'
            ]
          },
          {
            id: 2,
            plan_name: 'Professional',
            monthly_price: 149,
            annual_price: 1490,
            is_popular: true,
            features: [
              'Unlimited projects',
              'Advanced invoice automation',
              'Document storage (100GB)',
              'Priority support',
              'Team collaboration',
              'Advanced reporting & analytics',
              'AI-powered insights',
              'GPS time tracking',
              'Custom workflows',
              'Integration with QuickBooks'
            ]
          },
          {
            id: 3,
            plan_name: 'Enterprise',
            monthly_price: 299,
            annual_price: 2990,
            is_popular: false,
            features: [
              'Everything in Professional',
              'Unlimited storage',
              'White-label options',
              'Dedicated account manager',
              '24/7 phone support',
              'Custom integrations',
              'Advanced security features',
              'Multi-company management',
              'Custom training',
              'API access'
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading pricing plans:', error);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Machine learning algorithms predict project risks, optimize schedules, and identify cost savings automatically.',
      metric: '$47K average monthly savings',
      color: 'from-purple-600 to-pink-600',
      stats: '94% accuracy in predictions'
    },
    {
      icon: Building2,
      title: 'Project Management',
      description: 'Complete project lifecycle management with real-time tracking, automated workflows, and team collaboration.',
      metric: '40% faster completion',
      color: 'from-blue-600 to-cyan-600',
      stats: '10K+ projects completed'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Data-driven insights with predictive analytics, cost optimization, and performance benchmarking.',
      metric: '34% profit increase',
      color: 'from-green-600 to-emerald-600',
      stats: 'Real-time dashboards'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Native iOS and Android apps with offline capabilities, GPS tracking, and field data collection.',
      metric: '24/7 field access',
      color: 'from-orange-600 to-red-600',
      stats: '99.9% uptime SLA'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC 2 compliance, encrypted data, and role-based access controls.',
      metric: 'SOC 2 Type II certified',
      color: 'from-indigo-600 to-purple-600',
      stats: '256-bit encryption'
    },
    {
      icon: Zap,
      title: 'Automation Engine',
      description: 'Automate invoicing, approvals, notifications, and workflows to eliminate manual tasks.',
      metric: '87% time savings',
      color: 'from-yellow-600 to-orange-600',
      stats: '500+ automation rules'
    }
  ];

  const benefits = [
    { icon: DollarSign, text: 'Save $47,000+ monthly through AI optimization', value: '$47K+' },
    { icon: Timer, text: '40% faster project completion rates', value: '40%' },
    { icon: TrendingUp, text: '34% increase in profit margins', value: '34%' },
    { icon: Shield, text: 'Enterprise-grade security and compliance', value: '100%' },
    { icon: Globe, text: 'Cloud-native with 99.9% uptime SLA', value: '99.9%' },
    { icon: Target, text: '24% lead conversion rate (industry-leading)', value: '24%' }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Project Manager",
      company: "Coastal Construction",
      content: "ContractPro transformed our operations completely. We're completing projects 40% faster and our profit margins have increased by 23%. The AI insights alone save us thousands every month.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1708962188322-0e9a5e40c101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MTg3MTl8MHwxfHNlYXJjaHwxfHxBJTIwY3JvcHBlZCUyMGltYWdlJTIwb2YlMjBhJTIwcGVyc29uJTJDJTIwZm9jdXNpbmclMjBvbiUyMHRoZWlyJTIwZmFjZSUyQyUyMHdpdGglMjBhJTIwbmF0dXJhbCUyMGJhY2tncm91bmQufGVufDB8fHx8MTc1NTU0ODUxMXww&ixlib=rb-4.1.0&q=80&w=200$w=150"
    },
    {
      name: "Mike Rodriguez",
      role: "CEO",
      company: "Rodriguez Building Group",
      content: "Best investment we've made in our business. The platform paid for itself within the first month. Our team loves the mobile app and the automation features are incredible.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Jennifer Chen",
      role: "Operations Director",
      company: "Metro Contractors",
      content: "Finally, a construction platform that actually understands our industry. The customer support is phenomenal and the features keep getting better every month.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Contractors', icon: Users },
    { value: '34%', label: 'Average Profit Increase', icon: TrendingUp },
    { value: '$47K', label: 'Monthly Savings', icon: DollarSign },
    { value: '99.9%', label: 'Uptime SLA', icon: Globe }
  ];

  const startFreeTrial = () => {
    window.location.href = `/trial-signup?utm_source=homepage&utm_campaign=free_trial`;
  };

  const watchDemo = () => {
    setIsVideoPlaying(true);
    // In a real implementation, you would open a modal with the demo video
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <Waves className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">ContractPro</h1>
                <p className="text-xs text-gray-600 -mt-1">Construction Management</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Reviews</a>
              <Link to="/client/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Button onClick={startFreeTrial} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                Start Free Trial
              </Button>
            </nav>
            <div className="md:hidden flex items-center gap-2">
              <Link to="/client/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Button onClick={startFreeTrial} size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500">
                Try Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-6 text-blue-700 bg-blue-100 px-6 py-3 text-base font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Join 10,000+ contractors who increased profits by 34%
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Construction Management
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              AI-powered platform that helps construction companies complete projects 
              <strong className="text-blue-600"> 40% faster</strong> and save 
              <strong className="text-green-600"> $47K+ monthly</strong> through intelligent automation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                onClick={startFreeTrial}
                size="lg" 
                className="px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Rocket className="mr-3 h-5 w-5" />
                Start Your Free 30-Day Trial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-12 py-6 text-lg border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200"
                onClick={watchDemo}
              >
                <PlayCircle className="mr-3 h-5 w-5" />
                Watch 2-Min Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">No credit card required</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Full access for 30 days</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Cancel anytime</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Setup in 5 minutes</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg">Trusted by industry leaders</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-60">
            {['BuildCorp', 'SkyHigh Construction', 'Metro Builders', 'Coastal Contractors'].map((company, index) => (
              <div key={index} className="text-center">
                <div className="h-16 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">{company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 text-blue-700 bg-blue-100">Features</Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything you need to scale
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered insights to mobile field management, 
              we've built the most comprehensive platform in the industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <CardHeader className="pb-4 relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold mb-3">{feature.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs w-fit mb-3 bg-green-100 text-green-800">
                      {feature.metric}
                    </Badge>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-gray-600 leading-relaxed text-base mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      <Award className="w-4 h-4 mr-2" />
                      {feature.stats}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-6 text-green-700 bg-green-100">Proven Results</Badge>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Why contractors choose ContractPro
              </h2>
              <p className="text-xl text-gray-600">
                Real results from real construction companies
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-6 p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-green-600">{benefit.value}</span>
                        <Badge className="text-xs bg-green-100 text-green-800">Verified</Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-medium">{benefit.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 text-yellow-700 bg-yellow-100">Customer Stories</Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Don't just take our word for it
            </h2>
            <p className="text-xl text-gray-600">See what our customers are saying</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 text-blue-700 bg-blue-100">Pricing</Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">Start your 30-day free trial. No credit card required.</p>
            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm">
              <span className="px-4 py-2 text-sm font-medium text-gray-600">Monthly</span>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">Annual (Save 20%)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-2 ${
                plan.is_popular ? 'border-blue-500 shadow-2xl scale-110' : 'border-gray-200'
              } hover:shadow-lg transition-all duration-300 bg-white`}>
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 text-sm font-medium">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold mb-2">{plan.plan_name}</CardTitle>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">${plan.monthly_price}</span>
                    <span className="text-gray-600 text-lg">/month</span>
                  </div>
                  <div className="text-sm text-green-600 mt-3 font-medium">
                    Save ${(plan.monthly_price * 12 - plan.annual_price)} with annual billing
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-6">
                    <Button 
                      className={`w-full py-4 text-lg font-medium ${
                        plan.is_popular 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      } transition-all duration-200`}
                      onClick={startFreeTrial}
                    >
                      Start 30-Day Free Trial
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      No credit card required • Cancel anytime
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">Need a custom solution?</p>
            <Button variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to transform your business?
            </h2>
            <p className="text-xl mb-12 text-blue-100">
              Join thousands of contractors who've increased their profits by 34% with ContractPro.
              Start your free trial today and see the difference in just 30 days.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button 
                size="lg"
                onClick={startFreeTrial} 
                className="px-12 py-6 text-lg bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                <Rocket className="mr-3 h-5 w-5" />
                Start Your Free 30-Day Trial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-blue-100 font-medium">No credit card required</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-blue-100 font-medium">Full access for 30 days</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-blue-100 font-medium">Setup in 5 minutes</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-blue-100 font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <Waves className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-2xl">ContractPro</span>
                  <p className="text-gray-400 text-sm">Construction Management</p>
                </div>
              </div>
              <p className="text-gray-400 mb-8 max-w-md text-lg">
                The most advanced construction management platform. 
                Trusted by 10,000+ contractors worldwide.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="h-5 w-5" />
                  <span>(949) 555-WAVE</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                  <span>hello@contractpro.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span>Newport Beach, CA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link to="/mobile" className="text-gray-400 hover:text-white transition-colors">Mobile App</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Support</h3>
              <ul className="space-y-3">
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/status" className="text-gray-400 hover:text-white transition-colors">System Status</Link></li>
                <li><Link to="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white transition-colors">Training</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 ContractPro. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
                <Link to="/gdpr" className="text-gray-400 hover:text-white transition-colors">GDPR</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
