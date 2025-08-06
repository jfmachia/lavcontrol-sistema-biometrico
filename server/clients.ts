import { Pool } from 'pg';

export class ClientsStorage {
  private async getPool() {
    return new Pool({
      connectionString: 'postgresql://postgres:929d54bc0ff22387163f04cfb3b3d0fa@148.230.78.128:5432/postgres',
      ssl: false,
    });
  }

  async getAllClients(): Promise<any[]> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(`
        SELECT c.*, s.name as store_name, s.address as store_address
        FROM clients c
        LEFT JOIN stores s ON c.store_id = s.id
        ORDER BY c.created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        cpf: row.cpf,
        profileImageUrl: row.profile_image_url,
        status: row.status,
        storeId: row.store_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        store: row.store_name ? {
          id: row.store_id,
          name: row.store_name,
          address: row.store_address
        } : null
      }));
    } finally {
      await pool.end();
    }
  }

  async getClient(id: number): Promise<any | null> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(`
        SELECT c.*, s.name as store_name
        FROM clients c
        LEFT JOIN stores s ON c.store_id = s.id
        WHERE c.id = $1
      `, [id]);
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        cpf: row.cpf,
        profileImageUrl: row.profile_image_url,
        status: row.status,
        storeId: row.store_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        store: row.store_name ? {
          name: row.store_name
        } : null
      };
    } finally {
      await pool.end();
    }
  }

  async createClient(clientData: any): Promise<any> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(`
        INSERT INTO clients (name, email, phone, cpf, profile_image_url, status, store_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `, [
        clientData.name,
        clientData.email,
        clientData.phone,
        clientData.cpf,
        clientData.profileImageUrl,
        clientData.status || 'active',
        clientData.storeId
      ]);
      
      return result.rows[0];
    } finally {
      await pool.end();
    }
  }

  async updateClient(id: number, clientData: any): Promise<any | null> {
    const pool = await this.getPool();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      if (clientData.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(clientData.name);
      }
      if (clientData.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(clientData.email);
      }
      if (clientData.phone) {
        fields.push(`phone = $${paramCount++}`);
        values.push(clientData.phone);
      }
      if (clientData.cpf) {
        fields.push(`cpf = $${paramCount++}`);
        values.push(clientData.cpf);
      }
      if (clientData.status) {
        fields.push(`status = $${paramCount++}`);
        values.push(clientData.status);
      }
      if (clientData.storeId) {
        fields.push(`store_id = $${paramCount++}`);
        values.push(clientData.storeId);
      }
      
      fields.push(`updated_at = NOW()`);
      values.push(id);
      
      const result = await pool.query(`
        UPDATE clients 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      
      return result.rows[0] || null;
    } finally {
      await pool.end();
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    const pool = await this.getPool();
    try {
      const result = await pool.query(`DELETE FROM clients WHERE id = $1`, [id]);
      return result.rowCount > 0;
    } finally {
      await pool.end();
    }
  }
}

export const clientsStorage = new ClientsStorage();