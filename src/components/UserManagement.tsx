
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
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [newEmployeeData, setNewEmployeeData] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'user'
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: authService.getAllProfiles,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: ({ email, name, role }: { email: string; name: string; role: 'admin' | 'user' }) =>
      authService.createEmployee(email, name, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setGeneratedPassword(data.tempPassword);
      setShowPassword(true);
      setNewEmployeeData({ email: '', name: '', role: 'user' });
      toast({
        title: "Employee Created Successfully",
        description: "The employee account has been created with a temporary password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Employee",
        description: error.message || "Failed to create employee account",
        variant: "destructive",
      });
    },
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeData.email || !newEmployeeData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createEmployeeMutation.mutate(newEmployeeData);
  };

  const handleCloseForm = () => {
    setShowAddEmployee(false);
    setShowPassword(false);
    setGeneratedPassword('');
    setNewEmployeeData({ email: '', name: '', role: 'user' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-black">Employee Management</h2>
          <Button 
            onClick={() => setShowAddEmployee(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {showAddEmployee && (
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New Employee Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {showPassword && generatedPassword ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      <strong>Employee created successfully!</strong> Please share these login credentials with the new employee:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <Label className="text-sm font-medium text-black">Full Name:</Label>
                      <p className="font-mono text-sm bg-white p-2 rounded border text-black">{newEmployeeData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-black">Temporary Password:</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm bg-white p-2 rounded border flex-1 text-black">
                          {showPassword ? generatedPassword : '••••••••••••'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="border-gray-300 text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      <strong>Important:</strong> The employee should change this password after their first login for security.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={handleCloseForm} className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateEmployee} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee-name" className="text-black font-medium">Full Name *</Label>
                      <Input
                        id="employee-name"
                        value={newEmployeeData.name}
                        onChange={(e) => setNewEmployeeData({...newEmployeeData, name: e.target.value})}
                        placeholder="Enter full name"
                        required
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee-email" className="text-black font-medium">Email Address *</Label>
                      <Input
                        id="employee-email"
                        type="email"
                        value={newEmployeeData.email}
                        onChange={(e) => setNewEmployeeData({...newEmployeeData, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee-role" className="text-black font-medium">Role *</Label>
                    <Select 
                      value={newEmployeeData.role} 
                      onValueChange={(value: 'admin' | 'user') => setNewEmployeeData({...newEmployeeData, role: value})}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Select employee role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="user">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      A temporary password will be automatically generated for the new employee. They should change it after their first login.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      disabled={createEmployeeMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {createEmployeeMutation.isPending ? 'Creating Account...' : 'Create Employee Account'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseForm}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardTitle>All Employees</CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-black font-semibold">Name</TableHead>
                  <TableHead className="text-black font-semibold">Email</TableHead>
                  <TableHead className="text-black font-semibold">Role</TableHead>
                  <TableHead className="text-black font-semibold">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-black">{employee.name}</TableCell>
                    <TableCell className="text-gray-700">{employee.email}</TableCell>
                    <TableCell>
                      <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'} 
                             className={employee.role === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}>
                        {employee.role === 'admin' ? 'Admin' : 'Employee'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(employee.created_at || '').toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
