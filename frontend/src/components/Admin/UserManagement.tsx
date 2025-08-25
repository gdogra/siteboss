import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { User, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { ROLE_HIERARCHY } from '../../types/permissions';
import RoleChangeModal from './RoleChangeModal';
import RoleIndicator from '../UI/RoleIndicator';

interface UserWithActions extends User {
  last_login?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { canManageRole } = useRBAC();
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithActions | null>(null);
  const [isRoleChangeModalOpen, setIsRoleChangeModalOpen] = useState(false);

  // Mock users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUsers: UserWithActions[] = [
        {
          id: 'user-1',
          email: 'john.doe@acme.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'project_manager',
          company_id: 'company-1',
          phone: '(555) 123-4567',
          last_login: new Date('2024-01-20T10:30:00Z'),
          status: 'active'
        },
        {
          id: 'user-2',
          email: 'sarah.wilson@acme.com',
          first_name: 'Sarah',
          last_name: 'Wilson',
          role: 'foreman',
          company_id: 'company-1',
          phone: '(555) 234-5678',
          last_login: new Date('2024-01-19T14:15:00Z'),
          status: 'active'
        },
        {
          id: 'user-3',
          email: 'mike.johnson@acme.com',
          first_name: 'Mike',
          last_name: 'Johnson',
          role: 'worker',
          company_id: 'company-1',
          phone: '(555) 345-6789',
          last_login: new Date('2024-01-18T08:45:00Z'),
          status: 'active'
        },
        {
          id: 'user-4',
          email: 'lisa.chen@client.com',
          first_name: 'Lisa',
          last_name: 'Chen',
          role: 'client',
          company_id: 'company-2',
          phone: '(555) 456-7890',
          last_login: new Date('2024-01-17T16:20:00Z'),
          status: 'active'
        },
        {
          id: 'user-5',
          email: 'demo@siteboss.com',
          first_name: 'Demo',
          last_name: 'User',
          role: 'company_admin',
          company_id: 'demo-company-1',
          phone: '(555) 123-4567',
          last_login: new Date(),
          status: 'active'
        }
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (user: UserWithActions) => {
    setSelectedUser(user);
    setIsRoleChangeModalOpen(true);
  };

  const handleRoleChangeComplete = (userId: string, newRole: UserRole) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    setIsRoleChangeModalOpen(false);
    setSelectedUser(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user roles and permissions across your organization
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Invite User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="company_admin">Company Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="foreman">Foreman</option>
              <option value="worker">Worker</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <div className="ml-2">
                        <RoleIndicator />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Last login: {formatLastLogin(user.last_login)}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {canManageRole(user.role) && user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleRoleChange(user)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Change Role
                    </button>
                  )}
                  
                  {user.id === currentUser?.id && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      You
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-sm text-gray-500">No users found matching your criteria</div>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <RoleChangeModal
          isOpen={isRoleChangeModalOpen}
          onClose={() => {
            setIsRoleChangeModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onRoleChange={handleRoleChangeComplete}
        />
      )}
    </div>
  );
};

export default UserManagement;