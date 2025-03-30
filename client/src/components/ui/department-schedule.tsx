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
import { departments, timeSlots, weekDays, Instructor, Course, Classroom, ScheduledClass } from "@shared/schema";

interface DepartmentScheduleProps {
  timetableId?: number;
}

const DepartmentSchedule = ({ timetableId }: DepartmentScheduleProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  const { data: activeTimetable } = useQuery<{ id: number }>({
    queryKey: ["/api/timetables/active"],
    enabled: !timetableId,
  });

  const activeTimetableId = timetableId || activeTimetable?.id;
  
  // Get instructors data
  const { data: instructors, isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ["/api/instructors"],
  });
  
  // Get courses data
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Get scheduled classes data
  const { data: scheduledClasses, isLoading: scheduledClassesLoading } = useQuery<ScheduledClass[]>({
    queryKey: [`/api/scheduled-classes`],
  });
  
  // Get classrooms data
  const { data: classrooms, isLoading: classroomsLoading } = useQuery<Classroom[]>({
    queryKey: ["/api/classrooms"],
  });
  
  // Set the first department as default when data is loaded
  useEffect(() => {
    if (instructors && instructors.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  }, [instructors, selectedDepartment]);
  
  // Filter instructors by department
  const departmentInstructors = instructors?.filter(
    (instructor: Instructor) => instructor.department === selectedDepartment
  ) || [];
  
  // Create schedule data structure
  const createScheduleMap = () => {
    const scheduleMap: Record<number, Record<string, Record<string, any>>> = {};
    
    if (!scheduledClasses || scheduledClasses.length === 0) return scheduleMap;
    
    // Initialize schedule map for each instructor
    departmentInstructors.forEach((instructor: Instructor) => {
      scheduleMap[instructor.id] = {};
      
      weekDays.forEach((day) => {
        scheduleMap[instructor.id][day] = {};
        
        timeSlots.forEach((timeSlot) => {
          scheduleMap[instructor.id][day][timeSlot] = null;
        });
      });
    });
    
    // Populate schedule with scheduled classes
    scheduledClasses.forEach((scheduledClass: ScheduledClass) => {
      const instructorId = scheduledClass.instructorId;
      const day = scheduledClass.day;
      
      // Only process if the instructor is from the selected department
      if (departmentInstructors.some((i: Instructor) => i.id === instructorId)) {
        // Find time slot that matches the class time
        const matchingTimeSlot = timeSlots.find(slot => {
          const [slotStart, slotEnd] = slot.split('-').map(t => t.trim());
          return slotStart === scheduledClass.startTime && slotEnd === scheduledClass.endTime;
        });
        
        if (matchingTimeSlot && scheduleMap[instructorId] && scheduleMap[instructorId][day]) {
          const course = courses?.find((c: Course) => c.id === scheduledClass.courseId);
          const classroom = classrooms?.find((c: Classroom) => c.id === scheduledClass.classroomId);
          
          scheduleMap[instructorId][day][matchingTimeSlot] = {
            ...scheduledClass,
            course,
            classroom
          };
        }
      }
    });
    
    return scheduleMap;
  };
  
  const scheduleMap = createScheduleMap();
  const isLoading = instructorsLoading || coursesLoading || scheduledClassesLoading || classroomsLoading;
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Department-wise Faculty Schedule</CardTitle>
        <CardDescription>
          View teaching schedules for instructors by department
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
          <div className="py-8 text-center">Loading schedules...</div>
        ) : departmentInstructors.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No instructors found for {selectedDepartment} department.
          </div>
        ) : (
          <div className="space-y-8">
            {departmentInstructors.map((instructor: Instructor) => (
              <div key={instructor.id} className="instructor-schedule">
                <h3 className="text-lg font-medium mb-4">{instructor.name}</h3>
                
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
                            const classInfo = scheduleMap[instructor.id]?.[day]?.[timeSlot];
                            
                            return (
                              <TableCell
                                key={`${day}-${timeSlot}`}
                                className={
                                  classInfo
                                    ? `bg-${classInfo.course?.department.toLowerCase()}-100`
                                    : ""
                                }
                              >
                                {classInfo ? (
                                  <div className="text-xs">
                                    <div className="font-medium">
                                      {classInfo.course?.code}
                                    </div>
                                    <div>{classInfo.classroom?.name}</div>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentSchedule;