import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  ArrowLeft,
  Grid3X3,
  List
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  location: string;
  manager: string;
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
  health: 'excellent' | 'good' | 'warning' | 'critical';
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
    {
      id: '3',
      name: 'Shopping Center Renovation',
      description: 'Complete renovation of existing shopping center with modern amenities',
      status: 'active',
      progress: 89,
      budget: 1200000,
      spent: 1068000,
      startDate: '2024-05-01',
      endDate: '2024-11-30',
      location: 'Suburban Mall',
      manager: 'Lisa Rodriguez',
      teamSize: 12,
      priority: 'medium',
      health: 'warning'
    },
    {
      id: '4',
      name: 'Industrial Warehouse Complex',
      description: 'Three-building warehouse facility with distribution center',
      status: 'planning',
      progress: 0,
      budget: 4200000,
      spent: 125000,
      startDate: '2024-12-01',
      endDate: '2025-08-15',
      location: 'Industrial Park',
      manager: 'Tom Wilson',
      teamSize: 0,
      priority: 'medium',
      health: 'good'
    },
    {
      id: '5',
      name: 'School Building Expansion',
      description: 'Adding new classrooms and gymnasium to existing school',
      status: 'completed',
      progress: 100,
      budget: 3200000,
      spent: 3150000,
      startDate: '2023-06-01',
      endDate: '2024-08-15',
      location: 'Education District',
      manager: 'David Park',
      teamSize: 18,
      priority: 'high',
      health: 'excellent'
    },
    {
      id: '6',
      name: 'Hospital Emergency Wing',
      description: 'New emergency department with advanced medical facilities',
      status: 'on-hold',
      progress: 23,
      budget: 6800000,
      spent: 1564000,
      startDate: '2024-02-15',
      endDate: '2025-10-30',
      location: 'Medical Center',
      manager: 'Dr. Jennifer Adams',
      teamSize: 22,
      priority: 'high',
      health: 'critical'
    }
  ];

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (health: Project['health']) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Projects</h1>
                  <p className="text-xs text-muted-foreground">Manage your construction projects</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={() => navigate('/projects/new')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{projectStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{projectStats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{projectStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{projectStats.onHold}</div>
              <div className="text-sm text-muted-foreground">On Hold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-emerald-600">
                ${(projectStats.totalBudget / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-indigo-600">
                ${(projectStats.totalSpent / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="planning">Planning</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)} variant="outline">
                          {project.priority}
                        </Badge>
                        {getHealthIcon(project.health)}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Budget</div>
                        <div className="font-medium">${(project.budget / 1000000).toFixed(1)}M</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Spent</div>
                        <div className="font-medium">${(project.spent / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {project.manager} • {project.teamSize} team members
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {project.startDate} to {project.endDate}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/project/${project.id}/dashboard`)}
                      >
                        Open Project
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)} variant="outline">
                          {project.priority}
                        </Badge>
                        {getHealthIcon(project.health)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.manager}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${(project.spent / 1000000).toFixed(1)}M / ${(project.budget / 1000000).toFixed(1)}M
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.progress}% Complete
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium">{project.progress}%</div>
                        <Progress value={project.progress} className="w-24" />
                      </div>
                      <Button 
                        onClick={() => navigate(`/project/${project.id}/dashboard`)}
                      >
                        Open Project
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first project to get started'}
              </p>
              <Button 
                onClick={() => navigate('/projects/new')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;