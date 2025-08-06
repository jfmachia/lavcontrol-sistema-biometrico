-- Script para criar tabelas e dados na VPS PostgreSQL (212.85.1.24:5435)

-- Tabela de usuários
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'franqueado' NOT NULL,
    profile_image TEXT,
    alert_level TEXT DEFAULT 'normal' NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela de lojas
DROP TABLE IF EXISTS stores CASCADE;
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    loja TEXT NOT NULL,
    nome_loja TEXT NOT NULL,
    nome_ia TEXT,
    endereco TEXT,
    telefone TEXT,
    gerente TEXT,
    biometria TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela de dispositivos
DROP TABLE IF EXISTS devices CASCADE;
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    device_id TEXT NOT NULL UNIQUE,
    store_id INTEGER NOT NULL,
    status TEXT DEFAULT 'offline' NOT NULL,
    last_ping TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela de logs de acesso
DROP TABLE IF EXISTS access_logs CASCADE;
CREATE TABLE access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    device_id INTEGER,
    action TEXT NOT NULL,
    method TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status TEXT NOT NULL
);

-- Tabela de alertas
DROP TABLE IF EXISTS alerts CASCADE;
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    device_id INTEGER,
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Inserir dados de teste

-- Usuários
INSERT INTO users (name, email, password, role, alert_level, is_blocked, is_active) VALUES
('Super Admin LavControl', 'admin@lavcontrol.com', '$2b$10$hash1', 'admin', 'normal', false, true),
('VIP Executive Ana Lima', 'ana.vip@empresa.com', '$2b$10$hash2', 'franqueado', 'vip', false, true),
('Funcionário João Silva', 'joao.func@empresa.com', '$2b$10$hash3', 'franqueado', 'normal', false, true),
('Funcionária Maria Santos', 'maria.func@empresa.com', '$2b$10$hash4', 'franqueado', 'amarelo', false, true),
('Funcionário Carlos Costa', 'carlos.func@empresa.com', '$2b$10$hash5', 'franqueado', 'normal', false, true),
('Funcionário Roberto Tech', 'roberto.tech@empresa.com', '$2b$10$hash6', 'tecnico', 'normal', false, true),
('Cliente Shopping Center', 'cliente1@shopping.com', '$2b$10$hash7', 'franqueado', 'normal', false, true),
('Cliente Condomínio Elite', 'cliente2@cond.com', '$2b$10$hash8', 'franqueado', 'vip', false, true),
('Técnico São Paulo', 'tecnico1@lavcontrol.com', '$2b$10$hash9', 'tecnico', 'normal', false, true),
('Manager Premium Plaza', 'manager1@plaza.com', '$2b$10$hash10', 'franqueado', 'amarelo', false, true);

-- Lojas
INSERT INTO stores (loja, nome_loja, endereco, telefone, gerente, user_id, is_active) VALUES
('LV011', 'Shopping Eldorado', 'Av. Rebouças, 3970 - Pinheiros, São Paulo', '(11) 3003-4455', 'João Silva', 3, true),
('LV012', 'Condomínio Alpha', 'Rua Augusta, 1200 - Consolação, São Paulo', '(11) 3004-5566', 'Maria Santos', 4, true),
('LV013', 'Business Tower', 'Av. Paulista, 1500 - Bela Vista, São Paulo', '(11) 3005-6677', 'Carlos Costa', 5, true),
('LV014', 'LavControl Jardins', 'Rua Oscar Freire, 800 - Jardins, São Paulo', '(11) 3006-7788', 'Ana Lima', 2, true),
('LV015', 'LavControl Leblon', 'Rua Dias Ferreira, 200 - Leblon, Rio de Janeiro', '(21) 3007-8899', 'Roberto Tech', 6, true),
('LV016', 'LavControl Barra', 'Av. das Américas, 3000 - Barra da Tijuca, Rio de Janeiro', '(21) 3008-9900', 'Cliente Shopping', 7, true),
('LV017', 'LavControl Savassi', 'Rua Pernambuco, 1000 - Savassi, Belo Horizonte', '(31) 3009-1122', 'Cliente Elite', 8, true),
('LV018', 'LavControl Pinheiros', 'Rua Teodoro Sampaio, 500 - Pinheiros, São Paulo', '(11) 3010-2233', 'Técnico SP', 9, true),
('LV019', 'Plaza Premium', 'Rua XV de Novembro, 300 - Centro, São Paulo', '(11) 3011-3344', 'Manager Premium', 10, true),
('LV020', 'Corporate Center', 'Av. Faria Lima, 2000 - Itaim Bibi, São Paulo', '(11) 3012-4455', 'Admin LavControl', 1, true);

