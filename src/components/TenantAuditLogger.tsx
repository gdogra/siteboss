
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Shield,
  User,
  Settings,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AuditLog {
  id: number;
  tenant_id: number;
  tenant_name?: string;
  user_id: number;
  user_name?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: string;
  new_values: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'pending';
}

interface TenantAuditLoggerProps {
  tenantId?: number;
}

const TenantAuditLogger: React.FC<TenantAuditLoggerProps> = ({ tenantId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const { toast } = useToast();

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const filters = [];
      
      if (tenantId) {
        filters.push({ name: "tenant_id", op: "Equal", value: tenantId });
      }
      
      if (searchTerm) {
        filters.push({ name: "action", op: "StringContains", value: searchTerm });
      }
      
      if (selectedAction !== 'all') {
        filters.push({ name: "action", op: "StringContains", value: selectedAction });
      }
      
      if (selectedSeverity !== 'all') {
        filters.push({ name: "severity", op: "Equal", value: selectedSeverity });
      }
      
      if (dateRange.from) {
        filters.push({ name: "timestamp", op: "GreaterThanOrEqual", value: dateRange.from.toISOString() });
      }
      
      if (dateRange.to) {
        filters.push({ name: "timestamp", op: "LessThanOrEqual", value: dateRange.to.toISOString() });
      }

      const { data, error } = await window.ezsite.apis.tablePage(35609, {
        PageNo: currentPage,
        PageSize: pageSize,
        OrderByField: "timestamp",
        IsAsc: false,
        Filters: filters
      });

      if (error) throw error;

      // Get tenant names and user names for enrichment
      const logs = data?.List || [];
      const tenantIds = [...new Set(logs.map((l: any) => l.tenant_id))];
      const userIds = [...new Set(logs.map((l: any) => l.user_id))];

      // Load tenant info
      const { data: tenantsData } = await window.ezsite.apis.tablePage(35554, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "ID",
        IsAsc: false,
        Filters: []
      });

      // Load user info
      const { data: usersData } = await window.ezsite.apis.tablePage(32152, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: "ID",
        IsAsc: false,
        Filters: []
      });

      const tenantMap = new Map((tenantsData?.List || []).map((t: any) => [t.id, t.name]));
      const userMap = new Map((usersData?.List || []).map((u: any) => [u.ID, u.Name]));

      const enrichedLogs = logs.map((log: any) => ({
        ...log,
        tenant_name: tenantMap.get(log.tenant_id) || `Tenant ${log.tenant_id}`,
        user_name: userMap.get(log.user_id) || `User ${log.user_id}`
      }));

      setAuditLogs(enrichedLogs);
      setTotalCount(data?.VirtualCount || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [tenantId, currentPage, searchTerm, selectedAction, selectedSeverity, dateRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('auth')) return User;
    if (action.includes('create') || action.includes('update') || action.includes('delete')) return Database;
    if (action.includes('config') || action.includes('setting')) return Settings;
    if (action.includes('security') || action.includes('permission')) return Shield;
    return Eye;
  };

  const exportLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Tenant', 'User', 'Action', 'Resource Type', 'Resource ID', 'Severity', 'Status', 'IP Address'].join(','),
        ...auditLogs.map(log => [
          log.timestamp,
          log.tenant_name,
          log.user_name,
          log.action,
          log.resource_type,
          log.resource_id,
          log.severity,
          log.status,
          log.ip_address
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Audit logs exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login/Auth</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="config">Configuration</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={exportLogs} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Audit Logs</h3>
            <p className="text-sm text-gray-500">{totalCount} total records</p>
          </div>
          <Button onClick={loadAuditLogs} variant="outline" size="sm" disabled={loading}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs</h3>
            <p className="mt-1 text-sm text-gray-500">
              No audit logs match the current filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <ActionIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {log.action}
                          </h4>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <span className="font-medium">Tenant:</span> {log.tenant_name}
                          </div>
                          <div>
                            <span className="font-medium">User:</span> {log.user_name}
                          </div>
                          <div>
                            <span className="font-medium">Resource:</span> {log.resource_type} #{log.resource_id}
                          </div>
                          <div>
                            <span className="font-medium">IP:</span> {log.ip_address}
                          </div>
                        </div>
                        
                        {(log.old_values || log.new_values) && (
                          <Tabs defaultValue="changes" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="changes">Changes</TabsTrigger>
                              <TabsTrigger value="details">Details</TabsTrigger>
                            </TabsList>
                            <TabsContent value="changes" className="mt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {log.old_values && (
                                  <div>
                                    <span className="font-medium text-red-600">Before:</span>
                                    <pre className="mt-1 p-2 bg-red-50 rounded text-xs whitespace-pre-wrap">
                                      {JSON.stringify(JSON.parse(log.old_values || '{}'), null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.new_values && (
                                  <div>
                                    <span className="font-medium text-green-600">After:</span>
                                    <pre className="mt-1 p-2 bg-green-50 rounded text-xs whitespace-pre-wrap">
                                      {JSON.stringify(JSON.parse(log.new_values || '{}'), null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="details" className="mt-2">
                              <div className="text-xs text-gray-600">
                                <p><span className="font-medium">User Agent:</span> {log.user_agent}</p>
                                <p><span className="font-medium">Timestamp:</span> {new Date(log.timestamp).toLocaleString()}</p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * pageSize >= totalCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TenantAuditLogger;
