import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Course, Instructor, Classroom, Constraint, departments } from "@shared/schema";
import { generateTimetable } from "@/lib/timetable-generator";

interface GenerateTimetableFormProps {
  courses: Course[];
  instructors: Instructor[];
  classrooms: Classroom[];
  constraints: Constraint[];
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, "Timetable name must be at least 3 characters"),
  semester: z.string().min(3, "Semester must be at least 3 characters"),
  makeActive: z.boolean().default(true),
  selectedDepartments: z.array(z.string()).optional(),
});

const GenerateTimetableForm = ({
  courses,
  instructors,
  classrooms,
  constraints,
  onSuccess,
}: GenerateTimetableFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      semester: "",
      makeActive: true,
      selectedDepartments: [],
    },
  });
  
  const createTimetableMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/timetables", {
        name: values.name,
        semester: values.semester,
        isActive: values.makeActive,
      });
      return response.json();
    },
  });
  
  const createClassMutation = useMutation({
    mutationFn: async (data: { timetableId: number, classes: any[] }) => {
      const promises = data.classes.map((scheduledClass) => 
        apiRequest("POST", "/api/scheduled-classes", {
          ...scheduledClass,
          timetableId: data.timetableId,
        })
      );
      
      return Promise.all(promises);
    },
  });
  
  const activateTimetableMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/timetables/${id}/activate`, {});
      return response.json();
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (courses.length === 0) {
      toast({
        title: "No Courses",
        description: "There are no courses to schedule. Please add courses first.",
        variant: "destructive",
      });
      return;
    }
    
    if (instructors.length === 0) {
      toast({
        title: "No Instructors",
        description: "There are no instructors available. Please add instructors first.",
        variant: "destructive",
      });
      return;
    }
    
    if (classrooms.length === 0) {
      toast({
        title: "No Classrooms",
        description: "There are no classrooms available. Please add classrooms first.",
        variant: "destructive",
      });
      return;
    }
    
    setGenerating(true);
    
    try {
      // Step 1: Create a new timetable
      const timetable = await createTimetableMutation.mutateAsync(values);
      
      // Step 2: Filter courses by selected departments if any
      let filteredCourses = courses;
      if (values.selectedDepartments && values.selectedDepartments.length > 0) {
        filteredCourses = courses.filter(course => 
          values.selectedDepartments!.includes(course.department)
        );
      }
      
      // Step 3: Generate timetable
      const generatedClasses = await generateTimetable({
        courses: filteredCourses,
        instructors,
        classrooms,
        constraints,
        timetableId: timetable.id,
      });
      
      // Step 4: Save generated scheduled classes
      await createClassMutation.mutateAsync({
        timetableId: timetable.id,
        classes: generatedClasses,
      });
      
      // Step 5: Make timetable active if requested
      if (values.makeActive) {
        await activateTimetableMutation.mutateAsync(timetable.id);
      }
      
      // Success!
      queryClient.invalidateQueries({ queryKey: ["/api/timetables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timetables/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-classes"] });
      
      toast({
        title: "Timetable Generated",
        description: `Successfully generated timetable "${timetable.name}" with ${generatedClasses.length} scheduled classes.`,
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertTitle>Generation Process</AlertTitle>
          <AlertDescription>
            The system will automatically generate a conflict-free timetable based on the courses, 
            instructors, classrooms, and constraints in the system.
          </AlertDescription>
        </Alert>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timetable Name</FormLabel>
              <FormControl>
                <Input placeholder="2024-2025 Second Semester" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this timetable
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester Code</FormLabel>
              <FormControl>
                <Input placeholder="2024-2025-II" {...field} />
              </FormControl>
              <FormDescription>
                The semester code (e.g., 2024-2025-II)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="selectedDepartments"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Filter by Departments</FormLabel>
                <FormDescription>
                  Optionally select specific departments to include in the timetable
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {departments.map((department) => (
                  <FormItem
                    key={department}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={form.watch("selectedDepartments")?.includes(department)}
                        onCheckedChange={(checked) => {
                          const currentValues = form.getValues("selectedDepartments") || [];
                          const newValues = checked
                            ? [...currentValues, department]
                            : currentValues.filter((value) => value !== department);
                          form.setValue("selectedDepartments", newValues);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {department}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="makeActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Set as active timetable</FormLabel>
                <FormDescription>
                  Make this the active timetable upon generation
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
        
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={generating}
            className="bg-[#4CAF50] hover:bg-[#4CAF50]/80 text-white"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Generate Timetable
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-sm font-medium mb-2">Resources Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-medium">Courses:</span> {courses.length}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-medium">Instructors:</span> {instructors.length}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="font-medium">Classrooms:</span> {classrooms.length}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default GenerateTimetableForm;
