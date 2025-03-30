import {
  type Course, type InsertCourse,
  type Instructor, type InsertInstructor,
  type Classroom, type InsertClassroom,
  type ScheduledClass, type InsertScheduledClass,
  type Timetable, type InsertTimetable,
  type Constraint, type InsertConstraint,
  type User, type InsertUser,
  courses, instructors, classrooms, scheduledClasses, timetables, constraints, users
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseByCode(code: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  // Instructor operations
  getInstructors(): Promise<Instructor[]>;
  getInstructor(id: number): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  updateInstructor(id: number, instructor: Partial<InsertInstructor>): Promise<Instructor>;
  deleteInstructor(id: number): Promise<void>;

  // Classroom operations
  getClassrooms(): Promise<Classroom[]>;
  getClassroom(id: number): Promise<Classroom | undefined>;
  createClassroom(classroom: InsertClassroom): Promise<Classroom>;
  updateClassroom(id: number, classroom: Partial<InsertClassroom>): Promise<Classroom>;
  deleteClassroom(id: number): Promise<void>;

  // Scheduled class operations
  getScheduledClasses(): Promise<ScheduledClass[]>;
  getScheduledClassesByTimetable(timetableId: number): Promise<ScheduledClass[]>;
  createScheduledClass(scheduledClass: InsertScheduledClass): Promise<ScheduledClass>;
  updateScheduledClass(id: number, scheduledClass: Partial<InsertScheduledClass>): Promise<ScheduledClass>;
  deleteScheduledClass(id: number): Promise<void>;
  deleteScheduledClassesByTimetable(timetableId: number): Promise<void>;

  // Timetable operations
  getTimetables(): Promise<Timetable[]>;
  getTimetable(id: number): Promise<Timetable | undefined>;
  getActiveTimetable(): Promise<Timetable | undefined>;
  createTimetable(timetable: InsertTimetable): Promise<Timetable>;
  updateTimetable(id: number, timetable: Partial<InsertTimetable>): Promise<Timetable>;
  deleteTimetable(id: number): Promise<void>;
  setActiveTimetable(id: number): Promise<Timetable>;

  // Constraint operations
  getConstraints(): Promise<Constraint[]>;
  getConstraint(id: number): Promise<Constraint | undefined>;
  createConstraint(constraint: InsertConstraint): Promise<Constraint>;
  updateConstraint(id: number, constraint: Partial<InsertConstraint>): Promise<Constraint>;
  deleteConstraint(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private instructors: Map<number, Instructor>;
  private classrooms: Map<number, Classroom>;
  private scheduledClasses: Map<number, ScheduledClass>;
  private timetables: Map<number, Timetable>;
  private constraints: Map<number, Constraint>;
  
  private currentUserId: number;
  private currentCourseId: number;
  private currentInstructorId: number;
  private currentClassroomId: number;
  private currentScheduledClassId: number;
  private currentTimetableId: number;
  private currentConstraintId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.instructors = new Map();
    this.classrooms = new Map();
    this.scheduledClasses = new Map();
    this.timetables = new Map();
    this.constraints = new Map();
    
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentInstructorId = 1;
    this.currentClassroomId = 1;
    this.currentScheduledClassId = 1;
    this.currentTimetableId = 1;
    this.currentConstraintId = 1;
    
    this.initializeSampleData();
  }

  // Initialize some sample data
  private initializeSampleData() {
    // Sample instructors
    const sampleInstructors: InsertInstructor[] = [
      { name: "Dr. P. Verma", department: "CHM", email: "p.verma@iiserb.ac.in" },
      { name: "Dr. R. Sharma", department: "PHY", email: "r.sharma@iiserb.ac.in" },
      { name: "Dr. S. Kumar", department: "PHY", email: "s.kumar@iiserb.ac.in" },
      { name: "Dr. A. Gupta", department: "PHY", email: "a.gupta@iiserb.ac.in" },
      { name: "Dr. M. Patel", department: "PHY", email: "m.patel@iiserb.ac.in" },
      { name: "Dr. L. Singh", department: "PHY", email: "l.singh@iiserb.ac.in" },
      { name: "Dr. K. Mishra", department: "CHM", email: "k.mishra@iiserb.ac.in" },
      { name: "Dr. J. Roy", department: "CHM", email: "j.roy@iiserb.ac.in" }
    ];
    
    sampleInstructors.forEach(instructor => this.createInstructor(instructor));
    
    // Sample classrooms
    const sampleClassrooms: InsertClassroom[] = [
      { name: "L1", building: "L1", capacity: 100, hasProjector: true, hasComputers: false },
      { name: "L2", building: "L2", capacity: 100, hasProjector: true, hasComputers: false },
      { name: "L3", building: "L3", capacity: 100, hasProjector: true, hasComputers: false },
      { name: "AB1-304", building: "AB1", capacity: 40, hasProjector: true, hasComputers: false },
      { name: "AB2-104", building: "AB2", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "AB3-201", building: "AB3", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "AB1-102", building: "AB1", capacity: 35, hasProjector: true, hasComputers: false },
      { name: "AB2-201", building: "AB2", capacity: 35, hasProjector: true, hasComputers: false },
      { name: "Lab 3", building: "Lab 3", capacity: 25, hasProjector: true, hasComputers: true },
      { name: "AB1-401", building: "AB1", capacity: 35, hasProjector: true, hasComputers: false },
      { name: "AB1-301", building: "AB1", capacity: 35, hasProjector: true, hasComputers: false },
      { name: "AB2-301", building: "AB2", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "Lab 2", building: "Lab 2", capacity: 25, hasProjector: true, hasComputers: true },
      { name: "AB1-203", building: "AB1", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "Lab 4", building: "Lab 4", capacity: 25, hasProjector: true, hasComputers: true },
      { name: "AB2-205", building: "AB2", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "AB1-405", building: "AB1", capacity: 35, hasProjector: true, hasComputers: false },
      { name: "AB1-403", building: "AB1", capacity: 35, hasProjector: true, hasComputers: false },
      { name: "AB2-102", building: "AB2", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "AB2-204", building: "AB2", capacity: 30, hasProjector: true, hasComputers: false },
      { name: "Lab 1", building: "Lab 1", capacity: 25, hasProjector: true, hasComputers: true }
    ];
    
    sampleClassrooms.forEach(classroom => this.createClassroom(classroom));
    
    // Sample courses
    const sampleCourses: InsertCourse[] = [
      { code: "CHM 111", name: "General Chemistry", department: "CHM", instructorId: 1, credits: 3, capacity: 50 },
      { code: "PHY 101", name: "Mechanics", department: "PHY", instructorId: 2, credits: 4, capacity: 50 },
      { code: "PHY 104", name: "Electromagnetism", department: "PHY", instructorId: 3, credits: 4, capacity: 40 },
      { code: "PHY 306", name: "Quantum Physics I", department: "PHY", instructorId: 4, credits: 3, capacity: 30 },
      { code: "PHY 407", name: "Solid State Physics", department: "PHY", instructorId: 5, credits: 3, capacity: 25 },
      { code: "PHY 503", name: "Advanced Lab Techniques", department: "PHY", instructorId: 6, credits: 2, capacity: 20 },
      { code: "CHM 206", name: "Organic Chemistry", department: "CHM", instructorId: 7, credits: 3, capacity: 40 },
      { code: "CHM 252", name: "Analytical Methods", department: "CHM", instructorId: 8, credits: 3, capacity: 30 }
    ];
    
    sampleCourses.forEach(course => this.createCourse(course));
    
    // Create a default timetable
    this.createTimetable({
      name: "2024-2025-II Semester",
      semester: "2024-2025-II",
      isActive: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseByCode(code: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(course => course.code === code);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseUpdate: Partial<InsertCourse>): Promise<Course> {
    const course = this.courses.get(id);
    if (!course) throw new Error(`Course with id ${id} not found`);
    const updatedCourse = { ...course, ...courseUpdate };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    if (!this.courses.has(id)) throw new Error(`Course with id ${id} not found`);
    this.courses.delete(id);
  }

  // Instructor operations
  async getInstructors(): Promise<Instructor[]> {
    return Array.from(this.instructors.values());
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }

  async createInstructor(insertInstructor: InsertInstructor): Promise<Instructor> {
    const id = this.currentInstructorId++;
    const instructor: Instructor = { ...insertInstructor, id };
    this.instructors.set(id, instructor);
    return instructor;
  }

  async updateInstructor(id: number, instructorUpdate: Partial<InsertInstructor>): Promise<Instructor> {
    const instructor = this.instructors.get(id);
    if (!instructor) throw new Error(`Instructor with id ${id} not found`);
    const updatedInstructor = { ...instructor, ...instructorUpdate };
    this.instructors.set(id, updatedInstructor);
    return updatedInstructor;
  }

  async deleteInstructor(id: number): Promise<void> {
    if (!this.instructors.has(id)) throw new Error(`Instructor with id ${id} not found`);
    this.instructors.delete(id);
  }

  // Classroom operations
  async getClassrooms(): Promise<Classroom[]> {
    return Array.from(this.classrooms.values());
  }

  async getClassroom(id: number): Promise<Classroom | undefined> {
    return this.classrooms.get(id);
  }

  async createClassroom(insertClassroom: InsertClassroom): Promise<Classroom> {
    const id = this.currentClassroomId++;
    const classroom: Classroom = { ...insertClassroom, id };
    this.classrooms.set(id, classroom);
    return classroom;
  }

  async updateClassroom(id: number, classroomUpdate: Partial<InsertClassroom>): Promise<Classroom> {
    const classroom = this.classrooms.get(id);
    if (!classroom) throw new Error(`Classroom with id ${id} not found`);
    const updatedClassroom = { ...classroom, ...classroomUpdate };
    this.classrooms.set(id, updatedClassroom);
    return updatedClassroom;
  }

  async deleteClassroom(id: number): Promise<void> {
    if (!this.classrooms.has(id)) throw new Error(`Classroom with id ${id} not found`);
    this.classrooms.delete(id);
  }

  // Scheduled class operations
  async getScheduledClasses(): Promise<ScheduledClass[]> {
    return Array.from(this.scheduledClasses.values());
  }

  async getScheduledClassesByTimetable(timetableId: number): Promise<ScheduledClass[]> {
    return Array.from(this.scheduledClasses.values())
      .filter(scheduledClass => scheduledClass.timetableId === timetableId);
  }

  async createScheduledClass(insertScheduledClass: InsertScheduledClass): Promise<ScheduledClass> {
    const id = this.currentScheduledClassId++;
    const scheduledClass: ScheduledClass = { ...insertScheduledClass, id };
    this.scheduledClasses.set(id, scheduledClass);
    return scheduledClass;
  }

  async updateScheduledClass(id: number, scheduledClassUpdate: Partial<InsertScheduledClass>): Promise<ScheduledClass> {
    const scheduledClass = this.scheduledClasses.get(id);
    if (!scheduledClass) throw new Error(`Scheduled class with id ${id} not found`);
    const updatedScheduledClass = { ...scheduledClass, ...scheduledClassUpdate };
    this.scheduledClasses.set(id, updatedScheduledClass);
    return updatedScheduledClass;
  }

  async deleteScheduledClass(id: number): Promise<void> {
    if (!this.scheduledClasses.has(id)) throw new Error(`Scheduled class with id ${id} not found`);
    this.scheduledClasses.delete(id);
  }

  async deleteScheduledClassesByTimetable(timetableId: number): Promise<void> {
    const classesToDelete = Array.from(this.scheduledClasses.values())
      .filter(scheduledClass => scheduledClass.timetableId === timetableId);
    
    for (const scheduledClass of classesToDelete) {
      this.scheduledClasses.delete(scheduledClass.id);
    }
  }

  // Timetable operations
  async getTimetables(): Promise<Timetable[]> {
    return Array.from(this.timetables.values());
  }

  async getTimetable(id: number): Promise<Timetable | undefined> {
    return this.timetables.get(id);
  }

  async getActiveTimetable(): Promise<Timetable | undefined> {
    return Array.from(this.timetables.values()).find(timetable => timetable.isActive);
  }

  async createTimetable(insertTimetable: InsertTimetable): Promise<Timetable> {
    const id = this.currentTimetableId++;
    const now = new Date();
    const timetable: Timetable = { ...insertTimetable, id, createdAt: now };
    
    // If this timetable is set as active, deactivate all others
    if (timetable.isActive) {
      for (const [existingId, existingTimetable] of this.timetables.entries()) {
        if (existingTimetable.isActive) {
          this.timetables.set(existingId, { ...existingTimetable, isActive: false });
        }
      }
    }
    
    this.timetables.set(id, timetable);
    return timetable;
  }

  async updateTimetable(id: number, timetableUpdate: Partial<InsertTimetable>): Promise<Timetable> {
    const timetable = this.timetables.get(id);
    if (!timetable) throw new Error(`Timetable with id ${id} not found`);
    
    const updatedTimetable = { ...timetable, ...timetableUpdate };
    
    // If this timetable is being set as active, deactivate all others
    if (timetableUpdate.isActive) {
      for (const [existingId, existingTimetable] of this.timetables.entries()) {
        if (existingId !== id && existingTimetable.isActive) {
          this.timetables.set(existingId, { ...existingTimetable, isActive: false });
        }
      }
    }
    
    this.timetables.set(id, updatedTimetable);
    return updatedTimetable;
  }

  async deleteTimetable(id: number): Promise<void> {
    if (!this.timetables.has(id)) throw new Error(`Timetable with id ${id} not found`);
    this.timetables.delete(id);
    await this.deleteScheduledClassesByTimetable(id);
  }

  async setActiveTimetable(id: number): Promise<Timetable> {
    const timetable = this.timetables.get(id);
    if (!timetable) throw new Error(`Timetable with id ${id} not found`);
    
    // Deactivate all timetables
    for (const [existingId, existingTimetable] of this.timetables.entries()) {
      if (existingTimetable.isActive) {
        this.timetables.set(existingId, { ...existingTimetable, isActive: false });
      }
    }
    
    // Activate the selected timetable
    const activeTimetable = { ...timetable, isActive: true };
    this.timetables.set(id, activeTimetable);
    return activeTimetable;
  }

  // Constraint operations
  async getConstraints(): Promise<Constraint[]> {
    return Array.from(this.constraints.values());
  }

  async getConstraint(id: number): Promise<Constraint | undefined> {
    return this.constraints.get(id);
  }

  async createConstraint(insertConstraint: InsertConstraint): Promise<Constraint> {
    const id = this.currentConstraintId++;
    const constraint: Constraint = { ...insertConstraint, id };
    this.constraints.set(id, constraint);
    return constraint;
  }

  async updateConstraint(id: number, constraintUpdate: Partial<InsertConstraint>): Promise<Constraint> {
    const constraint = this.constraints.get(id);
    if (!constraint) throw new Error(`Constraint with id ${id} not found`);
    const updatedConstraint = { ...constraint, ...constraintUpdate };
    this.constraints.set(id, updatedConstraint);
    return updatedConstraint;
  }

  async deleteConstraint(id: number): Promise<void> {
    if (!this.constraints.has(id)) throw new Error(`Constraint with id ${id} not found`);
    this.constraints.delete(id);
  }
}

export const storage = new MemStorage();
