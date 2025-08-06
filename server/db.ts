import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Configure connection for your VPS PostgreSQL
const connectionConfig = {
  host: process.env.POSTGRES_HOST || '212.85.1.24',
  port: parseInt(process.env.POSTGRES_PORT || '5435'),
  database: process.env.POSTGRES_DB || 'postgres',  
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl: false, // Disable SSL for local VPS connection
};

// Use DATABASE_URL if provided, otherwise use individual config
let pool: Pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  pool = new Pool(connectionConfig);
}

export const db = drizzle(pool, { schema });
export { pool };