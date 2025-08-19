
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  RefreshCw,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemAlert {
  id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  status: string;
  assigned_to: string;
  created_at: string;
  acknowledged_at: string;
  resolved_at: string;
  resolution_notes: string;
}

const AlertManagement = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [filterStatus, filterSeverity]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const filters = [];
      
      if (filterStatus !== 'all') {
        filters.push({
          name: "status",
          op: "Equal",
          value: filterStatus
        });
      }
      
      if (filterSeverity !== 'all') {
        filters.push({
          name: "severity",
          op: "Equal",
          value: filterSeverity
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(35451, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "created_at",
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      setAlerts(data?.List || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleAlerts = async () => {
    try {
      const sampleAlerts = [
        {
          alert_type: "security",
          severity: "critical",
          title: "Multiple Failed Login Attempts",
          description: "Detected 15 failed login attempts from IP 192.168.1.100 within 5 minutes",
          source: "Authentication System",
          status: "active",
          assigned_to: "",
          created_at: new Date().toISOString(),
          acknowledged_at: "",
          resolved_at: "",
          resolution_notes: ""
        },
        {
          alert_type: "performance",
          severity: "high",
          title: "High CPU Usage Detected",
          description: "CPU usage exceeded 90% threshold on server web-01",
          source: "System Monitor",
          status: "active",
          assigned_to: "",
          created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          acknowledged_at: "",
          resolved_at: "",
          resolution_notes: ""
        },
        {
          alert_type: "error",
          severity: "medium",
          title: "Database Connection Pool Full",
          description: "All database connections in use, new requests may be delayed",
          source: "Database Monitor",
          status: "acknowledged",
          assigned_to: "admin",
          created_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          acknowledged_at: new Date(Date.now() - 300000).toISOString(),
          resolved_at: "",
          resolution_notes: ""
        },
        {
          alert_type: "performance",
          severity: "low",
          title: "Disk Space Warning",
          description: "Disk usage on /var partition reached 80%",
          source: "System Monitor",
          status: "resolved",
          assigned_to: "admin",
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          acknowledged_at: new Date(Date.now() - 3000000).toISOString(),
          resolved_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          resolution_notes: "Cleaned up old log files and temporary data"
        }
      ];

      for (const alert of sampleAlerts) {
        const { error } = await window.ezsite.apis.tableCreate(35451, alert);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Sample alerts added successfully",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error adding sample alerts:', error);
      toast({
        title: "Error",
        description: "Failed to add sample alerts",
        variant: "destructive"
      });
    }
  };

  const acknowledgeAlert = async (alertId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(35451, {
        ID: alertId,
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
        assigned_to: "admin" // In a real app, this would be the current user
      });

      if (error) throw error;

      toast({
        title: "Alert Acknowledged",
        description: "Alert has been acknowledged and assigned to you",
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  const resolveAlert = async (alertId: number, resolutionNotes: string) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(35451, {
        ID: alertId,
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes
      });

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "Alert has been marked as resolved",
      });

      fetchAlerts();
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4" />;
      case 'acknowledged': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const alertCounts = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-gray-600">Monitor and manage system alerts and incidents</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchAlerts} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {alerts.length === 0 && (
            <Button onClick={addSampleAlerts} variant="outline" size="sm">
              Add Sample Alerts
            </Button>
          )}
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{alertCounts.total}</div>
            <div className="text-sm text-gray-600">Total Alerts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{alertCounts.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{alertCounts.acknowledged}</div>
            <div className="text-sm text-gray-600">Acknowledged</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{alertCounts.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-800">{alertCounts.critical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Severity:</label>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-600 text-center mb-4">
              No system alerts match your current filters. Add some sample data to get started.
            </p>
            <Button onClick={addSampleAlerts}>Add Sample Alerts</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {getStatusIcon(alert.status)}
                          <span className="ml-1 capitalize">{alert.status}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">{alert.alert_type}</span>
                      </div>
                      
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-gray-600">{alert.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Source: {alert.source}</span>
                        <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                        {alert.assigned_to && (
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            Assigned to: {alert.assigned_to}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{alert.title}</DialogTitle>
                          </DialogHeader>
                          <AlertDetails alert={alert} onResolve={resolveAlert} />
                        </DialogContent>
                      </Dialog>
                      
                      {alert.status === 'active' && (
                        <Button 
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AlertDetails = ({ alert, onResolve }: { alert: SystemAlert; onResolve: (id: number, notes: string) => void }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="font-medium">Alert Type:</label>
          <div className="capitalize">{alert.alert_type}</div>
        </div>
        <div>
          <label className="font-medium">Severity:</label>
          <Badge className={getSeverityColor(alert.severity)}>
            {alert.severity.toUpperCase()}
          </Badge>
        </div>
        <div>
          <label className="font-medium">Source:</label>
          <div>{alert.source}</div>
        </div>
        <div>
          <label className="font-medium">Status:</label>
          <Badge className={getStatusColor(alert.status)}>
            {alert.status.toUpperCase()}
          </Badge>
        </div>
      </div>
      
      <div>
        <label className="font-medium">Description:</label>
        <p className="text-gray-600 mt-1">{alert.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm">
        <div>
          <label className="font-medium">Created:</label>
          <div>{new Date(alert.created_at).toLocaleString()}</div>
        </div>
        {alert.acknowledged_at && (
          <div>
            <label className="font-medium">Acknowledged:</label>
            <div>{new Date(alert.acknowledged_at).toLocaleString()}</div>
          </div>
        )}
        {alert.resolved_at && (
          <div>
            <label className="font-medium">Resolved:</label>
            <div>{new Date(alert.resolved_at).toLocaleString()}</div>
          </div>
        )}
      </div>

      {alert.resolution_notes && (
        <div>
          <label className="font-medium">Resolution Notes:</label>
          <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded">{alert.resolution_notes}</p>
        </div>
      )}

      {alert.status !== 'resolved' && (
        <div className="space-y-3 pt-4 border-t">
          <label className="font-medium">Resolution Notes:</label>
          <Textarea
            placeholder="Enter resolution notes..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={() => onResolve(alert.id, resolutionNotes)}
            disabled={!resolutionNotes.trim()}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Resolved
          </Button>
        </div>
      )}
    </div>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-red-100 text-red-800';
    case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default AlertManagement;
