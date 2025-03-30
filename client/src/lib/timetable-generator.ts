import { 
  Course, Instructor, Classroom, ScheduledClass, Constraint,
  Department, weekDays, timeSlots, cseSections
} from "@shared/schema";

// Types for constraints
type ConstraintType = 'instructor_unavailable' | 'room_unavailable' | 'course_conflict';

// Types for time slots and days
type TimeSlot = typeof timeSlots[number];
type WeekDay = typeof weekDays[number];
type Section = typeof cseSections[number];

// Custom time slots based on the screenshot (for future enhancement)
export const customTimeSlots = [
  "8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", 
  "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00"
];

// Type for a class slot (day + time)
interface ClassSlot {
  day: WeekDay;
  timeSlot: TimeSlot;
  section?: Section; // Include section in the slot type
}

// Interface for the generator
export interface TimetableGeneratorOptions {
  courses: Course[];
  instructors: Instructor[];
  classrooms: Classroom[];
  constraints: Constraint[];
  timetableId: number;
}

/**
 * Generate a timetable based on courses, instructors, classrooms, and constraints
 */
export const generateTimetable = async (options: TimetableGeneratorOptions): Promise<ScheduledClass[]> => {
  const { courses, instructors, classrooms, constraints, timetableId } = options;
  
  // Create a map of all available time slots
  const allSlots: ClassSlot[] = [];
  for (const day of weekDays) {
    for (const timeSlot of timeSlots) {
      allSlots.push({ day, timeSlot });
    }
  }
  
  // Initialize variables for tracking assignments
  const scheduledClasses: ScheduledClass[] = [];
  const instructorAssignments: Record<number, ClassSlot[]> = {};
  const classroomAssignments: Record<number, ClassSlot[]> = {};
  const courseAssignments: Record<number, ClassSlot[]> = {};
  
  // Process constraints
  const instructorUnavailable: Record<number, ClassSlot[]> = {};
  const roomUnavailable: Record<number, ClassSlot[]> = {};
  const courseConflicts: Record<number, number[]> = {}; // courseId -> conflicting course IDs
  
  for (const constraint of constraints) {
    const { type, entityId, day, timeSlot } = constraint;
    
    if (type === 'instructor_unavailable') {
      if (!instructorUnavailable[entityId]) {
        instructorUnavailable[entityId] = [];
      }
      instructorUnavailable[entityId].push({ day, timeSlot } as ClassSlot);
    } 
    else if (type === 'room_unavailable') {
      if (!roomUnavailable[entityId]) {
        roomUnavailable[entityId] = [];
      }
      roomUnavailable[entityId].push({ day, timeSlot } as ClassSlot);
    }
    else if (type === 'course_conflict') {
      // The entity ID in this case is the course ID
      // And timeSlot field is used to store the conflicting course ID (a bit of a hack)
      const courseId = entityId;
      const conflictingCourseId = parseInt(timeSlot);
      
      if (!courseConflicts[courseId]) {
        courseConflicts[courseId] = [];
      }
      if (!courseConflicts[conflictingCourseId]) {
        courseConflicts[conflictingCourseId] = [];
      }
      
      courseConflicts[courseId].push(conflictingCourseId);
      courseConflicts[conflictingCourseId].push(courseId);
    }
  }
  
  // Sort courses by number of constraints (most constrained first)
  const sortedCourses = [...courses].sort((a, b) => {
    const aConstraints = (courseConflicts[a.id]?.length || 0) + 
                       (instructorUnavailable[a.instructorId]?.length || 0);
    const bConstraints = (courseConflicts[b.id]?.length || 0) + 
                       (instructorUnavailable[b.instructorId]?.length || 0);
    
    // If constraints are equal, randomize to distribute better across the week
    if (aConstraints === bConstraints) {
      return Math.random() - 0.5;
    }
    
    return bConstraints - aConstraints;
  });
  
  // Helper function to check if a slot is available for a course
  const isSlotAvailable = (course: Course, slot: ClassSlot, roomId: number): boolean => {
    const { day, timeSlot } = slot;
    
    // Check instructor availability
    const instructorId = course.instructorId;
    if (instructorUnavailable[instructorId]?.some(s => 
      s.day === day && s.timeSlot === timeSlot)) {
      return false;
    }
    if (instructorAssignments[instructorId]?.some(s => 
      s.day === day && s.timeSlot === timeSlot)) {
      return false;
    }
    
    // Check room availability
    if (roomUnavailable[roomId]?.some(s => 
      s.day === day && s.timeSlot === timeSlot)) {
      return false;
    }
    if (classroomAssignments[roomId]?.some(s => 
      s.day === day && s.timeSlot === timeSlot)) {
      return false;
    }
    
    // Check course conflicts
    if (courseConflicts[course.id]) {
      for (const conflictingCourseId of courseConflicts[course.id]) {
        if (courseAssignments[conflictingCourseId]?.some(s => 
          s.day === day && s.timeSlot === timeSlot)) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Assign courses to time slots for each section
  for (const course of sortedCourses) {
    // For each CSE section, we need to schedule the course
    for (const section of cseSections) {
      // Find suitable classrooms (with enough capacity)
      // Normal classrooms for lectures, labs for lab courses
      const isLabCourse = course.name.toLowerCase().includes('lab') || 
                          course.code.toLowerCase().includes('lab');
      
      // Filter suitable rooms
      const suitableRooms = classrooms
        .filter(room => {
          // Match room type with course type
          const isLabRoom = room.name.toLowerCase().includes('lab');
          if (isLabCourse) {
            return isLabRoom && room.capacity >= course.capacity;
          } else {
            return !isLabRoom && room.capacity >= course.capacity;
          }
        })
        .sort((a, b) => a.capacity - b.capacity); // Prefer smaller rooms that fit
      
      if (suitableRooms.length === 0) {
        console.warn(`No suitable rooms for course ${course.code} section ${section}`);
        continue;
      }
      
      // Determine how many time slots this course needs (based on credits)
      const slotsNeeded = course.credits >= 4 ? 3 : (course.credits >= 3 ? 2 : 1);
      
      // Try to assign the course to consecutive time slots on the same day if possible
      let assigned = false;
      
      // Shuffle weekDays to ensure better distribution across the entire week
      const shuffledWeekDays = [...weekDays].sort(() => Math.random() - 0.5);
      
      // First try consecutive slots on the same day
      for (const room of suitableRooms) {
        if (assigned) break;
        
        for (const day of shuffledWeekDays) {
          if (assigned) break;
          
          for (let i = 0; i < timeSlots.length - slotsNeeded + 1; i++) {
            // Check if all consecutive slots are available
            let allAvailable = true;
            for (let j = 0; j < slotsNeeded; j++) {
              const slot = { day, timeSlot: timeSlots[i + j] };
              if (!isSlotAvailable(course, slot, room.id)) {
                allAvailable = false;
                break;
              }
            }
            
            if (allAvailable) {
              // Assign this course to these slots
              for (let j = 0; j < slotsNeeded; j++) {
                const slot = { day, timeSlot: timeSlots[i + j] };
                
                // Update assignments
                if (!instructorAssignments[course.instructorId]) {
                  instructorAssignments[course.instructorId] = [];
                }
                instructorAssignments[course.instructorId].push(slot);
                
                if (!classroomAssignments[room.id]) {
                  classroomAssignments[room.id] = [];
                }
                classroomAssignments[room.id].push(slot);
                
                if (!courseAssignments[course.id]) {
                  courseAssignments[course.id] = [];
                }
                courseAssignments[course.id].push(slot);
                
                // Create scheduled class
                const startTime = slot.timeSlot.split('-')[0].trim();
                const endTime = j === slotsNeeded - 1 
                  ? slot.timeSlot.split('-')[1].trim() 
                  : timeSlots[i + j + 1].split('-')[0].trim();
                
                // Add section info to the class name
                const sectionInfo = `${course.name} (Section ${section})`;
                
                scheduledClasses.push({
                  id: 0, // Will be assigned by the backend
                  courseId: course.id,
                  instructorId: course.instructorId,
                  classroomId: room.id,
                  day: slot.day,
                  startTime,
                  endTime,
                  timetableId,
                  section // Add section information (this field needs to be added to the schema)
                } as ScheduledClass);
              }
              
              assigned = true;
              break;
            }
          }
        }
      }
    
      // If not assigned with consecutive slots, try individual slots
      if (!assigned) {
        let assignedSlots = 0;
        
        // Shuffle allSlots to distribute classes across different days
        const shuffledSlots = [...allSlots].sort(() => Math.random() - 0.5);
        
        for (const room of suitableRooms) {
          if (assignedSlots >= slotsNeeded) break;
          
          for (const slot of shuffledSlots) {
            if (assignedSlots >= slotsNeeded) break;
            
            if (isSlotAvailable(course, slot, room.id)) {
              // Update assignments
              if (!instructorAssignments[course.instructorId]) {
                instructorAssignments[course.instructorId] = [];
              }
              instructorAssignments[course.instructorId].push(slot);
              
              if (!classroomAssignments[room.id]) {
                classroomAssignments[room.id] = [];
              }
              classroomAssignments[room.id].push(slot);
              
              if (!courseAssignments[course.id]) {
                courseAssignments[course.id] = [];
              }
              courseAssignments[course.id].push(slot);
              
              // Create scheduled class
              const [startTime, endTime] = slot.timeSlot.split('-').map(t => t.trim());
              
              scheduledClasses.push({
                id: 0, // Will be assigned by the backend
                courseId: course.id,
                instructorId: course.instructorId,
                classroomId: room.id,
                day: slot.day,
                startTime,
                endTime,
                timetableId,
                section // Add section information
              } as ScheduledClass);
              
              assignedSlots++;
            }
          }
        }
        
        if (assignedSlots < slotsNeeded) {
          console.warn(`Could only assign ${assignedSlots}/${slotsNeeded} slots for course ${course.code} section ${section}`);
        }
      }
    }
  }
  
  return scheduledClasses;
};

/**
 * Check for conflicts in a timetable
 */
export const checkConflicts = (scheduledClasses: ScheduledClass[]): {
  instructorConflicts: any[];
  classroomConflicts: any[];
  studentConflicts: any[];
} => {
  const instructorConflicts: any[] = [];
  const classroomConflicts: any[] = [];
  const studentConflicts: any[] = [];
  
  // Check for instructor conflicts (same instructor, same time)
  const instructorSlots: Record<number, Record<string, ScheduledClass[]>> = {};
  
  for (const scheduledClass of scheduledClasses) {
    const instructorId = scheduledClass.instructorId;
    const key = `${scheduledClass.day}-${scheduledClass.startTime}-${scheduledClass.endTime}`;
    
    if (!instructorSlots[instructorId]) {
      instructorSlots[instructorId] = {};
    }
    
    if (!instructorSlots[instructorId][key]) {
      instructorSlots[instructorId][key] = [];
    }
    
    instructorSlots[instructorId][key].push(scheduledClass);
    
    if (instructorSlots[instructorId][key].length > 1) {
      instructorConflicts.push({
        instructorId,
        classes: instructorSlots[instructorId][key]
      });
    }
  }
  
  // Check for classroom conflicts (same classroom, same time)
  const classroomSlots: Record<number, Record<string, ScheduledClass[]>> = {};
  
  for (const scheduledClass of scheduledClasses) {
    const classroomId = scheduledClass.classroomId;
    const key = `${scheduledClass.day}-${scheduledClass.startTime}-${scheduledClass.endTime}`;
    
    if (!classroomSlots[classroomId]) {
      classroomSlots[classroomId] = {};
    }
    
    if (!classroomSlots[classroomId][key]) {
      classroomSlots[classroomId][key] = [];
    }
    
    classroomSlots[classroomId][key].push(scheduledClass);
    
    if (classroomSlots[classroomId][key].length > 1) {
      classroomConflicts.push({
        classroomId,
        classes: classroomSlots[classroomId][key]
      });
    }
  }
  
  // Student conflicts check for section-based conflicts
  // Students in the same section cannot be in multiple classes at once
  const sectionSlots: Record<string, Record<string, ScheduledClass[]>> = {};
  
  for (const scheduledClass of scheduledClasses) {
    // Skip if no section is assigned (shouldn't happen with CSE data)
    if (!scheduledClass.section) continue;
    
    const section = scheduledClass.section;
    const key = `${scheduledClass.day}-${scheduledClass.startTime}-${scheduledClass.endTime}`;
    
    if (!sectionSlots[section]) {
      sectionSlots[section] = {};
    }
    
    if (!sectionSlots[section][key]) {
      sectionSlots[section][key] = [];
    }
    
    sectionSlots[section][key].push(scheduledClass);
    
    if (sectionSlots[section][key].length > 1) {
      studentConflicts.push({
        section,
        classes: sectionSlots[section][key]
      });
    }
  }
  
  return {
    instructorConflicts,
    classroomConflicts,
    studentConflicts
  };
};
