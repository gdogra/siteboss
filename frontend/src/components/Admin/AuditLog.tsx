import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: new Date('2024-01-20T10:30:00Z'),
          user: {
            id: 'admin-1',
            name: 'Demo User',
            email: 'demo@siteboss.com',
            role: 'company_admin'
          },
          action: 'role_change',
          resource: 'user:john.doe@acme.com',
          details: 'Changed role from worker to project_manager',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'warning'
        },
        {
          id: '2',
          timestamp: new Date('2024-01-20T09:15:00Z'),
          user: {
            id: 'admin-1',
            name: 'Demo User',
            email: 'demo@siteboss.com',
            role: 'company_admin'
          },
          action: 'login',
          resource: 'authentication',
          details: 'Successful login to admin panel',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        },
        {
          id: '3',
          timestamp: new Date('2024-01-19T16:45:00Z'),
          user: {
            id: 'pm-1',
            name: 'John Doe',
            email: 'john.doe@acme.com',
            role: 'project_manager'
          },
          action: 'project_create',
          resource: 'project:new-office-complex',
          details: 'Created new project: Downtown Office Complex',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          severity: 'info'
        },
        {
          id: '4',
          timestamp: new Date('2024-01-19T14:20:00Z'),
          user: {
            id: 'admin-1',
            name: 'Demo User',
            email: 'demo@siteboss.com',
            role: 'company_admin'
          },
          action: 'settings_change',
          resource: 'system_settings',
          details: 'Updated data retention policy to 365 days',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'warning'
        },
        {
          id: '5',
          timestamp: new Date('2024-01-19T12:10:00Z'),
          user: {
            id: 'worker-1',
            name: 'Mike Johnson',
            email: 'mike.johnson@acme.com',
            role: 'worker'
          },
          action: 'failed_login',
          resource: 'authentication',
          details: 'Failed login attempt - incorrect password',
          ipAddress: '192.168.1.110',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          severity: 'error'
        },
        {
          id: '6',
          timestamp: new Date('2024-01-18T18:30:00Z'),
          user: {
            id: 'admin-1',
            name: 'Demo User',
            email: 'demo@siteboss.com',
            role: 'company_admin'
          },
          action: 'user_invite',
          resource: 'user:sarah.wilson@acme.com',
          details: 'Invited new user with foreman role',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        }
      ];
      
      setLogs(mockLogs);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'role_change':
        return 'bg-purple-100 text-purple-800';
      case 'login':
      case 'logout':
        return 'bg-green-100 text-green-800';
      case 'failed_login':
        return 'bg-red-100 text-red-800';
      case 'project_create':
      case 'project_update':
        return 'bg-blue-100 text-blue-800';
      case 'settings_change':
        return 'bg-orange-100 text-orange-800';
      case 'user_invite':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
        <p className="mt-1 text-sm text-gray-600">
          Track user actions and system events for security and compliance
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="sm:w-48">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="sm:w-48">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="failed_login">Failed Login</option>
              <option value="role_change">Role Change</option>
              <option value="project_create">Project Create</option>
              <option value="settings_change">Settings Change</option>
              <option value="user_invite">User Invite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <li key={log.id} className="px-6 py-4">
              <div className="flex items-start space-x-4">
                {/* Severity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(log.severity)}
                </div>
                
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-900">
                    {log.details}
                  </p>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span>{log.user.name} ({log.user.email})</span>
                    </div>
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      <span>{log.user.role}</span>
                    </div>
                    <span>IP: {log.ipAddress}</span>
                    <span>Resource: {log.resource}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No logs match your current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;