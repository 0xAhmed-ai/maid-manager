import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().nullable().optional(),
  deadline: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  photoEvidence: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.string().nullable().optional(),
  deadline: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const languageSchema = z.object({
  language: z.enum(["en", "ar", "hi", "id", "fil", "ur", "tw", "am"]),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username: data.username,
        password: data.password,
        name: data.name,
        role: data.role,
        language: "en",
        avatarUrl: null,
      });

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation failed" });
      }
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      if (user.password !== data.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      if (user.role !== data.role) {
        return res.status(401).json({ message: `This account is registered as ${user.role}` });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation failed" });
      }
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user: { ...user, password: undefined } });
  });

  app.get("/api/users/maids", async (req, res) => {
    const maids = await storage.getMaids();
    res.json(maids.map((m) => ({ ...m, password: undefined })));
  });

  app.patch("/api/users/language", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { language } = languageSchema.parse(req.body);
      
      const user = await storage.updateUserLanguage(req.session.userId, language);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ language: user.language });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid language" });
      }
      res.status(400).json({ message: error.message || "Failed to update language" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    let tasks;
    if (user.role === "owner") {
      tasks = await storage.getTasks();
    } else {
      tasks = await storage.getTasksByAssignee(user.id);
    }

    res.json(tasks);
  });

  app.get("/api/tasks/my", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const tasks = await storage.getTasksByAssignee(req.session.userId);
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const task = await storage.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "owner") {
      return res.status(403).json({ message: "Only owners can create tasks" });
    }

    try {
      const validatedData = createTaskSchema.parse(req.body);
      
      const task = await storage.createTask({
        ...validatedData,
        createdBy: req.session.userId,
      });
      res.json(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation failed" });
      }
      res.status(400).json({ message: error.message || "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const task = await storage.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role === "maid" && task.assignedTo !== user.id) {
      return res.status(403).json({ message: "Cannot update this task" });
    }

    try {
      const validatedData = updateTaskSchema.parse(req.body);
      
      const allowedMaidUpdates = ["status", "notes", "photoEvidence", "completedAt"];
      let updates = validatedData;

      if (user.role === "maid") {
        updates = Object.keys(updates)
          .filter((key) => allowedMaidUpdates.includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: (updates as any)[key] }), {});
      }

      const updated = await storage.updateTask(req.params.id, updates);
      if (!updated) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Validation failed" });
      }
      res.status(400).json({ message: error.message || "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "owner") {
      return res.status(403).json({ message: "Only owners can delete tasks" });
    }

    const deleted = await storage.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  });

  app.get("/api/notifications", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const notifications = await storage.getNotifications(req.session.userId);
    res.json(notifications);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const notification = await storage.markNotificationRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    await storage.markAllNotificationsRead(req.session.userId);
    res.json({ message: "All notifications marked as read" });
  });

  return httpServer;
}
