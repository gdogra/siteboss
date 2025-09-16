import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTasks } from '@/contexts/TasksContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskManagementBoard from '@/components/enterprise/TaskManagementBoard';
import FinancialDashboard from '@/components/enterprise/FinancialDashboard';
import CashFlowDashboard from '@/components/enterprise/CashFlowDashboard';
import ChangeOrdersManagement from '@/components/enterprise/ChangeOrdersManagement';
import DocumentsManagement from '@/components/enterprise/DocumentsManagement';
import TeamManagement from '@/components/enterprise/TeamManagement';
import ReportsAnalytics from '@/components/enterprise/ReportsAnalytics';
import ProjectFilterDialog, { ProjectFilters } from '@/components/ProjectFilterDialog';
import InfoTooltip, { MetricTooltip, CalculationTooltip, HelpTooltip } from '@/components/InfoTooltip';
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  Camera,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface ProjectHealth {
  overall_health: number;
  health_status: 'excellent' | 'good' | 'warning' | 'critical';
  budget_health: number;
  schedule_health: number;
  quality_health: number;
  task_completion_rate: number;
  risk_factors: {
    overdue_tasks: number;
    failed_inspections: number;
    change_orders: number;
    weather_delays: number;
  };
}

interface ProjectDashboardData {
  id: string;
  name: string;
  description: string;
  status: string;
  completion_percentage: number;
  total_budget: number;
  total_actual_cost: number;
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  overdue_tasks: number;
  team_members_count: number;
  project_manager_name: string;
  client_name: string;
  start_date: string;
  end_date: string;
  phases: any[];
  upcoming_milestones: any[];
  recent_change_orders: any[];
  recent_activities: any[];
}

const EnterpriseProjectDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { getTasksByProject } = useTasks();
  const [projectData, setProjectData] = useState<ProjectDashboardData | null>(null);
  const [projectHealth, setProjectHealth] = useState<ProjectHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    dateRange: { startDate: '', endDate: '' },
    taskStatus: [],
    priority: [],
    teamMembers: [],
    completionPercentage: { min: 0, max: 100 },
    overdue: false,
    phases: [],
    searchText: ''
  });
  const [filteredData, setFilteredData] = useState<ProjectDashboardData | null>(null);

  // Calculate phase data from real tasks
  const calculatePhasesFromTasks = (tasks: any[]) => {
    // Group tasks by phase
    const tasksByPhase = tasks.reduce((acc, task) => {
      const phaseName = task.phase_name || 'Miscellaneous';
      if (!acc[phaseName]) {
        acc[phaseName] = [];
      }
      acc[phaseName].push(task);
      return acc;
    }, {});

    // Calculate phase statistics
    const phases = Object.entries(tasksByPhase).map(([phaseName, phaseTasks]: [string, any[]], index) => {
      const totalTasks = phaseTasks.length;
      const completedTasks = phaseTasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = phaseTasks.filter(task => task.status === 'in_progress').length;
      const notStartedTasks = phaseTasks.filter(task => task.status === 'not_started').length;
      
      // Calculate completion percentage based on task completion_percentage
      const totalCompletionPercentage = phaseTasks.reduce((sum, task) => sum + task.completion_percentage, 0);
      const averageCompletionPercentage = totalTasks > 0 ? Math.round(totalCompletionPercentage / totalTasks) : 0;
      
      // Determine if phase is on critical path (phases with high priority tasks or early phases)
      const hasCriticalTasks = phaseTasks.some(task => task.priority === 'critical' || task.priority === 'high');
      const phaseOrder = ['Pre-Construction', 'Foundation', 'Structure', 'Systems', 'Insulation', 'Interior', 'Finishes', 'Completion'];
      const isCriticalPath = hasCriticalTasks || phaseOrder.indexOf(phaseName) < 4; // First 4 phases are typically critical
      
      return {
        id: (index + 1).toString(),
        name: phaseName,
        completion_percentage: averageCompletionPercentage,
        phase_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        not_started_tasks: notStartedTasks,
        is_critical_path: isCriticalPath,
        overdue_tasks: phaseTasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          const now = new Date();
          return dueDate < now && task.status !== 'completed';
        }).length
      };
    });

    // Sort phases by typical construction order
    const phaseOrder = ['Pre-Construction', 'Demolition', 'Foundation', 'Structure', 'Systems', 'Insulation', 'Interior', 'Finishes', 'Completion', 'Miscellaneous'];
    phases.sort((a, b) => {
      const aOrder = phaseOrder.indexOf(a.name);
      const bOrder = phaseOrder.indexOf(b.name);
      const aIndex = aOrder === -1 ? 999 : aOrder;
      const bIndex = bOrder === -1 ? 999 : bOrder;
      return aIndex - bIndex;
    });

    return phases;
  };

  // Fetch real project data from context
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const realProject = getProject(projectId || '');
        if (!realProject) {
          // Project not found, redirect to projects page
          navigate('/projects');
          return;
        }

        // Get real tasks for this project
        const projectTasks = getTasksByProject(realProject.id);
        const realPhases = calculatePhasesFromTasks(projectTasks);

        // Calculate real task statistics
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
        const activeTasks = projectTasks.filter(task => task.status === 'in_progress').length;
        const overdueTasks = projectTasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          const now = new Date();
          return dueDate < now && task.status !== 'completed';
        }).length;
        
        const mockProjectData: ProjectDashboardData = {
          id: realProject.id,
          name: realProject.name,
          description: realProject.description,
          status: realProject.status,
          completion_percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          total_budget: realProject.budget,
          total_actual_cost: realProject.spent,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          active_tasks: activeTasks,
          overdue_tasks: overdueTasks,
          team_members_count: realProject.teamSize,
          project_manager_name: realProject.manager,
          client_name: realProject.clientName || 'Not specified',
          start_date: realProject.startDate,
          end_date: realProject.endDate,
          phases: realPhases,
          upcoming_milestones: (() => {
            // Create milestones from high-priority upcoming tasks
            const upcomingTasks = projectTasks.filter(task => 
              task.due_date && 
              new Date(task.due_date) > new Date() &&
              (task.priority === 'high' || task.priority === 'critical' || 
               task.title.toLowerCase().includes('inspection') ||
               task.title.toLowerCase().includes('milestone') ||
               task.title.toLowerCase().includes('completion'))
            )
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 5); // Limit to next 5 milestones
            
            return upcomingTasks.map(task => ({
              id: task.id,
              name: task.title,
              target_date: task.due_date,
              status: task.status,
              payment_due: task.estimated_cost || 0
            }));
          })(),
          recent_change_orders: [
            {
              id: '1',
              co_number: 'CO-001',
              title: 'Additional HVAC Units',
              impact_amount: 45000,
              status: 'approved',
              created_at: '2024-11-20'
            }
          ],
          recent_activities: (() => {
            // Generate recent activities from completed and updated tasks
            const recentlyCompletedTasks = projectTasks
              .filter(task => task.status === 'completed')
              .slice(0, 5); // Get most recent completed tasks
            
            const recentlyUpdatedTasks = projectTasks
              .filter(task => task.status === 'in_progress' && task.completion_percentage > 50)
              .slice(0, 3);
            
            const activities = [];
            
            // Add completed task activities
            recentlyCompletedTasks.forEach((task, index) => {
              activities.push({
                id: `completed-${task.id}`,
                type: 'task_completed',
                icon: 'CheckCircle',
                message: `Task completed: ${task.title}`,
                timestamp: new Date(Date.now() - (index + 1) * 3600000), // Hours ago
                color: 'text-green-600'
              });
            });
            
            // Add progress update activities
            recentlyUpdatedTasks.forEach((task, index) => {
              activities.push({
                id: `progress-${task.id}`,
                type: 'task_progress',
                icon: 'TrendingUp',
                message: `${task.title} - ${task.completion_percentage}% complete`,
                timestamp: new Date(Date.now() - (index + 1) * 7200000), // Hours ago
                color: 'text-blue-600'
              });
            });
            
            // Add milestone activities from high-priority tasks
            const milestoneTasks = projectTasks
              .filter(task => task.priority === 'high' || task.priority === 'critical')
              .slice(0, 2);
              
            milestoneTasks.forEach((task, index) => {
              activities.push({
                id: `milestone-${task.id}`,
                type: 'milestone',
                icon: 'FileText',
                message: task.status === 'completed' ? `Milestone achieved: ${task.title}` : `Milestone in progress: ${task.title}`,
                timestamp: new Date(Date.now() - (index + 1) * 86400000), // Days ago
                color: 'text-purple-600'
              });
            });
            
            // Sort by timestamp and limit to 6 most recent
            return activities
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .slice(0, 6);
          })()
        };

        // Calculate real project health metrics
        const budgetHealth = realProject.budget > 0 ? Math.max(0, Math.min(100, 
          100 - ((realProject.spent / realProject.budget) * 100 - 100)
        )) : 100;
        
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Calculate schedule health based on project dates and task completion
        const scheduleHealth = (() => {
          if (!realProject.startDate || !realProject.endDate) return 75;
          
          const startDate = new Date(realProject.startDate);
          const endDate = new Date(realProject.endDate);
          const now = new Date();
          
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          const expectedProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
          
          // Compare expected progress vs actual completion
          const scheduleVariance = taskCompletionRate - expectedProgress;
          
          if (scheduleVariance >= 10) return 95; // Ahead of schedule
          if (scheduleVariance >= 0) return 85;  // On schedule
          if (scheduleVariance >= -10) return 65; // Slightly behind
          return 40; // Behind schedule
        })();
        
        // Calculate quality health (based on overdue tasks and completion rate)
        const qualityHealth = (() => {
          let quality = 85; // Base quality score
          
          // Penalize for overdue tasks
          if (overdueTasks > 0) {
            quality -= Math.min(30, overdueTasks * 5);
          }
          
          // Bonus for high completion rate
          if (taskCompletionRate > 80) {
            quality += 10;
          }
          
          return Math.max(0, Math.min(100, quality));
        })();
        
        // Calculate overall health as weighted average
        const overallHealth = Math.round(
          (budgetHealth * 0.3 + scheduleHealth * 0.4 + qualityHealth * 0.2 + taskCompletionRate * 0.1)
        );
        
        const healthStatus: 'excellent' | 'good' | 'warning' | 'critical' = 
          overallHealth >= 85 ? 'excellent' :
          overallHealth >= 70 ? 'good' :
          overallHealth >= 50 ? 'warning' : 'critical';
        
        const realHealthData: ProjectHealth = {
          overall_health: overallHealth,
          health_status: healthStatus,
          budget_health: Math.round(budgetHealth),
          schedule_health: Math.round(scheduleHealth),
          quality_health: Math.round(qualityHealth),
          task_completion_rate: taskCompletionRate,
          risk_factors: {
            overdue_tasks: overdueTasks,
            failed_inspections: 0, // Would need to be tracked separately
            change_orders: 0, // Would need to be tracked separately  
            weather_delays: 0 // Would need to be tracked separately
          }
        };

        setProjectData(mockProjectData);
        setProjectHealth(realHealthData);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, getProject, navigate]);

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600 bg-green-50';
    if (health >= 60) return 'text-blue-600 bg-blue-50';
    if (health >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter logic
  const applyFilters = (data: ProjectDashboardData, filterCriteria: ProjectFilters) => {
    if (!data) return null;

    // Get all tasks for filtering
    const allTasks = getTasksByProject(data.id);
    let filteredTasks = [...allTasks];

    // Apply search filter
    if (filterCriteria.searchText.trim()) {
      const searchText = filterCriteria.searchText.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchText) ||
        task.description?.toLowerCase().includes(searchText) ||
        task.assigned_to?.toLowerCase().includes(searchText)
      );
    }

    // Apply date range filter
    if (filterCriteria.dateRange.startDate || filterCriteria.dateRange.endDate) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        const startDate = filterCriteria.dateRange.startDate ? new Date(filterCriteria.dateRange.startDate) : null;
        const endDate = filterCriteria.dateRange.endDate ? new Date(filterCriteria.dateRange.endDate) : null;
        
        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
        return true;
      });
    }

    // Apply task status filter
    if (filterCriteria.taskStatus.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filterCriteria.taskStatus.includes(task.status)
      );
    }

    // Apply priority filter
    if (filterCriteria.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filterCriteria.priority.includes(task.priority)
      );
    }

    // Apply team member filter
    if (filterCriteria.teamMembers.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        task.assigned_to && filterCriteria.teamMembers.includes(task.assigned_to)
      );
    }

    // Apply overdue filter
    if (filterCriteria.overdue) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        const now = new Date();
        return dueDate < now && task.status !== 'completed';
      });
    }

    // Apply completion percentage filter
    if (filterCriteria.completionPercentage.min > 0 || filterCriteria.completionPercentage.max < 100) {
      filteredTasks = filteredTasks.filter(task => 
        task.completion_percentage >= filterCriteria.completionPercentage.min &&
        task.completion_percentage <= filterCriteria.completionPercentage.max
      );
    }

    // Recalculate phases with filtered tasks
    const filteredPhases = calculatePhasesFromTasks(filteredTasks);
    
    // Apply phase filter
    let finalPhases = filteredPhases;
    if (filterCriteria.phases.length > 0) {
      finalPhases = filteredPhases.filter(phase => 
        filterCriteria.phases.includes(phase.name)
      );
    }

    // Recalculate statistics with filtered tasks
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
    const activeTasks = filteredTasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = filteredTasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const now = new Date();
      return dueDate < now && task.status !== 'completed';
    }).length;

    return {
      ...data,
      phases: finalPhases,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      active_tasks: activeTasks,
      overdue_tasks: overdueTasks,
      completion_percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Update filtered data when filters or project data changes
  useEffect(() => {
    if (projectData) {
      const filtered = applyFilters(projectData, filters);
      setFilteredData(filtered);
    }
  }, [projectData, filters]);

  // Button handlers
  const handleExportProject = () => {
    // Export project data as JSON
    const exportData = {
      project: projectData,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${projectData?.name || 'project'}_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
  };

  const handleProjectSettings = () => {
    navigate(`/projects/${projectId}/settings`);
  };

  const handleViewAllActivity = () => {
    // Navigate to detailed activity log
    alert('Activity Log - This would show a detailed chronological log of all project activities');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!projectData || !projectHealth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <p className="text-gray-600 mt-2">The requested project could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="header" />
      
      {/* Project Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <Link to="/projects" className="text-gray-400 hover:text-gray-500">
                        Projects
                      </Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-4 text-sm font-medium text-gray-500">
                          {projectData.name}
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <div className="mt-2 flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">{projectData.name}</h1>
                  <Badge className={getStatusColor(projectData.status)}>
                    {projectData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getHealthColor(projectHealth.overall_health)}>
                    {projectHealth.overall_health}% Health
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">{projectData.description}</p>
              </div>
              
              <div className="flex space-x-3">
                <ProjectFilterDialog
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  teamMembers={[
                    { id: 'manager1', name: projectData?.project_manager_name || 'Project Manager', role: 'Manager' },
                    { id: 'client1', name: projectData?.client_name || 'Client', role: 'Client' }
                  ]}
                  availablePhases={projectData?.phases.map(p => p.name) || []}
                />
                <Button variant="outline" size="sm" onClick={handleExportProject}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/projects/${projectId}/ai-wizard`)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Task Wizard
                </Button>
                <Button size="sm" onClick={handleProjectSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
                <MetricTooltip
                  title="Project Progress"
                  content="Overall completion percentage based on completed tasks versus total tasks in the project."
                  impact="Higher progress indicates the project is moving toward completion. Low progress may signal delays or resource issues."
                  calculation="(Completed Tasks ÷ Total Tasks) × 100"
                />
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(filteredData || projectData).completion_percentage}%</div>
              <Progress value={(filteredData || projectData).completion_percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {(filteredData || projectData).completed_tasks} of {(filteredData || projectData).total_tasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                <MetricTooltip
                  title="Budget Status"
                  content="Current project spending compared to the total allocated budget."
                  impact="Overspending indicates budget overruns that may require additional funding. Underspending may suggest delays or resource availability issues."
                  calculation="Spent Amount ÷ Total Budget × 100"
                />
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(projectData.total_actual_cost / 1000000).toFixed(1)}M
              </div>
              <Progress 
                value={(projectData.total_actual_cost / projectData.total_budget) * 100} 
                className="mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                ${(projectData.total_budget / 1000000).toFixed(1)}M budgeted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <MetricTooltip
                  title="Active Tasks"
                  content="Number of tasks currently in progress. Overdue tasks are flagged separately as they require immediate attention."
                  impact="Too many active tasks may indicate resource bottlenecks. Overdue tasks directly impact project timeline and delivery dates."
                  calculation="Count of tasks with status = 'in_progress'"
                />
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(filteredData || projectData).active_tasks}</div>
              <div className="flex items-center space-x-2 mt-2">
                {(filteredData || projectData).overdue_tasks > 0 && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span className="text-xs">{(filteredData || projectData).overdue_tasks} overdue</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <MetricTooltip
                  title="Team Members"
                  content="Total number of team members assigned to this project, including project managers, contractors, and specialists."
                  impact="Team size affects project capacity, communication complexity, and resource allocation. Right-sizing teams is crucial for efficiency."
                />
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectData.team_members_count}</div>
              <p className="text-xs text-muted-foreground mt-2">
                PM: {projectData.project_manager_name}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="changeorders">Change Orders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Health */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Project Health</CardTitle>
                    <MetricTooltip
                      title="Project Health Overview"
                      content="Comprehensive health assessment combining budget, schedule, quality, and task completion metrics."
                      impact="Poor health scores indicate potential project risks requiring immediate management attention. Good health scores suggest the project is on track for successful delivery."
                      calculation="Weighted average: Budget (30%) + Schedule (40%) + Quality (20%) + Task Completion (10%)"
                      maxWidth="max-w-sm"
                    />
                  </div>
                  <CardDescription>Key performance indicators for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span>Overall Health</span>
                            <CalculationTooltip
                              content="Composite score reflecting all project health dimensions."
                              calculation="(Budget×0.3 + Schedule×0.4 + Quality×0.2 + Tasks×0.1)"
                              impact="Scores <50% indicate critical issues, 50-70% warning, 70-85% good, >85% excellent."
                            />
                          </div>
                          <span className="font-medium">{projectHealth.overall_health}%</span>
                        </div>
                        <Progress value={projectHealth.overall_health} className="mt-1" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span>Budget Health</span>
                            <CalculationTooltip
                              content="Financial performance relative to allocated budget."
                              calculation="100 - ((Spent ÷ Budget × 100) - 100)"
                              impact="Low scores indicate budget overruns requiring cost control measures or additional funding."
                            />
                          </div>
                          <span className="font-medium">{projectHealth.budget_health}%</span>
                        </div>
                        <Progress value={projectHealth.budget_health} className="mt-1" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span>Schedule Health</span>
                            <CalculationTooltip
                              content="Timeline performance comparing expected vs actual progress."
                              calculation="Based on task completion rate vs time elapsed since project start"
                              impact="Poor schedule health indicates delays that may affect delivery dates and increase costs."
                            />
                          </div>
                          <span className="font-medium">{projectHealth.schedule_health}%</span>
                        </div>
                        <Progress value={projectHealth.schedule_health} className="mt-1" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span>Quality Health</span>
                            <CalculationTooltip
                              content="Quality assessment based on task completion rates and overdue items."
                              calculation="Base 85% - (overdue tasks × 5%) + completion rate bonus"
                              impact="Low quality health suggests work standards issues or inadequate resource allocation."
                            />
                          </div>
                          <span className="font-medium">{projectHealth.quality_health}%</span>
                        </div>
                        <Progress value={projectHealth.quality_health} className="mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Factors */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-sm font-medium">Risk Factors</h4>
                      <HelpTooltip
                        title="Risk Factors"
                        content="Key indicators that may impact project success and delivery."
                        impact="High risk factors require immediate attention to prevent project delays, cost overruns, or quality issues."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span>Overdue Tasks</span>
                          <InfoTooltip
                            content="Tasks past their due date that haven't been completed."
                            impact="Each overdue task delays project completion and may cascade to dependent tasks. >5 overdue tasks indicate critical scheduling issues."
                            type="warning"
                          />
                        </div>
                        <Badge variant={projectHealth.risk_factors.overdue_tasks > 5 ? "destructive" : "secondary"}>
                          {projectHealth.risk_factors.overdue_tasks}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span>Failed Inspections</span>
                          <InfoTooltip
                            content="Inspections that didn't pass initial review and require rework."
                            impact="Failed inspections require costly rework, delay subsequent phases, and may indicate quality control issues."
                            type="warning"
                          />
                        </div>
                        <Badge variant={projectHealth.risk_factors.failed_inspections > 0 ? "destructive" : "secondary"}>
                          {projectHealth.risk_factors.failed_inspections}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span>Change Orders</span>
                          <InfoTooltip
                            content="Formal requests to modify the original project scope, timeline, or budget."
                            impact="Multiple change orders increase project complexity, costs, and timeline. They may indicate insufficient initial planning."
                          />
                        </div>
                        <Badge variant="outline">
                          {projectHealth.risk_factors.change_orders}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span>Weather Delays</span>
                          <InfoTooltip
                            content="Days lost due to weather conditions preventing safe work."
                            impact="Weather delays extend project timelines and may require schedule adjustments. Consider seasonal planning for future phases."
                          />
                        </div>
                        <Badge variant="outline">
                          {projectHealth.risk_factors.weather_delays} days
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {projectData.recent_activities.length > 0 ? (
                      projectData.recent_activities.map((activity) => {
                        const IconComponent = activity.icon === 'CheckCircle' ? CheckCircle :
                                             activity.icon === 'TrendingUp' ? TrendingUp :
                                             activity.icon === 'FileText' ? FileText : Camera;
                        
                        const timeAgo = (() => {
                          const now = new Date();
                          const diff = now.getTime() - activity.timestamp.getTime();
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const days = Math.floor(hours / 24);
                          
                          if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                          if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                          return 'Just now';
                        })();
                        
                        return (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <IconComponent className={`h-5 w-5 ${activity.color} mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{activity.message}</p>
                              <p className="text-xs text-gray-500">{timeAgo}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Upcoming Milestones</CardTitle>
                  <HelpTooltip
                    title="Upcoming Milestones"
                    content="Critical project milestones generated from high-priority tasks and key deliverables."
                    impact="Meeting milestones keeps the project on schedule and triggers payment releases. Missing milestones can cascade delays throughout the project."
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.upcoming_milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(milestone.target_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          ${milestone.payment_due.toLocaleString()} due
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases">
            <Card>
              <CardHeader>
                <CardTitle>Project Phases</CardTitle>
                <CardDescription>Track progress across all project phases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(filteredData || projectData).phases.map((phase, index) => (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Phase {index + 1}</span>
                          <h3 className="font-semibold">{phase.name}</h3>
                          {phase.is_critical_path && (
                            <Badge variant="destructive" className="text-xs">Critical Path</Badge>
                          )}
                        </div>
                        <span className="text-sm font-medium">{phase.completion_percentage}%</span>
                      </div>
                      
                      <Progress value={phase.completion_percentage} className="mb-2" />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{phase.completed_tasks} of {phase.phase_tasks} tasks completed</span>
                          <span>
                            {phase.completion_percentage === 100 ? 
                              <CheckCircle className="h-4 w-4 text-green-600 inline" /> :
                              phase.completion_percentage > 0 ?
                              <Clock className="h-4 w-4 text-blue-600 inline" /> :
                              <div className="h-4 w-4 border rounded-full inline-block"></div>
                            }
                          </span>
                        </div>
                        
                        {/* Pending Work Details */}
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="text-center">
                            <div className="text-blue-600 font-medium">{phase.in_progress_tasks || 0}</div>
                            <div className="text-gray-500">In Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600 font-medium">{phase.not_started_tasks || 0}</div>
                            <div className="text-gray-500">Not Started</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-600 font-medium">{phase.overdue_tasks || 0}</div>
                            <div className="text-gray-500">Overdue</div>
                          </div>
                        </div>
                        
                        {/* Phase Status Indicator */}
                        {phase.completion_percentage === 100 && (
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✓ Phase Complete
                          </div>
                        )}
                        {phase.overdue_tasks > 0 && phase.completion_percentage < 100 && (
                          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            ⚠ {phase.overdue_tasks} overdue task{phase.overdue_tasks > 1 ? 's' : ''}
                          </div>
                        )}
                        {phase.in_progress_tasks > 0 && phase.completion_percentage < 100 && phase.overdue_tasks === 0 && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            🔄 Active work in progress
                          </div>
                        )}
                        {phase.not_started_tasks === phase.phase_tasks && (
                          <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            ⏳ Awaiting start
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would go here */}
          <TabsContent value="tasks">
            <TaskManagementBoard projectId={projectId || ''} />
          </TabsContent>

          <TabsContent value="financials">
            <FinancialDashboard projectId={projectId || ''} />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowDashboard projectId={projectId || ''} />
          </TabsContent>

          <TabsContent value="changeorders">
            <ChangeOrdersManagement projectId={projectId || ''} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsManagement projectId={projectId || ''} />
          </TabsContent>

          <TabsContent value="team">
            <TeamManagement projectId={projectId || ''} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseProjectDashboard;
