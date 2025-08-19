
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  FolderOpen,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  FileText } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientPortalLayout from '@/components/ClientPortalLayout';
import { useToast } from '@/hooks/use-toast';

const ClientProjects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchLogs();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);
      setProjects(data?.List || []);
    } catch (error: any) {
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32234, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "id",
        IsAsc: false,
        Filters: []
      });

      if (!error && data?.List) {
        setLogs(data.List);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const getProjectStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateProjectProgress = (project: any) => {
    switch (project.status?.toLowerCase()) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 60;
      case 'pending':
        return 20;
      default:
        return 0;
    }
  };

  const getProjectLogs = (projectId: number) => {
    return logs.filter((log) => log.project_id === projectId).slice(0, 5);
  };

  const filteredProjects = projects.filter((project) =>
  project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ClientPortalLayout>);

  }

  return (
    <ClientPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              View and track the progress of your projects
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9" />

        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) =>
          <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {getProjectStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{project.description}</p>
                
                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{calculateProjectProgress(project)}%</span>
                  </div>
                  <Progress value={calculateProjectProgress(project)} />
                </div>

                {/* Recent Activity */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Activity</h4>
                  <div className="space-y-1">
                    {getProjectLogs(project.id).slice(0, 3).map((log) =>
                  <div key={log.id} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {log.description} - {new Date(log.created_at).toLocaleDateString()}
                      </div>
                  )}
                    {getProjectLogs(project.id).length === 0 &&
                  <p className="text-xs text-muted-foreground">No recent activity</p>
                  }
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProject(project)}>

                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/client/documents', { state: { projectId: project.id } })}>

                    <FileText className="h-4 w-4 mr-1" />
                    Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* No projects message */}
        {filteredProjects.length === 0 &&
        <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No projects match your search criteria.' : 'You don\'t have any projects yet.'}
            </p>
          </div>
        }

        {/* Project Details Modal */}
        {selectedProject &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedProject.name}</CardTitle>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProject(null)}>

                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedProject.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Project Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p>{new Date(selectedProject.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p>{new Date(selectedProject.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status & Progress</h4>
                  <div className="space-y-2">
                    {getProjectStatusBadge(selectedProject.status)}
                    <Progress value={calculateProjectProgress(selectedProject)} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Activity Log</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getProjectLogs(selectedProject.id).map((log) =>
                  <div key={log.id} className="p-2 bg-muted rounded text-sm">
                        <p>{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      </div>
    </ClientPortalLayout>);

};

export default ClientProjects;