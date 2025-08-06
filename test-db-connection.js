// Script rápido para testar conectividade direta
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres'
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado com sucesso!');
    
    const result = await client.query('SELECT email, failed_login_attempts, locked_until FROM users WHERE email = $1', ['admin@lavcontrol.com']);
    console.log('📊 Dados do usuário admin:', result.rows[0]);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

testConnection();