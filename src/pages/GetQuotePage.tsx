import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GetQuotePage: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Your Custom Quote
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your construction management needs and we'll provide a customized solution for your business.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Enterprise Quote</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-6">
              Our enterprise sales team will work with you to create a customized solution.
            </p>
            <div className="space-y-4">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link to="/trial-signup">Start Free Trial Instead</Link>
              </Button>
              <p className="text-sm text-gray-500">
                Or contact us directly at sales@siteboss.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GetQuotePage;