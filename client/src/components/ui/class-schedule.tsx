import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  departments, 
  timeSlots, 
  weekDays, 
  Course, 
  Instructor, 
  Classroom, 
  ScheduledClass 
} from "@shared/schema";

interface ClassScheduleProps {
  timetableId?: number;
}

const ClassSchedule = ({ timetableId }: ClassScheduleProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  const { data: activeTimetable } = useQuery<{ id: number }>({
    queryKey: ["/api/timetables/active"],
    enabled: !timetableId,
  });

  const activeTimetableId = timetableId || activeTimetable?.id;
  
  // Get courses data
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Get scheduled classes data
  const { data: scheduledClasses, isLoading: scheduledClassesLoading } = useQuery<ScheduledClass[]>({
    queryKey: [`/api/scheduled-classes`],
  });
  
  // Get instructors data
  const { data: instructors, isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ["/api/instructors"],
  });
  
  // Get classrooms data
  const { data: classrooms, isLoading: classroomsLoading } = useQuery<Classroom[]>({
    queryKey: ["/api/classrooms"],
  });
  
  // Set the first department as default when data is loaded
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  }, [courses, selectedDepartment]);
  
  // Filter courses by department
  const departmentCourses = courses?.filter(
    (course: Course) => course.department === selectedDepartment
  ) || [];
  
  // Get all time slots for the week
  const getWeekTimeSlots = () => {
    const slots: Record<string, Record<string, any>> = {};
    
    weekDays.forEach(day => {
      slots[day] = {};
      timeSlots.forEach(timeSlot => {
        slots[day][timeSlot] = [];
      });
    });
    
    return slots;
  };
  
  // Build schedule data
  const buildScheduleData = () => {
    const schedule: Record<string, any> = {};
    const weekTimeSlots = getWeekTimeSlots();
    
    if (!scheduledClasses || !courses || !instructors || !classrooms) {
      return { weekTimeSlots, schedule };
    }
    
    // Process each class
    scheduledClasses.forEach((scheduledClass: ScheduledClass) => {
      const course = courses.find((c: Course) => c.id === scheduledClass.courseId);
      
      // Only include classes for the selected department
      if (course && course.department === selectedDepartment) {
        const instructor = instructors.find((i: Instructor) => i.id === scheduledClass.instructorId);
        const classroom = classrooms.find((c: Classroom) => c.id === scheduledClass.classroomId);
        const day = scheduledClass.day;
        
        // Find matching time slot
        const matchingTimeSlot = timeSlots.find(slot => {
          const [slotStart, slotEnd] = slot.split('-').map(t => t.trim());
          return slotStart === scheduledClass.startTime && slotEnd === scheduledClass.endTime;
        });
        
        if (matchingTimeSlot && weekTimeSlots[day]) {
          weekTimeSlots[day][matchingTimeSlot].push({
            ...scheduledClass,
            course,
            instructor,
            classroom
          });
        }
      }
    });
    
    return { weekTimeSlots, schedule };
  };
  
  const { weekTimeSlots } = buildScheduleData();
  const isLoading = coursesLoading || scheduledClassesLoading || instructorsLoading || classroomsLoading;
  
  // Get department colors
  const getDepartmentColor = (dept: string) => {
    const colorMap: Record<string, string> = {
      'PHY': 'bg-red-100',
      'CHM': 'bg-green-100',
      'BIO': 'bg-blue-100',
      'MTH': 'bg-yellow-100',
      'CSE': 'bg-purple-100',
      'ECE': 'bg-pink-100',
      'MECH': 'bg-indigo-100',
      'CIVIL': 'bg-orange-100',
      'EEE': 'bg-teal-100',
      'IT': 'bg-cyan-100',
      'EES': 'bg-amber-100',
      'CES': 'bg-lime-100',
      'ECO': 'bg-emerald-100'
    };
    
    return colorMap[dept] || 'bg-gray-100';
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Class Schedule by Department</CardTitle>
        <CardDescription>
          View weekly class schedule for a specific department
        </CardDescription>
        
        <div className="mt-4 w-full max-w-xs">
          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">Loading schedule...</div>
        ) : departmentCourses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No courses found for {selectedDepartment} department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Time</TableHead>
                  {weekDays.map((day) => (
                    <TableHead key={day}>{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell className="font-medium bg-gray-50">
                      {timeSlot}
                    </TableCell>
                    {weekDays.map((day) => {
                      const classes = weekTimeSlots[day][timeSlot];
                      
                      return (
                        <TableCell
                          key={`${day}-${timeSlot}`}
                          className={classes.length > 0 ? getDepartmentColor(selectedDepartment) : ""}
                        >
                          {classes.length > 0 ? (
                            <div className="space-y-2">
                              {classes.map((cls: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                  <div className="font-medium">
                                    {cls.course?.code}
                                  </div>
                                  <div>
                                    {cls.instructor?.name}
                                  </div>
                                  <div>
                                    {cls.classroom?.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassSchedule;