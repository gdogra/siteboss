import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProposalViewer from '@/components/ProposalViewer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

const ProposalViewPage: React.FC = () => {
  const { id } = useParams<{id: string;}>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Validate proposal ID
    if (!id || isNaN(parseInt(id))) {
      setError('Invalid proposal ID');
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading proposal...</span>
      </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProposalViewer proposalId={parseInt(id!)} />
    </div>);

};

export default ProposalViewPage;