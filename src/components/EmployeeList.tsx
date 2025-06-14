
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Mail, Building, User, Crown } from "lucide-react";
import { Employee } from "@/services/employeeService";
import Search from "./Search";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  positionFilter?: string;
  onPositionFilter?: (position: string) => void;
}

const EmployeeList = ({ 
  employees, 
  onEdit, 
  onDelete, 
  searchQuery = "", 
  onSearch,
  positionFilter = "",
  onPositionFilter
}: EmployeeListProps) => {
  
  // Get unique positions for filter dropdown
  const uniquePositions = Array.from(new Set(employees.map(emp => emp.position))).sort();

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPosition = !positionFilter || employee.position === positionFilter;
    
    return matchesSearch && matchesPosition;
  });

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
        <p className="text-gray-600">Get started by adding your first team member.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {onSearch && (
          <div className="flex-1">
            <Search
              placeholder="Search employees by name, email, department, or position..."
              onSearch={onSearch}
            />
          </div>
        )}
        
        {onPositionFilter && (
          <Select value={positionFilter} onValueChange={onPositionFilter}>
            <SelectTrigger className="w-full sm:w-48 border-gray-200">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All positions</SelectItem>
              {uniquePositions.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {filteredEmployees.length === 0 && (searchQuery || positionFilter) ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        {employee.role === 'admin' && (
                          <Crown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{employee.position}</p>
                      <Badge 
                        variant={employee.role === 'admin' ? 'default' : 'secondary'}
                        className={employee.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}
                      >
                        {employee.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(employee.id)}
                      className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {employee.department}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
