import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Users, Clock, Calendar as CalendarRange } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface WorkPeriod {
  id?: number;
  project_id: number;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  team_members: string;
  estimated_hours: number;
  actual_hours: number;
}

interface Project {
  id: number;
  name: string;
  client_name: string;
  status: string;
}

interface WorkPeriodFormProps {
  workPeriod?: WorkPeriod | null;
  onClose: () => void;
  onSuccess: () => void;
}

const WorkPeriodForm: React.FC<WorkPeriodFormProps> = ({ workPeriod, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<WorkPeriod>>({
    project_id: 0,
    start_date: '',
    end_date: '',
    description: '',
    status: 'Planned',
    team_members: '',
    estimated_hours: 0,
    actual_hours: 0
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    if (workPeriod) {
      setFormData(workPeriod);
      // Parse existing dates for date range
      if (workPeriod.start_date && workPeriod.end_date) {
        setDateRange({
          from: new Date(workPeriod.start_date),
          to: new Date(workPeriod.end_date)
        });
      }
    }
  }, [workPeriod]);

  // Update form data when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setFormData(prev => ({
        ...prev,
        start_date: dateRange.from?.toISOString().split('T')[0] || '',
        end_date: dateRange.to?.toISOString().split('T')[0] || ''
      }));
    }
  }, [dateRange]);

  const loadProjects = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [
          {
            name: 'status',
            op: 'Equal',
            value: 'In Progress'
          }
        ]
      });
      
      if (response.error) throw response.error;
      setProjects(response.data?.List || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a project',
        variant: 'destructive'
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Validation Error',
        description: 'Please select both start and end dates',
        variant: 'destructive'
      });
      return;
    }

    if (dateRange.from >= dateRange.to) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        created_at: workPeriod?.id ? undefined : new Date().toISOString()
      };

      let response;
      if (workPeriod?.id) {
        response = await window.ezsite.apis.tableUpdate(33268, {
          ...submitData,
          ID: workPeriod.id
        });
      } else {
        response = await window.ezsite.apis.tableCreate(33268, submitData);
      }

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: `Work period ${workPeriod?.id ? 'updated' : 'created'} successfully`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting work period:', error);
      toast({
        title: 'Error',
        description: 'Failed to save work period',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof WorkPeriod, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDateRangeText = () => {
    if (!dateRange?.from) return 'Select date range';
    if (!dateRange.to) return format(dateRange.from, 'MMM dd, yyyy');
    return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
  };

  const getDaysBetween = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">
              {workPeriod?.id ? 'Edit Work Period' : 'New Work Period'}
            </CardTitle>
            <CardDescription>
              Define a work period with specific date range and team assignments
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select
                value={formData.project_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('project_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name} - {project.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Selection */}
            <div className="space-y-2">
              <Label>Work Period Date Range *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {getDateRangeText()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              {dateRange?.from && dateRange?.to && (
                <p className="text-sm text-muted-foreground">
                  Duration: {getDaysBetween()} days
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the work activities planned for this period..."
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'Planned'}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <Label htmlFor="team_members">
                <Users className="inline h-4 w-4 mr-1" />
                Team Members
              </Label>
              <Textarea
                id="team_members"
                placeholder="List team members assigned to this work period (one per line or comma-separated)"
                rows={2}
                value={formData.team_members || ''}
                onChange={(e) => handleInputChange('team_members', e.target.value)}
              />
            </div>

            {/* Hours Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_hours">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Estimated Hours
                </Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={formData.estimated_hours || ''}
                  onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="actual_hours">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Actual Hours
                </Label>
                <Input
                  id="actual_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={formData.actual_hours || ''}
                  onChange={(e) => handleInputChange('actual_hours', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : workPeriod?.id ? 'Update Work Period' : 'Create Work Period'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkPeriodForm;