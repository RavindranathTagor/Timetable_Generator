import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Department, ScheduledClass, Course, Instructor, Classroom } from "@shared/schema";

interface TimetableViewProps {
  timetableId?: number;
  selectedDepartment?: Department | "all";
}

interface ScheduledClassWithDetails extends ScheduledClass {
  course?: Course;
  instructor?: Instructor;
  classroom?: Classroom;
}

const TimetableView = ({ timetableId, selectedDepartment = "all" }: TimetableViewProps) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const { data: timetable } = useQuery({
    queryKey: ["/api/timetables/active"],
    enabled: !timetableId,
  });

  const { data: specificTimetable } = useQuery({
    queryKey: [`/api/timetables/${timetableId}`],
    enabled: !!timetableId,
  });

  const activeTimetableId = timetableId || timetable?.id;

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
  });

  const { data: classrooms } = useQuery({
    queryKey: ["/api/classrooms"],
  });

  const { data: scheduledClasses, isLoading } = useQuery({
    queryKey: [`/api/scheduled-classes?timetableId=${activeTimetableId}`],
    enabled: !!activeTimetableId,
  });

  // Combine scheduled classes with their related data
  const enhancedScheduledClasses: ScheduledClassWithDetails[] = scheduledClasses 
    ? scheduledClasses.map((scheduledClass: ScheduledClass) => {
        const course = courses?.find((c: Course) => c.id === scheduledClass.courseId);
        const instructor = instructors?.find((i: Instructor) => i.id === scheduledClass.instructorId);
        const classroom = classrooms?.find((c: Classroom) => c.id === scheduledClass.classroomId);
        
        return {
          ...scheduledClass,
          course,
          instructor,
          classroom
        };
      })
    : [];

  // Time slots
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

  const departmentColors: Record<Department, string> = {
    PHY: "bg-[#ffcccc]",
    CHM: "bg-[#ccffcc]",
    BIO: "bg-[#ccccff]",
    MTH: "bg-[#fff2cc]",
    EES: "bg-[#ffe0cc]",
    CES: "bg-[#e6ccff]",
    ECO: "bg-[#ccffff]",
  };

  // Get filtered classes based on selected department
  const getFilteredClasses = () => {
    if (!enhancedScheduledClasses.length) return [];
    
    if (selectedDepartment === "all") {
      return enhancedScheduledClasses;
    }
    
    return enhancedScheduledClasses.filter(cls => 
      cls.course?.department === selectedDepartment
    );
  };
  
  // Get classes for a specific time slot and day
  const getClassesForTimeSlot = (timeSlot: string, day: string) => {
    if (!enhancedScheduledClasses.length) return [];
    
    // Get classes filtered by department if needed
    const filteredClasses = getFilteredClasses();
    
    // This is a simplified version - in a real app, you would parse the time and day properly
    return filteredClasses.filter(cls => {
      const dayMatches = cls.day === day;
      const timeMatches = 
        (timeSlot === "9:00 - 10:00" && cls.startTime?.includes("9:00")) ||
        (timeSlot === "10:00 - 11:00" && cls.startTime?.includes("10:00")) ||
        (timeSlot === "11:00 - 12:00" && cls.startTime?.includes("11:00")) ||
        (timeSlot === "12:00 - 1:00" && cls.startTime?.includes("12:00")) ||
        (timeSlot === "2:00 - 3:00" && cls.startTime?.includes("2:00")) ||
        (timeSlot === "3:00 - 4:00" && cls.startTime?.includes("3:00")) ||
        (timeSlot === "4:00 - 5:00" && cls.startTime?.includes("4:00")) ||
        (timeSlot === "5:00 - 6:00" && cls.startTime?.includes("5:00"));
      
      return dayMatches && timeMatches;
    });
  };

  const handleClassClick = (scheduledClass: ScheduledClassWithDetails) => {
    alert(`Course: ${scheduledClass.course?.code} - ${scheduledClass.course?.name}\nInstructor: ${scheduledClass.instructor?.name}\nRoom: ${scheduledClass.classroom?.name}`);
  };
  
  return (
    <div className="w-full">
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">
            Weekly Timetable
            {timetable && ` - ${timetable.name}`}
          </h2>
          <div className="flex space-x-2">
            <button 
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                <line x1="11" x2="11" y1="8" y2="14" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
            <button 
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                <line x1="8" x2="14" y1="11" y2="11" />
              </svg>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm">
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
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
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
                {timeSlots.map((timeSlot, index) => (
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
                          {getClassesForTimeSlot(timeSlot, day).map((scheduledClass, i) => (
                            <div 
                              key={i}
                              className={`${scheduledClass.course ? departmentColors[scheduledClass.course.department as Department] : 'bg-gray-200'} timetable-cell rounded p-1 min-h-[60px] max-h-[60px] overflow-hidden text-xs hover:ring-2 hover:ring-primary hover:ring-opacity-50 cursor-pointer`}
                              onClick={() => handleClassClick(scheduledClass)}
                            >
                              <div className="font-medium">{scheduledClass.course?.code}</div>
                              <div className="text-xs">{`${scheduledClass.day} ${scheduledClass.startTime}-${scheduledClass.endTime}`}</div>
                              <div className="text-xs">{scheduledClass.classroom?.name}</div>
                            </div>
                          ))}
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Department-specific schedules */}
      {selectedDepartment !== "all" ? (
        // Show one department table when a specific department is selected
        <div className="mt-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <span className={`w-3 h-3 rounded-full ${departmentColors[selectedDepartment as Department]} mr-2`}></span>
              {selectedDepartment} Department Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border bg-gray-50 p-1 text-left">Course Code</th>
                    <th className="border bg-gray-50 p-1 text-left">Schedule</th>
                    <th className="border bg-gray-50 p-1 text-left">Room</th>
                    <th className="border bg-gray-50 p-1 text-left">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    ?.filter(course => course.department === selectedDepartment)
                    .map(course => {
                      const courseClasses = enhancedScheduledClasses.filter(sc => sc.courseId === course.id);
                      const instructor = instructors?.find(i => i.id === course.instructorId);
                      
                      return courseClasses.map((scheduledClass, index) => (
                        <tr key={`${course.id}-${index}`}>
                          <td className="border p-1">{course.code}</td>
                          <td className="border p-1">{`${scheduledClass.day} ${scheduledClass.startTime}-${scheduledClass.endTime}`}</td>
                          <td className="border p-1">{scheduledClass.classroom?.name}</td>
                          <td className="border p-1">{instructor?.name}</td>
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // Show three department tables when showing all departments
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {/* Physics Department Schedule */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#ffcccc] mr-2"></span>
              Physics Department Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border bg-gray-50 p-1 text-left">Course Code</th>
                    <th className="border bg-gray-50 p-1 text-left">Schedule</th>
                    <th className="border bg-gray-50 p-1 text-left">Room</th>
                    <th className="border bg-gray-50 p-1 text-left">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    ?.filter(course => course.department === "PHY")
                    .map(course => {
                      const courseClasses = enhancedScheduledClasses.filter(sc => sc.courseId === course.id);
                      const instructor = instructors?.find(i => i.id === course.instructorId);
                      
                      return courseClasses.map((scheduledClass, index) => (
                        <tr key={`${course.id}-${index}`}>
                          <td className="border p-1">{course.code}</td>
                          <td className="border p-1">{`${scheduledClass.day} ${scheduledClass.startTime}-${scheduledClass.endTime}`}</td>
                          <td className="border p-1">{scheduledClass.classroom?.name}</td>
                          <td className="border p-1">{instructor?.name}</td>
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chemistry Department Schedule */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#ccffcc] mr-2"></span>
              Chemistry Department Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border bg-gray-50 p-1 text-left">Course Code</th>
                    <th className="border bg-gray-50 p-1 text-left">Schedule</th>
                    <th className="border bg-gray-50 p-1 text-left">Room</th>
                    <th className="border bg-gray-50 p-1 text-left">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    ?.filter(course => course.department === "CHM")
                    .map(course => {
                      const courseClasses = enhancedScheduledClasses.filter(sc => sc.courseId === course.id);
                      const instructor = instructors?.find(i => i.id === course.instructorId);
                      
                      return courseClasses.map((scheduledClass, index) => (
                        <tr key={`${course.id}-${index}`}>
                          <td className="border p-1">{course.code}</td>
                          <td className="border p-1">{`${scheduledClass.day} ${scheduledClass.startTime}-${scheduledClass.endTime}`}</td>
                          <td className="border p-1">{scheduledClass.classroom?.name}</td>
                          <td className="border p-1">{instructor?.name}</td>
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Computer & Electrical Sciences Department Schedule */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#e6ccff] mr-2"></span>
              Computer & Electrical Sciences Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border bg-gray-50 p-1 text-left">Course Code</th>
                    <th className="border bg-gray-50 p-1 text-left">Schedule</th>
                    <th className="border bg-gray-50 p-1 text-left">Room</th>
                    <th className="border bg-gray-50 p-1 text-left">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {courses
                    ?.filter(course => course.department === "CES")
                    .map(course => {
                      const courseClasses = enhancedScheduledClasses.filter(sc => sc.courseId === course.id);
                      const instructor = instructors?.find(i => i.id === course.instructorId);
                      
                      return courseClasses.map((scheduledClass, index) => (
                        <tr key={`${course.id}-${index}`}>
                          <td className="border p-1">{course.code}</td>
                          <td className="border p-1">{`${scheduledClass.day} ${scheduledClass.startTime}-${scheduledClass.endTime}`}</td>
                          <td className="border p-1">{scheduledClass.classroom?.name}</td>
                          <td className="border p-1">{instructor?.name}</td>
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
