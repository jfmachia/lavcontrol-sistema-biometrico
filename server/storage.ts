import { 
  users, stores, devices, accessLogs, alerts,
  type User, type InsertUser, type Store, type InsertStore, type Device, type InsertDevice,
  type AccessLog, type InsertAccessLog, type Alert, type InsertAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getFacialRecognizedUsers(): Promise<Pick<User, 'id' | 'name' | 'email' | 'isActive' | 'createdAt'>[]>;
  
  // Authentication
  authenticateUser(email: string, password: string): Promise<User | null>;
  updateLastLogin(id: number): Promise<void>;
  increaseFailedAttempts(email: string): Promise<void>;
  resetFailedAttempts(email: string): Promise<void>;
  lockUser(email: string, lockUntil: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  updateResetToken(email: string, token: string | null, expires?: Date | null): Promise<void>;
  updatePassword(id: number, hashedPassword: string): Promise<void>;
  
  // Stores
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined>;
  getStores(): Promise<Store[]>;
  getStoresByUser(userId: number): Promise<Store[]>;
  getStoreStatistics(): Promise<{
    totalStores: number;
    onlineStores: number;
    totalAccess: number;
    activeDevices: number;
  }>;

  // Devices
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  getDevices(): Promise<(Device & { store?: Store })[]>;
  getAvailableDevices(): Promise<Device[]>;
  getAllDevices(): Promise<Device[]>;
  deleteDevice(id: number): Promise<void>;
  updateDeviceStatus(deviceId: string, status: string, lastPing?: Date): Promise<void>;
  
  // Access Logs
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(limit?: number): Promise<(AccessLog & { user?: User; device?: Device })[]>;
  getAccessLogsByDevice(deviceId: number, limit?: number): Promise<AccessLog[]>;
  getAccessLogsByUser(userId: number, limit?: number): Promise<AccessLog[]>;
  
  // Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getActiveAlerts(): Promise<(Alert & { device?: Device })[]>;
  resolveAlert(id: number): Promise<void>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeDevices: number;
    todayAccess: number;
    activeAlerts: number;
  }>;
  getTrafficChart(): Promise<Array<{
    date: string;
    count: number;
  }>>;
  getWaveChartData(): Promise<Array<{
    time: string;
    store_name: string;
    access_count: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log(`🔍 Buscando usuário por email: ${email}`);
    try {
      // Usar conexão direta do pool para contornar problemas de schema
      const { pool } = await import('./db');
      console.log(`🔧 Executando query direta no pool para: ${email}`);
      
      // Primeiro verificar todos os emails na tabela
      const allUsers = await pool.query('SELECT email FROM users LIMIT 10');
      console.log(`📋 Todos os emails no banco:`, allUsers.rows.map(r => r.email));
      
      const result = await pool.query(
        'SELECT id, email, name, password, role, is_active, alert_level, failed_login_attempts, locked_until, reset_token, reset_token_expires, last_login, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );
      
      console.log(`📊 Resultado da query:`, result.rows);
      console.log(`📊 Número de linhas retornadas:`, result.rows.length);
      
      if (result.rows.length === 0) {
        console.log(`👤 Usuário retornado: nenhum`);
        return undefined;
      }
      
      const row = result.rows[0];
      const user = {
        id: row.id,
        email: row.email,
        name: row.name,
        password: row.password,
        role: row.role,
        isActive: row.is_active,
        alertLevel: row.alert_level,
        failedLoginAttempts: row.failed_login_attempts,
        lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
        resetToken: row.reset_token,
        resetTokenExpires: row.reset_token_expires ? new Date(row.reset_token_expires) : null,
        lastLogin: row.last_login ? new Date(row.last_login) : null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
      
      console.log(`👤 Usuário retornado: ${user.name} (${user.email})`);
      return user;
    } catch (error) {
      console.log(`❌ Erro na query getUserByEmail:`, error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getFacialRecognizedUsers(): Promise<Pick<User, 'id' | 'name' | 'email' | 'isActive' | 'createdAt'>[]> {
    // Buscar usuários únicos que tiveram acesso reconhecido por reconhecimento facial
    const recognizedUsers = await db
      .selectDistinct({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(accessLogs, eq(users.id, accessLogs.userId))
      .where(eq(accessLogs.method, "facial_recognition"))
      .orderBy(desc(users.createdAt));

    return recognizedUsers;
  }

  // ===== AUTHENTICATION METHODS =====
  
  async authenticateUser(email: string, password: string): Promise<User | null> {
    console.log(`🔐 Tentativa de login para: ${email}`);
    
    const user = await this.getUserByEmail(email);
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return null;
    }
    
    console.log(`👤 Usuário encontrado: ${user.name} (ID: ${user.id}, Tipo ID: ${typeof user.id})`);
    console.log(`🔒 Status: active=${user.isActive}, locked=${user.lockedUntil}`);
    
    // Check if user is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      console.log(`🔒 Usuário bloqueado até: ${user.lockedUntil}`);
      return null;
    }
    
    // Check if user is active
    if (!user.isActive) {
      console.log(`⏸️ Usuário inativo: ${email}`);
      return null;
    }
    
    // Verify password
    if (!user.password) {
      console.log(`🔑 Senha não definida para usuário: ${email}`);
      return null;
    }
    
    console.log(`🔐 Verificando senha para: ${email}`);
    console.log(`🔑 Hash no banco: ${user.password.substring(0, 20)}...`);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`✅ Senha válida: ${isValidPassword}`);
    
    if (!isValidPassword) {
      await this.increaseFailedAttempts(email);
      return null;
    }
    
    // Reset failed attempts and update last login
    await this.resetFailedAttempts(email);
    await this.updateLastLogin(user.id);
    
    console.log(`✅ Login bem-sucedido para: ${email}`);
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async increaseFailedAttempts(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) return;
    
    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData: any = { failedLoginAttempts: newAttempts };
    
    // Lock account after 5 failed attempts for 15 minutes
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.email, email));
  }

  async resetFailedAttempts(email: string): Promise<void> {
    await db.update(users)
      .set({ 
        failedLoginAttempts: 0,
        lockedUntil: null
      })
      .where(eq(users.email, email));
  }

  async lockUser(email: string, lockUntil: Date): Promise<void> {
    await db.update(users)
      .set({ lockedUntil })
      .where(eq(users.email, email));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.resetToken, token));
    return user || undefined;
  }

  async updateResetToken(email: string, token: string | null, expires?: Date | null): Promise<void> {
    await db.update(users)
      .set({ 
        resetToken: token,
        resetTokenExpires: expires || null
      })
      .where(eq(users.email, email));
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({ 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device || undefined;
  }

  async getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.deviceId, deviceId));
    return device || undefined;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db
      .insert(devices)
      .values(insertDevice)
      .returning();
    return device;
  }

  async updateDevice(id: number, updateData: Partial<InsertDevice>): Promise<Device | undefined> {
    const [device] = await db
      .update(devices)
      .set(updateData)
      .where(eq(devices.id, id))
      .returning();
    return device || undefined;
  }

  async getDevices(): Promise<(Device & { store?: Store })[]> {
    const devicesData = await db
      .select()
      .from(devices)
      .leftJoin(stores, eq(devices.storeId, stores.id))
      .orderBy(desc(devices.createdAt));

    return devicesData.map(row => ({
      ...row.devices,
      store: row.stores || undefined,
    }));
  }

  async getAllDevices(): Promise<Device[]> {
    return await db.select().from(devices).orderBy(desc(devices.createdAt));
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  // Store methods
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db
      .insert(stores)
      .values(insertStore)
      .returning();
    return store;
  }

  async updateStore(id: number, updateData: Partial<InsertStore>): Promise<Store | undefined> {
    const [store] = await db
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, id))
      .returning();
    return store || undefined;
  }

  async getStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(desc(stores.createdAt));
  }

  async getStoresByUser(userId: number): Promise<Store[]> {
    return await db
      .select()
      .from(stores)
      .where(eq(stores.userId, userId))
      .orderBy(desc(stores.createdAt));
  }

  async updateDeviceStatus(deviceId: string, status: string, lastPing?: Date): Promise<void> {
    await db
      .update(devices)
      .set({ 
        status, 
        lastPing: lastPing || new Date() 
      })
      .where(eq(devices.deviceId, deviceId));
  }

  async createAccessLog(insertLog: InsertAccessLog): Promise<AccessLog> {
    const [log] = await db
      .insert(accessLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getAccessLogs(limit = 50): Promise<(AccessLog & { user?: User; device?: Device })[]> {
    const logs = await db
      .select()
      .from(accessLogs)
      .leftJoin(users, eq(accessLogs.userId, users.id))
      .leftJoin(devices, eq(accessLogs.deviceId, devices.id))
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);

    return logs.map(row => ({
      ...row.access_logs,
      user: row.users || undefined,
      device: row.devices || undefined,
    }));
  }

  async getAccessLogsByDevice(deviceId: number, limit = 50): Promise<AccessLog[]> {
    return await db
      .select()
      .from(accessLogs)
      .where(eq(accessLogs.deviceId, deviceId))
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);
  }

  async getAccessLogsByUser(userId: number, limit = 50): Promise<AccessLog[]> {
    return await db
      .select()
      .from(accessLogs)
      .where(eq(accessLogs.userId, userId))
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getActiveAlerts(): Promise<(Alert & { device?: Device })[]> {
    const alertsData = await db
      .select()
      .from(alerts)
      .leftJoin(devices, eq(alerts.deviceId, devices.id))
      .where(eq(alerts.isResolved, false))
      .orderBy(desc(alerts.createdAt));

    return alertsData.map(row => ({
      ...row.alerts,
      device: row.devices || undefined,
    }));
  }

  async resolveAlert(id: number): Promise<void> {
    await db
      .update(alerts)
      .set({ isResolved: true })
      .where(eq(alerts.id, id));
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeDevices: number;
    todayAccess: number;
    activeAlerts: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const [activeDevicesResult] = await db
      .select({ count: count() })
      .from(devices)
      .where(eq(devices.status, "online"));

    const [todayAccessResult] = await db
      .select({ count: count() })
      .from(accessLogs)
      .where(gte(accessLogs.timestamp, today));

    const [activeAlertsResult] = await db
      .select({ count: count() })
      .from(alerts)
      .where(eq(alerts.isResolved, false));

    return {
      totalUsers: totalUsersResult.count,
      activeDevices: activeDevicesResult.count,
      todayAccess: todayAccessResult.count,
      activeAlerts: activeAlertsResult.count,
    };
  }

  async getTrafficChart(): Promise<Array<{ date: string; count: number; }>> {
    // Buscar dados dos últimos 7 dias
    const result = await db
      .select({
        date: sql<string>`DATE(${accessLogs.timestamp}) as date`,
        count: count()
      })
      .from(accessLogs)
      .where(
        and(
          eq(accessLogs.status, "success"),
          gte(accessLogs.timestamp, sql`NOW() - INTERVAL '7 days'`)
        )
      )
      .groupBy(sql`DATE(${accessLogs.timestamp})`)
      .orderBy(sql`DATE(${accessLogs.timestamp})`);

    return result;
  }

  async getStoreStatistics(): Promise<{
    totalStores: number;
    onlineStores: number;
    totalAccess: number;
    activeDevices: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total stores
    const [totalStoresResult] = await db
      .select({ count: count() })
      .from(stores)
      .where(eq(stores.isActive, true));

    // Online stores (stores with online devices)
    const [onlineStoresResult] = await db
      .select({ count: count() })
      .from(stores)
      .leftJoin(devices, eq(stores.id, devices.storeId))
      .where(and(
        eq(stores.isActive, true),
        eq(devices.status, "online")
      ));

    // Total access logs today
    const [totalAccessResult] = await db
      .select({ count: count() })
      .from(accessLogs)
      .where(and(
        eq(accessLogs.status, "success"),
        gte(accessLogs.timestamp, today)
      ));

    // Active devices
    const [activeDevicesResult] = await db
      .select({ count: count() })
      .from(devices)
      .where(eq(devices.status, "online"));

    return {
      totalStores: totalStoresResult.count,
      onlineStores: onlineStoresResult.count,
      totalAccess: totalAccessResult.count,
      activeDevices: activeDevicesResult.count,
    };
  }

  async getAvailableDevices(): Promise<Device[]> {
    // Get devices that are not linked to any store's biometry field
    const linkedDeviceIds = await db
      .selectDistinct({ deviceId: stores.biometria })
      .from(stores)
      .where(sql`${stores.biometria} IS NOT NULL`);

    const linkedIds = linkedDeviceIds.map(row => row.deviceId).filter(Boolean);

    if (linkedIds.length === 0) {
      return await db.select().from(devices);
    }

    return await db
      .select()
      .from(devices)
      .where(sql`${devices.deviceId} NOT IN (${linkedIds.map(id => `'${id}'`).join(', ')})`);
  }

  async getWaveChartData(): Promise<Array<{
    time: string;
    store_name: string; 
    access_count: number;
  }>> {
    try {
      // Usar raw SQL para evitar problemas de sintaxe
      const result = await db.execute(sql`
        SELECT 
          DATE_TRUNC('hour', al.timestamp) as time,
          s.nome_loja as store_name,
          COUNT(*) as access_count
        FROM access_logs al
        LEFT JOIN devices d ON al.device_id = d.id
        LEFT JOIN stores s ON d.store_id = s.id  
        WHERE 
          al.status = 'success' 
          AND al.timestamp > NOW() - INTERVAL '24 hours'
          AND s.nome_loja IS NOT NULL
        GROUP BY DATE_TRUNC('hour', al.timestamp), s.nome_loja
        ORDER BY DATE_TRUNC('hour', al.timestamp), s.nome_loja
      `);

      return result.rows.map((row: any) => ({
        time: row.time,
        store_name: row.store_name,
        access_count: parseInt(row.access_count)
      }));
    } catch (error) {
      console.error('Error in getWaveChartData:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
