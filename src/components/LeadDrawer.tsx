
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar,
  Star,
  MessageSquare,
  ArrowRight,
  Plus,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Lead {
  ID: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company: string;
  address: string;
  project_type: string;
  project_description: string;
  budget_min: number;
  budget_max: number;
  lead_source: string;
  status: string;
  owner_id: number;
  score: number;
  notes: string;
  next_action_at: string;
  converted_project_id: number;
  created_at: string;
  updated_at: string;
}

interface Activity {
  ID: number;
  lead_id: number;
  user_id: number;
  activity_type: string;
  title: string;
  description: string;
  old_value: string;
  new_value: string;
  scheduled_at: string;
  completed_at: string;
  created_at: string;
}

interface Tag {
  ID: number;
  name: string;
  color: string;
}

interface LeadDrawerProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentUser: any;
}

const LeadDrawer: React.FC<LeadDrawerProps> = ({ lead, isOpen, onClose, onUpdate, currentUser }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newActivityType, setNewActivityType] = useState('NOTE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
      fetchTags();
    }
  }, [isOpen, lead.ID]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(33727, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'lead_id', op: 'Equal', value: lead.ID }
        ]
      });
      
      if (error) throw error;
      setActivities(data.List);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(33729, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'lead_id', op: 'Equal', value: lead.ID }
        ]
      });
      
      if (error) throw error;
      
      // Fetch tag details for each association
      const tagPromises = data.List.map(async (assoc: any) => {
        const tagResponse = await window.ezsite.apis.tablePage(33728, {
          PageNo: 1,
          PageSize: 1,
          Filters: [{ name: 'ID', op: 'Equal', value: assoc.tag_id }]
        });
        return tagResponse.data?.List[0];
      });
      
      const tagResults = await Promise.all(tagPromises);
      setTags(tagResults.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const addActivity = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      
      const activityData = {
        lead_id: lead.ID,
        user_id: currentUser?.ID || 0,
        activity_type: newActivityType,
        title: newActivityType === 'NOTE' ? 'Note Added' : 'Activity Logged',
        description: newNote,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { error } = await window.ezsite.apis.tableCreate(33727, activityData);
      if (error) throw error;

      setNewNote('');
      fetchActivities();
      
      toast({
        title: "Success",
        description: "Activity added successfully"
      });
    } catch (error) {
      console.error('Failed to add activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToProject = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await window.ezsite.apis.run({
        path: "convertLeadToProject",
        param: [lead.ID, currentUser?.ID || 0]
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Lead converted to project: ${data.projectName}`
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to convert lead:', error);
      toast({
        title: "Error",
        description: "Failed to convert lead to project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      'CALL': <Phone className="w-4 h-4" />,
      'EMAIL': <Mail className="w-4 h-4" />,
      'NOTE': <MessageSquare className="w-4 h-4" />,
      'STATUS_CHANGE': <ArrowRight className="w-4 h-4" />,
      'TASK': <CheckCircle className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <MessageSquare className="w-4 h-4" />;
  };

  const canConvert = lead.status !== 'WON' && lead.status !== 'LOST' && lead.converted_project_id === 0;
  const canEdit = currentUser?.Roles?.includes('Administrator') || 
                 (currentUser?.Roles?.includes('Sales') && lead.owner_id === currentUser.ID);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {lead.contact_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{lead.contact_name}</h2>
                <p className="text-sm text-gray-500">{lead.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="capitalize">{lead.status.toLowerCase()}</Badge>
              <Badge variant="outline">Score: {lead.score}</Badge>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{lead.contact_name}</span>
              </div>
              
              {lead.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:underline">
                    {lead.contact_email}
                  </a>
                </div>
              )}
              
              {lead.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${lead.contact_phone}`} className="text-blue-600 hover:underline">
                    {lead.contact_phone}
                  </a>
                </div>
              )}
              
              {lead.company && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{lead.company}</span>
                </div>
              )}
              
              {lead.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{lead.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.project_type && (
                <div>
                  <span className="font-medium">Type: </span>
                  <span>{lead.project_type}</span>
                </div>
              )}
              
              {lead.project_description && (
                <div>
                  <span className="font-medium">Description: </span>
                  <p className="text-gray-600">{lead.project_description}</p>
                </div>
              )}
              
              {(lead.budget_min > 0 || lead.budget_max > 0) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Budget: </span>
                  <span>
                    {lead.budget_min > 0 && lead.budget_max > 0
                      ? `${formatCurrency(lead.budget_min)} - ${formatCurrency(lead.budget_max)}`
                      : formatCurrency(lead.budget_max || lead.budget_min)
                    }
                  </span>
                </div>
              )}
              
              <div>
                <span className="font-medium">Source: </span>
                <Badge variant="outline" className="ml-2">
                  {lead.lead_source.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag.ID} 
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Add Activity */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={newActivityType} onValueChange={setNewActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="TASK">Task</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Add your activity details..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                
                <Button onClick={addActivity} disabled={loading || !newNote.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activities yet</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.ID} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                        {activity.old_value && activity.new_value && (
                          <p className="text-xs text-gray-500 mt-1">
                            Changed from "{activity.old_value}" to "{activity.new_value}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Convert to Project */}
          {canConvert && canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convert to Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Ready to convert this lead to a project? This will mark the lead as won and create a new project record.
                </p>
                <Button onClick={convertToProject} disabled={loading} className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Convert to Project
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Lead Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(lead.created_at).toLocaleString()}</span>
              </div>
              
              {lead.next_action_at && (
                <div className="flex justify-between">
                  <span>Next Action:</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(lead.next_action_at).toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Score:</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{lead.score}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDrawer;
