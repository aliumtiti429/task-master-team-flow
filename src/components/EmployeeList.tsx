
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Mail, Building, User } from "lucide-react";
import { Employee } from "@/pages/Index";
import Search from "./Search";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const EmployeeList = ({ employees, onEdit, onDelete, searchQuery = "", onSearch }: EmployeeListProps) => {
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No employees yet</h3>
        <p className="text-slate-600">Get started by adding your first team member.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onSearch && (
        <Search
          placeholder="Search employees by name, email, department, or position..."
          onSearch={onSearch}
          className="mb-6"
        />
      )}
      
      {filteredEmployees.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No employees found</h3>
          <p className="text-slate-600">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                      <p className="text-sm text-slate-600">{employee.position}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(employee.id)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
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
