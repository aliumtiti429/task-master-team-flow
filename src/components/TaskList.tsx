import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Calendar, User, AlertCircle } from "lucide-react";
import { Task } from "@/services/taskService";
import { Employee } from "@/services/employeeService";
import Search from "./Search";

interface TaskListProps {
  tasks: Task[];
  employees: Employee[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Task['status']) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilter?: (priority: string) => void;
  statusFilter?: string;
  onStatusFilter?: (status: string) => void;
}

const TaskList = ({ 
  tasks, 
  employees, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  searchQuery = "", 
  onSearch,
  priorityFilter = "",
  onPriorityFilter,
  statusFilter = "",
  onStatusFilter
}: TaskListProps) => {
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unassigned';
  };

  const filteredTasks = tasks.filter(task => {
    const employeeName = getEmployeeName(task.assigned_to);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = !priorityFilter || priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: Task['status']) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
        <p className="text-slate-600">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {onSearch && (
          <div className="flex-1">
            <Search
              placeholder="Search tasks by title, description, status, priority, or assignee..."
              onSearch={onSearch}
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          {onPriorityFilter && (
            <Select value={priorityFilter} onValueChange={onPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {onStatusFilter && (
            <Select value={statusFilter} onValueChange={onStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 && (searchQuery || priorityFilter || statusFilter) ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
          <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">{task.title}</h3>
                      {isOverdue(task.due_date, task.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 mb-3">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center text-slate-600">
                        <User className="h-4 w-4 mr-1" />
                        {getEmployeeName(task.assigned_to)}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {formatDate(task.due_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(task.id)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority} priority
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <Select value={task.status} onValueChange={(value: Task['status']) => onUpdateStatus(task.id, value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
