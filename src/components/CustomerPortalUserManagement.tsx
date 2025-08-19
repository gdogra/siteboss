
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DataTable from  '@/components/DataTable';
import {
  Users,
  Plus,
  Shield,
  Edit,
  Trash2,
  Mail,
  User,
  Lock,
  UserPlus,
  UserCheck,
  UserX,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  ID: number;
  Name: string;
  Email: string;
  Roles: string;
  CreateTime: string;
  permissions?: any[];
}

interface Permission {
  permission_key: string;
  permission_value: string;
  expires_at?: string;
}

const CustomerPortalUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'GeneralUser',
    permissions: [] as Permission[]
  });

  const permissionCategories = {
    dashboard: 'Dashboard Access',
    features: 'Feature Management', 
    users: 'User Management',
    analytics: 'Analytics & Reports',
    branding: 'Branding & Customization',
    settings: 'Portal Settings',
    integrations: 'Integration Management'
  };

  const permissionLevels = {
    none: 'No Access',
    read: 'View Only',
    write: 'Edit',
    admin: 'Full Control'
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all users from the auth system
      const { data: usersData, error: usersError } = await window.ezsite.apis.tablePage(32152, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (usersError) throw new Error(usersError);

      if (usersData?.List) {
        setUsers(usersData.List);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading users',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPermissions = async (userId: number) => {
    try {
      const { data: permissionsData, error } = await window.ezsite.apis.tablePage(35464, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userId }
        ]
      });

      if (!error && permissionsData?.List) {
        setUserPermissions(permissionsData.List);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading permissions',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const inviteUser = async () => {
    try {
      // First register the user
      const { error: registerError } = await window.ezsite.apis.register({
        email: newUser.email,
        password: 'TempPassword123!' // Temporary password
      });

      if (registerError) throw new Error(registerError);

      // Send invitation email (you would implement this)
      await sendInvitationEmail(newUser.email, newUser.name);

      // Create default permissions
      const currentUser = await window.ezsite.apis.getUserInfo();
      for (const permission of newUser.permissions) {
        await window.ezsite.apis.tableCreate(35464, {
          user_id: 0, // Will be updated when user accepts invitation
          customer_id: 1, // Default customer
          permission_key: permission.permission_key,
          permission_value: permission.permission_value,
          granted_by: currentUser.data?.ID,
          created_at: new Date().toISOString()
        });
      }

      toast({
        title: 'User invited',
        description: `Invitation sent to ${newUser.email}`
      });

      setShowAddUser(false);
      setNewUser({ email: '', name: '', role: 'GeneralUser', permissions: [] });
      loadUsers();

    } catch (error: any) {
      toast({
        title: 'Error inviting user',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const sendInvitationEmail = async (email: string, name: string) => {
    try {
      await window.ezsite.apis.sendEmail({
        from: 'Portal <noreply@portal.com>',
        to: [email],
        subject: 'Welcome to Customer Portal',
        html: `
          <h2>Welcome ${name}!</h2>
          <p>You've been invited to join the Customer Portal.</p>
          <p>Please click the link below to set your password and get started:</p>
          <a href="${window.location.origin}/resetpassword?token=invitation">Set Password</a>
        `
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }
  };

  const updateUserPermissions = async (userId: number, permissions: Permission[]) => {
    try {
      // Delete existing permissions
      const { data: existingPerms } = await window.ezsite.apis.tablePage(35464, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [{ name: 'user_id', op: 'Equal', value: userId }]
      });

      if (existingPerms?.List) {
        for (const perm of existingPerms.List) {
          await window.ezsite.apis.tableDelete(35464, { ID: perm.id });
        }
      }

      // Add new permissions
      const currentUser = await window.ezsite.apis.getUserInfo();
      for (const permission of permissions) {
        await window.ezsite.apis.tableCreate(35464, {
          user_id: userId,
          customer_id: 1,
          permission_key: permission.permission_key,
          permission_value: permission.permission_value,
          granted_by: currentUser.data?.ID,
          created_at: new Date().toISOString()
        });
      }

      toast({
        title: 'Permissions updated',
        description: 'User permissions have been updated successfully.'
      });

    } catch (error: any) {
      toast({
        title: 'Error updating permissions',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getUserStatusBadge = (user: User) => {
    const roles = user.Roles ? user.Roles.split(',') : [];
    if (roles.includes('Administrator')) {
      return <Badge variant="default">Admin</Badge>;
    } else if (roles.includes('GeneralUser')) {
      return <Badge variant="secondary">User</Badge>;
    } else {
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const userColumns = [
    {
      header: 'User',
      accessor: 'user',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.Name || 'Unnamed'}</div>
            <div className="text-sm text-muted-foreground">{user.Email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (user: User) => getUserStatusBadge(user)
    },
    {
      header: 'Created',
      accessor: 'created',
      render: (user: User) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.CreateTime).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              loadUserPermissions(user.ID);
              setShowPermissions(true);
            }}
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              // Open edit user dialog
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="User Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GeneralUser">General User</SelectItem>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={inviteUser} className="flex-1">
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={userColumns}
            searchKey="Email"
          />
        </CardContent>
      </Card>

      {/* User Permissions Dialog */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions for {selectedUser?.Name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(permissionCategories).map(([category, label]) => (
              <div key={category} className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <Select
                  value={userPermissions.find(p => p.permission_key === category)?.permission_value || 'none'}
                  onValueChange={(value) => {
                    const updatedPermissions = userPermissions.filter(p => p.permission_key !== category);
                    if (value !== 'none') {
                      updatedPermissions.push({
                        permission_key: category,
                        permission_value: value
                      });
                    }
                    setUserPermissions(updatedPermissions);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(permissionLevels).map(([level, levelLabel]) => (
                      <SelectItem key={level} value={level}>
                        {levelLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPermissions(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    updateUserPermissions(selectedUser.ID, userPermissions);
                    setShowPermissions(false);
                  }
                }}
                className="flex-1"
              >
                Update Permissions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.Roles?.includes('Administrator')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.Roles?.includes('GeneralUser')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerPortalUserManagement;
