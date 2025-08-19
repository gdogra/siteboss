import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import InvoiceSubmissionForm from '@/components/InvoiceSubmissionForm';

const InvoiceSubmissionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group">

          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-heading font-bold text-xl">LB</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
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
    </div>);

};

export default InvoiceSubmissionPage;