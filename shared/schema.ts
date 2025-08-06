import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== MAIN TABLES =====

export const users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").default(sql`NOW()`),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  address: varchar("address"), 
  phone: varchar("phone"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  managerName: varchar("manager_name"),
  openingHours: text("opening_hours"), // jsonb no banco mas text no código
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
  manager: varchar("manager"),
});

export const devices = pgTable("devices", {
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
  location: varchar("location"),
  biometria: varchar("biometria"),
  lastPing: timestamp("last_ping"),
});

export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // string no VPS
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
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // device_offline, multiple_denies, unauthorized_access
  title: text("title").notNull(),
  message: text("message").notNull(),
  deviceId: integer("device_id"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ===== LAUNDRY FRANCHISE SYSTEM TABLES =====

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  cpf: text("cpf").unique(),
  birthDate: timestamp("birth_date"),
  address: text("address"),
  profileImage: text("profile_image"),
  alertLevel: text("alert_level").default("normal").notNull(), // normal, amarelo, vip
  isBlocked: boolean("is_blocked").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  storeId: integer("store_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const clientEntries = pgTable("client_entries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  storeId: integer("store_id"),
  deviceId: integer("device_id"),
  entryType: text("entry_type").notNull(), // 'entry', 'exit', 'machine_use'
  machineType: text("machine_type"), // 'lavadora', 'secadora', 'centrifuga'
  machineNumber: text("machine_number"),
  serviceType: text("service_type"), // 'lavagem', 'secagem', 'lavagem_e_secagem'
  paymentMethod: text("payment_method"), // 'dinheiro', 'cartao', 'pix', 'credito_app'
  amountPaid: text("amount_paid"), // Using text to handle decimal values
  durationMinutes: integer("duration_minutes"),
  status: text("status").default("active").notNull(), // 'active', 'completed', 'cancelled'
  entryTime: timestamp("entry_time").default(sql`CURRENT_TIMESTAMP`).notNull(),
  exitTime: timestamp("exit_time"),
  notes: text("notes"),
});

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ many }) => ({
  accessLogs: many(accessLogs),
  stores: many(stores),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  user: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  devices: many(devices),
  clients: many(clients),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  store: one(stores, {
    fields: [devices.storeId],
    references: [stores.id],
  }),
  accessLogs: many(accessLogs),
  alerts: many(alerts),
  clientEntries: many(clientEntries),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [accessLogs.clientId],
    references: [clients.id],
  }),
  device: one(devices, {
    fields: [accessLogs.deviceId],
    references: [devices.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  store: one(stores, {
    fields: [clients.storeId],
    references: [stores.id],
  }),
  entries: many(clientEntries),
  accessLogs: many(accessLogs),
}));

export const clientEntriesRelations = relations(clientEntries, ({ one }) => ({
  client: one(clients, {
    fields: [clientEntries.clientId],
    references: [clients.id],
  }),
  store: one(stores, {
    fields: [clientEntries.storeId],
    references: [stores.id],
  }),
  device: one(devices, {
    fields: [clientEntries.deviceId],
    references: [devices.id],
  }),
}));

// ===== INSERT SCHEMAS =====

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  lastPing: true,
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientEntrySchema = createInsertSchema(clientEntries).omit({
  id: true,
  entryTime: true,
});

// ===== AUTH SCHEMAS =====

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["admin", "franqueado", "tecnico", "utilizador"]).default("franqueado"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

// ===== TYPES =====

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ClientEntry = typeof clientEntries.$inferSelect;
export type InsertClientEntry = z.infer<typeof insertClientEntrySchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;