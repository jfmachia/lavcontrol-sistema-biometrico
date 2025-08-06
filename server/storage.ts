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

  async getDevice(id: number): Promise<any | undefined> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const result = await pool.query('SELECT * FROM devices WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Erro ao buscar device por ID:', error);
      return undefined;
    } finally {
      await pool.end();
    }
  }

  async getDeviceByDeviceId(deviceId: string): Promise<any | undefined> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const result = await pool.query(`
        SELECT * FROM devices 
        WHERE id = $1 OR device_serial = $1 OR serial = $1
        LIMIT 1
      `, [deviceId]);
      
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Erro ao buscar device por ID:', error);
      return undefined;
    } finally {
      await pool.end();
    }
  }

  async createDevice(deviceData: any): Promise<any> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const result = await pool.query(`
        INSERT INTO devices (name, type, status, store_id, location, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [
        deviceData.name,
        deviceData.type || 'facial',
        deviceData.status || 'offline',
        deviceData.storeId,
        deviceData.location
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar device:', error);
      throw error;
    } finally {
      await pool.end();
    }
  }

  async updateDevice(id: number, updateData: any): Promise<any | undefined> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (updateData.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(updateData.name);
      }
      if (updateData.type) {
        fields.push(`type = $${paramCount++}`);
        values.push(updateData.type);
      }
      if (updateData.status) {
        fields.push(`status = $${paramCount++}`);
        values.push(updateData.status);
      }
      if (updateData.storeId !== undefined) {
        fields.push(`store_id = $${paramCount++}`);
        values.push(updateData.storeId);
      }
      if (updateData.location) {
        fields.push(`location = $${paramCount++}`);
        values.push(updateData.location);
      }
      
      fields.push(`updated_at = NOW()`);
      values.push(id);
      
      const result = await pool.query(`
        UPDATE devices 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Erro ao atualizar device:', error);
      throw error;
    } finally {
      await pool.end();
    }
  }

  async getDevices(): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const result = await pool.query(`
        SELECT d.*, s.name as store_name, s.address as store_address
        FROM devices d
        LEFT JOIN stores s ON d.store_id = s.id
        ORDER BY d.id DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name || row.device_name,
        type: row.type || row.device_type,
        deviceId: row.device_serial || row.serial || row.id.toString(),
        storeId: row.store_id,
        status: row.status || 'offline',
        ipAddress: row.ip_address || row.ip,
        lastSeen: row.last_seen || row.updated_at,
        firmwareVersion: row.firmware_version || row.version,
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
      
    } catch (error) {
      console.error('Erro ao buscar devices:', error);
      return [];
    } finally {
      await pool.end();
    }
  }

  async getAllDevices(): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const result = await pool.query('SELECT * FROM devices ORDER BY id DESC');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar todos os devices:', error);
      return [];
    } finally {
      await pool.end();
    }
  }

  async deleteDevice(id: number): Promise<void> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      await pool.query('DELETE FROM devices WHERE id = $1', [id]);
    } catch (error) {
      console.error('Erro ao deletar device:', error);
      throw error;
    } finally {
      await pool.end();
    }
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

  async updateStore(id: number, updateData: any): Promise<any | undefined> {
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
    if (updateData.nomeLoja) {
      fields.push(`nome_loja = $${paramCount++}`);
      values.push(updateData.nomeLoja);
    }
    if (updateData.address) {
      fields.push(`address = $${paramCount++}`);
      values.push(updateData.address);
    }
    if (updateData.endereco) {
      fields.push(`endereco = $${paramCount++}`);
      values.push(updateData.endereco);
    }
    if (updateData.phone) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updateData.phone);
    }
    if (updateData.manager) {
      fields.push(`manager = $${paramCount++}`);
      values.push(updateData.manager);
    }
    if (updateData.managerName) {
      fields.push(`manager_name = $${paramCount++}`);
      values.push(updateData.managerName);
    }
    if (updateData.horarioSegSex) {
      fields.push(`horario_seg_sex = $${paramCount++}`);
      values.push(updateData.horarioSegSex);
    }
    if (updateData.horarioSabado) {
      fields.push(`horario_sabado = $${paramCount++}`);
      values.push(updateData.horarioSabado);
    }
    if (updateData.horarioDom) {
      fields.push(`horario_dom = $${paramCount++}`);
      values.push(updateData.horarioDom);
    }
    if (updateData.whatsAtendimento) {
      fields.push(`whats_atendimento = $${paramCount++}`);
      values.push(updateData.whatsAtendimento);
    }
    if (updateData.valorLv || updateData.valor_lv) {
      fields.push(`valor_lv = $${paramCount++}`);
      values.push(updateData.valorLv || updateData.valor_lv);
    }
    if (updateData.valorS || updateData.valor_s) {
      fields.push(`valor_s = $${paramCount++}`);
      values.push(updateData.valorS || updateData.valor_s);
    }
    if (updateData.valorLv2 || updateData.valor_lv2) {
      fields.push(`valor_lv2 = $${paramCount++}`);
      values.push(updateData.valorLv2 || updateData.valor_lv2);
    }
    if (updateData.valorS2 || updateData.valor_s2) {
      fields.push(`valor_s2 = $${paramCount++}`);
      values.push(updateData.valorS2 || updateData.valor_s2);
    }
    if (updateData.biometria) {
      fields.push(`biometria = $${paramCount++}`);
      values.push(updateData.biometria);
    }
    if (updateData.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.isActive);
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await pool.query(`
      UPDATE stores 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    await pool.end();
    return result.rows[0] || undefined;
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
    
    try {
      // Verificar estrutura da tabela devices
      const columnsResult = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'devices'
      `);
      
      const columns = columnsResult.rows.map(r => r.column_name);
      
      // Usar id se device_id não existir
      const deviceColumn = columns.includes('device_id') ? 'device_id' : 'id';
      
      // Verificar se last_ping existe na tabela
      const hasPingColumn = columns.includes('last_ping');
      
      if (hasPingColumn) {
        await pool.query(`
          UPDATE devices 
          SET status = $1, last_ping = $2, updated_at = NOW()
          WHERE ${deviceColumn} = $3
        `, [status, lastPing || new Date(), deviceId]);
      } else {
        await pool.query(`
          UPDATE devices 
          SET status = $1, updated_at = NOW()
          WHERE ${deviceColumn} = $3
        `, [status, deviceId]);
      }
      
    } catch (error) {
      console.error('Error handling device status update:', error);
    } finally {
      await pool.end();
    }
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
    
    try {
      // Primeiro vamos descobrir qual tabela usar
      const tablesResult = await pool.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('access_logs', 'client_entries', 'entries')
      `);
      
      if (tablesResult.rows.length === 0) {
        return [];
      }
      
      const tableName = tablesResult.rows[0].table_name;
      
      // Agora vamos descobrir as colunas da tabela
      const columnsResult = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      const columns = columnsResult.rows.map(r => r.column_name);
      
      // Query básica adaptativa
      let query = `SELECT * FROM ${tableName} ORDER BY `;
      
      if (columns.includes('created_at')) {
        query += 'created_at DESC';
      } else if (columns.includes('timestamp')) {
        query += 'timestamp DESC';
      } else {
        query += 'id DESC';
      }
      
      query += ' LIMIT $1';
      
      const result = await pool.query(query, [limit]);
      return result.rows;
      
    } catch (error) {
      console.error('Erro ao buscar logs de acesso:', error);
      return [];
    } finally {
      await pool.end();
    }
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
    
    try {
      const result = await pool.query(`
        SELECT a.*, d.name as device_name, d.location as device_location
        FROM alerts a
        LEFT JOIN devices d ON a.device_id = d.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
      `);
      
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
      
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    } finally {
      await pool.end();
    }
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

  async getAvailableDevices(): Promise<any[]> {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
    
    try {
      const result = await pool.query(`
        SELECT d.*
        FROM devices d
        WHERE d.store_id IS NULL
        ORDER BY d.id DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name || `Device ${row.id}`,
        type: row.type || 'facial',
        deviceId: row.device_serial || row.serial || row.id.toString(),
        storeId: row.store_id,
        status: row.status || 'offline',
        ipAddress: row.ip_address || row.ip,
        lastSeen: row.last_seen || row.updated_at,
        firmwareVersion: row.firmware_version || row.version,
        location: row.location,
        biometria: row.biometria,
        lastPing: row.last_ping,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      
    } catch (error) {
      console.error('Erro ao buscar devices disponíveis:', error);
      return [];
    } finally {
      await pool.end();
    }
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
