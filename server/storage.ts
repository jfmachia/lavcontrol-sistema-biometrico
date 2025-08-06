import { 
  users, stores, devices, accessLogs, alerts,
  type User, type InsertUser, type Store, type InsertStore, type Device, type InsertDevice,
  type AccessLog, type InsertAccessLog, type Alert, type InsertAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getFacialRecognizedUsers(): Promise<Pick<User, 'id' | 'name' | 'email' | 'isActive' | 'createdAt'>[]>;
  
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
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
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
      .selectDistinct({ deviceId: stores.biometry })
      .from(stores)
      .where(sql`${stores.biometry} IS NOT NULL`);

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
    // Buscar dados das últimas 24 horas agrupados por hora e loja
    const result = await db
      .select({
        time: sql<string>`DATE_TRUNC('hour', ${accessLogs.timestamp}) as time`,
        store_name: sql<string>`COALESCE(${stores.name}, ${stores.nomeLoja}) as store_name`,
        access_count: count()
      })
      .from(accessLogs)
      .leftJoin(devices, eq(accessLogs.deviceId, devices.id))
      .leftJoin(stores, eq(devices.storeId, stores.id))
      .where(
        and(
          eq(accessLogs.status, "success"),
          gte(accessLogs.timestamp, sql`NOW() - INTERVAL '24 hours'`),
          sql`(${stores.name} IS NOT NULL OR ${stores.nomeLoja} IS NOT NULL)`
        )
      )
      .groupBy(sql`DATE_TRUNC('hour', ${accessLogs.timestamp})`, sql`COALESCE(${stores.name}, ${stores.nomeLoja})`)
      .orderBy(sql`DATE_TRUNC('hour', ${accessLogs.timestamp})`, sql`COALESCE(${stores.name}, ${stores.nomeLoja})`);

    return result;
  }
}

export const storage = new DatabaseStorage();
