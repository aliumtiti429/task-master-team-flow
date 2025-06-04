
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckSquare, Plus, BarChart3, LogOut, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import EmployeeList from "@/components/EmployeeList";
import TaskList from "@/components/TaskList";
import EmployeeForm from "@/components/EmployeeForm";
import TaskForm from "@/components/TaskForm";
import UserManagement from "@/components/UserManagement";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { employeeService, Employee } from "@/services/employeeService";
import { taskService, Task } from "@/services/taskService";
import { authService } from "@/services/authService";

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, profile, loading, signOut, isAdmin } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch employees, tasks, and profiles
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
    enabled: !!user && isAdmin(),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getAll,
    enabled: !!user,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: authService.getAllProfiles,
    enabled: !!user && isAdmin(),
  });

  // UI state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [employeePositionFilter, setEmployeePositionFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");

  // Employee mutations
  const createEmployeeMutation = useMutation({
    mutationFn: employeeService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowEmployeeForm(false);
      toast({
        title: "Employee Added",
        description: `${data.name} has been added successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding employee:', error);
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Employee, 'id' | 'created_at' | 'updated_at'> }) =>
      employeeService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditingEmployee(null);
      setShowEmployeeForm(false);
      toast({
        title: "Employee Updated",
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating employee:', error);
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: employeeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Employee Deleted",
        description: "Employee has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting employee:', error);
    },
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowTaskForm(false);
      toast({
        title: "Task Created",
        description: `"${data.title}" has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating task:', error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Task, 'id' | 'created_at' | 'updated_at'> }) =>
      taskService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
      setShowTaskForm(false);
      toast({
        title: "Task Updated",
        description: `"${data.title}" has been updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating task:', error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Deleted",
        description: "Task has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting task:', error);
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      taskService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Status Updated",
        description: `"${data.title}" is now ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating task status:', error);
    },
  });

  // Event handlers
  const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
    createEmployeeMutation.mutate(employee);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleUpdateEmployee = (updatedEmployee: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      updateEmployeeMutation.mutate({
        id: editingEmployee.id,
        data: updatedEmployee,
      });
    }
  };

  const handleDeleteEmployee = (id: string) => {
    deleteEmployeeMutation.mutate(id);
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    createTaskMutation.mutate(task);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateTask = (updatedTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: updatedTask,
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  const handleUpdateTaskStatus = (id: string, status: Task['status']) => {
    updateTaskStatusMutation.mutate({ id, status });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Get stats
  const getStats = () => {
    const userTasks = isAdmin() ? tasks : tasks.filter(t => t.assigned_to === user?.id);
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
    
    return {
      totalEmployees: employees.length,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  if (loading || employeesLoading || tasksLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const stats = getStats();
  const userTasks = isAdmin() ? tasks : tasks.filter(t => t.assigned_to === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Employee Task Manager
            </h1>
            <p className="text-slate-600 text-lg">
              Welcome back, {profile?.name} ({profile?.role})
            </p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin() && (
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
          )}

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">
                    {isAdmin() ? 'Total Tasks' : 'My Tasks'}
                  </p>
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
        <Tabs defaultValue={isAdmin() ? "employees" : "tasks"} className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin() ? 'grid-cols-3 lg:w-[500px]' : 'grid-cols-1 lg:w-[200px]'}`}>
            {isAdmin() && (
              <>
                <TabsTrigger value="employees" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employees
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Users
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              {isAdmin() ? 'All Tasks' : 'My Tasks'}
            </TabsTrigger>
          </TabsList>

          {isAdmin() && (
            <>
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
                      searchQuery={employeeSearchQuery}
                      onSearch={setEmployeeSearchQuery}
                      positionFilter={employeePositionFilter}
                      onPositionFilter={(value) => setEmployeePositionFilter(value === "all" ? "" : value)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="pt-6">
                    <UserManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-slate-800">
                      {isAdmin() ? 'Task Management' : 'My Tasks'}
                    </CardTitle>
                    <CardDescription>
                      {isAdmin() 
                        ? 'Create, assign, and track tasks for your team'
                        : 'View and update your assigned tasks'
                      }
                    </CardDescription>
                  </div>
                  {isAdmin() && (
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
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <TaskList 
                  tasks={userTasks}
                  employees={employees}
                  onEdit={isAdmin() ? handleEditTask : undefined}
                  onDelete={isAdmin() ? handleDeleteTask : undefined}
                  onUpdateStatus={handleUpdateTaskStatus}
                  searchQuery={taskSearchQuery}
                  onSearch={setTaskSearchQuery}
                  priorityFilter={taskPriorityFilter}
                  onPriorityFilter={(value) => setTaskPriorityFilter(value === "all" ? "" : value)}
                  statusFilter={taskStatusFilter}
                  onStatusFilter={(value) => setTaskStatusFilter(value === "all" ? "" : value)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showEmployeeForm && isAdmin() && (
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}
          />
        )}

        {showTaskForm && isAdmin() && (
          <TaskForm
            task={editingTask}
            profiles={profiles}
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
