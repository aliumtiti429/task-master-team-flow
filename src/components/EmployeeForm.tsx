
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Employee } from "@/services/employeeService";

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (employee: Omit<Employee, 'id'>) => void;
  onCancel: () => void;
}

const EmployeeForm = ({ employee, onSubmit, onCancel }: EmployeeFormProps) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || '',
    position: employee?.position || '',
    role: employee?.role || 'user' as 'admin' | 'user'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
          <CardTitle className="text-xl">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-white hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 font-medium">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
                className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-900 font-medium">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Enter department"
                className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.department ? 'border-red-500' : ''}`}
              />
              {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-900 font-medium">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Enter position"
                className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.position ? 'border-red-500' : ''}`}
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-900 font-medium">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger className={`border-gray-300 focus:border-red-500 focus:ring-red-500 ${errors.role ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {employee ? 'Update Employee' : 'Add Employee'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeForm;
