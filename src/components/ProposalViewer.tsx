import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Clock, CheckCircle, XCircle, Download, 
  Share2, Mail, Calendar, User, Phone, MapPin,
  DollarSign, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProposalSignature from './ProposalSignature';

interface ProposalViewerProps {
  proposalId: number;
  readonly?: boolean;
}

interface Proposal {
  id: number;
  proposal_number: string;
  title: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  status: string;
  priority: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  currency: string;
  valid_until: string;
  created_at: string;
  sent_at?: string;
  viewed_at?: string;
  signed_at?: string;
}

interface ProposalVersion {
  id: number;
  content: string;
  line_items: string;
  pricing_data: string;
  terms_conditions: string;
  attachments: string;
  is_current: boolean;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const ProposalViewer: React.FC<ProposalViewerProps> = ({ proposalId, readonly = false }) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [version, setVersion] = useState<ProposalVersion | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [pricingData, setPricingData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchProposal();
    fetchCurrentVersion();
  }, [proposalId]);

  useEffect(() => {
    if (proposal && !viewTracked && !readonly) {
      trackView();
      setViewTracked(true);
    }
  }, [proposal, viewTracked, readonly]);

  const fetchProposal = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35433, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: true,
        Filters: [
          { name: 'id', op: 'Equal', value: proposalId }
        ]
      });

      if (error) throw error;
      
      const proposalData = data?.List?.[0];
      if (proposalData) {
        setProposal(proposalData);
        
        // Update status to viewed if first time viewing
        if (proposalData.status === 'sent' && !proposalData.viewed_at && !readonly) {
          await window.ezsite.apis.tableUpdate(35433, {
            ID: proposalId,
            status: 'viewed',
            viewed_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to load proposal',
        variant: 'destructive'
      });
    }
  };

  const fetchCurrentVersion = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage(35434, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'version_number',
        IsAsc: false,
        Filters: [
          { name: 'proposal_id', op: 'Equal', value: proposalId },
          { name: 'is_current', op: 'Equal', value: true }
        ]
      });

      if (error) throw error;
      
      const versionData = data?.List?.[0];
      if (versionData) {
        setVersion(versionData);
        
        // Parse line items
        if (versionData.line_items) {
          const items = JSON.parse(versionData.line_items);
          setLineItems(items);
        }
        
        // Parse pricing data
        if (versionData.pricing_data) {
          const pricing = JSON.parse(versionData.pricing_data);
          setPricingData(pricing);
        }
      }
    } catch (error) {
      console.error('Error fetching version:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      // Track analytics
      await window.ezsite.apis.tableCreate(35436, {
        proposal_id: proposalId,
        event_type: 'view',
        event_data: JSON.stringify({
          page: 'proposal_viewer',
          timestamp: new Date().toISOString()
        }),
        user_email: proposal?.client_email || '',
        ip_address: '', // Browser doesn't have direct access to IP
        user_agent: navigator.userAgent,
        page_viewed: 'full_proposal',
        time_spent: 0,
        device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        operating_system: navigator.platform,
        browser: navigator.userAgent.split(' ').slice(-2).join(' '),
        referrer_url: document.referrer,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'viewed': 'bg-yellow-100 text-yellow-800',
      'signed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'draft': <FileText className="w-4 h-4" />,
      'sent': <Mail className="w-4 h-4" />,
      'viewed': <Eye className="w-4 h-4" />,
      'signed': <CheckCircle className="w-4 h-4" />,
      'rejected': <XCircle className="w-4 h-4" />,
      'expired': <Clock className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const isExpired = () => {
    if (!proposal?.valid_until) return false;
    return new Date() > new Date(proposal.valid_until);
  };

  const canSign = () => {
    return proposal?.status === 'viewed' && !isExpired() && !readonly;
  };

  const handleDownloadPDF = async () => {
    try {
      // Generate PDF using Node.js function
      const { data, error } = await window.ezsite.apis.run({
        path: "generateProposalPDF",
        param: [proposalId]
      });

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      link.download = `${proposal?.proposal_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track download
      await window.ezsite.apis.tableCreate(35436, {
        proposal_id: proposalId,
        event_type: 'download',
        event_data: JSON.stringify({
          format: 'pdf',
          timestamp: new Date().toISOString()
        }),
        user_email: proposal?.client_email || '',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/proposal/${proposalId}/view`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: proposal?.title,
          text: `View proposal: ${proposal?.title}`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast({
          title: 'Link Copied',
          description: 'Proposal link copied to clipboard'
        });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Proposal link copied to clipboard'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading proposal...</span>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center p-8">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposal Not Found</h3>
        <p className="text-gray-600">The proposal you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{proposal.title}</h1>
                <Badge className={getStatusColor(proposal.status)}>
                  {getStatusIcon(proposal.status)}
                  <span className="ml-1 capitalize">{proposal.status}</span>
                </Badge>
                {isExpired() && (
                  <Badge variant="destructive">
                    <Clock className="w-4 h-4 mr-1" />
                    Expired
                  </Badge>
                )}
              </div>
              <p className="text-lg text-gray-600">Proposal #{proposal.proposal_number}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created: {new Date(proposal.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Valid until: {new Date(proposal.valid_until).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              {canSign() && (
                <Button onClick={() => setShowSignature(true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sign Proposal
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">{proposal.client_name}</h4>
              {proposal.client_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${proposal.client_email}`} className="hover:text-blue-600">
                    {proposal.client_email}
                  </a>
                </div>
              )}
              {proposal.client_phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${proposal.client_phone}`} className="hover:text-blue-600">
                    {proposal.client_phone}
                  </a>
                </div>
              )}
            </div>
            {proposal.client_address && (
              <div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{proposal.client_address}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Proposal Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="text-right py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(item.unit_price * 100, proposal.currency)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(item.total * 100, proposal.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            {/* Pricing Summary */}
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(pricingData.subtotal || 0, proposal.currency)}</span>
              </div>
              {(pricingData.tax_amount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(pricingData.tax_amount, proposal.currency)}</span>
                </div>
              )}
              {(pricingData.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(pricingData.discount_amount, proposal.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(proposal.total_amount, proposal.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      {version?.terms_conditions && (
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {version.terms_conditions}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Proposal Section */}
      {canSign() && !showSignature && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Ready to Accept This Proposal?
            </h3>
            <p className="text-green-700 mb-4">
              By signing, you agree to the terms and conditions outlined above.
            </p>
            <Button onClick={() => setShowSignature(true)} size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Sign Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Signature Component */}
      {showSignature && (
        <ProposalSignature
          proposalId={proposalId}
          proposalVersionId={version?.id || 0}
          onSuccess={() => {
            setShowSignature(false);
            fetchProposal(); // Refresh to show signed status
            toast({
              title: 'Success',
              description: 'Proposal signed successfully!'
            });
          }}
          onCancel={() => setShowSignature(false)}
        />
      )}

      {/* Expired Notice */}
      {isExpired() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              This Proposal Has Expired
            </h3>
            <p className="text-orange-700">
              This proposal expired on {new Date(proposal.valid_until).toLocaleDateString()}.
              Please contact us to discuss a new proposal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProposalViewer;