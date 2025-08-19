import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Header from '@/components/Header';
import InvoiceSubmissionForm from '@/components/InvoiceSubmissionForm';

const InvoiceSubmissionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <Link
            to="/admin-dashboard"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Invoice Submission
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Submit your completed work invoices for review and payment processing.
              All fields marked with * are required.
            </p>
          </div>

          {/* Form */}
          <InvoiceSubmissionForm />
        </div>
      </main>
    </div>
  );
};

export default InvoiceSubmissionPage;