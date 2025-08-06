import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Configuração FORÇADA para PostgreSQL da VPS - ignorar DATABASE_URL
const connectionString = 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres';

const connectionConfig = {
  connectionString,
  ssl: false,
  connectTimeoutMS: 10000,
  idleTimeoutMillis: 30000,
};

console.log('🔌 Conectando ao PostgreSQL da VPS (148.230.78.128:5432)...');
console.log('🔑 Usando conexão direta à VPS:', connectionString.replace(/:[^:]+@/, ':****@'));
const pool = new Pool(connectionConfig);

// Testar conexão e criar tabelas se necessário
pool.connect().then(async client => {
  console.log('✅ Conectado com sucesso ao PostgreSQL da VPS');
  
  // Verificar se tabelas existem
  const result = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  
  if (result.rows.length === 0) {
    console.log('🛠️ Nenhuma tabela encontrada. Executando setup do banco...');
    // Aqui poderia executar o script SQL de setup
  } else {
    console.log(`📊 Encontradas ${result.rows.length} tabelas:`, result.rows.map(r => r.table_name));
  }
  
  client.release();
}).catch(err => {
  console.error('❌ Erro ao conectar à VPS PostgreSQL:', err.message);
  console.log('📝 Dica: Verifique se a senha está correta ou configure VPS_POSTGRES_PASSWORD');
});

export const db = drizzle(pool, { schema });
export { pool };