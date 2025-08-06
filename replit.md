# Overview

LavControl é um sistema completo de controle de acesso biométrico para lojas e condomínios. O sistema oferece autenticação de usuários, gestão de dispositivos, registro de acessos e comunicação MQTT em tempo real via N8N para controle de dispositivos físicos de acesso. Construído como uma aplicação web full-stack com frontend React moderno e backend Express.js, oferece um dashboard completo para gerenciar usuários, dispositivos, logs de acesso e alertas do sistema.

# User Preferences

Preferred communication style: Português simples e direto.
System name: LavControl
MQTT integration: Via N8N (external service handles database updates)
Alert system: Para classificação de usuários (amarelo = notificação, VIP = perfil especial)
Layout: Seguir o design da imagem anexa com esquema de cores específico
Dark Mode: Sistema totalmente implementado em modo escuro/dark mode
KPIs: Tráfego de usuários entrando nas lojas deve ser exibido corretamente nos dashboards

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **API Design**: RESTful API endpoints with consistent error handling
- **Real-time Communication**: MQTT client for device command transmission

## Database Design
- **Database**: PostgreSQL VPS exclusivamente (148.230.78.128:5432) - banco local desabilitado
- **Schema Definition**: Estrutura real do banco VPS com campos específicos em `shared/schema.ts`
- **Core Tables**:
  - `users`: Contas de usuário com autenticação por email e sistema de bloqueio
  - `stores`: Lojas com campos específicos do sistema (loja, nome_loja, endereco, etc.)
  - `devices`: Dispositivos físicos com status e localização
  - `access_logs`: Logs de acesso com suporte para clientes e dispositivos
  - `clients`: Clientes das lavanderias com níveis de alerta
  - `alerts`: Notificações do sistema
- **Conexão**: Pool direto ao PostgreSQL VPS ignorando DATABASE_URL local
- **Autenticação**: bcrypt para senhas, sistema de tentativas e bloqueio temporal

## Authentication & Authorization
- **Strategy**: JWT token-based authentication stored in localStorage
- **Password Security**: bcryptjs hashing with salt rounds
- **Route Protection**: Higher-order component pattern for protected routes
- **Session Management**: Token-based sessions with configurable expiration

## Real-time Device Communication
- **Protocol**: MQTT for lightweight device communication
- **Message Format**: JSON payloads with command, data, and timestamp
- **Topic Structure**: `device/{deviceId}/command` for device-specific commands
- **Connection Management**: Automatic reconnection and error handling

# External Dependencies

## Database
- **PostgreSQL VPS**: Banco de dados principal rodando em VPS dedicada (212.85.1.24:5435)
- **Connection**: Conexão direta via pg driver para máxima performance
- **ORM**: Drizzle ORM para gerenciamento de schema e queries
- **Dados**: Sistema totalmente populado com dados reais de 8 usuários, 10 lojas, 15 dispositivos

## UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide Icons**: Modern icon library for UI elements

## Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer

## MQTT Communication
- **Broker**: Configurable MQTT broker (default: broker.emqx.io)
- **Client Library**: mqtt.js for Node.js MQTT client implementation
- **Message Handling**: JSON-based command structure for device control

## Form Handling
- **React Hook Form**: Performant form library with validation
- **Zod**: Schema validation for both frontend and backend
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Date/Time Management
- **date-fns**: Lightweight date manipulation library for timestamps and formatting