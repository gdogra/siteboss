import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Award,
  Star,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: 'management' | 'engineering' | 'construction' | 'trades' | 'safety' | 'admin';
  status: 'active' | 'inactive' | 'on_leave' | 'contractor';
  hire_date: string;
  hourly_rate?: number;
  skills: string[];
  certifications: string[];
  current_tasks: number;
  completed_tasks: number;
  hours_logged_this_week: number;
  performance_rating: number; // 1-5 stars
  location?: string;
  supervisor?: string;
  availability: 'available' | 'busy' | 'off_duty' | 'vacation';
  avatar?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TeamManagementProps {
  projectId: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: '',
    availability: '',
    search: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'construction' as TeamMember['department'],
    hourly_rate: 0,
    skills: [] as string[],
    certifications: [] as string[],
    location: '',
    supervisor: ''
  });

  // Mock team members data - in production this would come from API
  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@siteboss.com',
      phone: '(555) 123-4567',
      role: 'Project Manager',
      department: 'management',
      status: 'active',
      hire_date: '2022-03-15',
      hourly_rate: 75,
      skills: ['Project Management', 'Risk Assessment', 'Budget Planning', 'Team Leadership'],
      certifications: ['PMP', 'OSHA 30', 'First Aid'],
      current_tasks: 8,
      completed_tasks: 45,
      hours_logged_this_week: 42,
      performance_rating: 5,
      location: 'Main Office',
      availability: 'available',
      emergency_contact: {
        name: 'Mike Johnson',
        phone: '(555) 987-6543',
        relationship: 'Spouse'
      },
      notes: 'Excellent leadership skills, consistently meets deadlines',
      created_at: '2022-03-15T08:00:00Z',
      updated_at: '2024-09-11T10:30:00Z'
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@contractor.com',
      phone: '(555) 234-5678',
      role: 'Site Supervisor',
      department: 'construction',
      status: 'contractor',
      hire_date: '2023-01-20',
      hourly_rate: 55,
      skills: ['Site Management', 'Safety Compliance', 'Equipment Operation', 'Quality Control'],
      certifications: ['OSHA 30', 'Forklift Operator', 'Crane Operator'],
      current_tasks: 12,
      completed_tasks: 89,
      hours_logged_this_week: 45,
      performance_rating: 4,
      location: 'Construction Site',
      supervisor: 'Sarah Johnson',
      availability: 'busy',
      emergency_contact: {
        name: 'Maria Rodriguez',
        phone: '(555) 876-5432',
        relationship: 'Spouse'
      },
      created_at: '2023-01-20T08:00:00Z',
      updated_at: '2024-09-11T09:15:00Z'
    },
    {
      id: '3',
      name: 'David Chen',
      email: 'david.chen@siteboss.com',
      phone: '(555) 345-6789',
      role: 'Structural Engineer',
      department: 'engineering',
      status: 'active',
      hire_date: '2021-08-10',
      hourly_rate: 85,
      skills: ['Structural Analysis', 'CAD Design', 'Building Codes', 'Steel Structures'],
      certifications: ['PE License', 'AISC Certified', 'LEED AP'],
      current_tasks: 6,
      completed_tasks: 67,
      hours_logged_this_week: 40,
      performance_rating: 5,
      location: 'Engineering Office',
      supervisor: 'Sarah Johnson',
      availability: 'available',
      emergency_contact: {
        name: 'Lisa Chen',
        phone: '(555) 765-4321',
        relationship: 'Spouse'
      },
      created_at: '2021-08-10T08:00:00Z',
      updated_at: '2024-09-11T08:45:00Z'
    },
    {
      id: '4',
      name: 'Maria Garcia',
      email: 'maria.garcia@contractor.com',
      phone: '(555) 456-7890',
      role: 'Electrician',
      department: 'trades',
      status: 'contractor',
      hire_date: '2023-05-15',
      hourly_rate: 48,
      skills: ['Electrical Installation', 'Wiring', 'Panel Setup', 'Troubleshooting'],
      certifications: ['Licensed Electrician', 'OSHA 10', 'Arc Flash Training'],
      current_tasks: 4,
      completed_tasks: 23,
      hours_logged_this_week: 38,
      performance_rating: 4,
      location: 'Construction Site',
      supervisor: 'Mike Rodriguez',
      availability: 'available',
      created_at: '2023-05-15T08:00:00Z',
      updated_at: '2024-09-11T11:20:00Z'
    },
    {
      id: '5',
      name: 'John Smith',
      email: 'john.smith@siteboss.com',
      phone: '(555) 567-8901',
      role: 'Safety Officer',
      department: 'safety',
      status: 'active',
      hire_date: '2022-11-01',
      hourly_rate: 42,
      skills: ['Safety Inspections', 'OSHA Compliance', 'Training', 'Risk Assessment'],
      certifications: ['OSHA 30', 'Safety Management', 'CPR/First Aid'],
      current_tasks: 3,
      completed_tasks: 156,
      hours_logged_this_week: 40,
      performance_rating: 5,
      location: 'Construction Site',
      supervisor: 'Sarah Johnson',
      availability: 'available',
      emergency_contact: {
        name: 'Jenny Smith',
        phone: '(555) 654-3210',
        relationship: 'Wife'
      },
      created_at: '2022-11-01T08:00:00Z',
      updated_at: '2024-09-11T07:30:00Z'
    },
    {
      id: '6',
      name: 'Lisa Wong',
      email: 'lisa.wong@siteboss.com',
      phone: '(555) 678-9012',
      role: 'Admin Assistant',
      department: 'admin',
      status: 'on_leave',
      hire_date: '2023-02-28',
      hourly_rate: 28,
      skills: ['Documentation', 'Scheduling', 'Communication', 'Data Entry'],
      certifications: ['Microsoft Office Specialist'],
      current_tasks: 0,
      completed_tasks: 234,
      hours_logged_this_week: 0,
      performance_rating: 4,
      location: 'Main Office',
      supervisor: 'Sarah Johnson',
      availability: 'vacation',
      notes: 'On maternity leave until November 2024',
      created_at: '2023-02-28T08:00:00Z',
      updated_at: '2024-09-01T00:00:00Z'
    }
  ];

  const filteredMembers = useMemo(() => {
    return mockTeamMembers.filter(member => {
      const matchesDepartment = !filters.department || member.department === filters.department;
      const matchesStatus = !filters.status || member.status === filters.status;
      const matchesAvailability = !filters.availability || member.availability === filters.availability;
      const matchesSearch = !filters.search || 
        member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.role.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesDepartment && matchesStatus && matchesAvailability && matchesSearch;
    });
  }, [filters, mockTeamMembers]);

  const statistics = useMemo(() => {
    return {
      total: mockTeamMembers.length,
      active: mockTeamMembers.filter(m => m.status === 'active').length,
      contractors: mockTeamMembers.filter(m => m.status === 'contractor').length,
      onLeave: mockTeamMembers.filter(m => m.status === 'on_leave').length,
      available: mockTeamMembers.filter(m => m.availability === 'available').length,
      totalHours: mockTeamMembers.reduce((sum, m) => sum + m.hours_logged_this_week, 0),
      averageRating: mockTeamMembers.reduce((sum, m) => sum + m.performance_rating, 0) / mockTeamMembers.length
    };
  }, [mockTeamMembers]);

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'contractor': return 'bg-blue-100 text-blue-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: TeamMember['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    // For now show alert - in production would open edit modal
    alert(`Edit ${member.name} - This would open a modal to edit member details, role, department, hourly rate, skills, etc.`);
  };

  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    // For now show alert - in production would show member details modal
    alert(`View ${member.name} Details:\nRole: ${member.role}\nDepartment: ${member.department}\nRating: ${member.performance_rating}/5 stars\nTasks: ${member.current_tasks} active\nHours: ${member.hours_logged_this_week} this week`);
  };

  const handleAddMember = () => {
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      current_tasks: 0,
      completed_tasks: 0,
      hours_logged_this_week: 0,
      performance_rating: 3,
      availability: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Added team member:', member);
    setShowAddModal(false);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: 'construction',
      hourly_rate: 0,
      skills: [],
      certifications: [],
      location: '',
      supervisor: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contractors</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.contractors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.totalHours}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.averageRating.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-8 w-64"
            />
          </div>

          <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="trades">Trades</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setFilters({ department: '', role: '', status: '', availability: '', search: '' })}
          >
            Clear Filters
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Job title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select 
                      value={newMember.department} 
                      onValueChange={(value: TeamMember['department']) => 
                        setNewMember(prev => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="trades">Trades</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={newMember.hourly_rate}
                      onChange={(e) => setNewMember(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newMember.location}
                      onChange={(e) => setNewMember(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Work location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Input
                      id="supervisor"
                      value={newMember.supervisor}
                      onChange={(e) => setNewMember(prev => ({ ...prev, supervisor: e.target.value }))}
                      placeholder="Supervisor name"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember}>
                    Add Member
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{member.name}</h3>
                    <Badge className={getStatusColor(member.status)} variant="outline">
                      {member.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{member.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-2">
                    {renderStars(member.performance_rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({member.performance_rating}/5)
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <Badge className={getAvailabilityColor(member.availability)} variant="outline">
                      {member.availability.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {member.current_tasks} active tasks
                    </span>
                  </div>

                  <div className="flex gap-1 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewMember(member)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(filter => filter) 
                ? "No team members match your current filters." 
                : "Get started by adding your first team member."
              }
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;