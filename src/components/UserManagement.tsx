import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  UserX,
  Shield,
  Clock,
  RefreshCw } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  create_time: string;
  is_activated: boolean;
  role_id: number;
  role_name: string;
  role_code: string;
}

interface Role {
  id: number;
  name: string;
  code: string;
  remark: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get current user info to check permissions
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw new Error('Not authenticated');
      setCurrentUserInfo(userInfo.data);

      // Check if user is admin
      const userRoles = userInfo.data?.Roles?.split(',') || [];
      if (!userRoles.includes('Administrator')) {
        toast({
          title: 'Access Denied',
          description: 'You need administrator privileges to manage users',
          variant: 'destructive'
        });
        return;
      }

      // Load users
      const usersResponse = await window.ezsite.apis.tablePage(32152, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'create_time',
        IsAsc: false
      });

      if (usersResponse.error) throw usersResponse.error;
      setUsers(usersResponse.data?.List || []);

      // Load roles
      const rolesResponse = await window.ezsite.apis.tablePage(32248, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'name',
        IsAsc: true
      });

      if (rolesResponse.error) throw rolesResponse.error;
      setRoles(rolesResponse.data?.List || []);

    } catch (error: any) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, roleId: number) => {
    try {
      const response = await window.ezsite.apis.tableUpdate(32152, {
        id: userId,
        role_id: roleId
      });

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: 'User role updated successfully'
      });

      loadData(); // Reload data
      setShowEditDialog(false);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActivation = async (userId: number, isActivated: boolean) => {
    try {
      const response = await window.ezsite.apis.tableUpdate(32152, {
        id: userId,
        is_activated: !isActivated
      });

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: `User ${!isActivated ? 'activated' : 'deactivated'} successfully`
      });

      loadData(); // Reload data
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await window.ezsite.apis.tableDelete(32152, { ID: userId });
      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });

      loadData(); // Reload data
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const getRoleDisplay = (roleCode: string) => {
    switch (roleCode) {
      case 'Administrator':return 'Administrator';
      case 'r-QpoZrh':return 'Contractor';
      case 'GeneralUser':return 'General User';
      default:return roleCode || 'User';
    }
  };

  const getRoleColor = (roleCode: string) => {
    switch (roleCode) {
      case 'Administrator':return 'bg-red-100 text-red-800';
      case 'r-QpoZrh':return 'bg-blue-100 text-blue-800';
      case 'GeneralUser':return 'bg-green-100 text-green-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter((user) =>
  user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  user.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current user is admin
  const isCurrentUserAdmin = currentUserInfo?.Roles?.split(',').includes('Administrator');

  if (!isCurrentUserAdmin && !loading) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You need administrator privileges to access user management.</p>
      </div>);

  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">Loading users...</p>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Total: {users.length} users</span>
          <Button onClick={loadData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10" />

      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ?
        <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No users found' : 'No users yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}
                </p>
              </div>
            </CardContent>
          </Card> :

        filteredUsers.map((user) =>
        <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {user.name || 'No Name'}
                        </h3>
                        <Badge className={getRoleColor(user.role_code)}>
                          {getRoleDisplay(user.role_code)}
                        </Badge>
                        {!user.is_activated &&
                    <Badge variant="destructive">Inactive</Badge>
                    }
                      </div>
                      <p className="text-gray-600 mb-1">{user.email}</p>
                      {user.phone_number &&
                  <p className="text-sm text-gray-500 mb-1">{user.phone_number}</p>
                  }
                      <p className="text-xs text-gray-400">
                        Registered: {formatDate(user.create_time)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleActivation(user.id, user.is_activated)}
                  title={user.is_activated ? 'Deactivate User' : 'Activate User'}>

                      {user.is_activated ?
                  <UserX className="h-4 w-4" /> :

                  <UserCheck className="h-4 w-4" />
                  }
                    </Button>

                    <Dialog open={showEditDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                  setShowEditDialog(open);
                  if (!open) setSelectedUser(null);
                }}>
                      <DialogTrigger asChild>
                        <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                      title="Edit Role">

                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User Role</DialogTitle>
                          <DialogDescription>
                            Change the role for {user.name || user.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Current Role</Label>
                            <div>
                              <Badge className={getRoleColor(user.role_code)}>
                                {getRoleDisplay(user.role_code)}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>New Role</Label>
                            <Select onValueChange={(value) => handleUpdateRole(user.id, parseInt(value))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) =>
                            <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name} ({getRoleDisplay(role.code)})
                                  </SelectItem>
                            )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteUser(user.id)}
                  title="Delete User"
                  className="text-red-600 hover:text-red-700">

                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )
        }
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.is_activated).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter((u) => u.role_code === 'Administrator').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">General Users</p>
                <p className="text-2xl font-bold text-gray-600">
                  {users.filter((u) => u.role_code === 'GeneralUser').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default UserManagement;