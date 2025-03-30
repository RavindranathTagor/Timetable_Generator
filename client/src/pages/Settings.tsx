import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { timetableFormSchema } from "@shared/schema";

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<number | null>(null);
  
  const form = useForm<z.infer<typeof timetableFormSchema>>({
    resolver: zodResolver(timetableFormSchema),
    defaultValues: {
      name: "",
      semester: "",
      isActive: false
    },
  });
  
  const { data: timetables, isLoading } = useQuery({
    queryKey: ["/api/timetables"],
  });
  
  const createTimetableMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timetableFormSchema>) => {
      const response = await apiRequest("POST", "/api/timetables", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      toast({
        title: "Timetable Created",
        description: "The new timetable has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create timetable. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const activateTimetableMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/timetables/${id}/activate`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetables/active"] });
      toast({
        title: "Timetable Activated",
        description: "The selected timetable is now active.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to activate timetable. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const deleteTimetableMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/timetables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetables/active"] });
      toast({
        title: "Timetable Deleted",
        description: "The timetable has been deleted successfully.",
      });
      setTimetableToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete timetable. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof timetableFormSchema>) => {
    createTimetableMutation.mutate(values);
  };
  
  const handleActivateTimetable = (id: number) => {
    activateTimetableMutation.mutate(id);
  };
  
  const handleDeleteTimetable = (id: number) => {
    setTimetableToDelete(id);
  };
  
  const confirmDeleteTimetable = () => {
    if (timetableToDelete !== null) {
      deleteTimetableMutation.mutate(timetableToDelete);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Create New Timetable</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Timetable Management</CardTitle>
          <CardDescription>
            Manage your timetables and select which one should be active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading timetables...</div>
          ) : timetables?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell className="font-medium">{timetable.name}</TableCell>
                    <TableCell>{timetable.semester}</TableCell>
                    <TableCell>{formatDate(timetable.createdAt)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={timetable.isActive}
                        onCheckedChange={() => !timetable.isActive && handleActivateTimetable(timetable.id)}
                        disabled={timetable.isActive}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTimetable(timetable.id)}
                        disabled={timetable.isActive}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No timetables created yet. Create a new timetable to get started.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure general system settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="timeSlotDuration">Time Slot Duration (minutes)</Label>
              <Input id="timeSlotDuration" value="60" disabled />
              <p className="text-sm text-gray-500">
                Time slot duration is fixed at 60 minutes.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="academicHours">Academic Hours</Label>
              <div className="flex gap-2">
                <Input id="startTime" value="9:00 AM" disabled className="w-1/2" />
                <Input id="endTime" value="6:00 PM" disabled className="w-1/2" />
              </div>
              <p className="text-sm text-gray-500">
                Academic hours are fixed from 9:00 AM to 6:00 PM.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Timetable</DialogTitle>
            <DialogDescription>
              Add a new timetable to the system.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timetable Name</FormLabel>
                    <FormControl>
                      <Input placeholder="2024-2025 Summer Semester" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input placeholder="2024-2025-II" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Activate immediately</FormLabel>
                      <FormDescription>
                        Make this the active timetable upon creation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTimetableMutation.isPending}>
                  {createTimetableMutation.isPending ? "Creating..." : "Create Timetable"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={timetableToDelete !== null} onOpenChange={(open) => !open && setTimetableToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this timetable and all its scheduled classes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteTimetable}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
