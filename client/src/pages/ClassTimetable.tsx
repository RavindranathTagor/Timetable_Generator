import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Department, 
  departments, 
  Course, 
  Instructor,
  Classroom,
  ScheduledClass,
  Timetable
} from "@shared/schema";

const ClassTimetable = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: timetable } = useQuery<Timetable>({
    queryKey: ["/api/timetables/active"],
  });

  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ["/api/instructors"],
  });

  const { data: classrooms = [] } = useQuery<Classroom[]>({
    queryKey: ["/api/classrooms"],
  });

  const { data: scheduledClasses = [] } = useQuery<ScheduledClass[]>({
    queryKey: [`/api/scheduled-classes?timetableId=${timetable?.id}`],
    enabled: !!timetable?.id,
  });

  // Filter courses by department
  const departmentCourses = selectedDepartment 
    ? courses?.filter(course => course.department === selectedDepartment) 
    : [];

  // Map of time slots
  const timeSlots = [
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 1:00",
    "1:00 - 2:00", // Lunch break
    "2:00 - 3:00",
    "3:00 - 4:00",
    "4:00 - 5:00",
    "5:00 - 6:00"
  ];

  // Weekdays
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Department colors
  const departmentColors: Record<Department, string> = {
    PHY: "bg-[#ffcccc]",
    CHM: "bg-[#ccffcc]",
    BIO: "bg-[#ccccff]",
    MTH: "bg-[#fff2cc]",
    EES: "bg-[#ffe0cc]",
    CES: "bg-[#e6ccff]",
    ECO: "bg-[#ccffff]",
  };

  // Get classes for a specific department, timeSlot, and day
  const getClassesForTimeSlot = (timeSlot: string, day: string): ScheduledClass[] => {
    if (!scheduledClasses || !selectedDepartment) return [];
    
    return scheduledClasses.filter((cls: ScheduledClass) => {
      // Find the course for this scheduled class
      const course = courses.find((c: Course) => c.id === cls.courseId);
      
      // Check if the course belongs to the selected department
      const departmentMatches = course?.department === selectedDepartment;
      
      // Check if day matches
      const dayMatches = cls.day === day;
      
      // Check if time matches
      const timeMatches = 
        (timeSlot === "9:00 - 10:00" && cls.startTime?.includes("9:00")) ||
        (timeSlot === "10:00 - 11:00" && cls.startTime?.includes("10:00")) ||
        (timeSlot === "11:00 - 12:00" && cls.startTime?.includes("11:00")) ||
        (timeSlot === "12:00 - 1:00" && cls.startTime?.includes("12:00")) ||
        (timeSlot === "2:00 - 3:00" && cls.startTime?.includes("2:00")) ||
        (timeSlot === "3:00 - 4:00" && cls.startTime?.includes("3:00")) ||
        (timeSlot === "4:00 - 5:00" && cls.startTime?.includes("4:00")) ||
        (timeSlot === "5:00 - 6:00" && cls.startTime?.includes("5:00"));
      
      return departmentMatches && dayMatches && timeMatches;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Class Timetable</h1>
      
      {/* Department selection */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Select Your Department</h2>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedDepartment === dept
                  ? `${departmentColors[dept]} text-gray-800 font-medium`
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>
      
      {selectedDepartment ? (
        <>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className={`w-4 h-4 rounded-full ${departmentColors[selectedDepartment]} mr-2`}></span>
            {selectedDepartment} Department Weekly Schedule
          </h2>
          
          {/* Timetable */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-16 border bg-gray-50 p-2 text-xs text-left sticky left-0 z-10">Time</th>
                  {weekdays.map(day => (
                    <th key={day} className="w-1/6 border bg-gray-50 p-2 text-xs text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot}>
                    <td className="border bg-gray-50 p-2 text-xs font-medium text-left sticky left-0 z-10">
                      {timeSlot}
                    </td>
                    
                    {/* Special case for lunch break */}
                    {timeSlot === "1:00 - 2:00" ? (
                      <td className="border bg-gray-100 p-1 text-center" colSpan={5}>
                        <span className="text-xs font-medium">LUNCH BREAK</span>
                      </td>
                    ) : (
                      weekdays.map(day => (
                        <td key={`${timeSlot}-${day}`} className="border p-1">
                          {getClassesForTimeSlot(timeSlot, day).map((scheduledClass: ScheduledClass, i: number) => {
                            const course = courses.find((c: Course) => c.id === scheduledClass.courseId);
                            const instructor = instructors.find((inst: Instructor) => inst.id === scheduledClass.instructorId);
                            const classroom = classrooms.find((c: Classroom) => c.id === scheduledClass.classroomId);
                            
                            return (
                              <div 
                                key={i}
                                className={`${departmentColors[selectedDepartment]} rounded p-1 min-h-[60px] max-h-[60px] overflow-hidden text-xs`}
                              >
                                <div className="font-medium">{course?.code}</div>
                                <div className="text-xs">{course?.name}</div>
                                <div className="text-xs">Instructor: {instructor?.name}</div>
                                <div className="text-xs">Room: {classroom?.name}</div>
                              </div>
                            );
                          })}
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Course list */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Courses for {selectedDepartment} Department</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border bg-gray-50 p-2 text-left">Course Code</th>
                    <th className="border bg-gray-50 p-2 text-left">Course Name</th>
                    <th className="border bg-gray-50 p-2 text-left">Instructor</th>
                    <th className="border bg-gray-50 p-2 text-left">Schedule</th>
                    <th className="border bg-gray-50 p-2 text-left">Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentCourses.map((course: Course) => {
                    const courseClasses = scheduledClasses.filter((sc: ScheduledClass) => sc.courseId === course.id);
                    const instructor = instructors.find((inst: Instructor) => inst.id === course.instructorId);
                    
                    return (
                      <tr key={course.id}>
                        <td className="border p-2">{course.code}</td>
                        <td className="border p-2">{course.name}</td>
                        <td className="border p-2">{instructor?.name}</td>
                        <td className="border p-2">
                          {courseClasses.map((cls: ScheduledClass, idx: number) => (
                            <div key={idx} className="text-sm mb-1">
                              {cls.day}, {cls.startTime}-{cls.endTime}
                            </div>
                          ))}
                        </td>
                        <td className="border p-2">
                          {courseClasses.map((cls: ScheduledClass, idx: number) => {
                            const classroom = classrooms.find((c: Classroom) => c.id === cls.classroomId);
                            return (
                              <div key={idx} className="text-sm mb-1">
                                {classroom?.name} ({classroom?.building})
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-4">Please select a department to view its timetable</h3>
          <p className="text-gray-600">
            Choose one of the departments above to see the weekly class schedule for that department.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassTimetable;