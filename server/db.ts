import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Configure connection for your VPS PostgreSQL (212.85.1.24:5435)
// Force VPS connection instead of Replit's Neon database
const connectionConfig = {
  host: '212.85.1.24',
  port: 5435,
  database: 'postgres',  
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl: false, // Disable SSL for VPS connection
  connectTimeoutMS: 10000,
  idleTimeoutMillis: 30000,
};

console.log('🔌 Connecting to VPS PostgreSQL at 212.85.1.24:5435');
const pool = new Pool(connectionConfig);

// Test connection
pool.connect().then(client => {
  console.log('✅ Successfully connected to VPS PostgreSQL');
  client.release();
}).catch(err => {
  console.error('❌ Failed to connect to VPS PostgreSQL:', err.message);
});

export const db = drizzle(pool, { schema });
export { pool };