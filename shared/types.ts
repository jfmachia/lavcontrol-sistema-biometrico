// Tipos para o LavControl Frontend - n8n Backend

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  lastLogin: string | null;
  loginAttempts: number;
  blockedUntil: string | null;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  horario_seg_sex: string;
  horario_sabado: string;
  horario_domingo: string;
  valor_lv: number;
  valor_s: number;
  senha_wifi: string;
  whats_atendimento: string;
  observacoes: string;
  status: 'online' | 'offline';
  lastConnection: string | null;
}

export interface Device {
  id: number;
  name: string;
  deviceId: string;
  storeId: number;
  type: 'entrada' | 'saida';
  status: 'online' | 'offline' | 'maintenance';
  lastPing: string | null;
  firmwareVersion: string;
  ipAddress: string;
  location: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  classification: 'active' | 'alert' | 'vip' | 'blocked';
  lastAccess: string | null;
  accessCount: number;
  registrationDate: string;
  biometricData?: string;
}

export interface AccessLog {
  id: number;
  userId: number | null;
  clientId: number | null;
  deviceId: number;
  storeId: number;
  timestamp: string;
  type: 'entry' | 'exit';
  method: 'biometric' | 'card' | 'manual';
  success: boolean;
  details?: string;
}

export interface Alert {
  id: number;
  type: 'security' | 'device' | 'access' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  userId?: number;
  storeId?: number;
  deviceId?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  activeDevices: number;
  todayAccess: number;
  onlineStores: number;
}

export interface TrafficData {
  date: string;
  value: number;
}

export interface WaveData {
  time: string;
  value: number;
}

// Form Types para inserção
export interface CreateUser {
  email: string;
  name: string;
  password: string;
}

export interface CreateStore {
  name: string;
  address: string;
  phone: string;
  horario_seg_sex: string;
  horario_sabado: string;
  horario_domingo: string;
  valor_lv: number;
  valor_s: number;
  senha_wifi: string;
  whats_atendimento: string;
  observacoes?: string;
}

export interface CreateDevice {
  name: string;
  deviceId: string;
  storeId: number;
  type: 'entrada' | 'saida';
  firmwareVersion: string;
  location: string;
}

export interface CreateClient {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  classification: 'active' | 'alert' | 'vip' | 'blocked';
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'device_status' | 'access_event' | 'alert' | 'store_update';
  payload: any;
  timestamp: string;
}

export interface DeviceCommand {
  deviceId: string;
  command: 'unlock' | 'lock' | 'reboot' | 'status';
  parameters?: Record<string, any>;
}