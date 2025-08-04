# Overview

This is a comprehensive SaaS application for access control management designed for stores and condominiums. The system provides user authentication, device management, access logging, and real-time MQTT communication for controlling physical access devices. Built as a full-stack web application with a modern React frontend and Express.js backend, it offers a complete dashboard for managing users, devices, access logs, and system alerts.

# User Preferences

Preferred communication style: Simple, everyday language.

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
- **Schema Definition**: Centralized in `shared/schema.ts` using Drizzle schema definitions
- **Core Tables**:
  - `users`: User accounts with email authentication
  - `devices`: Physical access control devices with status tracking
  - `access_logs`: Audit trail of all access attempts and device commands
  - `alerts`: System notifications for offline devices and security events
- **Relationships**: Proper foreign key relationships between users, devices, and logs
- **Migrations**: Drizzle Kit for schema migrations and database management

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
- **Neon Database**: PostgreSQL-compatible serverless database
- **Connection**: WebSocket-based connection pool for serverless environments
- **ORM**: Drizzle ORM for schema management and query building

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