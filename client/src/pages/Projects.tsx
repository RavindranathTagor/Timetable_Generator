import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar, MoreHorizontal, Trash2, Pencil, FolderPlus } from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types and Utils
import { 
  Project, 
  User, 
  Task,
  projectFormSchema
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectFormSchema>) => {
      return apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (values: Partial<Project> & { id: number }) => {
      const { id, ...rest } = values;
      return apiRequest(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(rest),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/projects/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
    },
  });

  // Fetch users for project assignment
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch tasks for project details
  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Create project form
  const createProjectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: null,
      ownerId: 1, // Default to first user
    },
  });

  // Edit project form
  const editProjectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: null,
      ownerId: 1,
    },
  });

  // Handle opening edit dialog
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    editProjectForm.reset({
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), "PPP");
  };

  // Get user details by ID
  const getUserById = (userId: number) => {
    if (!users) return null;
    return Array.isArray(users) ? users.find((user: User) => user.id === userId) : null;
  };

  // Get tasks for a project
  const getTasksForProject = (projectId: number) => {
    if (!tasks) return [];
    return Array.isArray(tasks) 
      ? tasks.filter((task: Task) => task.projectId === projectId) 
      : [];
  };

  // Get task count by status
  const getTaskCountByStatus = (projectId: number) => {
    const projectTasks = getTasksForProject(projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((task: Task) => task.isCompleted).length,
      inProgress: projectTasks.filter((task: Task) => task.status === "in_progress").length,
      todo: projectTasks.filter((task: Task) => task.status === "todo").length,
    };
  };

  // Get user initials for avatar
  const getUserInitials = (user: User | null) => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Get completion percentage
  const getCompletionPercentage = (projectId: number) => {
    const { total, completed } = getTaskCountByStatus(projectId);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {isLoadingProjects ? (
        <div className="text-center py-8">Loading projects...</div>
      ) : !projects || (Array.isArray(projects) && projects.length === 0) ? (
        <div className="text-center py-12">
          <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started organizing your tasks.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(projects) && projects.map((project: Project) => {
            const owner = getUserById(project.ownerId);
            const taskCounts = getTaskCountByStatus(project.id);
            const completionPercentage = getCompletionPercentage(project.id);
            
            return (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProject(project)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {project.description && (
                    <CardDescription className="mt-1.5">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <Avatar className="h-7 w-7 mr-2">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(owner)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {owner?.firstName
                          ? `${owner.firstName} ${owner.lastName}`
                          : owner?.username || "Unknown"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Created {formatDate(project.createdAt)}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full text-sm">
                    <div>
                      <Badge variant="outline" className="mr-2">
                        {taskCounts.total} {taskCounts.total === 1 ? "task" : "tasks"}
                      </Badge>
                    </div>
                    <div className="flex">
                      <Badge variant="outline" className="bg-green-100 text-green-800 mr-1">
                        {taskCounts.completed} done
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {taskCounts.inProgress} in progress
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Add a new project to organize your tasks.
            </DialogDescription>
          </DialogHeader>
          <Form {...createProjectForm}>
            <form
              onSubmit={createProjectForm.handleSubmit((values) => createProjectMutation.mutate(values))}
              className="space-y-6"
            >
              <FormField
                control={createProjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createProjectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createProjectForm.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Owner</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users && Array.isArray(users) && users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                <Button type="submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details of your project.
            </DialogDescription>
          </DialogHeader>
          <Form {...editProjectForm}>
            <form
              onSubmit={editProjectForm.handleSubmit((values) => 
                updateProjectMutation.mutate({ id: selectedProject?.id || 0, ...values })
              )}
              className="space-y-6"
            >
              <FormField
                control={editProjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editProjectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editProjectForm.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Owner</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users && Array.isArray(users) && users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This will also delete all tasks associated with this project.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md mb-4">
            <p className="font-medium">{selectedProject?.name}</p>
            {selectedProject?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProject.description}
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
              onClick={() => deleteProjectMutation.mutate(selectedProject?.id || 0)}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}