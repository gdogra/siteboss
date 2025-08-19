import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Crown } from 'lucide-react';

interface SubscriptionFallbackProps {
  onRetry: () => void;
  onUpgrade: () => void;
  error?: string;
  compact?: boolean;
}

const SubscriptionFallback: React.FC<SubscriptionFallbackProps> = ({
  onRetry,
  onUpgrade,
  error,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">Subscription unavailable</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button size="sm" onClick={onUpgrade}>
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800">
          <AlertTriangle className="w-5 h-5" />
          <span>Subscription Status Unavailable</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-amber-700">
          We're having trouble loading your subscription information. 
          This doesn't affect your access to the platform.
        </p>
        
        {error && (
          <div className="bg-white bg-opacity-50 p-3 rounded text-sm text-amber-800">
            <strong>Technical details:</strong> {error}
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onRetry} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onUpgrade} className="flex-1">
            <Crown className="w-4 h-4 mr-2" />
            View Plans
          </Button>
        </div>
        
        <div className="text-xs text-amber-700">
          If this issue persists, please contact support.
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionFallback;