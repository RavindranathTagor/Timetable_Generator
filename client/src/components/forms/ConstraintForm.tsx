import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course, Instructor, Classroom, constraintFormSchema, weekDays, timeSlots } from "@shared/schema";

interface ConstraintFormProps {
  courses: Course[];
  instructors: Instructor[];
  classrooms: Classroom[];
  onSuccess?: () => void;
}

const ConstraintForm = ({
  courses,
  instructors,
  classrooms,
  onSuccess,
}: ConstraintFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof constraintFormSchema>>({
    resolver: zodResolver(constraintFormSchema),
    defaultValues: {
      type: "instructor_unavailable",
      entityId: 0,
      day: "Monday",
      timeSlot: "9:00-10:00",
    },
  });
  
  const constraintType = form.watch("type");
  
  const createConstraintMutation = useMutation({
    mutationFn: async (values: z.infer<typeof constraintFormSchema>) => {
      const response = await apiRequest("POST", "/api/constraints", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/constraints"] });
      toast({
        title: "Constraint Added",
        description: "The constraint has been added successfully.",
      });
      form.reset({
        type: constraintType,
        entityId: 0,
        day: "Monday",
        timeSlot: "9:00-10:00",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add constraint. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof constraintFormSchema>) => {
    // For course_conflict type, we're using timeSlot to store the conflicting course ID
    if (values.type === "course_conflict" && values.entityId === parseInt(values.timeSlot)) {
      toast({
        title: "Invalid Selection",
        description: "A course cannot conflict with itself.",
        variant: "destructive",
      });
      return;
    }
    
    createConstraintMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Constraint Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset entity ID when type changes
                  form.setValue("entityId", 0);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select constraint type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="instructor_unavailable">Instructor Unavailable</SelectItem>
                  <SelectItem value="room_unavailable">Room Unavailable</SelectItem>
                  <SelectItem value="course_conflict">Course Conflict</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {constraintType === "instructor_unavailable"
                  ? "Specify when an instructor is not available"
                  : constraintType === "room_unavailable"
                  ? "Specify when a room is not available"
                  : "Specify courses that cannot be scheduled at the same time"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="entityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {constraintType === "instructor_unavailable"
                  ? "Instructor"
                  : constraintType === "room_unavailable"
                  ? "Classroom"
                  : "Course"}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value ? field.value.toString() : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        constraintType === "instructor_unavailable"
                          ? "Select instructor"
                          : constraintType === "room_unavailable"
                          ? "Select classroom"
                          : "Select course"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {constraintType === "instructor_unavailable" && instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id.toString()}>
                      {instructor.name} ({instructor.department})
                    </SelectItem>
                  ))}
                  {constraintType === "room_unavailable" && classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id.toString()}>
                      {classroom.name} ({classroom.building})
                    </SelectItem>
                  ))}
                  {constraintType === "course_conflict" && courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {constraintType === "course_conflict" ? (
          <FormField
            control={form.control}
            name="timeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conflicting Course</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select conflicting course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses
                      .filter(course => course.id !== form.getValues().entityId)
                      .map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  These courses cannot be scheduled at the same time
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createConstraintMutation.isPending}
          >
            {createConstraintMutation.isPending ? "Adding..." : "Add Constraint"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConstraintForm;
