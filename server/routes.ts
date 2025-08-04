import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mqttService } from "./mqtt";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema, insertDeviceSchema } from "@shared/schema";

// JWT middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Store routes
  app.get("/api/stores", authenticateToken, async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stores" });
    }
  });

  app.post("/api/stores", authenticateToken, async (req, res) => {
    try {
      const store = await storage.createStore(req.body);
      res.status(201).json(store);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create store" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  app.get("/api/dashboard/traffic-chart", authenticateToken, async (req, res) => {
    try {
      const chartData = await storage.getTrafficChart();
      res.json(chartData);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch traffic chart" });
    }
  });

  // Users routes
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // Buscar usuários reconhecidos pelo reconhecimento facial
  app.get("/api/users/facial-recognized", authenticateToken, async (req, res) => {
    try {
      const recognizedUsers = await storage.getFacialRecognizedUsers();
      res.json(recognizedUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch facial recognized users" });
    }
  });

  app.post("/api/users", authenticateToken, async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
      });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  // Devices routes
  app.get("/api/devices", authenticateToken, async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch devices" });
    }
  });

  app.post("/api/devices", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(validatedData);
      res.json(device);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create device" });
    }
  });

  app.post("/api/devices/:deviceId/command", authenticateToken, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { command, data } = req.body;

      // Find device
      const device = await storage.getDeviceByDeviceId(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Send MQTT command
      const success = mqttService.sendCommand(deviceId, command, data);
      if (!success) {
        return res.status(500).json({ message: "Failed to send command" });
      }

      // Log the command
      await storage.createAccessLog({
        userId: (req as any).user.id,
        deviceId: device.id,
        action: "device_command",
        method: "manual",
        status: "success",
      });

      res.json({ message: "Command sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to send command" });
    }
  });

  // Access logs routes
  app.get("/api/access-logs", authenticateToken, async (req, res) => {
    try {
      const logs = await storage.getAccessLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch access logs" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/resolve", authenticateToken, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      await storage.resolveAlert(alertId);
      res.json({ message: "Alert resolved" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to resolve alert" });
    }
  });

  // Setup MQTT device status updates
  mqttService.subscribeToDeviceUpdates(async (deviceId, status) => {
    try {
      await storage.updateDeviceStatus(deviceId, status.online ? "online" : "offline");
      
      // Create alert if device goes offline
      if (!status.online) {
        const device = await storage.getDeviceByDeviceId(deviceId);
        if (device) {
          await storage.createAlert({
            type: "device_offline",
            title: "Dispositivo Offline",
            message: `${device.name} (${deviceId}) está sem conexão`,
            deviceId: device.id,
          });
        }
      }
    } catch (error) {
      console.error("Error handling device status update:", error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
