import { Pool } from 'pg';

describe('Database Schema', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'controle_impostos_dev',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Tables', () => {
    it('should have users table', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'users'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have empresas table', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'empresas'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have impostos_mensal table', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'impostos_mensal'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have usuario_empresa table', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'usuario_empresa'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have auditoria table', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'auditoria'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });
  });

  describe('Constraints', () => {
    it('should reject duplicate email in users', async () => {
      await pool.query(
        'INSERT INTO users (email, senha_hash, nome, role) VALUES ($1, $2, $3, $4)',
        ['test@test.com', 'hash1', 'Test User', 'admin']
      );

      expect(
        pool.query(
          'INSERT INTO users (email, senha_hash, nome, role) VALUES ($1, $2, $3, $4)',
          ['test@test.com', 'hash2', 'Another User', 'admin']
        )
      ).rejects.toThrow();
    });

    it('should reject invalid role values', async () => {
      expect(
        pool.query(
          'INSERT INTO users (email, senha_hash, nome, role) VALUES ($1, $2, $3, $4)',
          ['invalid@test.com', 'hash', 'Invalid User', 'invalid_role']
        )
      ).rejects.toThrow();
    });

    it('should reject invalid mes values (> 12)', async () => {
      const empresaResult = await pool.query('SELECT id FROM empresas LIMIT 1');
      const empresaId = empresaResult.rows[0]?.id;

      if (empresaId) {
        expect(
          pool.query(
            'INSERT INTO impostos_mensal (empresa_id, mes, ano) VALUES ($1, $2, $3)',
            [empresaId, 13, 2026]
          )
        ).rejects.toThrow();
      }
    });

    it('should reject invalid mes values (< 1)', async () => {
      const empresaResult = await pool.query('SELECT id FROM empresas LIMIT 1');
      const empresaId = empresaResult.rows[0]?.id;

      if (empresaId) {
        expect(
          pool.query(
            'INSERT INTO impostos_mensal (empresa_id, mes, ano) VALUES ($1, $2, $3)',
            [empresaId, 0, 2026]
          )
        ).rejects.toThrow();
      }
    });
  });

  describe('Foreign Keys', () => {
    it('should cascade delete impostos when empresa is deleted', async () => {
      const empresaResult = await pool.query(
        'INSERT INTO empresas (cnpj, nome) VALUES ($1, $2) RETURNING id',
        ['99.999.999/0001-99', 'Temp Company']
      );
      const empresaId = empresaResult.rows[0].id;

      await pool.query(
        'INSERT INTO impostos_mensal (empresa_id, mes, ano) VALUES ($1, $2, $3)',
        [empresaId, 1, 2026]
      );

      await pool.query('DELETE FROM empresas WHERE id = $1', [empresaId]);

      const impostoResult = await pool.query(
        'SELECT COUNT(*) FROM impostos_mensal WHERE empresa_id = $1',
        [empresaId]
      );

      expect(parseInt(impostoResult.rows[0].count)).toBe(0);
    });
  });

  describe('Indices', () => {
    it('should have index on users.email', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE tablename = 'users' AND indexname = 'idx_users_email'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });

    it('should have index on empresas.cnpj', async () => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM pg_indexes
          WHERE tablename = 'empresas' AND indexname = 'idx_empresas_cnpj'
        )`
      );
      expect(result.rows[0].exists).toBe(true);
    });
  });
});
