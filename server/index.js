var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accessLogs: () => accessLogs,
  accessLogsRelations: () => accessLogsRelations,
  alerts: () => alerts,
  alertsRelations: () => alertsRelations,
  changePasswordSchema: () => changePasswordSchema,
  clientEntries: () => clientEntries,
  clientEntriesRelations: () => clientEntriesRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  configSistema: () => configSistema,
  devices: () => devices,
  devicesRelations: () => devicesRelations,
  forgotPasswordSchema: () => forgotPasswordSchema,
  insertAccessLogSchema: () => insertAccessLogSchema,
  insertAlertSchema: () => insertAlertSchema,
  insertClientEntrySchema: () => insertClientEntrySchema,
  insertClientSchema: () => insertClientSchema,
  insertConfigSistemaSchema: () => insertConfigSistemaSchema,
  insertDeviceSchema: () => insertDeviceSchema,
  insertStoreSchema: () => insertStoreSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
  resetPasswordSchema: () => resetPasswordSchema,
  stores: () => stores,
  storesRelations: () => storesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  name: varchar("name"),
  password: varchar("password"),
  role: varchar("role").default("utilizador"),
  isActive: boolean("is_active").default(true),
  alertLevel: varchar("alert_level").default("verde"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  resetToken: varchar("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`NOW()`),
  updatedAt: timestamp("updated_at").default(sql`NOW()`)
});
var stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  address: varchar("address"),
  phone: varchar("phone"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  managerName: varchar("manager_name"),
  openingHours: text("opening_hours"),
  // jsonb no banco mas text no código
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  // Campos específicos do banco VPS
  loja: varchar("loja"),
  nomeLoja: varchar("nome_loja"),
  nomeIa: varchar("nome_ia"),
  nvLoja: varchar("nv_loja"),
  endereco: text("endereco"),
  senhaPorta: varchar("senha_porta"),
  senhaWifi: varchar("senha_wifi"),
  horarioSegSex: varchar("horario_seg_sex"),
  horarioSabado: varchar("horario_sabado"),
  horarioDom: varchar("horario_dom"),
  whatsAtendimento: varchar("whats_atendimento"),
  pontoReferencia: text("ponto_referencia"),
  valorLv: varchar("valor_lv"),
  valorS: varchar("valor_s"),
  cestoGrande: varchar("cesto_grande"),
  valorLv2: varchar("valor_lv2"),
  valorS2: varchar("valor_s2"),
  estacionamento: boolean("estacionamento").default(false),
  delivery: boolean("delivery").default(false),
  deixou: boolean("deixou").default(false),
  assistente: varchar("assistente"),
  cashBack: varchar("cash_back"),
  cupons: varchar("cupons"),
  promocao: text("promocao"),
  data: timestamp("data"),
  instanciaLoja: varchar("instancia_loja"),
  lvsNumero: varchar("lvs_numero"),
  s2Numero: varchar("s2_numero"),
  observacaoTentativasSolucao: text("observacao_tentativas_solucao"),
  observacoes: text("observacoes"),
  cidadeVps: varchar("cidade"),
  estadoVps: varchar("estado"),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  numero: varchar("numero"),
  ordem: varchar("ordem"),
  voz: text("voz"),
  msgIni: text("msg_ini"),
  biometria: varchar("biometria"),
  userId: integer("user_id"),
  manager: varchar("manager")
});
var devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  type: varchar("type"),
  storeId: integer("store_id"),
  status: varchar("status").default("offline"),
  ipAddress: varchar("ip_address"),
  lastSeen: timestamp("last_seen"),
  firmwareVersion: varchar("firmware_version"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  deviceId: varchar("device_id"),
  serialNumber: varchar("serial_number"),
  location: varchar("location"),
  biometria: varchar("biometria"),
  lastPing: timestamp("last_ping")
});
var accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  // string no VPS
  clientId: integer("client_id"),
  deviceId: integer("device_id"),
  storeId: integer("store_id"),
  accessType: varchar("access_type"),
  method: varchar("method"),
  success: boolean("success"),
  details: text("details"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  action: varchar("action"),
  status: varchar("status"),
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`)
});
var alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(),
  status: varchar("status").default("active"),
  storeId: integer("store_id"),
  deviceId: integer("device_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
  resolvedAt: timestamp("resolved_at")
});
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  cpf: varchar("cpf"),
  profileImageUrl: varchar("profile_image_url"),
  status: varchar("status").default("active"),
  // active, alert, vip, blocked
  storeId: integer("store_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`)
});
var clientEntries = pgTable("client_entries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  storeId: integer("store_id"),
  serviceType: varchar("service_type").notNull(),
  machineNumber: integer("machine_number"),
  durationMinutes: integer("duration_minutes"),
  cost: varchar("cost"),
  // usando varchar para compatibilidade com numeric
  paymentMethod: varchar("payment_method"),
  status: varchar("status").default("completed"),
  startedAt: timestamp("started_at").default(sql`now()`),
  completedAt: timestamp("completed_at")
});
var usersRelations = relations(users, ({ many }) => ({
  accessLogs: many(accessLogs),
  stores: many(stores)
}));
var storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id]
  }),
  devices: many(devices),
  clients: many(clients),
  accessLogs: many(accessLogs),
  alerts: many(alerts)
}));
var devicesRelations = relations(devices, ({ one, many }) => ({
  store: one(stores, {
    fields: [devices.storeId],
    references: [stores.id]
  }),
  accessLogs: many(accessLogs),
  alerts: many(alerts),
  clientEntries: many(clientEntries)
}));
var accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [accessLogs.clientId],
    references: [clients.id]
  }),
  device: one(devices, {
    fields: [accessLogs.deviceId],
    references: [devices.id]
  })
}));
var alertsRelations = relations(alerts, ({ one }) => ({
  store: one(stores, {
    fields: [alerts.storeId],
    references: [stores.id]
  }),
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id]
  })
}));
var clientsRelations = relations(clients, ({ one, many }) => ({
  store: one(stores, {
    fields: [clients.storeId],
    references: [stores.id]
  }),
  entries: many(clientEntries),
  accessLogs: many(accessLogs)
}));
var clientEntriesRelations = relations(clientEntries, ({ one }) => ({
  client: one(clients, {
    fields: [clientEntries.clientId],
    references: [clients.id]
  }),
  store: one(stores, {
    fields: [clientEntries.storeId],
    references: [stores.id]
  })
}));
var insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  lastPing: true
});
var insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true
});
var insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertClientEntrySchema = createInsertSchema(clientEntries).omit({
  id: true,
  entryTime: true
});
var loginSchema = z.object({
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});
var registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "franqueado", "tecnico", "utilizador"]).default("franqueado")
});
var forgotPasswordSchema = z.object({
  email: z.string().email("Email inv\xE1lido")
});
var resetPasswordSchema = z.object({
  token: z.string().min(1, "Token \xE9 obrigat\xF3rio"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});
var changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual \xE9 obrigat\xF3ria"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres")
});
var configSistema = pgTable("config_sistema", {
  id: serial("id").primaryKey(),
  sistemaNome: varchar("sistema_nome").default("LavControl"),
  tema: varchar("tema").default("dark"),
  idioma: varchar("idioma").default("pt-BR"),
  notificacoesEmail: boolean("notificacoes_email").default(true),
  notificacoesPush: boolean("notificacoes_push").default(true),
  backupAutomatico: boolean("backup_automatico").default(true),
  manutencao: boolean("manutencao").default(false),
  versaoSistema: varchar("versao_sistema"),
  mqttBroker: varchar("mqtt_broker"),
  mqttPort: integer("mqtt_port").default(1883),
  mqttTopic: varchar("mqtt_topic").default("lavcontrol/devices"),
  emailSmtpHost: varchar("email_smtp_host"),
  emailSmtpPort: integer("email_smtp_port").default(587),
  emailUser: varchar("email_user"),
  createdAt: timestamp("created_at").default(sql`NOW()`),
  updatedAt: timestamp("updated_at").default(sql`NOW()`)
});
var insertConfigSistemaSchema = createInsertSchema(configSistema);

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var connectionString = "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres";
var connectionConfig = {
  connectionString,
  ssl: false,
  connectTimeoutMS: 1e4,
  idleTimeoutMillis: 3e4
};
console.log("\u{1F50C} Conectando ao PostgreSQL da VPS (148.230.78.128:5432)...");
console.log("\u{1F511} Usando conex\xE3o direta \xE0 VPS:", connectionString.replace(/:[^:]+@/, ":****@"));
var pool = new Pool(connectionConfig);
pool.connect().then(async (client) => {
  console.log("\u2705 Conectado com sucesso ao PostgreSQL da VPS");
  const result = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  if (result.rows.length === 0) {
    console.log("\u{1F6E0}\uFE0F Nenhuma tabela encontrada. Executando setup do banco...");
  } else {
    console.log(`\u{1F4CA} Encontradas ${result.rows.length} tabelas:`, result.rows.map((r) => r.table_name));
  }
  client.release();
}).catch((err) => {
  console.error("\u274C Erro ao conectar \xE0 VPS PostgreSQL:", err.message);
  console.log("\u{1F4DD} Dica: Verifique se a senha est\xE1 correta ou configure VPS_POSTGRES_PASSWORD");
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    try {
      const { Pool: Pool3 } = await import("pg");
      const freshPool = new Pool3({
        host: "148.230.78.128",
        port: 5432,
        user: "postgres",
        password: "929d54bc0ff22387163f04cfb3b3d0fa",
        database: "postgres",
        ssl: false
      });
      const result = await freshPool.query(
        "SELECT id, email, name, password, role, is_active, alert_level, failed_login_attempts, locked_until, reset_token, reset_token_expires, last_login, created_at, updated_at FROM users WHERE email = $1",
        [email]
      );
      await freshPool.end();
      if (result.rows.length === 0) {
        return void 0;
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
        updatedAt: new Date(row.updated_at)
      };
      return user;
    } catch (error) {
      return void 0;
    }
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updateData) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
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
    if (updateData.isActive !== void 0) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.isActive);
    }
    if (updateData.alertLevel) {
      fields.push(`alert_level = $${paramCount++}`);
      values.push(updateData.alertLevel);
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await pool2.query(`
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    await pool2.end();
    return result.rows[0] || void 0;
  }
  async getUsers() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const result = await pool2.query(`
      SELECT id, email, name, password, role, is_active, alert_level, 
             failed_login_attempts, locked_until, reset_token, reset_token_expires, 
             last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    await pool2.end();
    return result.rows;
  }
  async getFacialRecognizedUsers() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const result = await pool2.query(`
      SELECT DISTINCT u.id, u.name, u.email, u.is_active as "isActive", u.created_at as "createdAt"
      FROM users u
      INNER JOIN access_logs al ON u.id::text = al.user_id::text
      WHERE al.method = 'facial_recognition'
      ORDER BY u.created_at DESC
      LIMIT 10
    `);
    await pool2.end();
    return result.rows;
  }
  // Client methods (clientes das lavanderias)
  async getClients() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const result = await pool2.query(`
      SELECT c.*, s.name as store_name
      FROM clients c
      LEFT JOIN stores s ON c.store_id = s.id
      ORDER BY c.created_at DESC
    `);
    await pool2.end();
    return result.rows;
  }
  async getClientsByStore(storeId) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const result = await pool2.query(`
      SELECT * FROM clients 
      WHERE store_id = $1
      ORDER BY created_at DESC
    `, [storeId]);
    await pool2.end();
    return result.rows;
  }
  // ===== AUTHENTICATION METHODS =====
  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }
    if (user.lockedUntil && user.lockedUntil > /* @__PURE__ */ new Date()) {
      return null;
    }
    if (!user.isActive) {
      return null;
    }
    if (!user.password) {
      return null;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await this.increaseFailedAttempts(email);
      return null;
    }
    await this.resetFailedAttempts(email);
    await this.updateLastLogin(user.id);
    return user;
  }
  async updateLastLogin(id) {
    await db.update(users).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async increaseFailedAttempts(email) {
    const user = await this.getUserByEmail(email);
    if (!user) return;
    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData = { failedLoginAttempts: newAttempts };
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1e3);
    }
    await db.update(users).set(updateData).where(eq(users.email, email));
  }
  async resetFailedAttempts(email) {
    await db.update(users).set({
      failedLoginAttempts: 0,
      lockedUntil: null
    }).where(eq(users.email, email));
  }
  async lockUser(email, lockUntil) {
    await db.update(users).set({ lockedUntil }).where(eq(users.email, email));
  }
  async getUserByResetToken(token) {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user || void 0;
  }
  async updateResetToken(email, token, expires) {
    await db.update(users).set({
      resetToken: token,
      resetTokenExpires: expires || null
    }).where(eq(users.email, email));
  }
  async updatePassword(id, hashedPassword) {
    await db.update(users).set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id));
  }
  async getDevice(id) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query("SELECT * FROM devices WHERE id = $1", [id]);
      return result.rows[0] || void 0;
    } catch (error) {
      console.error("Erro ao buscar device por ID:", error);
      return void 0;
    } finally {
      await pool2.end();
    }
  }
  async getDeviceByDeviceId(deviceId) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT * FROM devices 
        WHERE id = $1 OR device_serial = $1 OR serial = $1
        LIMIT 1
      `, [deviceId]);
      return result.rows[0] || void 0;
    } catch (error) {
      console.error("Erro ao buscar device por ID:", error);
      return void 0;
    } finally {
      await pool2.end();
    }
  }
  async createDevice(deviceData) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      host: "148.230.78.128",
      port: 5432,
      user: "postgres",
      password: "929d54bc0ff22387163f04cfb3b3d0fa",
      database: "postgres",
      ssl: false
    });
    try {
      console.log("Creating device with data:", deviceData);
      const autoSerialNumber = `SN${Date.now().toString().slice(-6)}`;
      console.log("Will create device with serial:", autoSerialNumber);
      const result = await pool2.query(`
        INSERT INTO devices (
          name, type, status, store_id, serial_number, location
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        deviceData.name,
        deviceData.type || "facial",
        deviceData.status || "offline",
        deviceData.storeId,
        autoSerialNumber,
        [deviceData.location || "N\xE3o especificado"]
        // Array para location
      ]);
      console.log("Device created successfully:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar device:", error);
      throw error;
    } finally {
      await pool2.end();
    }
  }
  async updateDevice(id, updateData) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
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
      if (updateData.storeId !== void 0) {
        fields.push(`store_id = $${paramCount++}`);
        values.push(updateData.storeId);
      }
      if (updateData.location) {
        fields.push(`location = $${paramCount++}`);
        values.push(updateData.location);
      }
      if (updateData.serialNumber) {
        fields.push(`serial_number = $${paramCount++}`);
        values.push(updateData.serialNumber);
      }
      fields.push(`updated_at = NOW()`);
      values.push(id);
      const result = await pool2.query(`
        UPDATE devices 
        SET ${fields.join(", ")} 
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      return result.rows[0] || void 0;
    } catch (error) {
      console.error("Erro ao atualizar device:", error);
      throw error;
    } finally {
      await pool2.end();
    }
  }
  async getStoreById(id) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT s.*, 
               COALESCE(d.device_count, 0) as device_count,
               COALESCE(d.devices_online, 0) as devices_online
        FROM stores s 
        LEFT JOIN (
          SELECT store_id,
                 COUNT(*) as device_count,
                 COUNT(CASE WHEN status = 'online' THEN 1 END) as devices_online
          FROM devices 
          GROUP BY store_id
        ) d ON s.id = d.store_id
        WHERE s.id = $1
      `, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
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
        deviceCount: parseInt(row.device_count) || 0,
        devicesOnline: parseInt(row.devices_online) || 0,
        // Campos específicos do VPS para configurações
        nomeLoja: row.nome_loja,
        endereco: row.endereco,
        manager: row.manager,
        senhaPorta: row.senha_porta,
        senhaWifi: row.senha_wifi,
        horarioSegSex: row.horario_seg_sex,
        horarioSabado: row.horario_sabado,
        horarioDom: row.horario_dom,
        whatsAtendimento: row.whats_atendimento,
        pontoReferencia: row.ponto_referencia,
        valorLv: row.valor_lv,
        valorS: row.valor_s,
        valorLv2: row.valor_lv2,
        valorS2: row.valor_s2,
        estacionamento: row.estacionamento,
        delivery: row.delivery,
        cashBack: row.cash_back,
        cupons: row.cupons,
        promocao: row.promocao,
        observacoes: row.observacoes,
        biometria: row.biometria
      };
    } catch (error) {
      console.error("Erro ao buscar loja por ID:", error);
      throw error;
    } finally {
      await pool2.end();
    }
  }
  async getDevicesByStore(storeId) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT * FROM devices 
        WHERE store_id = $1 
        ORDER BY created_at DESC
      `, [storeId]);
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar dispositivos da loja:", error);
      throw error;
    } finally {
      await pool2.end();
    }
  }
  async getDevices() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT d.*, s.name as store_name, s.address as store_address
        FROM devices d
        LEFT JOIN stores s ON d.store_id = s.id
        ORDER BY d.id DESC
      `);
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name || row.device_name,
        type: row.type || row.device_type,
        deviceId: row.device_id || row.device_serial || row.serial || row.id.toString(),
        serialNumber: row.serial_number,
        storeId: row.store_id,
        status: row.status || "offline",
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
        } : void 0
      }));
    } catch (error) {
      console.error("Erro ao buscar devices:", error);
      return [];
    } finally {
      await pool2.end();
    }
  }
  async getAllDevices() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query("SELECT * FROM devices ORDER BY id DESC");
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todos os devices:", error);
      return [];
    } finally {
      await pool2.end();
    }
  }
  async deleteDevice(id) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      await pool2.query("DELETE FROM devices WHERE id = $1", [id]);
    } catch (error) {
      console.error("Erro ao deletar device:", error);
      throw error;
    } finally {
      await pool2.end();
    }
  }
  // Store methods
  async getStore(id) {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || void 0;
  }
  async createStore(storeData) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      host: "148.230.78.128",
      port: 5432,
      user: "postgres",
      password: "929d54bc0ff22387163f04cfb3b3d0fa",
      database: "postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        INSERT INTO stores (
          name, address, phone, city, state, manager_name, 
          is_active, estacionamento, delivery, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, false, false, NOW(), NOW())
        RETURNING *
      `, [
        storeData.name,
        storeData.address || "Endere\xE7o n\xE3o informado",
        storeData.phone || "Telefone n\xE3o informado",
        "Cidade n\xE3o informada",
        // city é obrigatório
        "Estado n\xE3o informado",
        // state pode ser obrigatório também
        storeData.managerName || "Gerente n\xE3o informado"
      ]);
      const store = result.rows[0];
      console.log("Loja criada com sucesso:", store);
      return {
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
        managerName: store.manager_name,
        isActive: store.is_active,
        createdAt: store.created_at,
        updatedAt: store.updated_at
      };
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      throw new Error("Falha ao cadastrar a loja");
    } finally {
      await pool2.end();
    }
  }
  async updateStore(id, updateData) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      host: "148.230.78.128",
      port: 5432,
      user: "postgres",
      password: "929d54bc0ff22387163f04cfb3b3d0fa",
      database: "postgres",
      ssl: false
    });
    const fields = [];
    const values = [];
    let paramCount = 1;
    if (updateData.name !== void 0) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }
    if (updateData.address !== void 0) {
      fields.push(`address = $${paramCount++}`);
      values.push(updateData.address);
    }
    if (updateData.phone !== void 0) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updateData.phone);
    }
    if (updateData.managerName !== void 0) {
      fields.push(`manager_name = $${paramCount++}`);
      values.push(updateData.managerName);
    }
    if (updateData.whatsAtendimento !== void 0) {
      fields.push(`whats_atendimento = $${paramCount++}`);
      values.push(updateData.whatsAtendimento);
    }
    if (updateData.horarioSegSex !== void 0) {
      fields.push(`horario_seg_sex = $${paramCount++}`);
      values.push(updateData.horarioSegSex);
    }
    if (updateData.horarioSabado !== void 0) {
      fields.push(`horario_sabado = $${paramCount++}`);
      values.push(updateData.horarioSabado);
    }
    if (updateData.horarioDom !== void 0) {
      fields.push(`horario_dom = $${paramCount++}`);
      values.push(updateData.horarioDom);
    }
    if (updateData.valorLv !== void 0) {
      fields.push(`valor_lv = $${paramCount++}`);
      values.push(updateData.valorLv);
    }
    if (updateData.valorS !== void 0) {
      fields.push(`valor_s = $${paramCount++}`);
      values.push(updateData.valorS);
    }
    if (updateData.valorLv2 !== void 0) {
      fields.push(`valor_lv2 = $${paramCount++}`);
      values.push(updateData.valorLv2);
    }
    if (updateData.valorS2 !== void 0) {
      fields.push(`valor_s2 = $${paramCount++}`);
      values.push(updateData.valorS2);
    }
    if (updateData.senhaPorta !== void 0) {
      fields.push(`senha_porta = $${paramCount++}`);
      values.push(updateData.senhaPorta);
    }
    if (updateData.senhaWifi !== void 0) {
      fields.push(`senha_wifi = $${paramCount++}`);
      values.push(updateData.senhaWifi);
    }
    if (updateData.biometria !== void 0) {
      fields.push(`biometria = $${paramCount++}`);
      values.push(updateData.biometria);
    }
    if (updateData.biometry !== void 0) {
      fields.push(`biometria = $${paramCount++}`);
      values.push(updateData.biometry);
    }
    if (updateData.estacionamento !== void 0) {
      fields.push(`estacionamento = $${paramCount++}`);
      values.push(updateData.estacionamento);
    }
    if (updateData.delivery !== void 0) {
      fields.push(`delivery = $${paramCount++}`);
      values.push(updateData.delivery);
    }
    if (updateData.cashBack !== void 0) {
      fields.push(`cash_back = $${paramCount++}`);
      values.push(updateData.cashBack);
    }
    if (updateData.cupons !== void 0) {
      fields.push(`cupons = $${paramCount++}`);
      values.push(updateData.cupons);
    }
    if (updateData.observacoes !== void 0) {
      fields.push(`observacoes = $${paramCount++}`);
      values.push(updateData.observacoes);
    }
    if (updateData.pontoReferencia !== void 0) {
      fields.push(`ponto_referencia = $${paramCount++}`);
      values.push(updateData.pontoReferencia);
    }
    if (updateData.promocao !== void 0) {
      fields.push(`promocao = $${paramCount++}`);
      values.push(updateData.promocao);
    }
    if (updateData.isActive !== void 0) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.isActive);
    }
    if (updateData.city !== void 0) {
      fields.push(`city = $${paramCount++}`);
      values.push(updateData.city);
    }
    if (updateData.state !== void 0) {
      fields.push(`state = $${paramCount++}`);
      values.push(updateData.state);
    }
    if (updateData.zipCode !== void 0) {
      fields.push(`zip_code = $${paramCount++}`);
      values.push(updateData.zipCode);
    }
    if (fields.length === 0) {
      await pool2.end();
      return null;
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const query = `
      UPDATE stores 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    try {
      const result = await pool2.query(query, values);
      if (result.rows.length === 0) {
        await pool2.end();
        return null;
      }
      const row = result.rows[0];
      const updatedStore = {
        id: row.id,
        name: row.name || row.nome_loja,
        address: row.address || row.endereco,
        phone: row.phone,
        managerName: row.manager_name || row.manager,
        whatsAtendimento: row.whats_atendimento,
        horarioSegSex: row.horario_seg_sex,
        horarioSabado: row.horario_sabado,
        horarioDom: row.horario_dom,
        valorLv: row.valor_lv,
        valorS: row.valor_s,
        valorLv2: row.valor_lv2,
        valorS2: row.valor_s2,
        senhaPorta: row.senha_porta,
        senhaWifi: row.senha_wifi,
        biometria: row.biometria,
        estacionamento: row.estacionamento,
        delivery: row.delivery,
        cashBack: row.cash_back,
        cupons: row.cupons,
        observacoes: row.observacoes,
        pontoReferencia: row.ponto_referencia,
        promocao: row.promocao,
        updatedAt: row.updated_at
      };
      await pool2.end();
      return updatedStore;
    } catch (error) {
      console.error("\u274C Erro ao executar query de update:", error);
      await pool2.end();
      throw error;
    }
  }
  async getStores() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const result = await pool2.query(`
      SELECT s.*, 
             COALESCE(d.device_count, 0) as device_count,
             COALESCE(d.devices_online, 0) as devices_online
      FROM stores s 
      LEFT JOIN (
        SELECT store_id,
               COUNT(*) as device_count,
               COUNT(CASE WHEN status = 'online' THEN 1 END) as devices_online
        FROM devices 
        GROUP BY store_id
      ) d ON s.id = d.store_id
      ORDER BY s.created_at DESC
    `);
    await pool2.end();
    return result.rows.map((row) => ({
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
      deviceCount: parseInt(row.device_count) || 0,
      devicesOnline: parseInt(row.devices_online) || 0,
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
      manager: row.manager
    }));
  }
  async getStoresByUser(userId) {
    return await db.select().from(stores).where(eq(stores.userId, userId)).orderBy(desc(stores.createdAt));
  }
  async updateDeviceStatus(deviceId, status, lastPing) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const columnsResult = await pool2.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'devices'
      `);
      const columns = columnsResult.rows.map((r) => r.column_name);
      const deviceColumn = columns.includes("device_id") ? "device_id" : "id";
      const hasPingColumn = columns.includes("last_ping");
      if (hasPingColumn) {
        await pool2.query(`
          UPDATE devices 
          SET status = $1, last_ping = $2, updated_at = NOW()
          WHERE ${deviceColumn} = $3
        `, [status, lastPing || /* @__PURE__ */ new Date(), deviceId]);
      } else {
        await pool2.query(`
          UPDATE devices 
          SET status = $1, updated_at = NOW()
          WHERE ${deviceColumn} = $3
        `, [status, deviceId]);
      }
    } catch (error) {
      console.error("Error handling device status update:", error);
    } finally {
      await pool2.end();
    }
  }
  async createAccessLog(insertLog) {
    const [log2] = await db.insert(accessLogs).values(insertLog).returning();
    return log2;
  }
  async getAccessLogs(limit = 50) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const query = `
        SELECT 
          al.id,
          al.user_id,
          al.client_id,
          al.device_id,
          al.store_id,
          al.access_type as action,
          al.method,
          al.success,
          al.success::text as status,
          al.details,
          al.created_at as timestamp,
          c.name as client_name,
          c.status as client_status,
          c.email as client_email,
          c.profile_image_url as client_profile_image_url,
          d.name as device_name,
          d.ip_address as device_ip,
          s.name as store_name
        FROM access_logs al
        LEFT JOIN clients c ON al.client_id = c.id
        LEFT JOIN devices d ON al.device_id = d.id
        LEFT JOIN stores s ON al.store_id = s.id
        ORDER BY al.created_at DESC
        LIMIT $1
      `;
      const result = await pool2.query(query, [limit]);
      const logs = result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        clientId: row.client_id,
        deviceId: row.device_id,
        storeId: row.store_id,
        action: row.action,
        method: row.method,
        status: row.success ? "success" : "failed",
        timestamp: row.timestamp,
        details: row.details,
        user: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          email: row.client_email,
          profileImageUrl: row.client_profile_image_url
        } : null,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          status: row.client_status,
          email: row.client_email,
          profileImageUrl: row.client_profile_image_url
        } : null,
        device: row.device_name ? {
          id: row.device_id,
          name: row.device_name,
          deviceId: row.device_ip || `device-${row.device_id}`
        } : null,
        store: row.store_name ? {
          id: row.store_id,
          name: row.store_name
        } : null
      }));
      return logs;
    } catch (error) {
      console.error("Erro ao buscar logs de acesso:", error);
      return [];
    } finally {
      await pool2.end();
    }
  }
  async getAccessLogsByDevice(deviceId, limit = 50) {
    return await db.select().from(accessLogs).where(eq(accessLogs.deviceId, deviceId)).orderBy(desc(accessLogs.timestamp)).limit(limit);
  }
  async getAccessLogsByUser(userId, limit = 50) {
    return await db.select().from(accessLogs).where(eq(accessLogs.userId, userId)).orderBy(desc(accessLogs.timestamp)).limit(limit);
  }
  async createAlert(insertAlert) {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }
  async getActiveAlerts() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT a.*, d.name as device_name, d.ip_address as device_ip
        FROM alerts a
        LEFT JOIN devices d ON a.device_id = d.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
      `);
      return result.rows.map((row) => ({
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
        } : void 0
      }));
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      return [];
    } finally {
      await pool2.end();
    }
  }
  async resolveAlert(id) {
    await db.update(alerts).set({ isResolved: true }).where(eq(alerts.id, id));
  }
  async getDashboardStats() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const result = await pool2.query(`
      SELECT 
        (SELECT COUNT(*) FROM clients WHERE status = 'active') as total_users,
        (SELECT COUNT(*) FROM devices WHERE status = 'online') as active_devices,
        (SELECT COUNT(*) FROM access_logs WHERE created_at >= $1 AND success = true) as today_access,
        (SELECT COUNT(*) FROM alerts WHERE status = 'ativo' OR status = 'pendente') as active_alerts
    `, [today]);
    await pool2.end();
    const row = result.rows[0];
    return {
      totalUsers: parseInt(row.total_users),
      activeDevices: parseInt(row.active_devices),
      todayAccess: parseInt(row.today_access),
      activeAlerts: parseInt(row.active_alerts)
    };
  }
  async getTrafficChart() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const result = await pool2.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM access_logs
      WHERE success = true 
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);
    await pool2.end();
    return result.rows.map((row) => ({
      date: row.date,
      count: parseInt(row.count)
    }));
  }
  async getStoreStatistics() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    const totalStoresResult = await pool2.query(`
      SELECT COUNT(*) as count FROM stores WHERE is_active = true
    `);
    const onlineStoresResult = await pool2.query(`
      SELECT COUNT(DISTINCT s.id) as count 
      FROM stores s
      LEFT JOIN devices d ON s.id = d.store_id
      WHERE s.is_active = true AND d.status = 'online'
    `);
    const totalAccessResult = await pool2.query(`
      SELECT COUNT(*) as count 
      FROM access_logs 
      WHERE success = true AND created_at >= $1
    `, [today]);
    const activeDevicesResult = await pool2.query(`
      SELECT COUNT(*) as count FROM devices WHERE status = 'online'
    `);
    await pool2.end();
    return {
      totalStores: parseInt(totalStoresResult.rows[0].count),
      onlineStores: parseInt(onlineStoresResult.rows[0].count),
      totalAccess: parseInt(totalAccessResult.rows[0].count),
      activeDevices: parseInt(activeDevicesResult.rows[0].count)
    };
  }
  async getAvailableDevices() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT d.*
        FROM devices d
        WHERE d.store_id IS NULL
        ORDER BY d.id DESC
      `);
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name || `Device ${row.id}`,
        type: row.type || "facial",
        deviceId: row.device_serial || row.serial || row.id.toString(),
        storeId: row.store_id,
        status: row.status || "offline",
        ipAddress: row.ip_address || row.ip,
        lastSeen: row.last_seen || row.updated_at,
        firmwareVersion: row.firmware_version || row.version,
        location: row.location,
        biometria: row.biometria,
        lastPing: row.last_ping,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error("Erro ao buscar devices dispon\xEDveis:", error);
      return [];
    } finally {
      await pool2.end();
    }
  }
  async getWaveChartData() {
    try {
      const { Pool: Pool3 } = await import("pg");
      const pool2 = new Pool3({
        connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
        ssl: false
      });
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
      const result = await pool2.query(`
        SELECT created_at as timestamp
        FROM access_logs 
        WHERE created_at >= $1 AND success = true
        ORDER BY created_at
      `, [twentyFourHoursAgo]);
      await pool2.end();
      const hourlyData = result.rows.reduce((acc, log2) => {
        if (!log2.timestamp) return acc;
        const hour = new Date(log2.timestamp).getHours();
        const key = `${hour.toString().padStart(2, "0")}:00`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const chartData = [];
      for (let i = 0; i < 24; i++) {
        const key = `${i.toString().padStart(2, "0")}:00`;
        chartData.push({
          time: key,
          value: hourlyData[key] || 0
        });
      }
      return chartData;
    } catch (error) {
      console.error("Error in getWaveChartData:", error);
      return [];
    }
  }
  // ===== CONFIG SISTEMA METHODS =====
  async getConfigSistema() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      await pool2.query(`
        CREATE TABLE IF NOT EXISTS config_sistema (
          id SERIAL PRIMARY KEY,
          sistema_nome VARCHAR(100) DEFAULT 'LavControl',
          logo_url VARCHAR(500) DEFAULT NULL,
          logo_margin_top INTEGER DEFAULT 25,
          logo_margin_bottom INTEGER DEFAULT 8,
          logo_size INTEGER DEFAULT 48,
          text_margin_top INTEGER DEFAULT 0,
          text_margin_bottom INTEGER DEFAULT 16,
          tema VARCHAR(20) DEFAULT 'dark',
          idioma VARCHAR(10) DEFAULT 'pt-BR',
          notificacoes_email BOOLEAN DEFAULT true,
          notificacoes_push BOOLEAN DEFAULT true,
          backup_automatico BOOLEAN DEFAULT true,
          manutencao BOOLEAN DEFAULT false,
          mqtt_broker VARCHAR(255) DEFAULT 'broker.emqx.io',
          mqtt_port INTEGER DEFAULT 1883,
          mqtt_topic VARCHAR(255) DEFAULT 'lavcontrol/devices',
          email_smtp_host VARCHAR(255) DEFAULT '',
          email_smtp_port INTEGER DEFAULT 587,
          email_user VARCHAR(255) DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await pool2.query(`
        ALTER TABLE config_sistema 
        ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS logo_margin_top INTEGER DEFAULT 25,
        ADD COLUMN IF NOT EXISTS logo_margin_bottom INTEGER DEFAULT 8,
        ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 48,
        ADD COLUMN IF NOT EXISTS text_margin_top INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS text_margin_bottom INTEGER DEFAULT 16
      `);
      const result = await pool2.query("SELECT * FROM config_sistema ORDER BY id DESC LIMIT 1");
      return result.rows[0] || {
        sistema_nome: "LavControl",
        logo_url: null,
        logo_margin_top: 25,
        logo_margin_bottom: 8,
        logo_size: 48,
        text_margin_top: 0,
        text_margin_bottom: 16,
        tema: "dark",
        idioma: "pt-BR",
        notificacoes_email: true,
        notificacoes_push: true,
        backup_automatico: true,
        manutencao: false,
        mqtt_topic: "lavcontrol/devices"
      };
    } finally {
      await pool2.end();
    }
  }
  async updateConfigSistema(data) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      await pool2.query(`
        CREATE TABLE IF NOT EXISTS config_sistema (
          id SERIAL PRIMARY KEY,
          sistema_nome VARCHAR(100) DEFAULT 'LavControl',
          logo_url VARCHAR(500) DEFAULT NULL,
          logo_margin_top INTEGER DEFAULT 25,
          logo_margin_bottom INTEGER DEFAULT 8,
          logo_size INTEGER DEFAULT 48,
          text_margin_top INTEGER DEFAULT 0,
          text_margin_bottom INTEGER DEFAULT 16,
          tema VARCHAR(20) DEFAULT 'dark',
          idioma VARCHAR(10) DEFAULT 'pt-BR',
          notificacoes_email BOOLEAN DEFAULT true,
          notificacoes_push BOOLEAN DEFAULT true,
          backup_automatico BOOLEAN DEFAULT true,
          manutencao BOOLEAN DEFAULT false,
          mqtt_broker VARCHAR(255) DEFAULT 'broker.emqx.io',
          mqtt_port INTEGER DEFAULT 1883,
          mqtt_topic VARCHAR(255) DEFAULT 'lavcontrol/devices',
          email_smtp_host VARCHAR(255) DEFAULT '',
          email_smtp_port INTEGER DEFAULT 587,
          email_user VARCHAR(255) DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      try {
        await pool2.query(`
          ALTER TABLE config_sistema 
          ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS logo_margin_top INTEGER DEFAULT 25,
          ADD COLUMN IF NOT EXISTS logo_margin_bottom INTEGER DEFAULT 8,
          ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 48,
          ADD COLUMN IF NOT EXISTS text_margin_top INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS text_margin_bottom INTEGER DEFAULT 16
        `);
      } catch (error) {
      }
      const existingResult = await pool2.query("SELECT id FROM config_sistema LIMIT 1");
      if (existingResult.rows.length > 0) {
        try {
          const result = await pool2.query(`
            UPDATE config_sistema 
            SET sistema_nome = $1, logo_url = $2, logo_margin_top = $3, logo_margin_bottom = $4,
                logo_size = $5, text_margin_top = $6, text_margin_bottom = $7,
                tema = $8, idioma = $9, 
                notificacoes_email = $10, notificacoes_push = $11, 
                backup_automatico = $12, manutencao = $13, 
                mqtt_broker = $14, mqtt_port = $15, mqtt_topic = $16,
                email_smtp_host = $17, email_smtp_port = $18, email_user = $19,
                updated_at = NOW()
            WHERE id = $20
            RETURNING *
          `, [
            data.sistema_nome || "LavControl",
            data.logo_url || null,
            data.logo_margin_top !== void 0 ? data.logo_margin_top : 25,
            data.logo_margin_bottom !== void 0 ? data.logo_margin_bottom : 8,
            data.logo_size !== void 0 ? data.logo_size : 48,
            data.text_margin_top !== void 0 ? data.text_margin_top : 0,
            data.text_margin_bottom !== void 0 ? data.text_margin_bottom : 16,
            data.tema || "dark",
            data.idioma || "pt-BR",
            data.notificacoes_email !== void 0 ? data.notificacoes_email : true,
            data.notificacoes_push !== void 0 ? data.notificacoes_push : true,
            data.backup_automatico !== void 0 ? data.backup_automatico : true,
            data.manutencao !== void 0 ? data.manutencao : false,
            data.mqtt_broker || "broker.emqx.io",
            data.mqtt_port || 1883,
            data.mqtt_topic || "lavcontrol/devices",
            data.email_smtp_host || "",
            data.email_smtp_port || 587,
            data.email_user || "",
            existingResult.rows[0].id
          ]);
          return result.rows[0];
        } catch (error) {
          const result = await pool2.query(`
            UPDATE config_sistema 
            SET sistema_nome = $1, tema = $2, idioma = $3, 
                notificacoes_email = $4, notificacoes_push = $5, 
                backup_automatico = $6, manutencao = $7, 
                mqtt_broker = $8, mqtt_port = $9, mqtt_topic = $10,
                email_smtp_host = $11, email_smtp_port = $12, email_user = $13,
                updated_at = NOW()
            WHERE id = $14
            RETURNING *
          `, [
            data.sistema_nome || "LavControl",
            data.tema || "dark",
            data.idioma || "pt-BR",
            data.notificacoes_email !== void 0 ? data.notificacoes_email : true,
            data.notificacoes_push !== void 0 ? data.notificacoes_push : true,
            data.backup_automatico !== void 0 ? data.backup_automatico : true,
            data.manutencao !== void 0 ? data.manutencao : false,
            data.mqtt_broker || "broker.emqx.io",
            data.mqtt_port || 1883,
            data.mqtt_topic || "lavcontrol/devices",
            data.email_smtp_host || "",
            data.email_smtp_port || 587,
            data.email_user || "",
            existingResult.rows[0].id
          ]);
          return result.rows[0];
        }
      } else {
        try {
          const result = await pool2.query(`
            INSERT INTO config_sistema (
              sistema_nome, logo_url, logo_margin_top, logo_margin_bottom, logo_size,
              text_margin_top, text_margin_bottom, tema, idioma, notificacoes_email, notificacoes_push, 
              backup_automatico, manutencao, mqtt_broker, mqtt_port, mqtt_topic,
              email_smtp_host, email_smtp_port, email_user
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING *
          `, [
            data.sistema_nome || "LavControl",
            data.logo_url || null,
            data.logo_margin_top !== void 0 ? data.logo_margin_top : 25,
            data.logo_margin_bottom !== void 0 ? data.logo_margin_bottom : 8,
            data.logo_size !== void 0 ? data.logo_size : 48,
            data.text_margin_top !== void 0 ? data.text_margin_top : 0,
            data.text_margin_bottom !== void 0 ? data.text_margin_bottom : 16,
            data.tema || "dark",
            data.idioma || "pt-BR",
            data.notificacoes_email !== void 0 ? data.notificacoes_email : true,
            data.notificacoes_push !== void 0 ? data.notificacoes_push : true,
            data.backup_automatico !== void 0 ? data.backup_automatico : true,
            data.manutencao !== void 0 ? data.manutencao : false,
            data.mqtt_broker || "broker.emqx.io",
            data.mqtt_port || 1883,
            data.mqtt_topic || "lavcontrol/devices",
            data.email_smtp_host || "",
            data.email_smtp_port || 587,
            data.email_user || ""
          ]);
          return result.rows[0];
        } catch (insertError) {
          const result = await pool2.query(`
            INSERT INTO config_sistema (
              sistema_nome, tema, idioma, notificacoes_email, notificacoes_push, 
              backup_automatico, manutencao, mqtt_broker, mqtt_port, mqtt_topic,
              email_smtp_host, email_smtp_port, email_user
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
          `, [
            data.sistema_nome || "LavControl",
            data.tema || "dark",
            data.idioma || "pt-BR",
            data.notificacoes_email !== void 0 ? data.notificacoes_email : true,
            data.notificacoes_push !== void 0 ? data.notificacoes_push : true,
            data.backup_automatico !== void 0 ? data.backup_automatico : true,
            data.manutencao !== void 0 ? data.manutencao : false,
            data.mqtt_broker || "broker.emqx.io",
            data.mqtt_port || 1883,
            data.mqtt_topic || "lavcontrol/devices",
            data.email_smtp_host || "",
            data.email_smtp_port || 587,
            data.email_user || ""
          ]);
          return result.rows[0];
        }
      }
    } finally {
      await pool2.end();
    }
  }
  // ===== DASHBOARD TRAFFIC CHART =====
  async getDashboardTrafficChart() {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
    try {
      const result = await pool2.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          COUNT(CASE WHEN access_type = 'entry' THEN 1 END) as entries,
          COUNT(CASE WHEN access_type = 'exit' THEN 1 END) as exits
        FROM access_logs 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      const chartData = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
        const dateStr = date.toISOString().split("T")[0];
        const dayData = result.rows.find((row) => row.date === dateStr);
        chartData.push({
          date: dateStr,
          count: dayData ? parseInt(dayData.count) : 0,
          entries: dayData ? parseInt(dayData.entries) : 0,
          exits: dayData ? parseInt(dayData.exits) : 0
        });
      }
      return chartData;
    } finally {
      await pool2.end();
    }
  }
  async deleteStore(id) {
    const { Pool: Pool3 } = await import("pg");
    const pool2 = new Pool3({
      host: "148.230.78.128",
      port: 5432,
      user: "postgres",
      password: "929d54bc0ff22387163f04cfb3b3d0fa",
      database: "postgres",
      ssl: false
    });
    try {
      console.log("\u{1F5D1}\uFE0F Tentando deletar loja ID:", id);
      const checkResult = await pool2.query("SELECT id, name FROM stores WHERE id = $1", [id]);
      console.log("\u{1F4CB} Loja encontrada antes do delete:", checkResult.rows);
      if (checkResult.rows.length === 0) {
        console.log("\u26A0\uFE0F Loja n\xE3o encontrada no banco, ID:", id);
        return;
      }
      const deleteResult = await pool2.query("DELETE FROM stores WHERE id = $1", [id]);
      console.log("\u2705 Comando DELETE executado. Linhas afetadas:", deleteResult.rowCount);
      const verifyResult = await pool2.query("SELECT id FROM stores WHERE id = $1", [id]);
      if (verifyResult.rows.length === 0) {
        console.log("\u2705 Loja deletada com sucesso, ID:", id);
      } else {
        console.log("\u274C Loja ainda existe ap\xF3s DELETE, ID:", id);
        throw new Error("Loja n\xE3o foi deletada - pode haver constraints impedindo");
      }
    } catch (error) {
      console.error("\u274C Erro ao deletar loja:", error);
      throw new Error("Falha ao deletar a loja: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      await pool2.end();
    }
  }
};
var storage = new DatabaseStorage();

// server/clients.ts
import { Pool as Pool2 } from "pg";
var ClientsStorage = class {
  async getPool() {
    return new Pool2({
      connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
      ssl: false
    });
  }
  async getAllClients() {
    const pool2 = await this.getPool();
    try {
      const result = await pool2.query(`
        SELECT c.*, s.name as store_name, s.address as store_address
        FROM clients c
        LEFT JOIN stores s ON c.store_id = s.id
        ORDER BY c.created_at DESC
      `);
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        cpf: row.cpf,
        profileImageUrl: row.profile_image_url,
        // Campo padronizado para frontend
        status: row.status,
        store_id: row.store_id,
        // Para compatibilidade com o front
        store_name: row.store_name,
        // Para compatibilidade com o front
        created_at: row.created_at,
        // Para compatibilidade com o front
        updated_at: row.updated_at,
        // Para compatibilidade com o front
        store: row.store_name ? {
          id: row.store_id,
          name: row.store_name,
          address: row.store_address
        } : null
      }));
    } finally {
      await pool2.end();
    }
  }
  async getClient(id) {
    const pool2 = await this.getPool();
    try {
      const result = await pool2.query(`
        SELECT c.*, s.name as store_name
        FROM clients c
        LEFT JOIN stores s ON c.store_id = s.id
        WHERE c.id = $1
      `, [id]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        cpf: row.cpf,
        profileImageUrl: row.profile_image_url,
        status: row.status,
        storeId: row.store_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        store: row.store_name ? {
          name: row.store_name
        } : null
      };
    } finally {
      await pool2.end();
    }
  }
  async createClient(clientData) {
    const pool2 = await this.getPool();
    try {
      const result = await pool2.query(`
        INSERT INTO clients (name, email, phone, cpf, profile_image_url, status, store_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `, [
        clientData.name,
        clientData.email,
        clientData.phone,
        clientData.cpf,
        clientData.profileImageUrl,
        clientData.status || "active",
        clientData.storeId
      ]);
      return result.rows[0];
    } finally {
      await pool2.end();
    }
  }
  async updateClient(id, clientData) {
    const pool2 = await this.getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      if (clientData.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(clientData.name);
      }
      if (clientData.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(clientData.email);
      }
      if (clientData.phone) {
        fields.push(`phone = $${paramCount++}`);
        values.push(clientData.phone);
      }
      if (clientData.cpf) {
        fields.push(`cpf = $${paramCount++}`);
        values.push(clientData.cpf);
      }
      if (clientData.status) {
        fields.push(`status = $${paramCount++}`);
        values.push(clientData.status);
      }
      if (clientData.storeId) {
        fields.push(`store_id = $${paramCount++}`);
        values.push(clientData.storeId);
      }
      if (clientData.profileImageUrl !== void 0) {
        fields.push(`profile_image_url = $${paramCount++}`);
        values.push(clientData.profileImageUrl);
      }
      fields.push(`updated_at = NOW()`);
      values.push(id);
      const result = await pool2.query(`
        UPDATE clients 
        SET ${fields.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      return result.rows[0] || null;
    } finally {
      await pool2.end();
    }
  }
  async deleteClient(id) {
    const pool2 = await this.getPool();
    try {
      const result = await pool2.query(`DELETE FROM clients WHERE id = $1`, [id]);
      return result.rowCount > 0;
    } finally {
      await pool2.end();
    }
  }
};
var clientsStorage = new ClientsStorage();

// server/mqtt.ts
import mqtt from "mqtt";
var MQTTService = class {
  client = null;
  isConnected = false;
  constructor() {
    this.connect();
  }
  connect() {
    try {
      const mqttUrl = process.env.MQTT_URL || "mqtt://broker.emqx.io";
      this.client = mqtt.connect(mqttUrl);
      this.client.on("connect", () => {
        console.log("MQTT connected");
        this.isConnected = true;
      });
      this.client.on("error", (error) => {
        console.error("MQTT connection error:", error);
        this.isConnected = false;
      });
      this.client.on("close", () => {
        console.log("MQTT connection closed");
        this.isConnected = false;
      });
    } catch (error) {
      console.error("Failed to initialize MQTT:", error);
    }
  }
  sendCommand(deviceId, command, data) {
    if (!this.client || !this.isConnected) {
      console.error("MQTT client not connected");
      return false;
    }
    try {
      const topic = `device/${deviceId}/command`;
      const payload = JSON.stringify({
        command,
        data: data || {},
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      this.client.publish(topic, payload);
      console.log(`MQTT command sent to ${deviceId}:`, command);
      return true;
    } catch (error) {
      console.error("Failed to send MQTT command:", error);
      return false;
    }
  }
  subscribeToDeviceUpdates(callback) {
    if (!this.client || !this.isConnected) {
      console.error("MQTT client not connected");
      return;
    }
    this.client.subscribe("device/+/status");
    this.client.on("message", (topic, message) => {
      try {
        const topicParts = topic.split("/");
        if (topicParts.length === 3 && topicParts[0] === "device" && topicParts[2] === "status") {
          const deviceId = topicParts[1];
          const status = JSON.parse(message.toString());
          callback(deviceId, status);
        }
      } catch (error) {
        console.error("Error processing MQTT message:", error);
      }
    });
  }
  isClientConnected() {
    return this.isConnected;
  }
};
var mqttService = new MQTTService();

// server/routes.ts
import jwt from "jsonwebtoken";
import bcrypt2 from "bcryptjs";
import crypto from "crypto";
var wsClients = /* @__PURE__ */ new Set();
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}
async function registerRoutes(app2) {
  app2.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "lavcontrol"
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt2.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
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
    } catch (error) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      console.log(`\u{1F6AA} Tentativa de login recebida:`, req.body);
      const validatedData = loginSchema.parse(req.body);
      console.log(`\u2705 Dados validados:`, validatedData);
      const user = await storage.authenticateUser(validatedData.email, validatedData.password);
      console.log(`\u{1F50D} Resultado da autentica\xE7\xE3o:`, user ? "Sucesso" : "Falhou");
      if (!user) {
        console.log(`\u274C Falha na autentica\xE7\xE3o para: ${validatedData.email}`);
        return res.status(401).json({ message: "Credenciais inv\xE1lidas ou conta bloqueada" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );
      console.log(`\u2705 Login bem-sucedido para: ${user.email}`);
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
    } catch (error) {
      console.log(`\u274C Erro no login:`, error);
      res.status(400).json({ message: error.message || "Falha no login" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.json({ message: "Se o email existir, voc\xEA receber\xE1 instru\xE7\xF5es para redefinir a senha" });
      }
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 36e5);
      await storage.updateResetToken(validatedData.email, resetToken, resetTokenExpires);
      console.log(`Reset token for ${validatedData.email}: ${resetToken}`);
      res.json({ message: "Se o email existir, voc\xEA receber\xE1 instru\xE7\xF5es para redefinir a senha" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao processar solicita\xE7\xE3o" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const user = await storage.getUserByResetToken(validatedData.token);
      if (!user || !user.resetTokenExpires || user.resetTokenExpires < /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "Token inv\xE1lido ou expirado" });
      }
      const hashedPassword = await bcrypt2.hash(validatedData.password, 12);
      await storage.updatePassword(user.id, hashedPassword);
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao redefinir senha" });
    }
  });
  app2.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (!user.password) {
        return res.status(400).json({ message: "Senha n\xE3o definida para este usu\xE1rio" });
      }
      const isCurrentPasswordValid = await bcrypt2.compare(validatedData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }
      const hashedNewPassword = await bcrypt2.hash(validatedData.newPassword, 12);
      await storage.updatePassword(user.id, hashedNewPassword);
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao alterar senha" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        alertLevel: user.alertLevel,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao buscar usu\xE1rio" });
    }
  });
  app2.put("/api/stores/:id", authenticateToken, async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const updatedStore = await storage.updateStore(storeId, req.body);
      res.json(updatedStore);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update store" });
    }
  });
  app2.get("/api/stores/statistics", async (req, res) => {
    try {
      const statistics = await storage.getStoreStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch store statistics" });
    }
  });
  app2.get("/api/devices", async (req, res) => {
    try {
      const devices3 = await storage.getAllDevices();
      res.json(devices3);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch devices" });
    }
  });
  app2.post("/api/devices", async (req, res) => {
    try {
      const { name, deviceId, storeId } = req.body;
      if (!name || !deviceId || !storeId) {
        return res.status(400).json({ message: "Todos os campos s\xE3o obrigat\xF3rios" });
      }
      const device = await storage.createDevice({
        name,
        deviceId,
        storeId: parseInt(storeId),
        status: "offline"
      });
      res.json(device);
    } catch (error) {
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Erro ao cadastrar dispositivo" });
    }
  });
  app2.patch("/api/devices/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const updatedDevice = await storage.updateDevice(deviceId, req.body);
      res.json(updatedDevice);
    } catch (error) {
      console.error("Error updating device:", error);
      res.status(500).json({ message: "Erro ao atualizar dispositivo" });
    }
  });
  app2.delete("/api/devices/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      await storage.deleteDevice(deviceId);
      res.json({ message: "Dispositivo removido com sucesso" });
    } catch (error) {
      console.error("Error deleting device:", error);
      res.status(500).json({ message: "Erro ao remover dispositivo" });
    }
  });
  app2.get("/api/devices/by-store/:storeId", async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const devices3 = await storage.getDevicesByStore(storeId);
      res.json(devices3);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch devices" });
    }
  });
  app2.get("/api/devices/available", authenticateToken, async (req, res) => {
    try {
      const availableDevices = await storage.getAvailableDevices();
      res.json(availableDevices);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch available devices" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });
  app2.get("/api/dashboard/traffic-chart", async (req, res) => {
    try {
      const chartData = await storage.getTrafficChart();
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch traffic chart" });
    }
  });
  app2.get("/api/dashboard/wave-chart", async (req, res) => {
    try {
      const waveData = await storage.getWaveChartData();
      res.json(waveData);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch wave chart data" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      res.json(users2);
    } catch (error) {
      console.error("Erro ao buscar usu\xE1rios:", error);
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });
  app2.get("/api/users/facial-recognized", authenticateToken, async (req, res) => {
    try {
      const recognizedUsers = await storage.getFacialRecognizedUsers();
      res.json(recognizedUsers);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch facial recognized users" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      console.log("Atualizando usu\xE1rio ID:", userId, "com dados:", req.body);
      const user = await storage.updateUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Erro ao atualizar usu\xE1rio:", error);
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });
  app2.post("/api/users", authenticateToken, async (req, res) => {
    try {
      const { name, email, password, role, alertLevel, storeId } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: role || "cliente",
        alertLevel: alertLevel || "normal"
      });
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        alertLevel: user.alertLevel,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to create user" });
    }
  });
  app2.patch("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, alertLevel, isBlocked, isActive } = req.body;
      const updateData = {};
      if (name !== void 0) updateData.name = name;
      if (email !== void 0) updateData.email = email;
      if (alertLevel !== void 0) updateData.alertLevel = alertLevel;
      if (isBlocked !== void 0) updateData.isBlocked = isBlocked;
      if (isActive !== void 0) updateData.isActive = isActive;
      console.log("Updating user", userId, "with data:", updateData);
      const updatedUser = await storage.updateUser(userId, updateData);
      console.log("Updated user result:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });
  app2.get("/api/devices", authenticateToken, async (req, res) => {
    try {
      const devices3 = await storage.getDevices();
      res.json(devices3);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch devices" });
    }
  });
  app2.get("/api/stores", async (req, res) => {
    try {
      const stores2 = await storage.getStores();
      res.json(stores2);
    } catch (error) {
      console.error("Erro ao buscar lojas:", error);
      res.status(500).json({ message: error.message || "Failed to fetch stores" });
    }
  });
  app2.get("/api/stores/:id", async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const store = await storage.getStoreById(storeId);
      if (!store) {
        return res.status(404).json({ message: "Loja n\xE3o encontrada" });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch store" });
    }
  });
  app2.get("/api/stores/secure", authenticateToken, async (req, res) => {
    try {
      const stores2 = await storage.getStores();
      res.json(stores2);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch stores" });
    }
  });
  app2.patch("/api/stores/:id", async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      console.log("Atualizando loja ID:", storeId, "com dados:", req.body);
      const store = await storage.updateStore(storeId, req.body);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
      res.status(500).json({ message: error.message || "Failed to update store" });
    }
  });
  app2.post("/api/stores", async (req, res) => {
    try {
      console.log("Criando loja com dados:", req.body);
      const store = await storage.createStore(req.body);
      res.status(201).json(store);
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      res.status(500).json({ message: error.message || "Failed to create store" });
    }
  });
  app2.delete("/api/stores/:id", async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      console.log("Deletando loja ID:", storeId);
      await storage.deleteStore(storeId);
      res.json({ message: "Loja deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar loja:", error);
      res.status(500).json({ message: error.message || "Failed to delete store" });
    }
  });
  app2.post("/api/devices", authenticateToken, async (req, res) => {
    try {
      const { name, deviceId, location, storeId, status } = req.body;
      const device = await storage.createDevice({
        name,
        deviceId,
        storeId,
        status: status || "offline"
      });
      res.json(device);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to create device" });
    }
  });
  app2.patch("/api/devices/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedDevice = await storage.updateDevice(deviceId, updateData);
      res.json(updatedDevice);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update device" });
    }
  });
  app2.post("/api/devices/:deviceId/command", authenticateToken, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { command, data } = req.body;
      const device = await storage.getDeviceByDeviceId(deviceId);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      const success = mqttService.sendCommand(deviceId, command, data);
      if (!success) {
        return res.status(500).json({ message: "Failed to send command" });
      }
      await storage.createAccessLog({
        userId: req.user.id,
        deviceId: device.id,
        action: "device_command",
        method: "manual",
        status: "success"
      });
      res.json({ message: "Command sent successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to send command" });
    }
  });
  app2.get("/api/access-logs", async (req, res) => {
    try {
      const logs = await storage.getAccessLogs();
      res.json(logs);
    } catch (error) {
      console.error("Erro ao buscar access logs:", error);
      res.status(500).json({ message: error.message || "Failed to fetch access logs" });
    }
  });
  app2.get("/api/clients", async (req, res) => {
    try {
      console.log("\u{1F50D} Buscando clientes...");
      const clients2 = await clientsStorage.getAllClients();
      console.log(`\u2705 Encontrados ${clients2.length} clientes`);
      res.json(clients2);
    } catch (error) {
      console.error("\u274C Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.post("/api/clients", async (req, res) => {
    try {
      console.log("\u2795 Criando novo cliente:", req.body);
      const client = await clientsStorage.createClient(req.body);
      console.log("\u2705 Cliente criado:", client);
      res.status(201).json(client);
    } catch (error) {
      console.error("\u274C Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });
  app2.patch("/api/clients/:id", async (req, res) => {
    try {
      console.log("\u270F\uFE0F Atualizando cliente ID:", req.params.id, "com dados:", req.body);
      const client = await clientsStorage.updateClient(parseInt(req.params.id), req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      console.log("\u2705 Cliente atualizado:", client);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const defaultSettings = {
        companyName: "LavControl",
        theme: "dark",
        notifications: true,
        autoRefresh: true,
        refreshInterval: 30,
        language: "pt-BR"
      };
      res.json(defaultSettings);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch settings" });
    }
  });
  app2.post("/api/settings", async (req, res) => {
    try {
      res.json({ message: "Settings saved successfully", data: req.body });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to update setting" });
    }
  });
  app2.get("/api/reports/access", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const { Pool: Pool3 } = await import("pg");
      const pool2 = new Pool3({
        connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
        ssl: false
      });
      const result = await pool2.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_accesses,
          COUNT(CASE WHEN success = true THEN 1 END) as successful_accesses,
          COUNT(CASE WHEN success = false THEN 1 END) as denied_accesses
        FROM access_logs
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [startDate || "2025-01-01", endDate || "2025-12-31"]);
      await pool2.end();
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar relat\xF3rios:", error);
      res.status(500).json({ message: error.message || "Failed to fetch reports" });
    }
  });
  app2.patch("/api/devices/:id", async (req, res) => {
    try {
      const deviceId = req.params.id;
      const updateData = req.body;
      const { Pool: Pool3 } = await import("pg");
      const pool2 = new Pool3({
        connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
        ssl: false
      });
      const fields = [];
      const values = [];
      let paramCount = 1;
      if (updateData.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(updateData.name);
      }
      if (updateData.storeId) {
        fields.push(`store_id = $${paramCount++}`);
        values.push(updateData.storeId);
      }
      if (updateData.location) {
        fields.push(`location = $${paramCount++}`);
        values.push(updateData.location);
      }
      if (updateData.status) {
        fields.push(`status = $${paramCount++}`);
        values.push(updateData.status);
      }
      fields.push(`updated_at = NOW()`);
      values.push(deviceId);
      const result = await pool2.query(`
        UPDATE devices 
        SET ${fields.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      await pool2.end();
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating device:", error);
      res.status(500).json({ message: error.message || "Failed to update device" });
    }
  });
  app2.get("/api/alerts", authenticateToken, async (req, res) => {
    try {
      const alerts2 = await storage.getActiveAlerts();
      res.json(alerts2);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch alerts" });
    }
  });
  app2.patch("/api/alerts/:id/resolve", authenticateToken, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      await storage.resolveAlert(alertId);
      res.json({ message: "Alert resolved" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to resolve alert" });
    }
  });
  mqttService.subscribeToDeviceUpdates(async (deviceId, status) => {
    try {
      await storage.updateDeviceStatus(deviceId, status.online ? "online" : "offline");
      if (!status.online) {
        const device = await storage.getDeviceByDeviceId(deviceId);
        if (device) {
          await storage.createAlert({
            type: "device_offline",
            title: "Dispositivo Offline",
            message: `${device.name} (${deviceId}) est\xE1 sem conex\xE3o`,
            deviceId: device.id
          });
        }
      }
    } catch (error) {
      console.error("Error handling device status update:", error);
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws"
  });
  wss.on("connection", (ws) => {
    console.log("New WebSocket client connected");
    wsClients.add(ws);
    ws.send(JSON.stringify({
      type: "connected",
      message: "Real-time updates enabled",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      wsClients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(ws);
    });
  });
  app2.post("/api/simulate/user-entry", async (req, res) => {
    try {
      const { storeId, userId } = req.body;
      const store = await storage.getStore(storeId);
      const user = await storage.getUser(userId);
      if (!store || !user) {
        return res.status(404).json({ message: "Loja ou usu\xE1rio n\xE3o encontrado" });
      }
      await storage.createAccessLog({
        userId,
        deviceId: null,
        // Entrada simulada
        action: "entry_simulated",
        method: "simulation",
        status: "success"
      });
      const accessData = await storage.getWaveChartData();
      broadcastUpdate("access-update", accessData);
      res.json({
        message: `Entrada simulada para ${user.name} na ${store.name}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao simular entrada" });
    }
  });
  app2.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfigSistema();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao buscar configura\xE7\xF5es" });
    }
  });
  app2.put("/api/config", async (req, res) => {
    try {
      const updatedConfig = await storage.updateConfigSistema(req.body);
      res.json({
        message: "Configura\xE7\xF5es atualizadas com sucesso",
        data: updatedConfig
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao atualizar configura\xE7\xF5es" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usu\xE1rio inv\xE1lido" });
      }
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json({
        message: "Usu\xE1rio atualizado com sucesso",
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao atualizar usu\xE1rio" });
    }
  });
  app2.patch("/api/users/:id/toggle-status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usu\xE1rio inv\xE1lido" });
      }
      const { Pool: Pool3 } = await import("pg");
      const pool2 = new Pool3({
        connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
        ssl: false
      });
      try {
        const result = await pool2.query(`
          UPDATE users 
          SET is_active = NOT is_active, updated_at = NOW()
          WHERE id = $1
          RETURNING id, name, email, role, alert_level, is_active, created_at, updated_at
        `, [userId]);
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
        }
        res.json({
          message: "Status do usu\xE1rio atualizado com sucesso",
          data: result.rows[0]
        });
      } finally {
        await pool2.end();
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao atualizar status do usu\xE1rio" });
    }
  });
  app2.get("/api/dashboard/traffic-chart", async (req, res) => {
    try {
      const trafficData = await storage.getDashboardTrafficChart();
      res.json(trafficData);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao buscar dados de tr\xE1fego" });
    }
  });
  app2.get("/api/reports/store-traffic", async (req, res) => {
    try {
      const storeId = req.query.store_id ? parseInt(req.query.store_id) : void 0;
      const timeRange = req.query.timeRange || "today";
      const { Pool: Pool3 } = await import("pg");
      const pool2 = new Pool3({
        connectionString: "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres",
        ssl: false
      });
      try {
        let query = `
          SELECT 
            al.store_id,
            s.name as store_name,
            COUNT(*) as total_access,
            COUNT(CASE WHEN al.access_type = 'entry' THEN 1 END) as entries,
            COUNT(CASE WHEN al.access_type = 'exit' THEN 1 END) as exits,
            DATE(al.created_at) as access_date,
            EXTRACT(HOUR FROM al.created_at) as access_hour
          FROM access_logs al
          LEFT JOIN stores s ON al.store_id = s.id
          WHERE 1=1
        `;
        const params = [];
        const now = /* @__PURE__ */ new Date();
        if (timeRange === "today") {
          query += ` AND DATE(al.created_at) = CURRENT_DATE`;
        } else if (timeRange === "week") {
          query += ` AND al.created_at >= $${params.length + 1}`;
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          params.push(weekAgo.toISOString());
        } else if (timeRange === "month") {
          query += ` AND al.created_at >= $${params.length + 1}`;
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
          params.push(monthAgo.toISOString());
        }
        if (storeId) {
          query += ` AND al.store_id = $${params.length + 1}`;
          params.push(storeId);
        }
        query += `
          GROUP BY al.store_id, s.name, DATE(al.created_at), EXTRACT(HOUR FROM al.created_at)
          ORDER BY access_date DESC, access_hour DESC
        `;
        const result = await pool2.query(query, params);
        res.json(result.rows);
      } finally {
        await pool2.end();
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao buscar relat\xF3rio de tr\xE1fego" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
process.env.DATABASE_URL = "postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
