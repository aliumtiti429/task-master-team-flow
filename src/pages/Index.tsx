
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckSquare, Plus, BarChart3 } from "lucide-react";
import EmployeeList from "@/components/EmployeeList";
import TaskList from "@/components/TaskList";
import EmployeeForm from "@/components/EmployeeForm";
import TaskForm from "@/components/TaskForm";
import { useToast } from "@/hooks/use-toast";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string; // employee id
  dueDate: string;
  createdAt: string;
}

const Index = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@company.com",
      department: "Engineering",
      position: "Senior Developer"
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      department: "Design",
      position: "UI/UX Designer"
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.wilson@company.com",
      department: "Marketing",
      position: "Marketing Manager"
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Implement User Authentication",
      description: "Add login and registration functionality to the application",
      status: "in-progress",
      priority: "high",
      assignedTo: "1",
      dueDate: "2024-06-15",
      createdAt: "2024-05-30"
    },
    {
      id: "2",
      title: "Design Landing Page",
      description: "Create mockups and design for the new landing page",
      status: "pending",
      priority: "medium",
      assignedTo: "2",
      dueDate: "2024-06-10",
      createdAt: "2024-05-30"
    },
    {
      id: "3",
      title: "Plan Marketing Campaign",
      description: "Develop strategy for Q3 marketing campaign",
      status: "completed",
      priority: "high",
      assignedTo: "3",
      dueDate: "2024-06-01",
      createdAt: "2024-05-25"
    }
  ]);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString()
    };
    setEmployees([...employees, newEmployee]);
    setShowEmployeeForm(false);
    toast({
      title: "Employee Added",
      description: `${employee.name} has been added successfully.`,
    });
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleUpdateEmployee = (updatedEmployee: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...updatedEmployee, id: editingEmployee.id }
          : emp
      ));
      setEditingEmployee(null);
      setShowEmployeeForm(false);
      toast({
        title: "Employee Updated",
        description: `${updatedEmployee.name} has been updated successfully.`,
      });
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    setEmployees(employees.filter(emp => emp.id !== id));
    // Also remove tasks assigned to this employee
    setTasks(tasks.filter(task => task.assignedTo !== id));
    toast({
      title: "Employee Deleted",
      description: `${employee?.name} has been removed.`,
    });
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
    toast({
      title: "Task Created",
      description: `"${task.title}" has been created successfully.`,
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = (updatedTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...updatedTask, id: editingTask.id, createdAt: editingTask.createdAt }
          : task
      ));
      setEditingTask(null);
      setShowTaskForm(false);
      toast({
        title: "Task Updated",
        description: `"${updatedTask.title}" has been updated successfully.`,
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.filter(t => t.id !== id));
    toast({
      title: "Task Deleted",
      description: `"${task?.title}" has been deleted.`,
    });
  };

  const handleUpdateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status } : task
    ));
    const task = tasks.find(t => t.id === id);
    toast({
      title: "Task Status Updated",
      description: `"${task?.title}" is now ${status}.`,
    });
  };

  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    return {
      totalEmployees: employees.length,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Employee Task Manager
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your team and tasks efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Employees</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalEmployees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-orange-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.inProgressTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-slate-800">Employee Management</CardTitle>
                    <CardDescription>
                      Add, edit, and manage your team members
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingEmployee(null);
                      setShowEmployeeForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EmployeeList 
                  employees={employees}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-slate-800">Task Management</CardTitle>
                    <CardDescription>
                      Create, assign, and track tasks for your team
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingTask(null);
                      setShowTaskForm(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={tasks}
                  employees={employees}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onUpdateStatus={handleUpdateTaskStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showEmployeeForm && (
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}
          />
        )}

        {showTaskForm && (
          <TaskForm
            task={editingTask}
            employees={employees}
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
            onCancel={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
