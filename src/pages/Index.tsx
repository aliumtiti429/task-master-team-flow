
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckSquare, Plus, BarChart3, LogOut, Calendar, Clock, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import EmployeeList from "@/components/EmployeeList";
import TaskList from "@/components/TaskList";
import EmployeeForm from "@/components/EmployeeForm";
import TaskForm from "@/components/TaskForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { employeeService, Employee } from "@/services/employeeService";
import { taskService, Task } from "@/services/taskService";

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin, signOut } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch employees and tasks
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.getAll,
    enabled: !!user,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getAll,
    enabled: !!user,
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

  // Employee mutations (admin only)
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

  // Get stats (filtered for employees)
  const getStats = () => {
    const userTasks = isAdmin ? tasks : tasks.filter(t => t.assigned_to === profile?.id);
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

  if (loading || employeesLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isAdmin ? 'Admin Dashboard' : 'Employee Dashboard'}
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {profile?.name} ({profile?.position})
            </p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin && (
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-700">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckSquare className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">{isAdmin ? 'Total Tasks' : 'My Tasks'}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-700">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgressTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={isAdmin ? "employees" : "tasks"} className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} lg:w-[400px] bg-gray-100`}>
            {isAdmin && (
              <TabsTrigger value="employees" className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                <Users className="h-4 w-4" />
                Employees
              </TabsTrigger>
            )}
            <TabsTrigger value="tasks" className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {isAdmin && (
            <TabsContent value="employees" className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl text-gray-900">Employee Management</CardTitle>
                      <CardDescription className="text-gray-600">
                        Add, edit, and manage your team members
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => {
                        setEditingEmployee(null);
                        setShowEmployeeForm(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
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
          )}

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{isAdmin ? 'Task Management' : 'My Tasks'}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {isAdmin ? 'Create, assign, and track tasks for your team' : 'View and update your assigned tasks'}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button 
                      onClick={() => {
                        setEditingTask(null);
                        setShowTaskForm(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TaskList 
                  tasks={isAdmin ? tasks : tasks.filter(t => t.assigned_to === profile?.id)}
                  employees={employees}
                  onEdit={isAdmin ? handleEditTask : undefined}
                  onDelete={isAdmin ? handleDeleteTask : undefined}
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

        {/* Forms (Admin only) */}
        {isAdmin && showEmployeeForm && (
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(null);
            }}
          />
        )}

        {isAdmin && showTaskForm && (
          <TaskForm
            task={editingTask}
            profiles={employees}
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
