
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Search,
  MoreHorizontal,
  RefreshCw,
  Settings } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
  Roles: string;
}

interface Role {
  RoleID: number;
  RoleName: string;
  RoleCode: string;
  RoleRemark: string;
}

const UserManagementPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32152, { // easysite_auth_users table
        PageNo: 1,
        PageSize: 100,
        OrderByField: "CreateTime",
        IsAsc: false
      });

      if (error) throw error;

      setUsers(data?.List || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(32248, { // easysite_roles table
        PageNo: 1,
        PageSize: 50,
        OrderByField: "RoleID",
        IsAsc: true
      });

      if (error) throw error;

      setRoles(data?.List || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.Email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.Roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const getUserRoleNames = (roleCodes: string) => {
    if (!roleCodes) return [];
    const codes = roleCodes.split(',').map((code) => code.trim());
    return codes.map((code) => {
      const role = roles.find((r) => r.RoleCode === code);
      return role ? role.RoleName : code;
    });
  };

  const getRoleBadgeColor = (roleCode: string) => {
    switch (roleCode.toLowerCase()) {
      case 'administrator':return 'bg-red-100 text-red-800';
      case 'generaluser':return 'bg-blue-100 text-blue-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.Roles.includes('Administrator')).length,
    generalUsers: users.filter((u) => u.Roles.includes('GeneralUser')).length,
    contractors: users.filter((u) => u.Roles.includes('r-QpoZrh')).length,
    recent: users.filter((u) =>
    Date.now() - new Date(u.CreateTime).getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={fetchUsers} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    User creation is handled through the registration system. 
                    Direct user creation from admin panel is not currently supported.
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline">Close</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{userStats.total}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{userStats.admins}</div>
            <div className="text-sm text-red-700">Administrators</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{userStats.generalUsers}</div>
            <div className="text-sm text-green-700">General Users</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{userStats.recent}</div>
            <div className="text-sm text-purple-700">New (7 days)</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10" />

          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) =>
              <SelectItem key={role.RoleID} value={role.RoleCode}>
                  {role.RoleName}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ?
          <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {users.length === 0 ? 'No Users Found' : 'No Matching Users'}
              </h3>
              <p className="text-gray-600">
                {users.length === 0 ?
              'No users have been registered in the system yet.' :
              'No users match your current search criteria.'
              }
              </p>
            </div> :

          filteredUsers.map((user) =>
          <div key={user.ID} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.Name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium">{user.Name}</h4>
                    <p className="text-sm text-gray-600">{user.Email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getUserRoleNames(user.Roles).map((roleName, index) =>
                  <Badge key={index} variant="outline" className="text-xs">
                          {roleName}
                        </Badge>
                  )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(user.CreateTime).toLocaleDateString()}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>User Details - {user.Name}</DialogTitle>
                      </DialogHeader>
                      <UserDetails user={user} roles={roles} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
          )
          }
        </div>
      </CardContent>
    </Card>);

};

const UserDetails = ({ user, roles }: {user: User;roles: Role[];}) => {
  const getUserRoles = () => {
    if (!user.Roles) return [];
    const codes = user.Roles.split(',').map((code) => code.trim());
    return codes.map((code) => {
      const role = roles.find((r) => r.RoleCode === code);
      return role || { RoleCode: code, RoleName: code, RoleRemark: '' };
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="font-medium">User ID:</label>
          <div>{user.ID}</div>
        </div>
        <div>
          <label className="font-medium">Name:</label>
          <div>{user.Name}</div>
        </div>
        <div className="col-span-2">
          <label className="font-medium">Email:</label>
          <div>{user.Email}</div>
        </div>
        <div className="col-span-2">
          <label className="font-medium">Created:</label>
          <div>{new Date(user.CreateTime).toLocaleString()}</div>
        </div>
      </div>

      <div>
        <label className="font-medium">Roles:</label>
        <div className="mt-2 space-y-2">
          {getUserRoles().map((role, index) =>
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{role.RoleName}</div>
                <div className="text-sm text-gray-600">{role.RoleCode}</div>
                {role.RoleRemark &&
              <div className="text-xs text-gray-500">{role.RoleRemark}</div>
              }
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600">
          User role management is handled through the system's permission system. 
          Contact system administrators for role changes.
        </p>
      </div>
    </div>);

};

export default UserManagementPanel;