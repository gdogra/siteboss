
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  UserX,
  Activity,
  RefreshCw,
  TrendingUp,
  Clock } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityIncident {
  id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  status: string;
  created_at: string;
}

const SecurityIncidentTracker = () => {
  const { toast } = useToast();
  const [securityAlerts, setSecurityAlerts] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSecurityIncidents();
    const interval = setInterval(fetchSecurityIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityIncidents = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35451, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "created_at",
        IsAsc: false,
        Filters: [
        {
          name: "alert_type",
          op: "Equal",
          value: "security"
        }]

      });

      if (error) throw error;

      setSecurityAlerts(data?.List || []);
    } catch (error) {
      console.error('Error fetching security incidents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security incidents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleSecurityIncidents = async () => {
    try {
      const sampleIncidents = [
      {
        alert_type: "security",
        severity: "critical",
        title: "Brute Force Attack Detected",
        description: "Multiple failed login attempts from IP 203.0.113.42. Pattern suggests automated attack.",
        source: "Intrusion Detection System",
        status: "active",
        created_at: new Date().toISOString()
      },
      {
        alert_type: "security",
        severity: "high",
        title: "Suspicious API Access Pattern",
        description: "Unusual API access pattern detected. Potential data scraping attempt.",
        source: "API Monitor",
        status: "acknowledged",
        created_at: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
      },
      {
        alert_type: "security",
        severity: "medium",
        title: "Failed Admin Login",
        description: "Admin login failure from unrecognized location: Singapore",
        source: "Authentication System",
        status: "resolved",
        created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      },
      {
        alert_type: "security",
        severity: "high",
        title: "SQL Injection Attempt",
        description: "SQL injection patterns detected in request parameters",
        source: "Web Application Firewall",
        status: "active",
        created_at: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
      },
      {
        alert_type: "security",
        severity: "low",
        title: "Unusual File Upload",
        description: "File upload with suspicious extension detected and blocked",
        source: "File Security Scanner",
        status: "resolved",
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }];


      for (const incident of sampleIncidents) {
        const { error } = await window.ezsite.apis.tableCreate(35451, incident);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Sample security incidents added successfully"
      });

      fetchSecurityIncidents();
    } catch (error) {
      console.error('Error adding sample security incidents:', error);
      toast({
        title: "Error",
        description: "Failed to add sample security incidents",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':return 'bg-red-100 text-red-800 border-red-200';
      case 'high':return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':return 'bg-blue-100 text-blue-800 border-blue-200';
      default:return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':return 'bg-red-100 text-red-800';
      case 'acknowledged':return 'bg-yellow-100 text-yellow-800';
      case 'resolved':return 'bg-green-100 text-green-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getThreatIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('brute') || lower.includes('login')) return <UserX className="h-5 w-5" />;
    if (lower.includes('sql') || lower.includes('injection')) return <AlertTriangle className="h-5 w-5" />;
    if (lower.includes('api')) return <Activity className="h-5 w-5" />;
    if (lower.includes('upload') || lower.includes('file')) return <Eye className="h-5 w-5" />;
    return <Shield className="h-5 w-5" />;
  };

  // Calculate security metrics
  const criticalIncidents = securityAlerts.filter((a) => a.severity === 'critical').length;
  const activeIncidents = securityAlerts.filter((a) => a.status === 'active').length;
  const resolvedIncidents = securityAlerts.filter((a) => a.status === 'resolved').length;
  const recentIncidents = securityAlerts.filter((a) =>
  Date.now() - new Date(a.created_at).getTime() < 3600000 // Last hour
  ).length;

  // Mock security metrics
  const securityScore = Math.max(0, 100 - criticalIncidents * 20 - activeIncidents * 10);
  const threatLevel = criticalIncidents > 0 ? 'High' : activeIncidents > 2 ? 'Medium' : 'Low';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Incident Tracker</h2>
          <p className="text-gray-600">Monitor and respond to security threats and incidents</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchSecurityIncidents} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {securityAlerts.length === 0 &&
          <Button onClick={addSampleSecurityIncidents} variant="outline" size="sm">
              Add Sample Data
            </Button>
          }
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityScore}</div>
            <Progress value={securityScore} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 mt-2">
              Overall security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${threatLevel === 'High' ? 'text-red-600' : threatLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${threatLevel === 'High' ? 'text-red-600' : threatLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
              {threatLevel}
            </div>
            <p className="text-xs text-gray-500">
              Current threat assessment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeIncidents}</div>
            <p className="text-xs text-gray-500">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{recentIncidents}</div>
            <p className="text-xs text-gray-500">
              In the last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Recent Security Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {securityAlerts.length === 0 ?
            <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Security Incidents</h3>
                <p className="text-gray-600 mb-4">No security incidents found. Add sample data to get started.</p>
                <Button onClick={addSampleSecurityIncidents}>Add Sample Data</Button>
              </div> :

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {securityAlerts.slice(0, 10).map((incident) =>
              <div key={incident.id} className={`p-4 rounded-lg border ${getSeverityColor(incident.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-current">
                          {getThreatIcon(incident.title)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{incident.title}</h4>
                          <p className="text-sm mt-1 opacity-80">{incident.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                            <span className="text-xs opacity-60">{incident.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs opacity-60">
                        {new Date(incident.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
              )}
              </div>
            }
          </CardContent>
        </Card>

        {/* Security Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Security Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Critical Incidents</span>
                <span className="text-sm font-bold text-red-600">{criticalIncidents}</span>
              </div>
              <Progress value={criticalIncidents / Math.max(securityAlerts.length, 1) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Resolution Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {securityAlerts.length > 0 ? Math.round(resolvedIncidents / securityAlerts.length * 100) : 0}%
                </span>
              </div>
              <Progress value={securityAlerts.length > 0 ? resolvedIncidents / securityAlerts.length * 100 : 0} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <h4 className="font-medium">Threat Categories</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Authentication</span>
                  <span>{securityAlerts.filter((a) => a.title.toLowerCase().includes('login') || a.title.toLowerCase().includes('auth')).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Injection Attacks</span>
                  <span>{securityAlerts.filter((a) => a.title.toLowerCase().includes('sql') || a.title.toLowerCase().includes('injection')).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>API Security</span>
                  <span>{securityAlerts.filter((a) => a.title.toLowerCase().includes('api')).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Security</span>
                  <span>{securityAlerts.filter((a) => a.title.toLowerCase().includes('file') || a.title.toLowerCase().includes('upload')).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      {criticalIncidents > 0 &&
      <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Security Alert:</strong> You have {criticalIncidents} critical security incident(s) that require immediate attention. 
            Please review and respond to these incidents as soon as possible.
          </AlertDescription>
        </Alert>
      }

      {activeIncidents > 0 && criticalIncidents === 0 &&
      <Alert className="border-yellow-200 bg-yellow-50">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> You have {activeIncidents} active security incident(s). 
            Regular monitoring and prompt response help maintain system security.
          </AlertDescription>
        </Alert>
      }

      {securityAlerts.length > 0 && activeIncidents === 0 &&
      <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Status:</strong> All security incidents have been addressed. 
            Your system security appears to be in good standing.
          </AlertDescription>
        </Alert>
      }
    </div>);

};

export default SecurityIncidentTracker;