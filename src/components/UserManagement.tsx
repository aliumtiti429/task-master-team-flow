
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, UserPlus, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, UserProfile } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newUserData, setNewUserData] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'user'
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: authService.getAllProfiles,
  });

  const createUserMutation = useMutation({
    mutationFn: ({ email, name, role }: { email: string; name: string; role: 'admin' | 'user' }) =>
      authService.createUserProfile(email, name, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setGeneratedPassword(data.tempPassword);
      setShowPassword(true);
      setNewUserData({ email: '', name: '', role: 'user' });
      toast({
        title: "User Created Successfully",
        description: "The user account has been created with a temporary password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating User",
        description: error.message || "Failed to create user account",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUserData);
  };

  const handleCloseForm = () => {
    setShowAddUser(false);
    setShowPassword(false);
    setGeneratedPassword('');
    setNewUserData({ email: '', name: '', role: 'user' });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button 
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {showAddUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New User Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showPassword && generatedPassword ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>User created successfully!</strong> Please share these login credentials with the new user:
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Email:</Label>
                    <p className="font-mono text-sm bg-white p-2 rounded border">{newUserData.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Temporary Password:</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-white p-2 rounded border flex-1">
                        {showPassword ? generatedPassword : '••••••••••••'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Important:</strong> The user should change this password after their first login for security.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={handleCloseForm} className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Full Name *</Label>
                    <Input
                      id="user-name"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email Address *</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">Role *</Label>
                  <Select 
                    value={newUserData.role} 
                    onValueChange={(value: 'admin' | 'user') => setNewUserData({...newUserData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Alert>
                  <AlertDescription>
                    A temporary password will be automatically generated for the new user. They should change it after their first login.
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createUserMutation.isPending ? 'Creating Account...' : 'Create User Account'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at || '').toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
