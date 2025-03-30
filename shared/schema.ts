import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the time slots enum
export const timeSlots = [
  "9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", 
  "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00"
] as const;

export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export const departments = [
  // Science departments
  "PHY", "CHM", "BIO", "MTH", 
  // Engineering departments
  "CSE", "ECE", "MECH", "CIVIL", "EEE", "IT",
  // Other departments
  "EES", "CES", "ECO"
] as const;

// Define the Department enum
export const departmentSchema = z.enum(departments);
export type Department = z.infer<typeof departmentSchema>;

// Define the TimeSlot enum
export const timeSlotSchema = z.enum(timeSlots);
export type TimeSlot = z.infer<typeof timeSlotSchema>;

// Define the WeekDay enum
export const weekDaySchema = z.enum(weekDays);
export type WeekDay = z.infer<typeof weekDaySchema>;

// Define buildings (AB1, AB2, AB3)
export const buildings = ["AB1", "AB2", "AB3", "L1", "L2", "L3", "Lab 1", "Lab 2", "Lab 3", "Lab 4"] as const;
export const buildingSchema = z.enum(buildings);
export type Building = z.infer<typeof buildingSchema>;

// Define course table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  instructorId: integer("instructor_id").notNull(),
  credits: integer("credits").notNull().default(3),
  capacity: integer("capacity").notNull().default(30),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Define instructor table
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  email: text("email").notNull().unique(),
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({ id: true });
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type Instructor = typeof instructors.$inferSelect;

// Define classroom table
export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  building: text("building").notNull(),
  capacity: integer("capacity").notNull(),
  hasProjector: boolean("has_projector").notNull().default(true),
  hasComputers: boolean("has_computers").notNull().default(false),
});

export const insertClassroomSchema = createInsertSchema(classrooms).omit({ id: true });
export type InsertClassroom = z.infer<typeof insertClassroomSchema>;
export type Classroom = typeof classrooms.$inferSelect;

// Define the CSE sections
export const cseSections = ["A", "B", "C"] as const;
export const cseSectionSchema = z.enum(cseSections);
export type CseSection = z.infer<typeof cseSectionSchema>;

// Define scheduled class table
export const scheduledClasses = pgTable("scheduled_classes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  instructorId: integer("instructor_id").notNull(),
  classroomId: integer("classroom_id").notNull(),
  day: text("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  timetableId: integer("timetable_id").notNull(),
  section: text("section"), // Optional section identifier (A, B, C) for CSE department
});

export const insertScheduledClassSchema = createInsertSchema(scheduledClasses).omit({ id: true });
export type InsertScheduledClass = z.infer<typeof insertScheduledClassSchema>;
export type ScheduledClass = typeof scheduledClasses.$inferSelect;

// Define timetable table
export const timetables = pgTable("timetables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  semester: text("semester").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTimetableSchema = createInsertSchema(timetables).omit({ id: true, createdAt: true });
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetables.$inferSelect;

// Define constraints table
export const constraints = pgTable("constraints", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // instructor_unavailable, room_unavailable, course_conflict
  entityId: integer("entity_id").notNull(), // instructor_id, room_id, course_id
  day: text("day").notNull(),
  timeSlot: text("time_slot").notNull(),
});

export const insertConstraintSchema = createInsertSchema(constraints).omit({ id: true });
export type InsertConstraint = z.infer<typeof insertConstraintSchema>;
export type Constraint = typeof constraints.$inferSelect;

// Define user preferences (for UI settings)
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

// Define compound table for course prerequisites
export const coursePrerequisites = pgTable(
  "course_prerequisites",
  {
    courseId: integer("course_id").notNull(),
    prerequisiteId: integer("prerequisite_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.courseId, table.prerequisiteId] }),
  })
);

// The users table as required by the template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Extended types for frontend use
export type CourseWithInstructor = Course & {
  instructor: Instructor;
};

export type ScheduledClassWithDetails = ScheduledClass & {
  course: Course;
  instructor: Instructor;
  classroom: Classroom;
};

export type TimetableWithClasses = Timetable & {
  classes: ScheduledClassWithDetails[];
};

// Extended schema for form validation
export const courseFormSchema = insertCourseSchema.extend({
  instructorId: z.number().min(1, "Instructor is required"),
  credits: z.number().min(1).max(5),
  capacity: z.number().min(1),
  code: z.string().min(5, "Course code must be at least 5 characters"),
  name: z.string().min(3, "Course name must be at least 3 characters"),
});

export const instructorFormSchema = insertInstructorSchema.extend({
  name: z.string().min(3, "Instructor name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

export const classroomFormSchema = insertClassroomSchema.extend({
  name: z.string().min(2, "Classroom name must be at least 2 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

export const constraintFormSchema = insertConstraintSchema.extend({
  entityId: z.number().min(1, "Entity ID is required"),
  type: z.enum(["instructor_unavailable", "room_unavailable", "course_conflict"]),
  day: weekDaySchema,
  timeSlot: timeSlotSchema,
});

export const timetableFormSchema = insertTimetableSchema.extend({
  name: z.string().min(3, "Timetable name must be at least 3 characters"),
  semester: z.string().min(3, "Semester must be at least 3 characters"),
});
