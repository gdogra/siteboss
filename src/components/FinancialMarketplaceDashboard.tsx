import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Building,
  CreditCard,
  FileText,
  Phone,
  Mail,
  ArrowRight,
  Calculator,
  Shield,
  Award,
  Briefcase,
  Users
} from 'lucide-react';
import { 
  financialMarketplaceService, 
  FinancingRequest, 
  FinancingRecommendation, 
  ApplicationStatus,
  MarketplaceAnalytics
} from '@/services/financialMarketplaceService';

interface FinancialMarketplaceDashboardProps {
  projectId: string;
  className?: string;
}

const FinancialMarketplaceDashboard: React.FC<FinancialMarketplaceDashboardProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [recommendations, setRecommendations] = useState<FinancingRecommendation[]>([]);
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [marketData, setMarketData] = useState<MarketplaceAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('finder');

  // Financing request form state
  const [financingAmount, setFinancingAmount] = useState<number>(250000);
  const [purpose, setPurpose] = useState<string>('working_capital');
  const [creditScore, setCreditScore] = useState<number>(720);
  const [annualRevenue, setAnnualRevenue] = useState<number>(1200000);
  const [yearsInBusiness, setYearsInBusiness] = useState<number>(5);

  useEffect(() => {
    loadInitialData();
  }, [projectId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load existing applications
      const existingApps = await financialMarketplaceService.getApplications(projectId);
      setApplications(existingApps);
      
      // Load market data
      const market = await financialMarketplaceService.getMarketAnalytics();
      setMarketData(market);
      
    } catch (error) {
      console.error('Failed to load marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const findFinancingOptions = async () => {
    try {
      setLoading(true);
      
      const request: FinancingRequest = {
        projectId,
        requestId: `req-${Date.now()}`,
        amount: financingAmount,
        purpose: purpose as any,
        timeline: {
          needByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          projectStartDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          projectEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        },
        applicant: {
          businessName: 'Sample Construction Co.',
          ein: '12-3456789',
          yearsInBusiness,
          annualRevenue,
          creditScore,
          location: 'San Francisco, CA'
        },
        project: {
          type: 'Commercial Construction',
          value: financingAmount * 2, // Assume project value is 2x loan amount
          duration: 6, // months
          contracts: [
            {
              clientName: 'ABC Corporation',
              contractValue: financingAmount * 1.5,
              startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              completionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
              paymentTerms: 'Net 30',
              verified: true
            }
          ]
        }
      };

      const recs = await financialMarketplaceService.getFinancingRecommendations(request);
      setRecommendations(recs);
      
    } catch (error) {
      console.error('Failed to find financing options:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForFinancing = async (productId: string) => {
    try {
      const request: FinancingRequest = {
        projectId,
        requestId: `req-${Date.now()}`,
        amount: financingAmount,
        purpose: purpose as any,
        timeline: {
          needByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          projectStartDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          projectEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        },
        applicant: {
          businessName: 'Sample Construction Co.',
          ein: '12-3456789',
          yearsInBusiness,
          annualRevenue,
          creditScore,
          location: 'San Francisco, CA'
        },
        project: {
          type: 'Commercial Construction',
          value: financingAmount * 2,
          duration: 6,
          contracts: []
        }
      };

      const application = await financialMarketplaceService.submitApplication(productId, request);
      setApplications(prev => [...prev, application]);
      setActiveTab('applications');
      
    } catch (error) {
      console.error('Failed to submit application:', error);
    }
  };

  const getPartnershipBadge = (level: string) => {
    const badges = {
      'platinum': <Badge className="bg-purple-100 text-purple-800 border-purple-200">Platinum Partner</Badge>,
      'gold': <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Gold Partner</Badge>,
      'silver': <Badge className="bg-gray-100 text-gray-800 border-gray-200">Silver Partner</Badge>,
      'bronze': <Badge variant="outline">Bronze Partner</Badge>
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'submitted': <Badge variant="outline">Submitted</Badge>,
      'under_review': <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>,
      'approved': <Badge className="bg-green-100 text-green-800">Approved</Badge>,
      'declined': <Badge className="bg-red-100 text-red-800">Declined</Badge>,
      'pending_documents': <Badge className="bg-orange-100 text-orange-800">Pending Documents</Badge>
    };
    return badges[status as keyof typeof badges] || badges.submitted;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Construction Financial Marketplace
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              AI-Powered Matching
            </Badge>
          </CardTitle>
          <CardDescription>
            Find the best financing options for your construction projects with AI-powered recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Market Overview */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Project Loans:</span>
                <span className="text-sm font-medium">{marketData.averageRates.projectLoans}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Equipment:</span>
                <span className="text-sm font-medium">{marketData.averageRates.equipmentFinancing}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Working Capital:</span>
                <span className="text-sm font-medium">{marketData.averageRates.workingCapital}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Rates {marketData.marketTrends.rateDirection}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Popular: {marketData.marketTrends.popularProducts.join(', ')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {applications.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {applications.filter(app => app.status === 'under_review').length} under review
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="finder">Financing Finder</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="finder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Perfect Financing Match</CardTitle>
              <CardDescription>
                Tell us about your financing needs and we'll find the best options for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Financing Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={financingAmount}
                      onChange={(e) => setFinancingAmount(Number(e.target.value))}
                      placeholder="250000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Select value={purpose} onValueChange={setPurpose}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="working_capital">Working Capital</SelectItem>
                        <SelectItem value="equipment_purchase">Equipment Purchase</SelectItem>
                        <SelectItem value="project_funding">Project Funding</SelectItem>
                        <SelectItem value="expansion">Business Expansion</SelectItem>
                        <SelectItem value="emergency">Emergency Funding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="credit-score">Credit Score</Label>
                    <Input
                      id="credit-score"
                      type="number"
                      value={creditScore}
                      onChange={(e) => setCreditScore(Number(e.target.value))}
                      placeholder="720"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="revenue">Annual Revenue</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={annualRevenue}
                      onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                      placeholder="1200000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="years">Years in Business</Label>
                    <Input
                      id="years"
                      type="number"
                      value={yearsInBusiness}
                      onChange={(e) => setYearsInBusiness(Number(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={findFinancingOptions}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Finding Best Matches...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Find Financing Options
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Use the Financing Finder to get personalized recommendations
                </p>
                <Button onClick={() => setActiveTab('finder')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Card key={rec.product.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Building className="w-5 h-5 mr-2" />
                          {rec.product.provider.name}
                          {getPartnershipBadge(rec.product.provider.partnershipLevel)}
                        </CardTitle>
                        <CardDescription>
                          {rec.product.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • 
                          {rec.product.termMonths} months
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {rec.estimatedRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Estimated Rate
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Monthly Payment</div>
                        <div className="text-lg font-medium">
                          {formatCurrency(rec.monthlyPayment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Cost</div>
                        <div className="text-lg font-medium">
                          {formatCurrency(rec.totalCost)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Approval Odds</div>
                        <div className="text-lg font-medium text-green-600">
                          {formatPercentage(rec.approvalProbability)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Processing</div>
                        <div className="text-lg font-medium">
                          {rec.product.processingTime} days
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-1">Match Score:</span>
                        <Progress value={rec.matchScore} className="w-20 h-2" />
                        <span className="text-sm font-medium ml-2">{rec.matchScore}%</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">
                          {rec.product.rating.customerRating}/5
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({rec.product.rating.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-2">Advantages</h4>
                        <ul className="text-sm space-y-1">
                          {rec.advantages.slice(0, 3).map((advantage, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              {advantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {rec.riskFactors.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-orange-600 mb-2">Considerations</h4>
                          <ul className="text-sm space-y-1">
                            {rec.riskFactors.slice(0, 3).map((risk, idx) => (
                              <li key={idx} className="flex items-center">
                                <AlertCircle className="w-3 h-3 text-orange-500 mr-2 flex-shrink-0" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => applyForFinancing(rec.product.id)}
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                      {rec.preApprovalUrl && (
                        <Button variant="outline" className="flex-1">
                          <Shield className="w-4 h-4 mr-2" />
                          Get Pre-Approval
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your loan applications will appear here once submitted
                </p>
                <Button onClick={() => setActiveTab('finder')}>
                  Find Financing Options
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.applicationId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Building className="w-5 h-5 mr-2" />
                          {app.provider}
                        </CardTitle>
                        <CardDescription>
                          Application #{app.applicationId.slice(-8)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                        <div className="text-sm text-muted-foreground mt-1">
                          {app.submittedDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {app.estimatedDecisionDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        Decision expected by {app.estimatedDecisionDate.toLocaleDateString()}
                      </div>
                    )}

                    {app.requiredDocuments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Required Documents</h4>
                        <ul className="text-sm space-y-1">
                          {app.requiredDocuments.map((doc, idx) => (
                            <li key={idx} className="flex items-center">
                              <FileText className="w-3 h-3 text-muted-foreground mr-2" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            Contact: {app.contactInfo.representative}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {app.contactInfo.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {app.contactInfo.email}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lender Directory</CardTitle>
              <CardDescription>
                Explore our network of trusted financial partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Lender directory coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialMarketplaceDashboard;