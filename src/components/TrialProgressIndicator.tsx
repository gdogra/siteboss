
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Zap,
  Crown,
  CheckCircle,
  ArrowRight,
  Gift,
  Star
} from 'lucide-react';

interface TrialProgressIndicatorProps {
  userId?: number;
  className?: string;
  showUpgradePrompt?: boolean;
}

const TrialProgressIndicator: React.FC<TrialProgressIndicatorProps> = ({ 
  userId, 
  className = '',
  showUpgradePrompt = true 
}) => {
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayFeature, setTodayFeature] = useState(null);

  useEffect(() => {
    if (userId) {
      loadTrialStatus();
      loadTodayFeature();
    }
  }, [userId]);

  const loadTrialStatus = async () => {
    try {
      const { data, error } = await window.ezsite.apis.run({
        path: "getTrialStatus",
        param: [userId]
      });

      if (!error && data) {
        setTrialStatus(data);
      }
    } catch (error) {
      console.error('Error loading trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayFeature = async () => {
    try {
      // Get current trial day to show relevant feature highlight
      const trialDay = trialStatus?.totalTrialDays - trialStatus?.daysRemaining || 1;
      
      const { data, error } = await window.ezsite.apis.tablePage(35527, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: "highlight_day", op: "Equal", value: trialDay }]
      });

      if (!error && data?.List?.length > 0) {
        setTodayFeature(data.List[0]);
      }
    } catch (error) {
      console.error('Error loading today\'s feature:', error);
    }
  };

  const getTrialStatusColor = () => {
    if (!trialStatus) return 'blue';
    
    if (trialStatus.daysRemaining > 14) return 'green';
    if (trialStatus.daysRemaining > 7) return 'yellow';
    return 'red';
  };

  const getTrialStatusMessage = () => {
    if (!trialStatus) return 'Loading trial status...';
    
    if (trialStatus.daysRemaining > 14) {
      return `${trialStatus.daysRemaining} days left in your trial`;
    } else if (trialStatus.daysRemaining > 7) {
      return `${trialStatus.daysRemaining} days remaining - Consider upgrading soon`;
    } else if (trialStatus.daysRemaining > 0) {
      return `Trial expires in ${trialStatus.daysRemaining} days - Upgrade now!`;
    } else {
      return 'Trial expired - Upgrade to continue';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trialStatus || !trialStatus.isTrialActive) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Trial Expired</span>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Link to="/subscription-management">Upgrade Now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = getTrialStatusColor();
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Trial Status Card */}
      <Card className={`border-${statusColor}-200 bg-${statusColor}-50`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className={`h-5 w-5 text-${statusColor}-600`} />
              Free Trial Active
            </CardTitle>
            <Badge variant={statusColor === 'green' ? 'default' : statusColor === 'yellow' ? 'secondary' : 'destructive'}>
              {trialStatus.daysRemaining} days left
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Trial Progress</span>
              <span className="text-sm font-medium">
                Day {trialStatus.totalTrialDays - trialStatus.daysRemaining} of {trialStatus.totalTrialDays}
              </span>
            </div>
            <Progress 
              value={trialStatus.progressPercentage} 
              className="h-2"
            />
          </div>
          
          <p className={`text-sm text-${statusColor}-700`}>
            {getTrialStatusMessage()}
          </p>
          
          {showUpgradePrompt && trialStatus.daysRemaining <= 7 && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Link to="/subscription-management" className="flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  Choose Plan
                </Link>
              </Button>
              {trialStatus.canExtendTrial && (
                <Button size="sm" variant="outline">
                  Extend Trial
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Feature Highlight */}
      {todayFeature && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Feature Spotlight
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-purple-900">{todayFeature.feature_title}</h3>
                <p className="text-sm text-purple-700">{todayFeature.feature_description}</p>
              </div>
              
              <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                <Link to={todayFeature.feature_url} className="flex items-center gap-1">
                  Try This Feature
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {trialStatus.featuresUsed?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Features Tried</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(trialStatus.onboardingProgress || 0)}%
              </div>
              <div className="text-xs text-gray-600">Setup Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialProgressIndicator;
