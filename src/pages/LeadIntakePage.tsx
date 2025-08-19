
import React from 'react';
import WebformIntake from '@/components/WebformIntake';

const LeadIntakePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Your Project Today</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get connected with our expert team for your next construction project. 
            We provide free quotes and professional consultations.
          </p>
        </div>
        
        <WebformIntake />
        
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Expert Craftsmanship</h3>
              <p className="text-gray-600">20+ years of experience in residential and commercial construction</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-lg font-medium mb-2">On-Time Delivery</h3>
              <p className="text-gray-600">We pride ourselves on completing projects on schedule and within budget</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All work comes with comprehensive warranties for your peace of mind</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadIntakePage;
