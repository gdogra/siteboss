
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface Insight {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  recommendation?: string;
}

interface InsightsPanelProps {
  insights: Insight[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      case 'low':
        return <Target className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const categories = Array.from(new Set(insights.map(insight => insight.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Actionable Insights
          </h2>
          <p className="text-muted-foreground">
            AI-powered recommendations to improve your business performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {insights.filter(i => i.impact === 'high').length}
              </p>
              <p className="text-sm text-muted-foreground">High Impact</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {insights.filter(i => i.impact === 'medium').length}
              </p>
              <p className="text-sm text-muted-foreground">Medium Impact</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {insights.filter(i => i.actionable).length}
              </p>
              <p className="text-sm text-muted-foreground">Actionable</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Lightbulb className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {insights.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Insights</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No insights available for the selected category.
            </CardContent>
          </Card>
        ) : (
          filteredInsights.map((insight, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getImpactIcon(insight.impact)}
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {insight.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                    <Badge variant="outline">
                      {insight.category}
                    </Badge>
                    {insight.actionable && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {insight.recommendation && (
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm mb-1">Recommendation:</p>
                        <p className="text-sm text-muted-foreground">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <div className="flex justify-end mt-4">
                      <Button size="sm">
                        Take Action
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Performance Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Performance Tips
          </CardTitle>
          <CardDescription>
            Simple actions you can take right now to improve your metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Lead Generation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Set up automated follow-up sequences</li>
                <li>• Optimize your lead capture forms</li>
                <li>• Track lead sources more effectively</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Project Management</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use project templates for consistency</li>
                <li>• Set clear milestones and deadlines</li>
                <li>• Implement regular status check-ins</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Financial Performance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Send invoices immediately upon completion</li>
                <li>• Set up automatic payment reminders</li>
                <li>• Offer early payment discounts</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Team Productivity</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use time tracking to identify bottlenecks</li>
                <li>• Standardize common workflows</li>
                <li>• Invest in team training and tools</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsPanel;
