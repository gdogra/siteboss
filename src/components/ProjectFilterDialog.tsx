import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import InfoTooltip, { HelpTooltip } from '@/components/InfoTooltip';
import { Calendar, X, Filter, RotateCcw } from 'lucide-react';

export interface ProjectFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  taskStatus: string[];
  priority: string[];
  teamMembers: string[];
  completionPercentage: {
    min: number;
    max: number;
  };
  overdue: boolean;
  phases: string[];
  searchText: string;
}

interface Props {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  teamMembers: Array<{ id: string; name: string; role: string }>;
  availablePhases: string[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const defaultFilters: ProjectFilters = {
  dateRange: {
    startDate: '',
    endDate: ''
  },
  taskStatus: [],
  priority: [],
  teamMembers: [],
  completionPercentage: {
    min: 0,
    max: 100
  },
  overdue: false,
  phases: [],
  searchText: ''
};

const taskStatuses = [
  { value: 'not_started', label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const ProjectFilterDialog: React.FC<Props> = ({
  filters,
  onFiltersChange,
  teamMembers,
  availablePhases,
  trigger,
  open,
  onOpenChange
}) => {
  const [localFilters, setLocalFilters] = useState<ProjectFilters>(filters);
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    handleOpenChange(false);
  };

  const handleResetFilters = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const updateFilter = <K extends keyof ProjectFilters>(
    key: K,
    value: ProjectFilters[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (
    filterKey: 'taskStatus' | 'priority' | 'teamMembers' | 'phases',
    value: string
  ) => {
    const current = localFilters[filterKey] as string[];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(filterKey, updated);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.dateRange.startDate || localFilters.dateRange.endDate) count++;
    if (localFilters.taskStatus.length > 0) count++;
    if (localFilters.priority.length > 0) count++;
    if (localFilters.teamMembers.length > 0) count++;
    if (localFilters.completionPercentage.min > 0 || localFilters.completionPercentage.max < 100) count++;
    if (localFilters.overdue) count++;
    if (localFilters.phases.length > 0) count++;
    if (localFilters.searchText.trim()) count++;
    return count;
  };

  const TriggerButton = trigger || (
    <Button variant="outline" size="sm">
      <Filter className="w-4 h-4 mr-2" />
      Filter
      {getActiveFiltersCount() > 0 && (
        <Badge variant="secondary" className="ml-2 text-xs">
          {getActiveFiltersCount()}
        </Badge>
      )}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Project Data
            <HelpTooltip
              title="Smart Filtering"
              content="Apply multiple filters simultaneously to focus on specific project data. Filters work together to narrow down results."
              impact="Effective filtering helps identify issues, track progress, and make data-driven decisions."
            />
          </DialogTitle>
          <DialogDescription>
            Filter tasks, milestones, and project data by various criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search Text */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search tasks, descriptions, team members..."
              value={localFilters.searchText}
              onChange={(e) => updateFilter('searchText', e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Label>
              <InfoTooltip
                content="Filter tasks by their due dates to focus on specific time periods."
                impact="Date filtering helps identify overdue items, plan upcoming work, and track timeline performance."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate" className="text-sm text-muted-foreground">From</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={localFilters.dateRange.startDate}
                  onChange={(e) => updateFilter('dateRange', {
                    ...localFilters.dateRange,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm text-muted-foreground">To</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={localFilters.dateRange.endDate}
                  onChange={(e) => updateFilter('dateRange', {
                    ...localFilters.dateRange,
                    endDate: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Task Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label>Task Status</Label>
              <InfoTooltip
                content="Filter by task completion status to focus on specific workflow stages."
                impact="Status filtering helps identify bottlenecks, track progress, and allocate resources effectively."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {taskStatuses.map(status => (
                <div
                  key={status.value}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                    localFilters.taskStatus.includes(status.value)
                      ? status.color + ' ring-2 ring-offset-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleArrayFilter('taskStatus', status.value)}
                >
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label>Priority</Label>
              <InfoTooltip
                content="Filter by task priority to focus on critical path items and urgent work."
                impact="Priority filtering ensures critical tasks get attention and helps prevent project delays."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {priorities.map(priority => (
                <div
                  key={priority.value}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                    localFilters.priority.includes(priority.value)
                      ? priority.color + ' ring-2 ring-offset-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleArrayFilter('priority', priority.value)}
                >
                  <span className="text-sm font-medium">{priority.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={localFilters.teamMembers.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('teamMembers', [...localFilters.teamMembers, member.id]);
                        } else {
                          updateFilter('teamMembers', localFilters.teamMembers.filter(id => id !== member.id));
                        }
                      }}
                    />
                    <Label htmlFor={`member-${member.id}`} className="text-sm">
                      {member.name}
                      <span className="text-muted-foreground ml-1">({member.role})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phases */}
          {availablePhases.length > 0 && (
            <div className="space-y-2">
              <Label>Project Phases</Label>
              <div className="flex flex-wrap gap-2">
                {availablePhases.map(phase => (
                  <div
                    key={phase}
                    className={`px-3 py-1 rounded-md cursor-pointer transition-all border ${
                      localFilters.phases.includes(phase)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleArrayFilter('phases', phase)}
                  >
                    <span className="text-sm">{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Percentage Range */}
          <div className="space-y-2">
            <Label>Completion Percentage</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minCompletion" className="text-sm text-muted-foreground">Min %</Label>
                <Input
                  id="minCompletion"
                  type="number"
                  min="0"
                  max="100"
                  value={localFilters.completionPercentage.min}
                  onChange={(e) => updateFilter('completionPercentage', {
                    ...localFilters.completionPercentage,
                    min: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                  })}
                />
              </div>
              <div>
                <Label htmlFor="maxCompletion" className="text-sm text-muted-foreground">Max %</Label>
                <Input
                  id="maxCompletion"
                  type="number"
                  min="0"
                  max="100"
                  value={localFilters.completionPercentage.max}
                  onChange={(e) => updateFilter('completionPercentage', {
                    ...localFilters.completionPercentage,
                    max: Math.max(0, Math.min(100, parseInt(e.target.value) || 100))
                  })}
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <Label>Additional Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdue"
                checked={localFilters.overdue}
                onCheckedChange={(checked) => updateFilter('overdue', !!checked)}
              />
              <Label htmlFor="overdue" className="text-sm">
                Show only overdue tasks
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFilterDialog;