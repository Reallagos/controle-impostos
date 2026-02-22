import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const SALT_ROUNDS = 10;

export async function seedDatabase(pool: Pool): Promise<void> {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // 1. Criar usuário admin
    const adminEmail = 'admin@controle-impostos.dev';
    const adminPassword = 'admin123';
    const adminHash = bcrypt.hashSync(adminPassword, SALT_ROUNDS);

    await pool.query(
      `INSERT INTO users (email, senha_hash, nome, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, adminHash, 'Administrador Sistema', 'admin']
    );

    console.log('✅ Usuário admin criado');

    // 2. Criar usuários de teste (contador e gerente)
    const contadorHash = bcrypt.hashSync('contador123', SALT_ROUNDS);
    const gerenteHash = bcrypt.hashSync('gerente123', SALT_ROUNDS);

    await pool.query(
      `INSERT INTO users (email, senha_hash, nome, role)
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      [
        'contador@controle-impostos.dev',
        contadorHash,
        'João Contador',
        'contador',
        'gerente@controle-impostos.dev',
        gerenteHash,
        'Maria Gerente',
        'gerente',
      ]
    );

    console.log('✅ Usuários contador e gerente criados');

    // 3. Obter usuário admin para usar como responsável
    const adminResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    const adminId = adminResult.rows[0]?.id;

    // 4. Criar empresas de teste
    await pool.query(
      `INSERT INTO empresas (cnpj, nome, responsavel_id)
       VALUES ($1, $2, $3), ($4, $5, $6)
       ON CONFLICT (cnpj) DO NOTHING`,
      [
        '01.234.567/0001-89',
        'Empresa Teste A',
        adminId,
        '98.765.432/0001-10',
        'Empresa Teste B',
        adminId,
      ]
    );

    console.log('✅ Empresas de teste criadas');

    // 5. Vincular usuários às empresas
    const empresasResult = await pool.query('SELECT id FROM empresas ORDER BY id LIMIT 2');
    const [empresa1, empresa2] = empresasResult.rows;

    const usersResult = await pool.query(
      'SELECT id FROM users WHERE role IN ($1, $2) ORDER BY id',
      ['contador', 'gerente']
    );
    const [usuario1, usuario2] = usersResult.rows;

    if (empresa1 && usuario1) {
      await pool.query(
        `INSERT INTO usuario_empresa (usuario_id, empresa_id)
         VALUES ($1, $2), ($3, $4)
         ON CONFLICT (usuario_id, empresa_id) DO NOTHING`,
        [usuario1.id, empresa1.id, usuario2.id, empresa2.id]
      );
    }

    console.log('✅ Usuários vinculados às empresas');

    console.log('✨ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao fazer seed do banco:', error);
    throw error;
  }
}
