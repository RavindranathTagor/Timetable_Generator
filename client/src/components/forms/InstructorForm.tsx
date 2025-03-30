import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Department, departments, instructorFormSchema } from "@shared/schema";

const InstructorForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [instructorToDelete, setInstructorToDelete] = useState<number | null>(null);
  
  const { data: instructors, isLoading } = useQuery({
    queryKey: ["/api/instructors"],
  });
  
  const form = useForm<z.infer<typeof instructorFormSchema>>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: "",
      department: "PHY",
      email: "",
    },
  });
  
  const createInstructorMutation = useMutation({
    mutationFn: async (values: z.infer<typeof instructorFormSchema>) => {
      const response = await apiRequest("POST", "/api/instructors", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructors"] });
      toast({
        title: "Instructor Added",
        description: "The instructor has been added successfully.",
      });
      form.reset({
        name: "",
        department: form.getValues().department,
        email: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add instructor. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const deleteInstructorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/instructors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructors"] });
      toast({
        title: "Instructor Deleted",
        description: "The instructor has been removed successfully.",
      });
      setInstructorToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete instructor. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof instructorFormSchema>) => {
    createInstructorMutation.mutate(values);
  };
  
  const handleDeleteInstructor = (id: number) => {
    setInstructorToDelete(id);
  };
  
  const confirmDeleteInstructor = () => {
    if (instructorToDelete !== null) {
      deleteInstructorMutation.mutate(instructorToDelete);
    }
  };
  
  const departmentColors: Record<Department, string> = {
    PHY: "bg-[#ffcccc]",
    CHM: "bg-[#ccffcc]",
    BIO: "bg-[#ccccff]",
    MTH: "bg-[#fff2cc]",
    EES: "bg-[#ffe0cc]",
    CES: "bg-[#e6ccff]",
    ECO: "bg-[#ccffff]",
  };
  
  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Smith" {...field} />
                  </FormControl>
                  <FormDescription>
                    Full name with title (e.g., Dr., Prof.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="j.smith@iiserb.ac.in" {...field} />
                  </FormControl>
                  <FormDescription>
                    Institutional email address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Department the instructor belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createInstructorMutation.isPending}
            >
              {createInstructorMutation.isPending ? "Adding..." : "Add Instructor"}
            </Button>
          </div>
        </form>
      </Form>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Existing Instructors</h3>
          
          {isLoading ? (
            <div className="py-8 text-center">Loading instructors...</div>
          ) : instructors?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell>
                        <span className={`inline-block w-3 h-3 rounded-full ${departmentColors[instructor.department as Department]} mr-2`}></span>
                        {instructor.department}
                      </TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInstructor(instructor.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
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
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No instructors added yet. Use the form above to add instructors.
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={instructorToDelete !== null} onOpenChange={(open) => !open && setInstructorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this instructor. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteInstructor}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InstructorForm;
