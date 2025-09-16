import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  ArrowLeft,
  Settings,
  Users,
  Bell,
  Shield,
  Save,
  Trash2,
  Plus,
  X,
  Mail,
  MessageCircle,
  Calendar
} from 'lucide-react';

const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  
  const project = projects.find(p => p.id === projectId);
  
  const [settings, setSettings] = useState(() => {
    // Try to load saved settings first
    const savedSettings = projectId ? localStorage.getItem(`project_settings_${projectId}`) : null;
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    // Default settings
    return {
      // General Settings
      name: project?.name || '',
      description: project?.description || '',
      budget: project?.budget || 0,
      startDate: project?.startDate || '',
      endDate: project?.endDate || '',
      priority: project?.priority || 'medium',
      status: project?.status || 'planning',
      
      // Notifications
      emailNotifications: true,
      smsNotifications: false,
      slackNotifications: true,
      dailyReports: true,
      weeklyReports: false,
      budgetAlerts: true,
      deadlineReminders: true,
      milestoneNotifications: true,
      
      // Permissions
      publicProject: false,
      allowGuestAccess: false,
      requireApprovalForChanges: true,
      enableTimeTracking: true,
      enableDocumentSharing: true,
      enableBudgetTracking: true
    };
  });

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Project Manager', permissions: ['read', 'write', 'admin'] },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Site Supervisor', permissions: ['read', 'write'] },
    { id: 3, name: 'Mike Wilson', email: 'mike@company.com', role: 'Contractor', permissions: ['read'] },
  ]);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Contractor');

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveSettings = () => {
    try {
      console.log('Save button clicked, projectId:', projectId);
      console.log('Settings to save:', settings);
      
      if (!projectId) {
        alert('Error: No project ID found');
        return;
      }

      updateProject(projectId, {
        name: settings.name,
        description: settings.description,
        budget: settings.budget,
        startDate: settings.startDate,
        endDate: settings.endDate,
        priority: settings.priority as any,
        status: settings.status as any,
      });
      
      // Save to localStorage for persistence
      localStorage.setItem(`project_settings_${projectId}`, JSON.stringify(settings));
      
      alert('Settings saved successfully!');
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Check console for details.');
    }
  };

  const addTeamMember = () => {
    if (newMemberEmail) {
      const newMember = {
        id: Date.now(),
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: newMemberRole,
        permissions: newMemberRole === 'Project Manager' ? ['read', 'write', 'admin'] : 
                    newMemberRole === 'Site Supervisor' ? ['read', 'write'] : ['read']
      };
      setTeamMembers([...teamMembers, newMember]);
      setNewMemberEmail('');
    }
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Project Manager': return 'bg-blue-100 text-blue-800';
      case 'Site Supervisor': return 'bg-green-100 text-green-800';
      case 'Contractor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/projects" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Project Settings</h1>
                  <p className="text-xs text-muted-foreground">{project.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team & Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={settings.budget}
                      onChange={(e) => setSettings({ ...settings, budget: Number(e.target.value) })}
                      placeholder="Enter project budget"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    placeholder="Enter project description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={settings.endDate}
                      onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={settings.priority}
                      onChange={(e) => setSettings({ ...settings, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={settings.status}
                      onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team & Permissions */}
          <TabsContent value="permissions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add new member */}
                    <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
                      <Input
                        placeholder="Enter email address"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="flex-1"
                      />
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="Project Manager">Project Manager</option>
                        <option value="Site Supervisor">Site Supervisor</option>
                        <option value="Contractor">Contractor</option>
                      </select>
                      <Button onClick={addTeamMember}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Team members list */}
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleColor(member.role)}>
                              {member.role}
                            </Badge>
                            <div className="flex gap-1">
                              {member.permissions.includes('read') && <Badge variant="outline" className="text-xs">Read</Badge>}
                              {member.permissions.includes('write') && <Badge variant="outline" className="text-xs">Write</Badge>}
                              {member.permissions.includes('admin') && <Badge variant="outline" className="text-xs">Admin</Badge>}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeTeamMember(member.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Public Project</Label>
                      <p className="text-sm text-muted-foreground">Allow anyone with the link to view this project</p>
                    </div>
                    <Switch 
                      checked={settings.publicProject}
                      onCheckedChange={(checked) => setSettings({ ...settings, publicProject: checked })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Guest Access</Label>
                      <p className="text-sm text-muted-foreground">Allow guest users to view project updates</p>
                    </div>
                    <Switch 
                      checked={settings.allowGuestAccess}
                      onCheckedChange={(checked) => setSettings({ ...settings, allowGuestAccess: checked })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Require Approval</Label>
                      <p className="text-sm text-muted-foreground">Changes require manager approval before being applied</p>
                    </div>
                    <Switch 
                      checked={settings.requireApprovalForChanges}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireApprovalForChanges: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Communication Channels
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch 
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive urgent updates via SMS</p>
                      </div>
                      <Switch 
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Slack Integration</Label>
                        <p className="text-sm text-muted-foreground">Send updates to Slack channel</p>
                      </div>
                      <Switch 
                        checked={settings.slackNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, slackNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Report Schedule
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Daily Reports</Label>
                        <p className="text-sm text-muted-foreground">Daily progress summaries</p>
                      </div>
                      <Switch 
                        checked={settings.dailyReports}
                        onCheckedChange={(checked) => setSettings({ ...settings, dailyReports: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Comprehensive weekly status reports</p>
                      </div>
                      <Switch 
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Alert Types
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Budget Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notifications when approaching budget limits</p>
                      </div>
                      <Switch 
                        checked={settings.budgetAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, budgetAlerts: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Deadline Reminders</Label>
                        <p className="text-sm text-muted-foreground">Alerts for upcoming deadlines</p>
                      </div>
                      <Switch 
                        checked={settings.deadlineReminders}
                        onCheckedChange={(checked) => setSettings({ ...settings, deadlineReminders: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Milestone Notifications</Label>
                        <p className="text-sm text-muted-foreground">Alerts when milestones are completed</p>
                      </div>
                      <Switch 
                        checked={settings.milestoneNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, milestoneNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Feature Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Time Tracking</Label>
                        <p className="text-sm text-muted-foreground">Enable time tracking for this project</p>
                      </div>
                      <Switch 
                        checked={settings.enableTimeTracking}
                        onCheckedChange={(checked) => setSettings({ ...settings, enableTimeTracking: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Document Sharing</Label>
                        <p className="text-sm text-muted-foreground">Allow team members to share documents</p>
                      </div>
                      <Switch 
                        checked={settings.enableDocumentSharing}
                        onCheckedChange={(checked) => setSettings({ ...settings, enableDocumentSharing: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Budget Tracking</Label>
                        <p className="text-sm text-muted-foreground">Enable budget tracking and expense management</p>
                      </div>
                      <Switch 
                        checked={settings.enableBudgetTracking}
                        onCheckedChange={(checked) => setSettings({ ...settings, enableBudgetTracking: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                  <div className="border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium text-red-600">Delete Project</Label>
                        <p className="text-sm text-muted-foreground">Permanently delete this project and all its data</p>
                      </div>
                      <Button variant="destructive" className="ml-4">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Project
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectSettingsPage;