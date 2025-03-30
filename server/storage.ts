import {
  type Task, type InsertTask,
  type User, type InsertUser,
  type Project, type InsertProject,
  type Comment, type InsertComment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Comment operations
  getComments(): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByTask(taskId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private projects: Map<number, Project>;
  private comments: Map<number, Comment>;

  private currentUserId: number;
  private currentTaskId: number;
  private currentProjectId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.projects = new Map();
    this.comments = new Map();
    
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentProjectId = 1;
    this.currentCommentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add a sample user
    this.createUser({
      username: "admin",
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });
    
    this.createUser({
      username: "user1",
      email: "user1@example.com",
      password: "password123",
      firstName: "Regular",
      lastName: "User",
      role: "user"
    });
    
    // Add sample projects
    this.createProject({
      name: "Website Redesign",
      description: "Redesign the company website with new branding",
      ownerId: 1
    });
    
    this.createProject({
      name: "Mobile App Development",
      description: "Develop a mobile app for customer engagement",
      ownerId: 1
    });
    
    // Add sample tasks
    this.createTask({
      title: "Design Homepage",
      description: "Create wireframes and mockups for the new homepage",
      status: "todo",
      priority: "high",
      dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      userId: 2,
      projectId: 1,
      isCompleted: false
    });
    
    this.createTask({
      title: "Implement User Authentication",
      description: "Set up user authentication and authorization system",
      status: "in_progress",
      priority: "high",
      dueDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      userId: 1,
      projectId: 1,
      isCompleted: false
    });
    
    this.createTask({
      title: "Create Database Schema",
      description: "Design and implement the database schema for the app",
      status: "todo",
      priority: "medium",
      dueDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      userId: 1,
      projectId: 2,
      isCompleted: false
    });
    
    // Add sample comments
    this.createComment({
      content: "I've started working on the mockups. Will share progress by tomorrow.",
      taskId: 1,
      userId: 2
    });
    
    this.createComment({
      content: "Let's use Firebase for authentication to save time.",
      taskId: 2,
      userId: 1
    });
  }
  
  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...existingUser, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }
  
  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
  }
  
  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const now = new Date();
    const updatedTask = { 
      ...existingTask, 
      ...taskUpdate, 
      updatedAt: now 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    // First delete all comments related to this task
    const commentsToDelete = Array.from(this.comments.values())
      .filter(comment => comment.taskId === id)
      .map(comment => comment.id);
    
    for (const commentId of commentsToDelete) {
      this.comments.delete(commentId);
    }
    
    // Then delete the task
    this.tasks.delete(id);
  }
  
  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectsByUser(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.ownerId === userId);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const now = new Date();
    const updatedProject = { 
      ...existingProject, 
      ...projectUpdate, 
      updatedAt: now 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<void> {
    // First get all tasks associated with this project
    const tasksToDelete = Array.from(this.tasks.values())
      .filter(task => task.projectId === id)
      .map(task => task.id);
    
    // Delete each task (which will also delete associated comments)
    for (const taskId of tasksToDelete) {
      await this.deleteTask(taskId);
    }
    
    // Then delete the project
    this.projects.delete(id);
  }
  
  // Comment operations
  async getComments(): Promise<Comment[]> {
    return Array.from(this.comments.values());
  }
  
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }
  
  async getCommentsByTask(taskId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }
  
  async updateComment(id: number, commentUpdate: Partial<InsertComment>): Promise<Comment> {
    const existingComment = this.comments.get(id);
    if (!existingComment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    const updatedComment = { 
      ...existingComment, 
      ...commentUpdate
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
  }
}

export const storage = new MemStorage();