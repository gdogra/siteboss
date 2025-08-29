import React, { useState } from 'react';
import {
  PlusIcon,
  UserIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hourly_rate: number;
  hours_logged: number;
  status: 'active' | 'inactive' | 'on_leave';
  skills: string[];
  start_date: string;
  performance_rating: number;
  avatar_url?: string;
}

interface TeamManagementTabProps {
  projectId: string;
}

const TeamManagementTab: React.FC<TeamManagementTabProps> = ({ projectId }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@construction.com',
      phone: '(555) 123-4567',
      role: 'Project Manager',
      department: 'Management',
      hourly_rate: 75,
      hours_logged: 160,
      status: 'active',
      skills: ['Project Management', 'Construction Planning', 'Team Leadership'],
      start_date: '2024-01-01',
      performance_rating: 4.5
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike.johnson@construction.com',
      phone: '(555) 234-5678',
      role: 'Site Supervisor',
      department: 'Field Operations',
      hourly_rate: 65,
      hours_logged: 180,
      status: 'active',
      skills: ['Site Management', 'Safety Protocols', 'Quality Control'],
      start_date: '2024-01-05',
      performance_rating: 4.2
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@construction.com',
      phone: '(555) 345-6789',
      role: 'Lead Electrician',
      department: 'Electrical',
      hourly_rate: 55,
      hours_logged: 144,
      status: 'active',
      skills: ['Electrical Installation', 'Code Compliance', 'Troubleshooting'],
      start_date: '2024-01-08',
      performance_rating: 4.7
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david.brown@construction.com',
      phone: '(555) 456-7890',
      role: 'Plumber',
      department: 'Plumbing',
      hourly_rate: 50,
      hours_logged: 120,
      status: 'on_leave',
      skills: ['Plumbing Installation', 'Pipe Fitting', 'Water Systems'],
      start_date: '2024-01-10',
      performance_rating: 4.0
    },
    {
      id: '5',
      name: 'Lisa Chen',
      email: 'lisa.chen@construction.com',
      phone: '(555) 567-8901',
      role: 'Carpenter',
      department: 'Carpentry',
      hourly_rate: 48,
      hours_logged: 156,
      status: 'active',
      skills: ['Framing', 'Finishing', 'Blueprint Reading'],
      start_date: '2024-01-12',
      performance_rating: 4.3
    }
  ]);

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    hourly_rate: 0,
    status: 'active',
    skills: [],
    performance_rating: 3.0
  });

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'on_leave':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'inactive':
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
        ) : i < rating ? (
          <div className="relative">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <StarIconSolid 
              className="h-4 w-4 text-yellow-400 absolute top-0 left-0" 
              style={{ clipPath: `inset(0 ${100 - (rating - i) * 100}% 0 0)` }}
            />
          </div>
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  const handleAddMember = () => {
    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name || '',
      email: newMember.email || '',
      phone: newMember.phone || '',
      role: newMember.role || '',
      department: newMember.department || '',
      hourly_rate: newMember.hourly_rate || 0,
      hours_logged: 0,
      status: newMember.status as TeamMember['status'] || 'active',
      skills: newMember.skills || [],
      start_date: new Date().toISOString().split('T')[0],
      performance_rating: newMember.performance_rating || 3.0
    };

    setTeamMembers(prev => [...prev, member]);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      hourly_rate: 0,
      status: 'active',
      skills: [],
      performance_rating: 3.0
    });
    setIsAddingMember(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  const handleStatusChange = (memberId: string, newStatus: TeamMember['status']) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, status: newStatus } : member
      )
    );
  };

  const handleAddSkill = (memberId: string, skill: string) => {
    if (skill.trim()) {
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId 
            ? { ...member, skills: [...member.skills, skill.trim()] }
            : member
        )
      );
    }
  };

  const handleRemoveSkill = (memberId: string, skillIndex: number) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId 
          ? { ...member, skills: member.skills.filter((_, i) => i !== skillIndex) }
          : member
      )
    );
  };

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    onLeave: teamMembers.filter(m => m.status === 'on_leave').length,
    totalHours: teamMembers.reduce((sum, m) => sum + m.hours_logged, 0),
    avgRating: teamMembers.reduce((sum, m) => sum + m.performance_rating, 0) / teamMembers.length
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage project team members, roles, and performance
          </p>
        </div>
        <button
          onClick={() => setIsAddingMember(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
          Add Team Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{teamStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-lg font-semibold text-gray-900">{teamStats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">On Leave</p>
              <p className="text-lg font-semibold text-gray-900">{teamStats.onLeave}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-lg font-semibold text-gray-900">{teamStats.totalHours}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIconSolid className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-lg font-semibold text-gray-900">{teamStats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Form */}
      {isAddingMember && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add Team Member</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newMember.name || ''}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={newMember.role || ''}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Job title"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newMember.email || ''}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newMember.phone || ''}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={newMember.department || ''}
                  onChange={(e) => setNewMember(prev => ({ ...prev, department: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select department</option>
                  <option value="Management">Management</option>
                  <option value="Field Operations">Field Operations</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={newMember.hourly_rate || ''}
                  onChange={(e) => setNewMember(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddMember}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add Member
              </button>
              <button
                onClick={() => setIsAddingMember(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {getStatusIcon(member.status)}
                      <span className="ml-1">{member.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{member.role} • {member.department}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {member.email}
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {member.phone}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {member.hours_logged}h logged
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(member.performance_rating)}
                      </div>
                      <span className="text-sm text-gray-600">({member.performance_rating})</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      ${member.hourly_rate}/hr
                    </div>
                  </div>
                  {member.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={member.status}
                  onChange={(e) => handleStatusChange(member.id, e.target.value as TeamMember['status'])}
                  className="text-sm border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-8">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding team members to your project.</p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddingMember(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Team Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementTab;