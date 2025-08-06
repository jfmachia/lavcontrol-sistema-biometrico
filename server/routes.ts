import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { mqttService } from "./mqtt";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema, insertDeviceSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "@shared/schema";
import crypto from "crypto";
import nodemailer from "nodemailer";

// WebSocket clients storage
const wsClients = new Set<WebSocket>();

// Broadcast real-time updates to all connected clients
export function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

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
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Authenticate user with enhanced security
      const user = await storage.authenticateUser(validatedData.email, validatedData.password);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas ou conta bloqueada" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role,
          alertLevel: user.alertLevel
        } 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Falha no login" });
    }
  });

  // Forgot password route
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "Se o email existir, você receberá instruções para redefinir a senha" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      
      await storage.updateResetToken(validatedData.email, resetToken, resetTokenExpires);
      
      // In a real app, you would send an email here
      // For now, we'll just return the token for testing
      console.log(`Reset token for ${validatedData.email}: ${resetToken}`);
      
      res.json({ message: "Se o email existir, você receberá instruções para redefinir a senha" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao processar solicitação" });
    }
  });

  // Reset password route
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByResetToken(validatedData.token);
      if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      
      // Update password and clear reset token
      await storage.updatePassword(user.id, hashedPassword);
      
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao redefinir senha" });
    }
  });

  // Change password route (requires authentication)
  app.post("/api/auth/change-password", authenticateToken, async (req: any, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12);
      
      // Update password
      await storage.updatePassword(user.id, hashedNewPassword);
      
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao alterar senha" });
    }
  });

  // Get current user (requires authentication)
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        alertLevel: user.alertLevel,
        lastLogin: user.lastLogin
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Erro ao buscar usuário" });
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

  // Update store
  app.put("/api/stores/:id", authenticateToken, async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const updatedStore = await storage.updateStore(storeId, req.body);
      res.json(updatedStore);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update store" });
    }
  });

  // Store statistics for dashboard
  app.get("/api/stores/statistics", authenticateToken, async (req, res) => {
    try {
      const statistics = await storage.getStoreStatistics();
      res.json(statistics);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch store statistics" });
    }
  });

  // Device routes
  app.get("/api/devices", authenticateToken, async (req, res) => {
    try {
      const devices = await storage.getAllDevices();
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch devices" });
    }
  });

  app.post("/api/devices", authenticateToken, async (req, res) => {
    try {
      const { name, deviceId, storeId } = req.body;
      
      if (!name || !deviceId || !storeId) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      const device = await storage.createDevice({
        name,
        deviceId,
        storeId: parseInt(storeId),
        status: "offline"
      });
      
      res.json(device);
    } catch (error: any) {
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Erro ao cadastrar dispositivo" });
    }
  });

  app.delete("/api/devices/:id", authenticateToken, async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      await storage.deleteDevice(deviceId);
      res.json({ message: "Dispositivo removido com sucesso" });
    } catch (error: any) {
      console.error("Error deleting device:", error);
      res.status(500).json({ message: "Erro ao remover dispositivo" });
    }
  });

  // Available devices for linking to stores
  app.get("/api/devices/available", authenticateToken, async (req, res) => {
    try {
      const availableDevices = await storage.getAvailableDevices();
      res.json(availableDevices);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch available devices" });
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

  // Wave chart data - dados para gráfico em ondas por loja
  app.get("/api/dashboard/wave-chart", authenticateToken, async (req, res) => {
    try {
      const waveData = await storage.getWaveChartData();
      res.json(waveData);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch wave chart data" });
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

  // Endpoint para atualizar usuário
  app.patch("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, isBlocked, alertLevel, isActive } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        name,
        email,
        isBlocked,
        alertLevel,
        isActive,
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });

  app.post("/api/users", authenticateToken, async (req, res) => {
    try {
      const { name, email, password, role, alertLevel, storeId } = req.body;
      
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
        role: role || 'cliente',
        alertLevel: alertLevel || 'normal'
      });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        alertLevel: user.alertLevel,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, alertLevel, isBlocked, isActive } = req.body;
      
      // Mapeamento de camelCase para o schema do banco
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (alertLevel !== undefined) updateData.alertLevel = alertLevel;
      if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      console.log('Updating user', userId, 'with data:', updateData);
      const updatedUser = await storage.updateUser(userId, updateData);
      console.log('Updated user result:', updatedUser);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: error.message || "Failed to update user" });
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

  // Stores routes
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
      const { name, address, phone, manager, biometry, isActive } = req.body;
      const store = await storage.createStore({
        name,
        address,
        phone,
        manager,
        biometria: biometry,
        isActive: isActive !== false,
        userId: (req as any).user.id
      });
      res.json(store);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create store" });
    }
  });

  app.post("/api/devices", authenticateToken, async (req, res) => {
    try {
      const { name, deviceId, location, storeId, status } = req.body;
      const device = await storage.createDevice({
        name,
        deviceId,
        storeId,
        status: status || 'offline'
      });
      res.json(device);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id", authenticateToken, async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedDevice = await storage.updateDevice(deviceId, updateData);
      res.json(updatedDevice);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update device" });
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
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);

    // Send initial connection message
    ws.send(JSON.stringify({ 
      type: 'connected', 
      message: 'Real-time updates enabled',
      timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  // API endpoint para simular entrada de usuário na loja
  app.post("/api/simulate/user-entry", async (req, res) => {
    try {
      const { storeId, userId } = req.body;
      
      // Verificar se loja e usuário existem
      const store = await storage.getStore(storeId);
      const user = await storage.getUser(userId);
      
      if (!store || !user) {
        return res.status(404).json({ message: "Loja ou usuário não encontrado" });
      }

      // Simular entrada criando um log de acesso
      await storage.createAccessLog({
        userId: userId,
        deviceId: null, // Entrada simulada
        action: "entry_simulated",
        method: "simulation",
        status: "success"
      });

      // Broadcast atualização em tempo real
      const accessData = await storage.getWaveChartData();
      broadcastUpdate('access-update', accessData);
      
      res.json({ 
        message: `Entrada simulada para ${user.name} na ${store.nome_loja}`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Erro ao simular entrada" });
    }
  });

  // Simular entradas automáticas para demonstração (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    let simulationCounter = 0;
    setInterval(async () => {
      try {
        simulationCounter++;
        // Simular entrada a cada 30 segundos com diferentes usuários/lojas
        const stores = await storage.getStores();
        const users = await storage.getUsers();
        
        if (stores.length > 0 && users.length > 0) {
          const randomStore = stores[simulationCounter % stores.length];
          const randomUser = users[simulationCounter % users.length];
          
          // Criar log de acesso simulado
          await storage.createAccessLog({
            userId: randomUser.id,
            deviceId: null,
            action: "entry_auto_simulated",
            method: "auto_simulation",
            status: "success"
          });

          // Broadcast atualização
          const accessData = await storage.getWaveChartData();
          broadcastUpdate('access-update', accessData);
          
          console.log(`🔄 Entrada simulada: ${randomUser.name} → ${randomStore.nome_loja}`);
        }
      } catch (error) {
        console.error('Erro na simulação automática:', error);
      }
    }, 30000); // A cada 30 segundos
  }

  return httpServer;
}
