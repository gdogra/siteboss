import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Shield, 
  Target,
  RefreshCw,
  Brain,
  BarChart3,
  Clock,
  AlertCircle
} from 'lucide-react';
import { aiPredictionService, ProjectPrediction, RiskFactor, Recommendation } from '@/services/aiPredictionService';
import SmartSchedulingDashboard from '@/components/SmartSchedulingDashboard';
import FinancialMarketplaceDashboard from '@/components/FinancialMarketplaceDashboard';

interface AIPredictionDashboardProps {
  projectId: string;
  className?: string;
}

const AIPredictionDashboard: React.FC<AIPredictionDashboardProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [prediction, setPrediction] = useState<ProjectPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadPrediction();
  }, [projectId]);

  const loadPrediction = async () => {
    try {
      setLoading(true);
      // This would integrate with your existing project data
      const mockProjectData = {
        budget: 750000,
        timeline: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          duration: 90
        },
        complexity: 'high',
        teamSize: 12,
        location: 'San Francisco',
        materials: ['concrete', 'steel', 'glass'],
        permits: ['building', 'environmental', 'electrical', 'plumbing'],
        contractorRating: 4.5
      };
      
      const result = await aiPredictionService.generateProjectPrediction(projectId, mockProjectData);
      setPrediction(result);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load AI prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-50 border-green-200';
    if (score < 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score < 80) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    if (score < 80) return 'High Risk';
    return 'Critical Risk';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Shield className="w-4 h-4 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Project Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Analyzing project data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Prediction Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to generate predictions. Please try again.</p>
          <Button onClick={loadPrediction} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Refresh */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                AI Project Intelligence
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {Math.round(prediction.confidenceLevel * 100)}% confidence
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-powered predictions and recommendations for your project
                {lastRefresh && (
                  <span className="block mt-1 text-xs">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadPrediction}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getRiskColor(prediction.riskScore)}`}>
                {prediction.riskScore}
              </div>
              <Badge variant="outline" className={getRiskColor(prediction.riskScore)}>
                {getRiskLevel(prediction.riskScore)}
              </Badge>
            </div>
            <Progress value={prediction.riskScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Delay Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(prediction.delayProbability * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted completion: {prediction.predictedCompletionDate.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Cost Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(prediction.costOverrunProbability * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted cost: ${(prediction.predictedFinalCost / 1000).toFixed(0)}K
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Quality Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={`text-sm ${
              prediction.qualityRiskLevel === 'low' ? 'bg-green-100 text-green-800' :
              prediction.qualityRiskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              prediction.qualityRiskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {prediction.qualityRiskLevel.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="risks">Risk Factors</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="scheduling">Smart Scheduling</TabsTrigger>
          <TabsTrigger value="financing">Smart Financing</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identified Risk Factors</CardTitle>
              <CardDescription>
                AI-identified risks that could impact your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  {getSeverityIcon(risk.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium capitalize">
                        {risk.type.replace('_', ' ')} Risk
                      </h4>
                      <Badge variant="outline" className={
                        risk.severity === 'low' ? 'border-green-200 text-green-700' :
                        risk.severity === 'medium' ? 'border-yellow-200 text-yellow-700' :
                        risk.severity === 'high' ? 'border-orange-200 text-orange-700' :
                        'border-red-200 text-red-700'
                      }>
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {risk.impact}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Probability: {Math.round(risk.probability * 100)}%
                      </span>
                      {risk.mitigation && (
                        <Button variant="link" className="text-xs p-0 h-auto">
                          View Mitigation →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <SmartSchedulingDashboard projectId={projectId} />
        </TabsContent>

        <TabsContent value="financing" className="space-y-4">
          <FinancialMarketplaceDashboard projectId={projectId} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Recommendations</CardTitle>
              <CardDescription>
                Actionable insights to optimize your project outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {rec.category}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {rec.estimatedCost && (
                        <div>Cost: ${rec.estimatedCost.toLocaleString()}</div>
                      )}
                      {rec.timeToImplement && (
                        <div>{rec.timeToImplement} days to implement</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">{rec.action}</h4>
                    <p className="text-sm text-muted-foreground">
                      Expected impact: {rec.expectedImpact}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm">
                      Implement Recommendation
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delay Prediction Model</span>
                    <Badge>87% accurate</Badge>
                  </div>
                  <Progress value={87} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost Prediction Model</span>
                    <Badge>82% accurate</Badge>
                  </div>
                  <Progress value={82} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Risk Model</span>
                    <Badge>79% accurate</Badge>
                  </div>
                  <Progress value={79} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Training Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projects Analyzed</span>
                    <span className="text-sm font-medium">15,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Model Update</span>
                    <span className="text-sm font-medium">Jan 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prediction Confidence</span>
                    <span className="text-sm font-medium">{Math.round(prediction.confidenceLevel * 100)}%</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPredictionDashboard;