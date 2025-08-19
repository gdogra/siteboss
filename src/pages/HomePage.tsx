import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Waves } from
'lucide-react';

const HomePage = () => {
  const features = [
  {
    icon: Building2,
    title: 'Project Management',
    description: 'Comprehensive project tracking from planning to completion with real-time updates.'
  },
  {
    icon: FileText,
    title: 'Invoice Processing',
    description: 'Streamlined invoice submission and approval process for contractors and subcontractors.'
  },
  {
    icon: Users,
    title: 'Team Coordination',
    description: 'Manage your construction team, subcontractors, and stakeholders in one place.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security ensuring your project data is protected and accessible.'
  }];


  const benefits = [
  'Real-time project tracking and reporting',
  'Automated invoice processing and approvals',
  'Document management and version control',
  'Team collaboration and communication tools',
  'Financial tracking and budget management',
  'Mobile-responsive access from any device'];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <Waves className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-gray-900">Laguna Bay Development</h1>
                <p className="text-xs text-gray-600 -mt-1">Construction Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/invoice-submission">
                <Button variant="outline">Submit Invoice</Button>
              </Link>
              <Link to="/admin-login">
                <Button>Admin Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Waves className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Premium Construction
              <span className="block text-blue-600">Management Solutions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Laguna Bay Development brings you cutting-edge construction management technology. 
              From luxury developments to commercial projects, we've got the expertise you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-quote">
                <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/invoice-submission">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-blue-200 hover:bg-blue-50">
                  Submit Invoice
                </Button>
              </Link>
              <Link to="/payments">
                <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Payment Engine
                </Button>
              </Link>
              <Link to="/lead-management">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-blue-200 hover:bg-blue-50">
                  Lead Management
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-blue-200 hover:bg-blue-50">
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Construction Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools needed for premium construction management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>);

            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Laguna Bay Development?
              </h2>
              <p className="text-xl text-gray-600">
                Built for construction professionals who demand excellence and efficiency in every project.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) =>
              <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{benefit}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Elevate Your Construction Projects?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join the elite contractors who trust Laguna Bay Development for their premium project management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/invoice-submission">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-50">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-2">
                  <Waves className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">Laguna Bay Development</span>
              </div>
              <p className="text-gray-400 mb-4">
                Premium construction management solutions for discerning professionals and luxury developments.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/invoice-submission" className="text-gray-400 hover:text-white transition-colors">
                    Submit Invoice
                  </Link>
                </li>
                <li>
                  <Link to="/admin-login" className="text-gray-400 hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>(949) 555-WAVE</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>info@lagunabay.dev</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>Laguna Beach, California</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Laguna Bay Development. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>);

};

export default HomePage;