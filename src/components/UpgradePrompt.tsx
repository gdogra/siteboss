
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Crown,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  X,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface UpgradePromptProps {
  urgency?: 'low' | 'medium' | 'high';
  daysRemaining?: number;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  urgency = 'medium',
  daysRemaining = 7,
  onDismiss,
  className = '',
  compact = false
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const getUrgencyConfig = () => {
    switch (urgency) {
      case 'high':
        return {
          color: 'red',
          icon: Crown,
          title: '🔥 Trial Ending Soon!',
          message: `Your trial expires in ${daysRemaining} days. Don't lose your progress!`,
          buttonText: 'Upgrade Now - Save 20%',
          className: 'border-red-200 bg-red-50'
        };
      case 'medium':
        return {
          color: 'orange',
          icon: Star,
          title: '⏰ Time to Upgrade',
          message: `${daysRemaining} days left in your trial. Secure your data and unlock premium features.`,
          buttonText: 'Choose Your Plan',
          className: 'border-orange-200 bg-orange-50'
        };
      case 'low':
        return {
          color: 'blue',
          icon: Sparkles,
          title: '✨ Ready to Upgrade?',
          message: 'You\'ve been making great progress! Consider upgrading to unlock advanced features.',
          buttonText: 'View Plans',
          className: 'border-blue-200 bg-blue-50'
        };
      default:
        return {
          color: 'blue',
          icon: Star,
          title: 'Upgrade Available',
          message: 'Unlock premium features and keep your progress.',
          buttonText: 'Learn More',
          className: 'border-blue-200 bg-blue-50'
        };
    }
  };

  const config = getUrgencyConfig();
  const IconComponent = config.icon;

  if (compact) {
    return (
      <div className={`${config.className} p-3 rounded-lg border ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-4 w-4 text-${config.color}-600`} />
            <span className="text-sm font-medium">{config.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs">
              <Link to="/subscription-management">Upgrade</Link>
            </Button>
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${config.className} ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
              <IconComponent className={`h-6 w-6 text-${config.color}-600`} />
            </div>
            <div>
              <CardTitle className={`text-lg text-${config.color}-900`}>
                {config.title}
              </CardTitle>
              <CardDescription className={`text-${config.color}-700 mt-1`}>
                {config.message}
              </CardDescription>
            </div>
          </div>
          
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Benefits */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-sm">Why upgrade now?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Keep all your data</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Unlimited projects</span>
            </div>
          </div>
        </div>

        {/* Popular Plan Highlight */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Most Popular</Badge>
              <span className="font-semibold">Professional Plan</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$149</div>
              <div className="text-sm text-gray-600">/month</div>
            </div>
          </div>
          
          {urgency === 'high' && (
            <div className="mb-3">
              <Badge className="bg-red-100 text-red-700 text-xs">
                🎯 Save 20% if you upgrade today!
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
            <Link to="/subscription-management" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {config.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          
          {urgency !== 'high' && (
            <Button variant="outline" onClick={handleDismiss}>
              Maybe Later
            </Button>
          )}
        </div>

        {/* Social Proof */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>Join 10,000+ contractors who upgraded and increased profits by 34%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
