
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle } from
'lucide-react';

interface LeadSummaryProps {
  currentUser: any;
}

const LeadSummary: React.FC<LeadSummaryProps> = ({ currentUser }) => {
  const [summary, setSummary] = useState({
    total: 0,
    byStatus: {},
    totalValue: 0,
    averageScore: 0,
    slaAlerts: {
      overdue: 0,
      dueToday: 0,
      dueSoon: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadSummary();
  }, []);

  const fetchLeadSummary = async () => {
    try {
      setLoading(true);

      // Fetch all leads
      const { data, error } = await window.ezsite.apis.tablePage(33726, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      const leads = data.List || [];

      // Calculate summary statistics
      const byStatus = leads.reduce((acc: any, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      const totalValue = leads.reduce((sum: number, lead: any) => {
        return sum + (lead.budget_max || lead.budget_min || 0);
      }, 0);

      const averageScore = leads.length > 0 ?
      leads.reduce((sum: number, lead: any) => sum + (lead.score || 0), 0) / leads.length :
      0;

      // Calculate SLA alerts
      const now = new Date();
      const slaAlerts = leads.reduce((acc: any, lead: any) => {
        if (!lead.next_action_at || lead.status === 'WON' || lead.status === 'LOST') {
          return acc;
        }

        const nextAction = new Date(lead.next_action_at);
        const hoursUntilDue = (nextAction.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) acc.overdue++;else
        if (hoursUntilDue < 6) acc.dueToday++;else
        if (hoursUntilDue < 24) acc.dueSoon++;

        return acc;
      }, { overdue: 0, dueToday: 0, dueSoon: 0 });

      setSummary({
        total: leads.length,
        byStatus,
        totalValue,
        averageScore: Math.round(averageScore),
        slaAlerts
      });
    } catch (error) {
      console.error('Failed to fetch lead summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string;} = {
      'NEW': 'bg-blue-100 text-blue-800',
      'QUALIFYING': 'bg-yellow-100 text-yellow-800',
      'CONTACTED': 'bg-purple-100 text-purple-800',
      'ESTIMATE_SENT': 'bg-indigo-100 text-indigo-800',
      'NEGOTIATING': 'bg-orange-100 text-orange-800',
      'WON': 'bg-green-100 text-green-800',
      'LOST': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WON':return <CheckCircle className="w-4 h-4" />;
      case 'LOST':return <XCircle className="w-4 h-4" />;
      default:return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) =>
        <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              Active pipeline leads
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total potential revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Out of 100 points
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.slaAlerts.overdue + summary.slaAlerts.dueToday}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.byStatus).map(([status, count]) =>
              <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  <Badge className={getStatusColor(status)}>
                    {count as number}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Overdue</span>
                </div>
                <Badge variant="destructive">
                  {summary.slaAlerts.overdue}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Due Today</span>
                </div>
                <Badge variant="outline" className="text-orange-600">
                  {summary.slaAlerts.dueToday}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>Due Soon</span>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  {summary.slaAlerts.dueSoon}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default LeadSummary;