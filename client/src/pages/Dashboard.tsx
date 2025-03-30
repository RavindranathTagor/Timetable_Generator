import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  ListChecks,
  ArrowUpRight,
  FolderOpen,
  PieChart,
  Plus,
  Users,
} from "lucide-react";

// Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types and Utils
import { 
  Task, 
  User, 
  Project,
  TaskStatus,
  Priority 
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Get user details by ID
  const getUserById = (userId: number | null) => {
    if (!userId || !users) return null;
    return Array.isArray(users) ? users.find((user: User) => user.id === userId) : null;
  };

  // Get project details by ID
  const getProjectById = (projectId: number | null) => {
    if (!projectId || !projects) return null;
    return Array.isArray(projects) ? projects.find((project: Project) => project.id === projectId) : null;
  };

  // Get user initials for avatar
  const getUserInitials = (user: User | null) => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Filter tasks by status
  const getTasksByStatus = (status: TaskStatus | "all" = "all") => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return status === "all" 
      ? tasks
      : tasks.filter((task: Task) => task.status === status);
  };

  // Get overdue tasks
  const getOverdueTasks = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate || task.isCompleted) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    });
  };

  // Get tasks due today
  const getTasksDueToday = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate || task.isCompleted) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate < tomorrow;
    });
  };

  // Get tasks due this week
  const getTasksDueThisWeek = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate || task.isCompleted) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= endOfWeek;
    });
  };

  // Get task statistics
  const getTaskStats = () => {
    if (!tasks || !Array.isArray(tasks)) return { total: 0, completed: 0, inProgress: 0, todo: 0, review: 0 };
    
    return {
      total: tasks.length,
      completed: tasks.filter((task: Task) => task.isCompleted).length,
      inProgress: tasks.filter((task: Task) => task.status === "in_progress").length,
      todo: tasks.filter((task: Task) => task.status === "todo").length,
      review: tasks.filter((task: Task) => task.status === "review").length,
      overdue: getOverdueTasks().length,
      dueToday: getTasksDueToday().length,
      dueThisWeek: getTasksDueThisWeek().length,
    };
  };

  // Get project statistics
  const getProjectStats = () => {
    if (!projects) return { total: 0 };
    return {
      total: Array.isArray(projects) ? projects.length : 0,
    };
  };

  // Get color for priority
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Get color for status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const taskStats = getTaskStats();
  const projectStats = getProjectStats();
  const recentTasks = Array.isArray(tasks) 
    ? [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    : [];
  const upcomingTasks = getTasksDueThisWeek().sort((a, b) => 
    new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
  ).slice(0, 5);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{taskStats.total}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ListChecks className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{taskStats.completed}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
              <h3 className="text-2xl font-bold mt-1">{taskStats.overdue}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projects</p>
              <h3 className="text-2xl font-bold mt-1">{projectStats.total}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Tasks Overview</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    View All
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Your tasks across all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col items-center justify-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-2xl font-bold">{taskStats.todo}</span>
                  <span className="text-xs text-muted-foreground mt-1">To Do</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl font-bold">{taskStats.inProgress}</span>
                  <span className="text-xs text-muted-foreground mt-1">In Progress</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-purple-100 rounded-lg">
                  <span className="text-2xl font-bold">{taskStats.review}</span>
                  <span className="text-xs text-muted-foreground mt-1">In Review</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl font-bold">{taskStats.completed}</span>
                  <span className="text-xs text-muted-foreground mt-1">Completed</span>
                </div>
              </div>
              
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {upcomingTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming tasks due this week
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingTasks.map((task) => {
                        const user = getUserById(task.userId);
                        const project = getProjectById(task.projectId);
                        
                        return (
                          <div key={task.id} className="flex items-start p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                  {task.title}
                                </h4>
                                <Badge className={`ml-2 ${getPriorityColor(task.priority)}`} variant="outline">
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </Badge>
                              </div>
                              {project && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Project: {project.name}
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-xs">
                                  Due: <span className="font-medium">{formatDate(task.dueDate)}</span>
                                </div>
                                {user && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getUserInitials(user)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recent">
                  {recentTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks created yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentTasks.map((task) => {
                        const user = getUserById(task.userId);
                        const project = getProjectById(task.projectId);
                        
                        return (
                          <div key={task.id} className="flex items-start p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                  {task.title}
                                </h4>
                                <Badge className={`ml-2 ${getStatusColor(task.status)}`} variant="outline">
                                  {task.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              </div>
                              {project && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Project: {project.name}
                                </div>
                              )}
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-xs">
                                  Created: <span className="font-medium">{formatDate(task.createdAt)}</span>
                                </div>
                                {user && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {getUserInitials(user)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/tasks">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Projects section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Projects</CardTitle>
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    View All
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Your recent projects</CardDescription>
            </CardHeader>
            <CardContent>
              {!projects || (Array.isArray(projects) && projects.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  No projects created yet
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(projects) && projects.slice(0, 3).map((project) => {
                    const owner = getUserById(project.ownerId);
                    const projectTasks = Array.isArray(tasks) 
                      ? tasks.filter((task: Task) => task.projectId === project.id)
                      : [];
                    const completedTasks = projectTasks.filter((task) => task.isCompleted).length;
                    const progress = projectTasks.length > 0 
                      ? Math.round((completedTasks / projectTasks.length) * 100)
                      : 0;
                    
                    return (
                      <div key={project.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getUserInitials(owner)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1.5 text-sm">
                            <span>{completedTasks} of {projectTasks.length} tasks</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/projects">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/tasks?new=true">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </Link>
              <Link href="/projects?new=true">
                <Button className="w-full justify-start" variant="outline">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Due Today */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Due Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {taskStats.dueToday === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No tasks due today
                </div>
              ) : (
                <div className="space-y-3">
                  {getTasksDueToday().map((task) => (
                    <div key={task.id} className="p-3 border rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <div className="flex items-center mt-1">
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                            {task.projectId && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {getProjectById(task.projectId)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Team */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!users || (Array.isArray(users) && users.length === 0) ? (
                <div className="text-center py-4 text-muted-foreground">
                  No team members yet
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.isArray(users) && users.slice(0, 5).map((user) => {
                    const userTasks = Array.isArray(tasks) 
                      ? tasks.filter((task: Task) => task.userId === user.id)
                      : [];
                    const completedTasks = userTasks.filter((task) => task.isCompleted).length;
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-2">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback>
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {completedTasks}/{userTasks.length} tasks
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}