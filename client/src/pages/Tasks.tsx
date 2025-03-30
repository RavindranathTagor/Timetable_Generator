import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Filter, X, Pencil, Trash2, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Types and Utils
import { 
  Task, 
  User, 
  Project, 
  taskFormSchema, 
  taskStatuses, 
  priorities,
  TaskStatus, 
  Priority 
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [view, setView] = useState<"list" | "board">("list");
  const { toast } = useToast();

  // Fetch tasks
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (values: z.infer<typeof taskFormSchema>) => {
      return apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (values: Partial<Task> & { id: number }) => {
      const { id, ...rest } = values;
      return apiRequest(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
  });

  // Toggle task completion
  const toggleTaskCompletionMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isCompleted }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Create task form
  const createTaskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: null,
      status: "todo",
      priority: "medium",
      dueDate: null,
      userId: null,
      projectId: null,
      isCompleted: false,
    },
  });

  // Edit task form
  const editTaskForm = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: null,
      status: "todo",
      priority: "medium",
      dueDate: undefined,
      userId: undefined,
      projectId: undefined,
      isCompleted: false,
    },
  });

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch projects for task assignment
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Handle opening edit dialog
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    editTaskForm.reset({
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as Priority,
      dueDate: task.dueDate,
      userId: task.userId,
      projectId: task.projectId,
      isCompleted: task.isCompleted,
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Handle task status change
  const handleStatusChange = (task: Task, status: TaskStatus) => {
    updateTaskMutation.mutate({ id: task.id, status });
  };

  // Handle task completion toggle
  const handleToggleCompletion = (task: Task) => {
    toggleTaskCompletionMutation.mutate({
      id: task.id,
      isCompleted: !task.isCompleted,
    });
  };

  // Filter tasks based on current filter
  const filteredTasks = tasks
    ? Array.isArray(tasks)
      ? tasks.filter((task: Task) => {
          const statusMatch = filter === "all" || task.status === filter;
          const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;
          return statusMatch && priorityMatch;
        })
      : []
    : [];

  // Group tasks by status for board view
  const groupedTasks = filteredTasks.reduce((groups: Record<TaskStatus, Task[]>, task: Task) => {
    const status = task.status as TaskStatus;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {} as Record<TaskStatus, Task[]>);

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

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return format(new Date(date), "PPP");
  };

  // Get user initials for avatar
  const getUserInitials = (user: User | null) => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <h4 className="mb-2 text-sm font-medium">Status</h4>
                <div className="space-y-1">
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    All
                  </DropdownMenuItem>
                  {taskStatuses.map((status) => (
                    <DropdownMenuItem key={status} onClick={() => setFilter(status)}>
                      {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </DropdownMenuItem>
                  ))}
                </div>
                <h4 className="mt-4 mb-2 text-sm font-medium">Priority</h4>
                <div className="space-y-1">
                  <DropdownMenuItem onClick={() => setPriorityFilter("all")}>
                    All
                  </DropdownMenuItem>
                  {priorities.map((priority) => (
                    <DropdownMenuItem key={priority} onClick={() => setPriorityFilter(priority)}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="list"
        className="w-full"
        value={view}
        onValueChange={(value) => setView(value as "list" | "board")}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="board">Board View</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </div>
        </div>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
          {isLoadingTasks ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task: Task) => {
                    const user = getUserById(task.userId);
                    const project = getProjectById(task.projectId);
                    return (
                      <TableRow
                        key={task.id}
                        className={task.isCompleted ? "bg-muted/40" : ""}
                      >
                        <TableCell>
                          <div onClick={() => handleToggleCompletion(task)} className="cursor-pointer">
                            {task.isCompleted ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={task.isCompleted ? "line-through text-muted-foreground" : ""}>
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)} variant="outline">
                            {task.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                        </TableCell>
                        <TableCell>
                          {project ? project.name : "None"}
                        </TableCell>
                        <TableCell>
                          {user ? (
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                              </span>
                            </div>
                          ) : (
                            "Unassigned"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Board View */}
        <TabsContent value="board" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {taskStatuses.map((status) => (
              <div key={status} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h3>
                  <Badge variant="outline">
                    {(groupedTasks[status as TaskStatus] || []).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {(groupedTasks[status as TaskStatus] || []).map((task: Task) => {
                    const user = getUserById(task.userId);
                    const project = getProjectById(task.projectId);
                    return (
                      <Card key={task.id} className={task.isCompleted ? "bg-muted/40" : ""}>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-2">
                              <div 
                                className="mt-1 cursor-pointer" 
                                onClick={() => handleToggleCompletion(task)}
                              >
                                {task.isCompleted ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <CardTitle className={`text-base ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteTask(task)}>
                                  Delete
                                </DropdownMenuItem>
                                {taskStatuses
                                  .filter((s) => s !== task.status)
                                  .map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => handleStatusChange(task, s as TaskStatus)}
                                    >
                                      Move to {s.replace("_", " ")}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Badge>
                            {project && (
                              <Badge variant="outline">{project.name}</Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">
                              {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                            </div>
                            {user && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {(!groupedTasks[status as TaskStatus] || groupedTasks[status as TaskStatus].length === 0) && (
                    <div className="h-20 border border-dashed rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Add a new task to your list. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...createTaskForm}>
            <form
              onSubmit={createTaskForm.handleSubmit((values) => createTaskMutation.mutate(values))}
              className="space-y-6"
            >
              <FormField
                control={createTaskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createTaskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createTaskForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTaskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createTaskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().substring(0, 10) : ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createTaskForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {projects && Array.isArray(projects) && projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createTaskForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to someone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users && Array.isArray(users) && users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createTaskForm.control}
                name="isCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as completed</FormLabel>
                      <FormDescription>
                        This task will be marked as done
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details of your task.
            </DialogDescription>
          </DialogHeader>
          <Form {...editTaskForm}>
            <form
              onSubmit={editTaskForm.handleSubmit((values) => 
                updateTaskMutation.mutate({ id: selectedTask?.id || 0, ...values })
              )}
              className="space-y-6"
            >
              <FormField
                control={editTaskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editTaskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editTaskForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taskStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editTaskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editTaskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().substring(0, 10) : ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editTaskForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {projects && Array.isArray(projects) && projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editTaskForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to someone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users && Array.isArray(users) && users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editTaskForm.control}
                name="isCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as completed</FormLabel>
                      <FormDescription>
                        This task will be marked as done
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md mb-4">
            <p className="font-medium">{selectedTask?.title}</p>
            {selectedTask?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTask.description}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteTaskMutation.mutate(selectedTask?.id || 0)}
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? "Deleting..." : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}