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
      // Criar nova pool de conexões para forçar dados atuais
      const { Pool } = await import('pg');
      const freshPool = new Pool({
        connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
        ssl: false,
      });
      
      console.log(`🔧 Executando query com nova pool para: ${email}`);
      
      const result = await freshPool.query(
        'SELECT id, email, name, password, role, is_active, alert_level, failed_login_attempts, locked_until, reset_token, reset_token_expires, last_login, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );
      
      await freshPool.end();
      
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
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (updateData.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }
    if (updateData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updateData.email);
    }
    if (updateData.role) {
      fields.push(`role = $${paramCount++}`);
      values.push(updateData.role);
    }
    if (updateData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.isActive);
    }
    if (updateData.alertLevel) {
      fields.push(`alert_level = $${paramCount++}`);
      values.push(updateData.alertLevel);
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await pool.query(`
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    await pool.end();
    return result.rows[0] || undefined;
  }

  async getUsers(): Promise<User[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT id, email, name, password, role, is_active, alert_level, 
             failed_login_attempts, locked_until, reset_token, reset_token_expires, 
             last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    await pool.end();
    return result.rows;
  }

  async getFacialRecognizedUsers(): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.is_active as "isActive", u.created_at as "createdAt"
      FROM users u
      INNER JOIN access_logs al ON u.id::text = al.user_id::text
      WHERE al.method = 'facial_recognition'
      ORDER BY u.created_at DESC
      LIMIT 10
    `);
    
    await pool.end();
    return result.rows;
  }

  // Client methods (clientes das lavanderias)
  async getClients(): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT c.*, s.name as store_name
      FROM clients c
      LEFT JOIN stores s ON c.store_id = s.id
      ORDER BY c.created_at DESC
    `);
    
    await pool.end();
    return result.rows;
  }

  async getClientsByStore(storeId: number): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT * FROM clients 
      WHERE store_id = $1
      ORDER BY created_at DESC
    `, [storeId]);
    
    await pool.end();
    return result.rows;
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
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT d.*, s.name as store_name, s.address as store_address
      FROM devices d
      LEFT JOIN stores s ON d.store_id = s.id
      ORDER BY d.created_at DESC
    `);
    
    await pool.end();
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      deviceId: row.device_id,
      storeId: row.store_id,
      status: row.status,
      ipAddress: row.ip_address,
      lastSeen: row.last_seen,
      firmwareVersion: row.firmware_version,
      location: row.location,
      biometria: row.biometria,
      lastPing: row.last_ping,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      store: row.store_name ? {
        id: row.store_id,
        name: row.store_name,
        address: row.store_address
      } : undefined,
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

  async getStores(): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT * FROM stores 
      ORDER BY created_at DESC
    `);
    
    await pool.end();
    
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name || row.nome_loja,
      address: row.address || row.endereco,
      phone: row.phone,
      city: row.city || row.cidade,
      state: row.state || row.estado,
      zipCode: row.zip_code,
      managerName: row.manager_name || row.manager,
      openingHours: row.opening_hours,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,

      nomeLoja: row.nome_loja,
      nomeIa: row.nome_ia,
      nvLoja: row.nv_loja,
      endereco: row.endereco,
      senhaPorta: row.senha_porta,
      senhaWifi: row.senha_wifi,
      horarioSegSex: row.horario_seg_sex,
      horarioSabado: row.horario_sabado,
      horarioDom: row.horario_dom,
      whatsAtendimento: row.whats_atendimento,
      pontoReferencia: row.ponto_referencia,
      valorLv: row.valor_lv,
      valorS: row.valor_s,
      cestoGrande: row.cesto_grande,
      valorLv2: row.valor_lv2,
      valorS2: row.valor_s2,
      estacionamento: row.estacionamento,
      delivery: row.delivery,
      deixou: row.deixou,
      assistente: row.assistente,
      cashBack: row.cash_back,
      cupons: row.cupons,
      promocao: row.promocao,
      data: row.data,
      instanciaLoja: row.instancia_loja,
      lvsNumero: row.lvs_numero,
      s2Numero: row.s2_numero,
      observacaoTentativasSolucao: row.observacao_tentativas_solucao,
      observacoes: row.observacoes,
      cidadeVps: row.cidade,
      estadoVps: row.estado,
      latitude: row.latitude,
      longitude: row.longitude,
      numero: row.numero,
      ordem: row.ordem,
      voz: row.voz,
      msgIni: row.msg_ini,
      biometria: row.biometria,
      userId: row.user_id,
      manager: row.manager,
    }));
  }

  async getStoresByUser(userId: number): Promise<Store[]> {
    return await db
      .select()
      .from(stores)
      .where(eq(stores.userId, userId))
      .orderBy(desc(stores.createdAt));
  }

  async updateDeviceStatus(deviceId: string, status: string, lastPing?: Date): Promise<void> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    await pool.query(`
      UPDATE devices 
      SET status = $1, last_ping = $2, updated_at = NOW()
      WHERE device_id = $3
    `, [status, lastPing || new Date(), deviceId]);
    
    await pool.end();
  }

  async createAccessLog(insertLog: InsertAccessLog): Promise<AccessLog> {
    const [log] = await db
      .insert(accessLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getAccessLogs(limit = 50): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT al.id, al.user_id, al.client_id, al.device_id, al.store_id,
             al.access_type, al.method, al.success, al.details, al.created_at,
             al.action, al.status, al.timestamp,
             u.name as user_name, u.email as user_email,
             c.name as client_name,
             d.name as device_name
      FROM access_logs al
      LEFT JOIN users u ON al.user_id::text = u.id::text
      LEFT JOIN clients c ON al.client_id = c.id
      LEFT JOIN devices d ON al.device_id = d.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [limit]);
    
    await pool.end();
    return result.rows;
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
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT a.*, d.name as device_name, d.location as device_location
      FROM alerts a
      LEFT JOIN devices d ON a.device_id = d.id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
    `);
    
    await pool.end();
    
    return result.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      deviceId: row.device_id,
      title: row.title,
      message: row.message,
      type: row.type,
      status: row.status,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
      device: row.device_name ? {
        id: row.device_id,
        name: row.device_name,
        location: row.device_location
      } : undefined,
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
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all stats in one query
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM devices WHERE status = 'online') as active_devices,
        (SELECT COUNT(*) FROM access_logs WHERE created_at >= $1 AND success = true) as today_access,
        (SELECT COUNT(*) FROM alerts WHERE status = 'active') as active_alerts
    `, [today]);

    await pool.end();

    const row = result.rows[0];
    return {
      totalUsers: parseInt(row.total_users),
      activeDevices: parseInt(row.active_devices),
      todayAccess: parseInt(row.today_access),
      activeAlerts: parseInt(row.active_alerts),
    };
  }

  async getTrafficChart(): Promise<Array<{ date: string; count: number; }>> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });

    const result = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM access_logs
      WHERE success = true 
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    await pool.end();
    
    return result.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count)
    }));
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
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });

    // Total stores
    const totalStoresResult = await pool.query(`
      SELECT COUNT(*) as count FROM stores WHERE is_active = true
    `);

    // Online stores (stores with online devices)
    const onlineStoresResult = await pool.query(`
      SELECT COUNT(DISTINCT s.id) as count 
      FROM stores s
      LEFT JOIN devices d ON s.id = d.store_id
      WHERE s.is_active = true AND d.status = 'online'
    `);


    
    const totalAccessResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM access_logs 
      WHERE success = true AND created_at >= $1
    `, [today]);

    // Active devices
    const activeDevicesResult = await pool.query(`
      SELECT COUNT(*) as count FROM devices WHERE status = 'online'
    `);

    await pool.end();

    return {
      totalStores: parseInt(totalStoresResult.rows[0].count),
      onlineStores: parseInt(onlineStoresResult.rows[0].count),
      totalAccess: parseInt(totalAccessResult.rows[0].count),
      activeDevices: parseInt(activeDevicesResult.rows[0].count),
    };
  }

  async getAvailableDevices(): Promise<Device[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    const result = await pool.query(`
      SELECT d.*
      FROM devices d
      LEFT JOIN stores s ON d.device_id = s.biometria
      WHERE s.biometria IS NULL
      ORDER BY d.created_at DESC
    `);
    
    await pool.end();
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      deviceId: row.device_id,
      storeId: row.store_id,
      status: row.status,
      ipAddress: row.ip_address,
      lastSeen: row.last_seen,
      firmwareVersion: row.firmware_version,
      location: row.location,
      biometria: row.biometria,
      lastPing: row.last_ping,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getWaveChartData(): Promise<{ time: string; value: number }[]> {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
        ssl: false,
      });
      
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await pool.query(`
        SELECT created_at as timestamp
        FROM access_logs 
        WHERE created_at >= $1 AND success = true
        ORDER BY created_at
      `, [twentyFourHoursAgo]);
      
      await pool.end();
      
      // Group by hour and count
      const hourlyData = result.rows.reduce((acc: Record<string, number>, log: any) => {
        if (!log.timestamp) return acc;
        
        const hour = new Date(log.timestamp).getHours();
        const key = `${hour.toString().padStart(2, '0')}:00`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Fill in missing hours with 0
      const chartData = [];
      for (let i = 0; i < 24; i++) {
        const key = `${i.toString().padStart(2, '0')}:00`;
        chartData.push({
          time: key,
          value: hourlyData[key] || 0,
        });
      }

      return chartData;
    } catch (error) {
      console.error('Error in getWaveChartData:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
