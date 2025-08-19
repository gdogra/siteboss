
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Check, 
  X, 
  Clock, 
  RefreshCw,
  Settings 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertItem {
  id: number;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  timestamp: string;
  category: string;
  status?: 'active' | 'acknowledged' | 'resolved';
}

interface AlertsPanelProps {
  alerts: AlertItem[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkForNewAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.run({
        path: 'checkAnalyticsAlerts',
        param: []
      });

      if (error) throw new Error(error);

      if (data.alertsTriggered > 0) {
        // Merge new alerts with existing ones
        const newAlerts = data.alerts.map((alert: any) => ({
          id: alert.id,
          title: alert.alert_name,
          message: alert.alert_message,
          level: alert.alert_level,
          timestamp: alert.triggered_at,
          category: alert.metric_name,
          status: 'active'
        }));

        setAlerts(prev => [...newAlerts, ...prev]);
        
        toast({
          title: "New Alerts",
          description: `${data.alertsTriggered} new alert(s) triggered.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to check alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been acknowledged.",
    });
  };

  const resolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved.",
    });
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'acknowledged':
        return <Check className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status !== 'resolved');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  useEffect(() => {
    // Check for new alerts every 2 minutes
    const interval = setInterval(checkForNewAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alerts & Notifications</h2>
          <p className="text-muted-foreground">
            Monitor critical metrics and system events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={checkForNewAlerts}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Alerts
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-red-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.level === 'critical' && a.status !== 'resolved').length}
              </p>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.level === 'warning' && a.status !== 'resolved').length}
              </p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Info className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.level === 'info' && a.status !== 'resolved').length}
              </p>
              <p className="text-sm text-muted-foreground">Information</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts ({activeAlerts.length})
          </CardTitle>
          <CardDescription>
            Alerts that require attention or acknowledgment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active alerts. Everything looks good! 🎉
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Alert key={alert.id} className="relative">
                  <div className="flex items-start gap-3 w-full">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getAlertBadgeVariant(alert.level)}>
                          {alert.level}
                        </Badge>
                        <Badge variant="outline">{alert.category}</Badge>
                        {getStatusIcon(alert.status)}
                      </div>
                      <AlertDescription className="mb-3">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          {alert.status !== 'acknowledged' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Resolved Alerts ({resolvedAlerts.length})
            </CardTitle>
            <CardDescription>
              Recently resolved alerts for reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 py-2 opacity-60">
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Resolved</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlertsPanel;
