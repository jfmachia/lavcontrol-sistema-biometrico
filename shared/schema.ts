import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("franqueado").notNull(), // admin, franqueado, tecnico, utilizador
  profileImage: text("profile_image"),
  alertLevel: text("alert_level").default("normal").notNull(), // normal, amarelo, vip
  isBlocked: boolean("is_blocked").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  loja: text("loja").notNull(), // nome_loja
  nome_loja: text("nome_loja").notNull(),
  nome_ia: text("nome_ia"),
  nv_loja: text("nv_loja"),
  endereco: text("endereco"),
  senha_porta: text("senha_porta"),
  senha_wifi: text("senha_wifi"),
  horario_seg_sex: text("horario_seg_sex"),
  horario_sab: text("horario_sab"),
  horario_dom: text("horario_dom"),
  whats_atendimento: text("whats_atendimento"),
  ponto_referencia: text("ponto_referencia"),
  valor_lv: text("valor_lv"),
  valor_s: text("valor_s"),
  cesto_grande: text("cesto_grande"),
  valor_lv2: text("valor_lv2"),
  valor_s2: text("valor_s2"),
  estacionamento: boolean("estacionamento").default(false),
  delivery: boolean("delivery").default(false),
  deixou: boolean("deixou").default(false),
  assistente: text("assistente"),
  cash_back: text("cash_back"),
  cupons: text("cupons"),
  promocao: text("promocao"),
  data: timestamp("data").default(sql`CURRENT_TIMESTAMP`),
  instancia_loja: text("instancia_loja"),
  lvs_numero: text("lvs_numero"),
  s2_numero: text("s2_numero"),
  observacao_tentativas_solucao: text("observacao_tentativas_solucao"),
  observacoes: text("observacoes"),
  cidade: text("cidade"),
  estado: text("estado"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  numero: text("numero"),
  ordem: text("ordem"),
  voz: text("voz"),
  msg_ini: text("msg_ini"),
  biometria: text("biometria"),
  // Campos legados para compatibilidade
  name: text("name"),
  address: text("address"),
  phone: text("phone"),
  manager: text("manager"),
  userId: integer("user_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  deviceId: text("device_id").notNull().unique(),
  storeId: integer("store_id").notNull(),
  status: text("status").default("offline").notNull(), // online, offline, maintenance
  lastPing: timestamp("last_ping"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  deviceId: integer("device_id"),
  action: text("action").notNull(), // access_granted, access_denied, device_command
  method: text("method"), // card, facial_recognition, manual
  timestamp: timestamp("timestamp").default(sql`CURRENT_TIMESTAMP`).notNull(),
  status: text("status").notNull(), // success, failed
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

// Relations
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
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  store: one(stores, {
    fields: [devices.storeId],
    references: [stores.id],
  }),
  accessLogs: many(accessLogs),
  alerts: many(alerts),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
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

// Insert schemas
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

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["master", "franqueado", "tecnico"]).default("franqueado"),
});

// Types
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
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
