import { 
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLanguage(id: string, language: string): Promise<User | undefined>;
  getMaids(): Promise<User[]>;
  
  getTasks(): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByAssignee(assigneeId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask & { createdBy: string }): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.notifications = new Map();
    this.seedData();
  }

  private seedData() {
    const ownerId = "owner-1";
    const maid1Id = "maid-1";
    const maid2Id = "maid-2";

    this.users.set(ownerId, {
      id: ownerId,
      username: "owner",
      password: "1234",
      name: "John Smith",
      role: "owner",
      language: "en",
      avatarUrl: null,
    });

    this.users.set(maid1Id, {
      id: maid1Id,
      username: "maid1",
      password: "1234",
      name: "Maria Santos",
      role: "maid",
      language: "fil",
      avatarUrl: null,
    });

    this.users.set(maid2Id, {
      id: maid2Id,
      username: "maid2",
      password: "1234",
      name: "Fatima Ahmed",
      role: "maid",
      language: "ar",
      avatarUrl: null,
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const task1: Task = {
      id: "task-1",
      title: "Clean living room",
      description: "Vacuum, dust all surfaces, and organize the coffee table",
      status: "pending",
      priority: "high",
      assignedTo: maid1Id,
      createdBy: ownerId,
      deadline: today,
      completedAt: null,
      photoEvidence: null,
      notes: null,
    };

    const task2: Task = {
      id: "task-2",
      title: "Wash dishes",
      description: "Clean all dishes in the sink and organize the kitchen",
      status: "in_progress",
      priority: "medium",
      assignedTo: maid1Id,
      createdBy: ownerId,
      deadline: today,
      completedAt: null,
      photoEvidence: null,
      notes: "Started at 10:00 AM",
    };

    const task3: Task = {
      id: "task-3",
      title: "Laundry",
      description: "Wash, dry, fold, and put away all laundry",
      status: "pending",
      priority: "medium",
      assignedTo: maid2Id,
      createdBy: ownerId,
      deadline: tomorrow,
      completedAt: null,
      photoEvidence: null,
      notes: null,
    };

    const task4: Task = {
      id: "task-4",
      title: "Clean bathrooms",
      description: "Deep clean all bathrooms including toilets, sinks, and mirrors",
      status: "completed",
      priority: "high",
      assignedTo: maid1Id,
      createdBy: ownerId,
      deadline: new Date(today.getTime() - 86400000),
      completedAt: new Date(today.getTime() - 43200000),
      photoEvidence: null,
      notes: "All done, used new cleaning supplies",
    };

    const task5: Task = {
      id: "task-5",
      title: "Grocery shopping",
      description: "Buy items from the shopping list on the fridge",
      status: "pending",
      priority: "low",
      assignedTo: maid2Id,
      createdBy: ownerId,
      deadline: nextWeek,
      completedAt: null,
      photoEvidence: null,
      notes: null,
    };

    this.tasks.set(task1.id, task1);
    this.tasks.set(task2.id, task2);
    this.tasks.set(task3.id, task3);
    this.tasks.set(task4.id, task4);
    this.tasks.set(task5.id, task5);

    const notification1: Notification = {
      id: "notif-1",
      userId: ownerId,
      title: "Task Completed",
      message: "Maria Santos completed 'Clean bathrooms'",
      type: "task_completed",
      read: false,
      createdAt: new Date(today.getTime() - 43200000),
    };

    const notification2: Notification = {
      id: "notif-2",
      userId: maid1Id,
      title: "New Task Assigned",
      message: "You have been assigned 'Clean living room'",
      type: "task_assigned",
      read: false,
      createdAt: new Date(today.getTime() - 3600000),
    };

    this.notifications.set(notification1.id, notification1);
    this.notifications.set(notification2.id, notification2);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      avatarUrl: insertUser.avatarUrl || null,
      language: insertUser.language || "en",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLanguage(id: string, language: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updated = { ...user, language: language as User["language"] };
      this.users.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getMaids(): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.role === "maid");
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.createdBy === userId)
      .sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.assignedTo === assigneeId)
      .sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask & { createdBy: string }): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      id,
      title: insertTask.title,
      description: insertTask.description || null,
      status: insertTask.status || "pending",
      priority: insertTask.priority || "medium",
      assignedTo: insertTask.assignedTo || null,
      createdBy: insertTask.createdBy,
      deadline: insertTask.deadline || null,
      completedAt: null,
      photoEvidence: null,
      notes: insertTask.notes || null,
    };
    this.tasks.set(id, task);

    if (task.assignedTo) {
      await this.createNotification({
        userId: task.assignedTo,
        title: "New Task Assigned",
        message: `You have been assigned '${task.title}'`,
        type: "task_assigned",
        read: false,
        createdAt: new Date(),
      });
    }

    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      const updated = { ...task, ...updates };
      this.tasks.set(id, updated);

      if (updates.status === "completed" && task.status !== "completed") {
        const owner = Array.from(this.users.values()).find((u) => u.role === "owner");
        if (owner) {
          await this.createNotification({
            userId: owner.id,
            title: "Task Completed",
            message: `'${task.title}' has been marked as completed`,
            type: "task_completed",
            read: false,
            createdAt: new Date(),
          });
        }
      }

      return updated;
    }
    return undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      id,
      userId: insertNotification.userId,
      title: insertNotification.title,
      message: insertNotification.message,
      type: insertNotification.type,
      read: insertNotification.read ?? false,
      createdAt: insertNotification.createdAt || new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      const updated = { ...notification, read: true };
      this.notifications.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    for (const [id, notification] of this.notifications) {
      if (notification.userId === userId) {
        this.notifications.set(id, { ...notification, read: true });
      }
    }
  }
}

export const storage = new MemStorage();
