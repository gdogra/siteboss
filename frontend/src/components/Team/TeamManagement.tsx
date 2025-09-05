import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  ShieldCheckIcon,
  ClockIcon,
  BellIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { User, UserRole } from '../../types';

interface TeamMember extends User {
  project_count?: number;
  task_count?: number;
  last_active?: Date;
  status: 'active' | 'inactive' | 'pending';
}

const TeamManagement: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [teamSettings, setTeamSettings] = useState({
    autoApproveInvites: false,
    allowSelfRegistration: true,
    defaultRole: 'worker' as UserRole,
    requirePhoneVerification: false,
    sessionTimeout: 8, // hours
    twoFactorRequired: false,
    allowRoleEscalation: false,
    projectAccessLevel: 'assigned_only' as 'all' | 'assigned_only' | 'department_only',
    emailNotifications: {
      newMemberJoined: true,
      roleChanged: true,
      memberDeactivated: false,
      weeklyReport: true,
    },
    workingHours: {
      enabled: true,
      start: '08:00',
      end: '17:00',
      timezone: 'America/New_York',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[],
    },
    permissions: {
      canCreateProjects: ['company_admin', 'project_manager'] as UserRole[],
      canDeleteTasks: ['company_admin', 'project_manager', 'foreman'] as UserRole[],
      canViewReports: ['company_admin', 'project_manager'] as UserRole[],
      canManageBudgets: ['company_admin'] as UserRole[],
      canInviteMembers: ['company_admin', 'project_manager'] as UserRole[],
    }
  });

  // Mock data
  useEffect(() => {
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        email: 'john.doe@construction.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1 (555) 123-4567',
        role: 'project_manager',
        company_id: 'comp1',
        avatar_url: undefined,
        project_count: 3,
        task_count: 12,
        last_active: new Date('2024-01-20T10:30:00'),
        status: 'active'
      },
      {
        id: '2',
        email: 'jane.smith@construction.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1 (555) 234-5678',
        role: 'foreman',
        company_id: 'comp1',
        avatar_url: undefined,
        project_count: 2,
        task_count: 8,
        last_active: new Date('2024-01-19T15:45:00'),
        status: 'active'
      },
      {
        id: '3',
        email: 'mike.wilson@construction.com',
        first_name: 'Mike',
        last_name: 'Wilson',
        phone: '+1 (555) 345-6789',
        role: 'worker',
        company_id: 'comp1',
        avatar_url: undefined,
        project_count: 1,
        task_count: 15,
        last_active: new Date('2024-01-18T09:20:00'),
        status: 'active'
      },
      {
        id: '4',
        email: 'sarah.brown@client.com',
        first_name: 'Sarah',
        last_name: 'Brown',
        phone: '+1 (555) 456-7890',
        role: 'client',
        company_id: 'comp2',
        avatar_url: undefined,
        project_count: 2,
        task_count: 0,
        last_active: new Date('2024-01-17T14:15:00'),
        status: 'active'
      },
      {
        id: '5',
        email: 'pending@construction.com',
        first_name: 'Alex',
        last_name: 'Johnson',
        phone: '+1 (555) 567-8901',
        role: 'worker',
        company_id: 'comp1',
        avatar_url: undefined,
        project_count: 0,
        task_count: 0,
        last_active: undefined,
        status: 'pending'
      }
    ];

    setTimeout(() => {
      setTeamMembers(mockMembers);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'company_admin': return 'bg-purple-100 text-purple-800';
      case 'project_manager': return 'bg-blue-100 text-blue-800';
      case 'foreman': return 'bg-green-100 text-green-800';
      case 'worker': return 'bg-yellow-100 text-yellow-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteMember = () => {
    setIsInviteModalOpen(true);
  };

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  const handleViewMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setShowMemberDetailModal(true);
    }
  };

  const handleEditMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      setShowEditMemberModal(true);
    }
  };

  const handleSettingsUpdate = (settingKey: string, value: any) => {
    setTeamSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    successMessage.textContent = 'Settings updated successfully!';
    document.body.appendChild(successMessage);
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  };

  const handleNestedSettingsUpdate = (parentKey: string, childKey: string, value: any) => {
    setTeamSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey as keyof typeof prev] as any,
        [childKey]: value
      }
    }));
  };

  const handlePermissionUpdate = (permission: string, roles: UserRole[]) => {
    setTeamSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: roles
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {activeTab === 'members' && (
            <button
              onClick={handleInviteMember}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UsersIcon className="h-5 w-5 inline-block mr-2" />
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 inline-block mr-2" />
            Team Settings
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'members' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Members
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {teamMembers.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Invites
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {teamMembers.filter(m => m.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Roles
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(teamMembers.map(m => m.role)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="company_admin">Company Admin</option>
                <option value="project_manager">Project Manager</option>
                <option value="foreman">Foreman</option>
                <option value="worker">Worker</option>
                <option value="client">Client</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by inviting your first team member.'}
              </p>
              {!searchTerm && selectedRole === 'all' && selectedStatus === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleInviteMember}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Invite Team Member
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects/Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                          {formatRole(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(member.status)}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.project_count || 0} projects • {member.task_count || 0} tasks
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.last_active ? member.last_active.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewMember(member.id)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditMember(member.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal Placeholder */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsInviteModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Invite Team Member</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="team_member">Team Member</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="company_admin">Company Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Message (Optional)
                    </label>
                    <textarea
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      rows={3}
                      placeholder="Welcome message for the new team member"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => {
                    alert('Invitation sent successfully!');
                    setIsInviteModalOpen(false);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        /* Team Settings */
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
                <CogIcon className="h-5 w-5 mr-2" />
                General Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-approve Invitations</label>
                    <p className="text-sm text-gray-500">Automatically approve team member invitations</p>
                  </div>
                  <button
                    onClick={() => handleSettingsUpdate('autoApproveInvites', !teamSettings.autoApproveInvites)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      teamSettings.autoApproveInvites ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      teamSettings.autoApproveInvites ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Self Registration</label>
                    <p className="text-sm text-gray-500">Allow users to register themselves with a company code</p>
                  </div>
                  <button
                    onClick={() => handleSettingsUpdate('allowSelfRegistration', !teamSettings.allowSelfRegistration)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      teamSettings.allowSelfRegistration ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      teamSettings.allowSelfRegistration ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Role for New Members</label>
                  <select
                    value={teamSettings.defaultRole}
                    onChange={(e) => handleSettingsUpdate('defaultRole', e.target.value as UserRole)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="worker">Worker</option>
                    <option value="foreman">Foreman</option>
                    <option value="project_manager">Project Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Access Level</label>
                  <select
                    value={teamSettings.projectAccessLevel}
                    onChange={(e) => handleSettingsUpdate('projectAccessLevel', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="all">All Projects</option>
                    <option value="assigned_only">Assigned Projects Only</option>
                    <option value="department_only">Department Projects Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Session Timeout (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={teamSettings.sessionTimeout}
                    onChange={(e) => handleSettingsUpdate('sessionTimeout', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Require Phone Verification</label>
                    <p className="text-sm text-gray-500">Require phone number verification for new members</p>
                  </div>
                  <button
                    onClick={() => handleSettingsUpdate('requirePhoneVerification', !teamSettings.requirePhoneVerification)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      teamSettings.requirePhoneVerification ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      teamSettings.requirePhoneVerification ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication Required</label>
                    <p className="text-sm text-gray-500">Require 2FA for all team members</p>
                  </div>
                  <button
                    onClick={() => handleSettingsUpdate('twoFactorRequired', !teamSettings.twoFactorRequired)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      teamSettings.twoFactorRequired ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      teamSettings.twoFactorRequired ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Role Escalation</label>
                    <p className="text-sm text-gray-500">Allow users to request higher role permissions</p>
                  </div>
                  <button
                    onClick={() => handleSettingsUpdate('allowRoleEscalation', !teamSettings.allowRoleEscalation)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      teamSettings.allowRoleEscalation ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      teamSettings.allowRoleEscalation ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
                <ClockIcon className="h-5 w-5 mr-2" />
                Working Hours
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Working Hours</label>
                    <p className="text-sm text-gray-500">Track and enforce working hours for team members</p>
                  </div>
                  <button
                    onClick={() => handleNestedSettingsUpdate('workingHours', 'enabled', !teamSettings.workingHours.enabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      teamSettings.workingHours.enabled ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      teamSettings.workingHours.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {teamSettings.workingHours.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        type="time"
                        value={teamSettings.workingHours.start}
                        onChange={(e) => handleNestedSettingsUpdate('workingHours', 'start', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Time</label>
                      <input
                        type="time"
                        value={teamSettings.workingHours.end}
                        onChange={(e) => handleNestedSettingsUpdate('workingHours', 'end', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Timezone</label>
                      <select
                        value={teamSettings.workingHours.timezone}
                        onChange={(e) => handleNestedSettingsUpdate('workingHours', 'timezone', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="America/New_York">Eastern Time (EST/EDT)</option>
                        <option value="America/Chicago">Central Time (CST/CDT)</option>
                        <option value="America/Denver">Mountain Time (MST/MDT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                      <div className="flex flex-wrap gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <button
                            key={day}
                            onClick={() => {
                              const workingDays = teamSettings.workingHours.workingDays.includes(day)
                                ? teamSettings.workingHours.workingDays.filter(d => d !== day)
                                : [...teamSettings.workingHours.workingDays, day];
                              handleNestedSettingsUpdate('workingHours', 'workingDays', workingDays);
                            }}
                            className={`px-3 py-1 text-sm rounded-md border ${
                              teamSettings.workingHours.workingDays.includes(day)
                                ? 'bg-primary-100 border-primary-300 text-primary-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
                <BellIcon className="h-5 w-5 mr-2" />
                Email Notifications
              </h3>
              
              <div className="space-y-4">
                {Object.entries({
                  newMemberJoined: 'New Member Joined',
                  roleChanged: 'Role Changed',
                  memberDeactivated: 'Member Deactivated',
                  weeklyReport: 'Weekly Team Report'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <p className="text-sm text-gray-500">Send email notifications for {label.toLowerCase()}</p>
                    </div>
                    <button
                      onClick={() => handleNestedSettingsUpdate('emailNotifications', key, !(teamSettings.emailNotifications as any)[key])}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        (teamSettings.emailNotifications as any)[key] ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        (teamSettings.emailNotifications as any)[key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center mb-4">
                <KeyIcon className="h-5 w-5 mr-2" />
                Role Permissions
              </h3>
              
              <div className="space-y-6">
                {Object.entries({
                  canCreateProjects: 'Can Create Projects',
                  canDeleteTasks: 'Can Delete Tasks',
                  canViewReports: 'Can View Reports',
                  canManageBudgets: 'Can Manage Budgets',
                  canInviteMembers: 'Can Invite Members'
                }).map(([permission, label]) => (
                  <div key={permission}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <div className="flex flex-wrap gap-2">
                      {['super_admin', 'company_admin', 'project_manager', 'foreman', 'worker', 'client'].map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            const currentRoles = (teamSettings.permissions as any)[permission] as UserRole[];
                            const newRoles = currentRoles.includes(role as UserRole)
                              ? currentRoles.filter(r => r !== role)
                              : [...currentRoles, role as UserRole];
                            handlePermissionUpdate(permission, newRoles);
                          }}
                          className={`px-3 py-1 text-sm rounded-md border ${
                            ((teamSettings.permissions as any)[permission] as UserRole[]).includes(role as UserRole)
                              ? 'bg-primary-100 border-primary-300 text-primary-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Save Changes</h3>
                  <p className="text-sm text-gray-500">Your changes are automatically saved when you make them.</p>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">All changes saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {showMemberDetailModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Team Member Details</h3>
              <button
                onClick={() => {
                  setShowMemberDetailModal(false);
                  setSelectedMember(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedMember.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.first_name + ' ' + selectedMember.last_name)}&background=3B82F6&color=fff`}
                  alt={`${selectedMember.first_name} ${selectedMember.last_name}`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedMember.first_name} {selectedMember.last_name}</h4>
                  <p className="text-gray-600">{selectedMember.role.replace('_', ' ')}</p>
                  <p className="text-gray-500">{selectedMember.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedMember.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Projects</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.project_count || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Active Tasks</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMember.task_count || 0}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Last Active</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMember.last_active ? selectedMember.last_active.toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowMemberDetailModal(false);
                    setShowEditMemberModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Edit Member
                </button>
                <button
                  onClick={() => {
                    setShowMemberDetailModal(false);
                    setSelectedMember(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Edit Team Member</h3>
              <button
                onClick={() => {
                  setShowEditMemberModal(false);
                  setSelectedMember(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValue={selectedMember.first_name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValue={selectedMember.last_name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue={selectedMember.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue={selectedMember.phone || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue={selectedMember.role}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="company_admin">Company Admin</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="foreman">Foreman</option>
                  <option value="worker">Worker</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  defaultValue={selectedMember.status}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    // TODO: Save member changes
                    setShowEditMemberModal(false);
                    setSelectedMember(null);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditMemberModal(false);
                    setSelectedMember(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;