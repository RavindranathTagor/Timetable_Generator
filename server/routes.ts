import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCourseSchema, 
  insertInstructorSchema, 
  insertClassroomSchema,
  insertConstraintSchema,
  insertTimetableSchema,
  insertScheduledClassSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  
  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, courseData);
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Instructor routes
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch instructors" });
    }
  });

  app.get("/api/instructors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const instructor = await storage.getInstructor(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      res.json(instructor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch instructor" });
    }
  });

  app.post("/api/instructors", async (req, res) => {
    try {
      const instructorData = insertInstructorSchema.parse(req.body);
      const instructor = await storage.createInstructor(instructorData);
      res.status(201).json(instructor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid instructor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create instructor" });
    }
  });

  app.put("/api/instructors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const instructorData = insertInstructorSchema.partial().parse(req.body);
      const instructor = await storage.updateInstructor(id, instructorData);
      res.json(instructor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid instructor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update instructor" });
    }
  });

  app.delete("/api/instructors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInstructor(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete instructor" });
    }
  });

  // Classroom routes
  app.get("/api/classrooms", async (req, res) => {
    try {
      const classrooms = await storage.getClassrooms();
      res.json(classrooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classrooms" });
    }
  });

  app.get("/api/classrooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const classroom = await storage.getClassroom(id);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      res.json(classroom);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classroom" });
    }
  });

  app.post("/api/classrooms", async (req, res) => {
    try {
      const classroomData = insertClassroomSchema.parse(req.body);
      const classroom = await storage.createClassroom(classroomData);
      res.status(201).json(classroom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid classroom data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create classroom" });
    }
  });

  app.put("/api/classrooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const classroomData = insertClassroomSchema.partial().parse(req.body);
      const classroom = await storage.updateClassroom(id, classroomData);
      res.json(classroom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid classroom data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update classroom" });
    }
  });

  app.delete("/api/classrooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClassroom(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete classroom" });
    }
  });

  // Timetable routes
  app.get("/api/timetables", async (req, res) => {
    try {
      const timetables = await storage.getTimetables();
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetables" });
    }
  });

  app.get("/api/timetables/active", async (req, res) => {
    try {
      const timetable = await storage.getActiveTimetable();
      if (!timetable) {
        return res.status(404).json({ message: "No active timetable found" });
      }
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active timetable" });
    }
  });

  app.get("/api/timetables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timetable = await storage.getTimetable(id);
      if (!timetable) {
        return res.status(404).json({ message: "Timetable not found" });
      }
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.post("/api/timetables", async (req, res) => {
    try {
      const timetableData = insertTimetableSchema.parse(req.body);
      const timetable = await storage.createTimetable(timetableData);
      res.status(201).json(timetable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timetable data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timetable" });
    }
  });

  app.put("/api/timetables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timetableData = insertTimetableSchema.partial().parse(req.body);
      const timetable = await storage.updateTimetable(id, timetableData);
      res.json(timetable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timetable data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update timetable" });
    }
  });

  app.delete("/api/timetables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTimetable(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timetable" });
    }
  });

  app.post("/api/timetables/:id/activate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timetable = await storage.setActiveTimetable(id);
      res.json(timetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to activate timetable" });
    }
  });

  // Scheduled Class routes
  app.get("/api/scheduled-classes", async (req, res) => {
    try {
      const timetableId = req.query.timetableId ? parseInt(req.query.timetableId as string) : undefined;
      let scheduledClasses;
      
      if (timetableId) {
        scheduledClasses = await storage.getScheduledClassesByTimetable(timetableId);
      } else {
        scheduledClasses = await storage.getScheduledClasses();
      }
      
      res.json(scheduledClasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scheduled classes" });
    }
  });

  app.post("/api/scheduled-classes", async (req, res) => {
    try {
      const scheduledClassData = insertScheduledClassSchema.parse(req.body);
      const scheduledClass = await storage.createScheduledClass(scheduledClassData);
      res.status(201).json(scheduledClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid scheduled class data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create scheduled class" });
    }
  });

  app.put("/api/scheduled-classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduledClassData = insertScheduledClassSchema.partial().parse(req.body);
      const scheduledClass = await storage.updateScheduledClass(id, scheduledClassData);
      res.json(scheduledClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid scheduled class data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update scheduled class" });
    }
  });

  app.delete("/api/scheduled-classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScheduledClass(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scheduled class" });
    }
  });

  // Batch delete scheduled classes by timetable
  app.delete("/api/timetables/:id/scheduled-classes", async (req, res) => {
    try {
      const timetableId = parseInt(req.params.id);
      await storage.deleteScheduledClassesByTimetable(timetableId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scheduled classes" });
    }
  });

  // Constraint routes
  app.get("/api/constraints", async (req, res) => {
    try {
      const constraints = await storage.getConstraints();
      res.json(constraints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch constraints" });
    }
  });

  app.post("/api/constraints", async (req, res) => {
    try {
      const constraintData = insertConstraintSchema.parse(req.body);
      const constraint = await storage.createConstraint(constraintData);
      res.status(201).json(constraint);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid constraint data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create constraint" });
    }
  });

  app.delete("/api/constraints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConstraint(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete constraint" });
    }
  });

  // Timetable generation endpoint
  app.post("/api/generate-timetable", async (req, res) => {
    try {
      const { name, semester } = req.body;
      
      if (!name || !semester) {
        return res.status(400).json({ message: "Name and semester are required" });
      }
      
      // Create a new timetable
      const timetable = await storage.createTimetable({
        name,
        semester,
        isActive: false
      });
      
      // Get data needed for timetable generation
      const courses = await storage.getCourses();
      const instructors = await storage.getInstructors();
      const classrooms = await storage.getClassrooms();
      const constraints = await storage.getConstraints();
      
      // Import the timetable generator
      const { generateTimetable } = await import('../client/src/lib/timetable-generator');
      
      // Generate scheduled classes
      const generatorOptions = {
        courses,
        instructors, 
        classrooms,
        constraints,
        timetableId: timetable.id
      };
      
      const scheduledClasses = await generateTimetable(generatorOptions);
      
      // Save all generated scheduled classes
      for (const scheduledClass of scheduledClasses) {
        await storage.createScheduledClass({
          courseId: scheduledClass.courseId,
          instructorId: scheduledClass.instructorId,
          classroomId: scheduledClass.classroomId,
          day: scheduledClass.day,
          startTime: scheduledClass.startTime,
          endTime: scheduledClass.endTime,
          timetableId: timetable.id,
          section: scheduledClass.section
        });
      }
      
      // Return the created timetable
      res.status(201).json(timetable);
    } catch (error) {
      console.error("Timetable generation error:", error);
      res.status(500).json({ message: "Failed to generate timetable" });
    }
  });

  // Timetable data endpoint - returns timetable with all related data (legacy endpoint)
  app.get("/api/timetable-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the timetable
      const timetable = await storage.getTimetable(id);
      if (!timetable) {
        return res.status(404).json({ message: "Timetable not found" });
      }
      
      // Get scheduled classes for this timetable
      const scheduledClasses = await storage.getScheduledClassesByTimetable(id);
      
      // Get all courses, instructors, and classrooms for reference
      const courses = await storage.getCourses();
      const instructors = await storage.getInstructors();
      const classrooms = await storage.getClassrooms();
      
      // Build detailed scheduled classes with referenced entities
      const detailedClasses = scheduledClasses.map(scheduledClass => {
        const course = courses.find(c => c.id === scheduledClass.courseId);
        const instructor = instructors.find(i => i.id === scheduledClass.instructorId);
        const classroom = classrooms.find(c => c.id === scheduledClass.classroomId);
        
        return {
          ...scheduledClass,
          course,
          instructor,
          classroom
        };
      });
      
      // Return complete timetable data
      res.json({
        ...timetable,
        classes: detailedClasses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable data" });
    }
  });
  
  // New endpoint - returns timetable with classes (TimetableWithClasses)
  app.get("/api/timetables/withClasses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the timetable
      const timetable = await storage.getTimetable(id);
      if (!timetable) {
        return res.status(404).json({ message: "Timetable not found" });
      }
      
      // Get scheduled classes for this timetable
      const scheduledClasses = await storage.getScheduledClassesByTimetable(id);
      
      // Get all courses, instructors, and classrooms for reference
      const courses = await storage.getCourses();
      const instructors = await storage.getInstructors();
      const classrooms = await storage.getClassrooms();
      
      // Build detailed scheduled classes with referenced entities
      const detailedClasses = scheduledClasses.map(scheduledClass => {
        const course = courses.find(c => c.id === scheduledClass.courseId);
        const instructor = instructors.find(i => i.id === scheduledClass.instructorId);
        const classroom = classrooms.find(c => c.id === scheduledClass.classroomId);
        
        return {
          ...scheduledClass,
          course,
          instructor,
          classroom
        };
      });
      
      // Return complete timetable data
      res.json({
        ...timetable,
        classes: detailedClasses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable with classes" });
    }
  });
  
  // Get active timetable with classes
  app.get("/api/timetables/withClasses", async (req, res) => {
    try {
      // Get the active timetable
      const timetable = await storage.getActiveTimetable();
      if (!timetable) {
        return res.status(404).json({ message: "No active timetable found" });
      }
      
      // Get scheduled classes for this timetable
      const scheduledClasses = await storage.getScheduledClassesByTimetable(timetable.id);
      
      // Get all courses, instructors, and classrooms for reference
      const courses = await storage.getCourses();
      const instructors = await storage.getInstructors();
      const classrooms = await storage.getClassrooms();
      
      // Build detailed scheduled classes with referenced entities
      const detailedClasses = scheduledClasses.map(scheduledClass => {
        const course = courses.find(c => c.id === scheduledClass.courseId);
        const instructor = instructors.find(i => i.id === scheduledClass.instructorId);
        const classroom = classrooms.find(c => c.id === scheduledClass.classroomId);
        
        return {
          ...scheduledClass,
          course,
          instructor,
          classroom
        };
      });
      
      // Return complete timetable data
      res.json({
        ...timetable,
        classes: detailedClasses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active timetable with classes" });
    }
  });

  // Check for timetable conflicts
  app.post("/api/check-conflicts", async (req, res) => {
    try {
      const { timetableId } = req.body;
      
      if (!timetableId) {
        return res.status(400).json({ message: "Timetable ID is required" });
      }
      
      // Get scheduled classes for this timetable
      const scheduledClasses = await storage.getScheduledClassesByTimetable(timetableId);
      
      if (scheduledClasses.length === 0) {
        return res.json({
          hasConflicts: false,
          conflicts: {
            instructorConflicts: [],
            classroomConflicts: [],
            studentConflicts: []
          }
        });
      }
      
      // Import the conflict checker
      const { checkConflicts } = await import('../client/src/lib/timetable-generator');
      
      // Check for conflicts using our implementation
      const conflicts = checkConflicts(scheduledClasses);
      
      // Return the conflicts
      res.json({
        hasConflicts: Object.values(conflicts).some(arr => arr.length > 0),
        conflicts
      });
    } catch (error) {
      console.error("Conflict checking error:", error);
      res.status(500).json({ message: "Failed to check conflicts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
