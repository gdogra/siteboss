
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Timer,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Filter,
  Search } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationSession {
  id: number;
  user_id: number;
  project_id: number;
  start_time: string;
  end_time: string;
  total_duration: number;
  work_duration: number;
  break_duration: number;
  geofence_violations: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  verified_by?: number;
  verified_at?: string;
  notes: string;
  events: VerificationEvent[];
}

interface VerificationEvent {
  id: number;
  event_type: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  geofence_status: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const SessionVerificationWorkflow: React.FC = () => {
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VerificationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filterStatus]);

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

      // Load sessions for verification
      const filters = filterStatus !== 'all' ?
      [{ name: 'verification_status', op: 'Equal', value: filterStatus }] :
      [];

      const sessionsResponse = await window.ezsite.apis.tablePage(35439, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'start_time',
        IsAsc: false,
        Filters: filters
      });

      if (sessionsResponse.error) throw sessionsResponse.error;

      const sessionsData = sessionsResponse.data?.List || [];

      // Load events for each session
      const sessionsWithEvents = await Promise.all(
        sessionsData.map(async (session: any) => {
          const eventsResponse = await window.ezsite.apis.tablePage(35437, {
            PageNo: 1,
            PageSize: 100,
            OrderByField: 'timestamp',
            IsAsc: true,
            Filters: [{ name: 'session_id', op: 'Equal', value: session.id }]
          });

          return {
            ...session,
            events: eventsResponse.data?.List || []
          };
        })
      );

      setSessions(sessionsWithEvents);

    } catch (error) {
      console.error('Error loading verification data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const approveSession = async (sessionId: number) => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      // Update session
      await window.ezsite.apis.tableUpdate(35439, {
        ID: sessionId,
        verification_status: 'approved',
        verified_by: userInfo.data.ID,
        verified_at: new Date().toISOString()
      });

      // Update all pending events in the session
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        for (const event of session.events) {
          if (event.verification_status === 'pending') {
            await window.ezsite.apis.tableUpdate(35437, {
              ID: event.id,
              verification_status: 'approved',
              verified_by: userInfo.data.ID,
              verified_at: new Date().toISOString(),
              notes: verificationNotes
            });
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Session approved successfully'
      });

      setVerificationNotes('');
      loadData();
      setSelectedSession(null);

    } catch (error) {
      console.error('Error approving session:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve session',
        variant: 'destructive'
      });
    }
  };

  const rejectSession = async (sessionId: number) => {
    if (!verificationNotes.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this session',
        variant: 'destructive'
      });
      return;
    }

    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      // Update session
      await window.ezsite.apis.tableUpdate(35439, {
        ID: sessionId,
        verification_status: 'rejected',
        verified_by: userInfo.data.ID,
        verified_at: new Date().toISOString(),
        notes: verificationNotes
      });

      // Update all pending events in the session
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        for (const event of session.events) {
          if (event.verification_status === 'pending') {
            await window.ezsite.apis.tableUpdate(35437, {
              ID: event.id,
              verification_status: 'rejected',
              verified_by: userInfo.data.ID,
              verified_at: new Date().toISOString(),
              notes: verificationNotes
            });
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Session rejected successfully'
      });

      setVerificationNotes('');
      loadData();
      setSelectedSession(null);

    } catch (error) {
      console.error('Error rejecting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject session',
        variant: 'destructive'
      });
    }
  };

  const approveEvent = async (eventId: number) => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      await window.ezsite.apis.tableUpdate(35437, {
        ID: eventId,
        verification_status: 'approved',
        verified_by: userInfo.data.ID,
        verified_at: new Date().toISOString()
      });

      toast({
        title: 'Success',
        description: 'Event approved'
      });

      loadData();
    } catch (error) {
      console.error('Error approving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve event',
        variant: 'destructive'
      });
    }
  };

  const rejectEvent = async (eventId: number, reason: string) => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      await window.ezsite.apis.tableUpdate(35437, {
        ID: eventId,
        verification_status: 'rejected',
        verified_by: userInfo.data.ID,
        verified_at: new Date().toISOString(),
        notes: reason
      });

      toast({
        title: 'Success',
        description: 'Event rejected'
      });

      loadData();
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject event',
        variant: 'destructive'
      });
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.ID === userId);
    return user ? (user as any).Name : `User ${userId}`;
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project ? (project as any).name : `Project ${projectId}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    const colors = {
      pending: 'text-yellow-600',
      approved: 'text-green-600',
      rejected: 'text-red-600'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>);

  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'clock_in':return <Clock className="h-4 w-4 text-green-600" />;
      case 'clock_out':return <Clock className="h-4 w-4 text-red-600" />;
      case 'break_start':return <Timer className="h-4 w-4 text-yellow-600" />;
      case 'break_end':return <Timer className="h-4 w-4 text-blue-600" />;
      default:return <Clock className="h-4 w-4" />;
    }
  };

  const pendingSessions = sessions.filter((s) => s.verification_status === 'pending');
  const approvedSessions = sessions.filter((s) => s.verification_status === 'approved');
  const rejectedSessions = sessions.filter((s) => s.verification_status === 'rejected');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) =>
          <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingSessions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedSessions.length}</p>
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
                <p className="text-2xl font-bold">{rejectedSessions.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sessions for Verification
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border rounded px-2 py-1">

                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ?
              <div className="text-center py-8 text-muted-foreground">
                  No sessions found for the selected filter
                </div> :

              <div className="space-y-4">
                  {sessions.map((session) =>
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''}`
                  }
                  onClick={() => setSelectedSession(session)}>

                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{getUserName(session.user_id)}</span>
                            {getStatusBadge(session.verification_status)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTime(session.start_time)}
                              {session.end_time && ` - ${formatTime(session.end_time)}`}
                            </div>
                            <div>
                              Project: {getProjectName(session.project_id)}
                            </div>
                            <div>
                              Duration: {formatDuration(session.work_duration)} work, {formatDuration(session.break_duration)} breaks
                            </div>
                            {session.geofence_violations > 0 &&
                        <div className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                {session.geofence_violations} geofence violations
                              </div>
                        }
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {session.events.length} events
                          </Badge>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </div>

        {/* Session Details */}
        <div>
          {selectedSession ?
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Session Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(selectedSession.verification_status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Worker:</span>
                    <span className="text-sm">{getUserName(selectedSession.user_id)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Project:</span>
                    <span className="text-sm">{getProjectName(selectedSession.project_id)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Work Hours:</span>
                    <span className="text-sm">{formatDuration(selectedSession.work_duration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Break Time:</span>
                    <span className="text-sm">{formatDuration(selectedSession.break_duration)}</span>
                  </div>

                  {selectedSession.geofence_violations > 0 &&
                <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {selectedSession.geofence_violations} geofence violations detected
                      </AlertDescription>
                    </Alert>
                }
                </div>

                {/* Events List */}
                <div className="space-y-3">
                  <h4 className="font-medium">Session Events</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedSession.events.map((event) =>
                  <div key={event.id} className="p-3 border rounded text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.event_type)}
                            <span className="font-medium">
                              {event.event_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {getStatusBadge(event.verification_status)}
                        </div>
                        
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatTime(event.timestamp)}
                        </div>
                        
                        {event.address &&
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.address}
                          </div>
                    }

                        <div className="mt-1 text-xs">
                          Accuracy: {Math.round(event.accuracy)}m • 
                          Geofence: {event.geofence_status}
                        </div>

                        {event.verification_status === 'pending' &&
                    <div className="mt-2 flex gap-1">
                            <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveEvent(event.id)}>

                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) rejectEvent(event.id, reason);
                        }}>

                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                    }
                      </div>
                  )}
                  </div>
                </div>

                {/* Verification Actions */}
                {selectedSession.verification_status === 'pending' &&
              <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Verification Notes</Label>
                      <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about your verification decision..."
                    rows={3} />

                    </div>

                    <div className="flex gap-2">
                      <Button
                    onClick={() => approveSession(selectedSession.id)}
                    className="flex-1">

                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                    onClick={() => rejectSession(selectedSession.id)}
                    variant="destructive"
                    className="flex-1">

                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
              }

                {/* Already Verified Info */}
                {selectedSession.verification_status !== 'pending' &&
              <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium">
                        {selectedSession.verification_status === 'approved' ? 'Approved' : 'Rejected'} by:
                      </div>
                      <div>
                        {getUserName(selectedSession.verified_by!)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(selectedSession.verified_at!)}
                      </div>
                      {selectedSession.notes &&
                  <div className="mt-2">
                          <div className="text-xs font-medium">Notes:</div>
                          <div className="text-xs">{selectedSession.notes}</div>
                        </div>
                  }
                    </div>
                  </div>
              }
              </CardContent>
            </Card> :

          <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Select a session to view details
                </div>
              </CardContent>
            </Card>
          }
        </div>
      </div>
    </div>);

};

export default SessionVerificationWorkflow;