-- Dispositivos
INSERT INTO devices (name, device_id, store_id, status, last_ping) VALUES
('Entrada Principal - Shopping Eldorado', 'DEV_001_ELDORADO', 1, 'online', CURRENT_TIMESTAMP),
('Saída Funcionários - Shopping Eldorado', 'DEV_002_ELDORADO', 1, 'online', CURRENT_TIMESTAMP),
('Portaria Alpha', 'DEV_001_ALPHA', 2, 'online', CURRENT_TIMESTAMP),
('Garagem Alpha', 'DEV_002_ALPHA', 2, 'offline', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('Recepção Business Tower', 'DEV_001_TOWER', 3, 'online', CURRENT_TIMESTAMP),
('Elevador Business Tower', 'DEV_002_TOWER', 3, 'online', CURRENT_TIMESTAMP),
('Entrada Jardins', 'DEV_001_JARDINS', 4, 'online', CURRENT_TIMESTAMP),
('Sala VIP Jardins', 'DEV_002_JARDINS', 4, 'online', CURRENT_TIMESTAMP),
('Portaria Leblon', 'DEV_001_LEBLON', 5, 'offline', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('Academia Leblon', 'DEV_002_LEBLON', 5, 'online', CURRENT_TIMESTAMP),
('Shopping Barra - Entrada', 'DEV_001_BARRA', 6, 'online', CURRENT_TIMESTAMP),
('Shopping Barra - Praça', 'DEV_002_BARRA', 6, 'online', CURRENT_TIMESTAMP),
('Condomínio Savassi', 'DEV_001_SAVASSI', 7, 'online', CURRENT_TIMESTAMP),
('Piscina Savassi', 'DEV_002_SAVASSI', 7, 'online', CURRENT_TIMESTAMP),
('Coworking Pinheiros', 'DEV_001_PINHEIROS', 8, 'online', CURRENT_TIMESTAMP);

-- Logs de acesso (últimas 48 horas)
INSERT INTO access_logs (user_id, device_id, action, method, timestamp, status) VALUES
(3, 1, 'access_granted', 'facial_recognition', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 'success'),
(4, 3, 'access_granted', 'card', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 'success'),
(5, 5, 'access_granted', 'facial_recognition', CURRENT_TIMESTAMP - INTERVAL '25 minutes', 'success'),
(6, 7, 'access_granted', 'card', CURRENT_TIMESTAMP - INTERVAL '35 minutes', 'success'),
(2, 8, 'access_granted', 'facial_recognition', CURRENT_TIMESTAMP - INTERVAL '45 minutes', 'success'),
(7, 11, 'access_granted', 'card', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'success'),
(8, 13, 'access_granted', 'facial_recognition', CURRENT_TIMESTAMP - INTERVAL '1.5 hours', 'success'),
(9, 15, 'access_granted', 'card', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'success'),
(10, 1, 'access_denied', 'facial_recognition', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'failed'),
(3, 2, 'access_granted', 'card', CURRENT_TIMESTAMP - INTERVAL '4 hours', 'success');

-- Alertas
INSERT INTO alerts (type, title, message, device_id, is_resolved) VALUES
('device_offline', 'Dispositivo Offline', 'Garagem Alpha está offline há mais de 2 horas', 4, false),
('device_offline', 'Dispositivo Offline', 'Portaria Leblon perdeu conexão', 9, false),
('unauthorized_access', 'Tentativa de Acesso Negada', 'Múltiplas tentativas de acesso falharam no Plaza Premium', 1, false),
('maintenance_required', 'Manutenção Necessária', 'Dispositivo Coworking Pinheiros precisa de calibração', 15, true);

-- Criar índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_stores_active ON stores(is_active);
CREATE INDEX idx_devices_store ON devices(store_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_access_logs_user ON access_logs(user_id);
CREATE INDEX idx_access_logs_device ON access_logs(device_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_alerts_resolved ON alerts(is_resolved);

-- Confirmar criação
SELECT 'Tabelas criadas e populadas com sucesso!' as resultado;