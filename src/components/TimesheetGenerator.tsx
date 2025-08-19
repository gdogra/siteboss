
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Send,
  Download,
  Eye,
  Edit,
  Plus,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';

interface Timesheet {
  id: number;
  user_id: number;
  period_start: string;
  period_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  break_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  session_ids: string;
  generated_data: string;
}

interface TimesheetSession {
  id: number;
  start_time: string;
  end_time: string;
  total_duration: number;
  work_duration: number;
  break_duration: number;
  project_id: number;
  project_name: string;
  verification_status: string;
  geofence_violations: number;
  notes: string;
}

const TimesheetGenerator: React.FC = () => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [timesheetSessions, setTimesheetSessions] = useState<TimesheetSession[]>([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingTimesheet, setGeneratingTimesheet] = useState(false);
  
  // Form states
  const [selectedUser, setSelectedUser] = useState('');
  const [periodType, setPeriodType] = useState('week');
  const [periodStart, setPeriodStart] = useState<Date>(startOfWeek(new Date()));
  const [periodEnd, setPeriodEnd] = useState<Date>(endOfWeek(new Date()));
  const [approvalNotes, setApprovalNotes] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (periodType === 'week') {
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      setPeriodStart(start);
      setPeriodEnd(end);
    } else if (periodType === 'month') {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      setPeriodStart(start);
      setPeriodEnd(end);
    }
  }, [periodType]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load users
      const usersResponse = await window.ezsite.apis.tablePage(32152, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'Name',
        IsAsc: true,
        Filters: []
      });
      
      if (!usersResponse.error) {
        setUsers(usersResponse.data?.List || []);
      }

      // Load projects
      const projectsResponse = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: []
      });
      
      if (!projectsResponse.error) {
        setProjects(projectsResponse.data?.List || []);
      }

      // Load timesheets
      const timesheetsResponse = await window.ezsite.apis.tablePage(35509, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'period_start',
        IsAsc: false,
        Filters: []
      });

      if (timesheetsResponse.error) throw timesheetsResponse.error;
      setTimesheets(timesheetsResponse.data?.List || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load timesheet data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimesheet = async () => {
    if (!selectedUser) {
      toast({
        title: 'User Required',
        description: 'Please select a user to generate timesheet for',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGeneratingTimesheet(true);

      // Load sessions for the selected user and period
      const sessionsResponse = await window.ezsite.apis.tablePage(35439, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'start_time',
        IsAsc: true,
        Filters: [
          { name: 'user_id', op: 'Equal', value: parseInt(selectedUser) },
          { name: 'start_time', op: 'GreaterThanOrEqual', value: periodStart.toISOString() },
          { name: 'start_time', op: 'LessThanOrEqual', value: periodEnd.toISOString() },
          { name: 'status', op: 'Equal', value: 'completed' }
        ]
      });

      if (sessionsResponse.error) throw sessionsResponse.error;
      const sessions = sessionsResponse.data?.List || [];

      if (sessions.length === 0) {
        toast({
          title: 'No Sessions Found',
          description: 'No completed sessions found for the selected period',
          variant: 'destructive'
        });
        return;
      }

      // Calculate totals
      const totalHours = sessions.reduce((sum: number, session: any) => 
        sum + (session.total_duration || 0) / 60, 0
      );
      
      const workHours = sessions.reduce((sum: number, session: any) => 
        sum + (session.work_duration || 0) / 60, 0
      );
      
      const breakHours = sessions.reduce((sum: number, session: any) => 
        sum + (session.break_duration || 0) / 60, 0
      );

      // Calculate regular vs overtime (assuming 40 hours per week is regular)
      const weeklyHours = workHours;
      const regularHours = Math.min(weeklyHours, 40);
      const overtimeHours = Math.max(0, weeklyHours - 40);

      // Load project names for sessions
      const sessionsWithProjects = await Promise.all(
        sessions.map(async (session: any) => {
          const project = projects.find((p: any) => p.id === session.project_id);
          return {
            ...session,
            project_name: project ? (project as any).name : 'Unknown Project'
          };
        })
      );

      // Create timesheet
      const timesheetData = {
        user_id: parseInt(selectedUser),
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_hours: Math.round(totalHours * 100) / 100,
        regular_hours: Math.round(regularHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        break_hours: Math.round(breakHours * 100) / 100,
        status: 'draft',
        session_ids: JSON.stringify(sessions.map((s: any) => s.id)),
        generated_data: JSON.stringify({
          sessions: sessionsWithProjects,
          generation_date: new Date().toISOString(),
          period_type: periodType
        })
      };

      const response = await window.ezsite.apis.tableCreate(35509, timesheetData);
      if (response.error) throw response.error;

      toast({
        title: 'Timesheet Generated',
        description: `Timesheet created successfully with ${sessions.length} sessions`
      });

      loadData();
      setSelectedUser('');

    } catch (error) {
      console.error('Error generating timesheet:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate timesheet',
        variant: 'destructive'
      });
    } finally {
      setGeneratingTimesheet(false);
    }
  };

  const submitTimesheet = async (timesheetId: number) => {
    try {
      await window.ezsite.apis.tableUpdate(35509, {
        ID: timesheetId,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });

      toast({
        title: 'Timesheet Submitted',
        description: 'Timesheet submitted for approval'
      });

      loadData();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      toast({
        title: 'Submit Failed',
        description: 'Failed to submit timesheet',
        variant: 'destructive'
      });
    }
  };

  const approveTimesheet = async (timesheetId: number) => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      await window.ezsite.apis.tableUpdate(35509, {
        ID: timesheetId,
        status: 'approved',
        approved_by: userInfo.data.ID,
        approved_at: new Date().toISOString()
      });

      toast({
        title: 'Timesheet Approved',
        description: 'Timesheet has been approved'
      });

      loadData();
      setSelectedTimesheet(null);
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve timesheet',
        variant: 'destructive'
      });
    }
  };

  const rejectTimesheet = async (timesheetId: number) => {
    if (!approvalNotes.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }

    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      await window.ezsite.apis.tableUpdate(35509, {
        ID: timesheetId,
        status: 'rejected',
        approved_by: userInfo.data.ID,
        approved_at: new Date().toISOString(),
        rejection_reason: approvalNotes
      });

      toast({
        title: 'Timesheet Rejected',
        description: 'Timesheet has been rejected'
      });

      loadData();
      setSelectedTimesheet(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject timesheet',
        variant: 'destructive'
      });
    }
  };

  const deleteTimesheet = async (timesheetId: number) => {
    if (!confirm('Are you sure you want to delete this timesheet?')) return;

    try {
      await window.ezsite.apis.tableDelete(35509, { ID: timesheetId });

      toast({
        title: 'Timesheet Deleted',
        description: 'Timesheet has been deleted'
      });

      loadData();
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete timesheet',
        variant: 'destructive'
      });
    }
  };

  const viewTimesheetDetails = async (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet);
    
    try {
      if (timesheet.generated_data) {
        const data = JSON.parse(timesheet.generated_data);
        setTimesheetSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error parsing timesheet data:', error);
      setTimesheetSessions([]);
    }
  };

  const exportTimesheet = async (timesheet: Timesheet) => {
    try {
      const user = users.find((u: any) => u.ID === timesheet.user_id);
      const userName = user ? (user as any).Name : `User ${timesheet.user_id}`;
      
      let sessions: TimesheetSession[] = [];
      if (timesheet.generated_data) {
        const data = JSON.parse(timesheet.generated_data);
        sessions = data.sessions || [];
      }

      const csvContent = [
        [`Timesheet for ${userName}`],
        [`Period: ${format(new Date(timesheet.period_start), 'yyyy-MM-dd')} to ${format(new Date(timesheet.period_end), 'yyyy-MM-dd')}`],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [`Status: ${timesheet.status}`],
        [''],
        ['Summary'],
        ['Total Hours', timesheet.total_hours.toString()],
        ['Regular Hours', timesheet.regular_hours.toString()],
        ['Overtime Hours', timesheet.overtime_hours.toString()],
        ['Break Hours', timesheet.break_hours.toString()],
        [''],
        ['Session Details'],
        ['Date', 'Start Time', 'End Time', 'Project', 'Work Hours', 'Break Hours', 'Status', 'Notes']
      ];

      sessions.forEach(session => {
        csvContent.push([
          format(new Date(session.start_time), 'yyyy-MM-dd'),
          format(new Date(session.start_time), 'HH:mm'),
          session.end_time ? format(new Date(session.end_time), 'HH:mm') : '',
          session.project_name || '',
          (session.work_duration / 60).toFixed(2),
          (session.break_duration / 60).toFixed(2),
          session.verification_status || '',
          session.notes || ''
        ]);
      });

      const csv = csvContent.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timesheet-${userName}-${format(new Date(timesheet.period_start), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Timesheet exported successfully'
      });
    } catch (error) {
      console.error('Error exporting timesheet:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export timesheet',
        variant: 'destructive'
      });
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.ID === userId);
    return user ? (user as any).Name : `User ${userId}`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'outline',
      submitted: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;
    
    const icons = {
      draft: <Edit className="h-3 w-3 mr-1" />,
      submitted: <Send className="h-3 w-3 mr-1" />,
      approved: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const draftTimesheets = timesheets.filter(t => t.status === 'draft');
  const submittedTimesheets = timesheets.filter(t => t.status === 'submitted');
  const approvedTimesheets = timesheets.filter(t => t.status === 'approved');
  const rejectedTimesheets = timesheets.filter(t => t.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{draftTimesheets.length}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">{submittedTimesheets.length}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedTimesheets.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedTimesheets.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timesheet Generation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate New Timesheet
              </CardTitle>
              <CardDescription>Create timesheet from completed sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.ID} value={user.ID.toString()}>
                          {user.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Period Type</Label>
                  <Select value={periodType} onValueChange={setPeriodType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(periodStart, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={periodStart}
                        onSelect={(date) => date && setPeriodStart(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(periodEnd, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={periodEnd}
                        onSelect={(date) => date && setPeriodEnd(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                onClick={generateTimesheet} 
                disabled={generatingTimesheet || !selectedUser}
                className="w-full"
              >
                {generatingTimesheet ? 'Generating...' : 'Generate Timesheet'}
              </Button>
            </CardContent>
          </Card>

          {/* Timesheets List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Timesheets</CardTitle>
            </CardHeader>
            <CardContent>
              {timesheets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No timesheets generated yet
                </div>
              ) : (
                <div className="space-y-4">
                  {timesheets.slice(0, 10).map((timesheet) => (
                    <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getUserName(timesheet.user_id)}</span>
                          {getStatusBadge(timesheet.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(timesheet.period_start)} - {formatDate(timesheet.period_end)}
                        </div>
                        <div className="text-sm">
                          Total: {formatHours(timesheet.total_hours)} • 
                          Regular: {formatHours(timesheet.regular_hours)} • 
                          Overtime: {formatHours(timesheet.overtime_hours)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewTimesheetDetails(timesheet)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportTimesheet(timesheet)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {timesheet.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => submitTimesheet(timesheet.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {timesheet.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTimesheet(timesheet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timesheet Details */}
        <div>
          {selectedTimesheet ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Timesheet Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Employee:</span>
                    <span className="text-sm">{getUserName(selectedTimesheet.user_id)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(selectedTimesheet.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Period:</span>
                    <span className="text-sm">
                      {formatDate(selectedTimesheet.period_start)} - {formatDate(selectedTimesheet.period_end)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Hours Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium">Hours Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {formatHours(selectedTimesheet.total_hours)}
                      </div>
                      <div className="text-xs text-blue-600">Total Hours</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {formatHours(selectedTimesheet.regular_hours)}
                      </div>
                      <div className="text-xs text-green-600">Regular</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {formatHours(selectedTimesheet.overtime_hours)}
                      </div>
                      <div className="text-xs text-orange-600">Overtime</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {formatHours(selectedTimesheet.break_hours)}
                      </div>
                      <div className="text-xs text-purple-600">Breaks</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sessions */}
                <div className="space-y-3">
                  <h4 className="font-medium">Sessions ({timesheetSessions.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {timesheetSessions.map((session, index) => (
                      <div key={session.id} className="p-3 border rounded text-sm">
                        <div className="font-medium">{session.project_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(session.start_time), 'MMM dd, HH:mm')} - 
                          {session.end_time && format(new Date(session.end_time), 'HH:mm')}
                        </div>
                        <div className="mt-1">
                          Work: {formatHours(session.work_duration / 60)} • 
                          Break: {formatHours(session.break_duration / 60)}
                        </div>
                        {session.geofence_violations > 0 && (
                          <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {session.geofence_violations} violations
                          </div>
                        )}
                        <Badge variant="outline" className="mt-1">
                          {session.verification_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval Actions */}
                {selectedTimesheet.status === 'submitted' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Approval Notes</Label>
                        <Textarea
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          placeholder="Add notes about approval/rejection..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => approveTimesheet(selectedTimesheet.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectTimesheet(selectedTimesheet.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Approval Info */}
                {selectedTimesheet.status === 'approved' && selectedTimesheet.approved_at && (
                  <>
                    <Separator />
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700">
                        <div className="font-medium">Approved by:</div>
                        <div>{getUserName(selectedTimesheet.approved_by!)}</div>
                        <div className="text-xs">
                          {formatTime(selectedTimesheet.approved_at)}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedTimesheet.status === 'rejected' && (
                  <>
                    <Separator />
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-700">
                        <div className="font-medium">Rejected by:</div>
                        <div>{getUserName(selectedTimesheet.approved_by!)}</div>
                        <div className="text-xs">
                          {selectedTimesheet.approved_at && formatTime(selectedTimesheet.approved_at)}
                        </div>
                        {selectedTimesheet.rejection_reason && (
                          <div className="mt-2">
                            <div className="text-xs font-medium">Reason:</div>
                            <div className="text-xs">{selectedTimesheet.rejection_reason}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Select a timesheet to view details
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetGenerator;
