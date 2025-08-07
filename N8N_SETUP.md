# LavControl - Configuração do Frontend + Backend n8n

## 🎨 Frontend React Standalone

O frontend foi separado do backend e agora pode ser deployado independentemente. Ele se comunica com APIs REST que você criará no n8n.

## 🔧 Como Configurar

### 1. Build do Frontend

```bash
# Tornar script executável
chmod +x build-frontend.sh

# Executar build
./build-frontend.sh
```

### 2. Configurar URLs do n8n

Edite o arquivo `.env`:

```env
VITE_N8N_BASE_URL=https://seu-n8n.com/webhook
VITE_N8N_WS_URL=wss://seu-n8n.com/websocket
```

### 3. Deploy do Frontend

#### Opção A: Docker
```bash
# Fazer build
./build-frontend.sh

# Criar imagem Docker
docker build -f Dockerfile-frontend -t lavcontrol-frontend .

# Executar
docker run -p 80:80 lavcontrol-frontend
```

#### Opção B: Servidor Web
Copie os arquivos da pasta `dist/` para seu servidor web (Apache, Nginx, etc.)

## 🤖 APIs que o n8n precisa implementar

### Autenticação

#### POST /auth/login
```json
// Request
{
  "email": "admin@lavcontrol.com",
  "password": "123456"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@lavcontrol.com",
      "name": "Administrador",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isBlocked": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/register
```json
// Request
{
  "name": "Novo Usuário",
  "email": "user@example.com",
  "password": "senha123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "user@example.com",
      "name": "Novo Usuário",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isBlocked": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /auth/user
```json
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@lavcontrol.com",
    "name": "Administrador",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isBlocked": false
  }
}
```

### Usuários

#### GET /users
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@lavcontrol.com",
      "name": "Administrador",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "isBlocked": false,
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "loginAttempts": 0
    }
  ]
}
```

#### POST /users
```json
// Request
{
  "name": "Novo Usuário",
  "email": "novo@example.com",
  "password": "senha123"
}

// Response
{
  "success": true,
  "data": {
    "id": 3,
    "email": "novo@example.com",
    "name": "Novo Usuário",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isBlocked": false
  }
}
```

### Lojas

#### GET /stores
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Lavô Shopping",
      "address": "Shopping Center, Loja 123",
      "phone": "(11) 99999-9999",
      "horario_seg_sex": "08:00-18:00",
      "horario_sabado": "09:00-17:00",
      "horario_domingo": "10:00-16:00",
      "valor_lv": 15.00,
      "valor_s": 20.00,
      "senha_wifi": "lavo123456",
      "whats_atendimento": "(11) 88888-8888",
      "observacoes": "Loja principal",
      "status": "online",
      "lastConnection": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### Dispositivos

#### GET /devices
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Catraca Entrada",
      "deviceId": "DEV001",
      "storeId": 1,
      "type": "entrada",
      "status": "online",
      "lastPing": "2024-01-01T12:00:00.000Z",
      "firmwareVersion": "1.2.3",
      "ipAddress": "192.168.1.100",
      "location": "Entrada Principal"
    }
  ]
}
```

### Clientes

#### GET /clients
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "(11) 77777-7777",
      "cpf": "123.456.789-00",
      "classification": "active",
      "lastAccess": "2024-01-01T10:00:00.000Z",
      "accessCount": 25,
      "registrationDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Logs de Acesso

#### GET /access-logs
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": null,
      "clientId": 1,
      "deviceId": 1,
      "storeId": 1,
      "timestamp": "2024-01-01T10:00:00.000Z",
      "type": "entry",
      "method": "biometric",
      "success": true,
      "details": "Acesso liberado"
    }
  ]
}
```

### Dashboard

#### GET /dashboard/stats
```json
// Response
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "activeDevices": 5,
    "todayAccess": 150,
    "onlineStores": 3
  }
}
```

#### GET /dashboard/traffic-chart
```json
// Response
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "value": 45
    },
    {
      "date": "2024-01-02",
      "value": 52
    }
  ]
}
```

#### GET /dashboard/wave-chart
```json
// Response
{
  "success": true,
  "data": [
    {
      "time": "08:00",
      "value": 15
    },
    {
      "time": "09:00",
      "value": 25
    }
  ]
}
```

### Comandos de Dispositivo

#### POST /device/command
```json
// Request
{
  "deviceId": "DEV001",
  "command": "unlock",
  "parameters": {
    "duration": 5
  }
}

// Response
{
  "success": true,
  "data": {
    "message": "Comando enviado com sucesso",
    "commandId": "CMD123"
  }
}
```

## 📋 Estrutura dos Workflows no n8n

### 1. Webhook de Login
- **Método**: POST
- **URL**: `/auth/login`
- **Função**: Validar credenciais no PostgreSQL e retornar JWT

### 2. Webhook de Dados
- **Método**: GET/POST/PUT/DELETE
- **URLs**: `/users`, `/stores`, `/devices`, `/clients`, etc.
- **Função**: CRUD nas tabelas do PostgreSQL

### 3. Webhook de Dashboard
- **Método**: GET
- **URLs**: `/dashboard/*`
- **Função**: Consultar dados agregados para gráficos

### 4. Webhook de Comandos
- **Método**: POST
- **URL**: `/device/command`
- **Função**: Enviar comandos via MQTT para dispositivos

## 🛠️ CORS

Lembre-se de configurar CORS no n8n para permitir chamadas do frontend:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

## 📋 Banco de Dados

O banco PostgreSQL (148.230.78.128:5432) já está configurado com todas as tabelas. Use as seguintes credenciais nos workflows do n8n:

- **Host**: 148.230.78.128
- **Porta**: 5432
- **Banco**: postgres
- **Usuário**: postgres
- **Senha**: 929d54bc0ff22387163f04cfb3b3d0fa

## ✅ Checklist de Deploy

- [ ] Executar `./build-frontend.sh`
- [ ] Configurar `.env` com URLs do n8n
- [ ] Criar workflows no n8n para cada endpoint
- [ ] Configurar CORS no n8n
- [ ] Testar autenticação (login/register)
- [ ] Testar CRUD das entidades principais
- [ ] Configurar WebSocket (se necessário)
- [ ] Deploy do frontend em servidor web

## 🌐 URLs de Teste

Depois do deploy, o frontend estará acessível em:
- **Local**: http://localhost (se usando Docker)
- **Produção**: Sua URL configurada

O frontend tentará se conectar automaticamente com as URLs configuradas no `.env`.

---

🎉 **Agora você tem um frontend React completamente independente que pode ser deployado em qualquer servidor web e se conectar com seu backend n8n!**