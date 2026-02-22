/**
 * Empresa Service
 * CRUD operations for empresas with Row Level Security via usuario_empresa
 */

import { Pool } from 'pg';
import {
  Empresa,
  EmpresaUpdateRequest,
  EmpresaResponse,
  CreateEmpresaResponse,
} from '../types/empresa';
import { validateCNPJ, validateNome } from '../utils/validators';

export class EmpresaService {
  constructor(private pool: Pool) {}

  /**
   * Create a new empresa
   * Inserts into empresas table and automatically creates usuario_empresa association
   */
  async createEmpresa(
    cnpj: string,
    nome: string,
    userId: number
  ): Promise<CreateEmpresaResponse> {
    // Validate inputs
    if (!validateCNPJ(cnpj)) {
      throw new Error('Invalid CNPJ format');
    }

    if (!validateNome(nome)) {
      throw new Error('Invalid name');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert into empresas
      const empresaResult = await client.query<Empresa>(
        `INSERT INTO empresas (cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em)
         VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em`,
        [cnpj, nome, userId]
      );

      if (empresaResult.rows.length === 0) {
        throw new Error('Failed to create empresa');
      }

      const empresa = empresaResult.rows[0];

      // Insert into usuario_empresa (RLS junction table)
      await client.query(
        `INSERT INTO usuario_empresa (usuario_id, empresa_id)
         VALUES ($1, $2)`,
        [userId, empresa.id]
      );

      await client.query('COMMIT');

      return {
        id: empresa.id,
        cnpj: empresa.cnpj,
        nome: empresa.nome,
        responsavel_id: empresa.responsavel_id || 0,
        ativa: empresa.ativa,
        criado_em: empresa.criado_em,
      };
    } catch (error) {
      await client.query('ROLLBACK');

      // Check for unique constraint violation (duplicate CNPJ)
      const errorMsg = error instanceof Error ? error.message : '';
      if (errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
        throw new Error('CNPJ already exists');
      }

      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all empresas for a user (Row Level Security)
   * Returns only empresas where usuario_empresa.usuario_id = userId
   */
  async getEmpresas(userId: number): Promise<EmpresaResponse[]> {
    const result = await this.pool.query<EmpresaResponse>(
      `SELECT e.id, e.cnpj, e.nome, e.responsavel_id, e.ativa, e.criado_em, e.atualizado_em
       FROM empresas e
       INNER JOIN usuario_empresa ue ON e.id = ue.empresa_id
       WHERE ue.usuario_id = $1
       ORDER BY e.criado_em DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get single empresa by ID (with RLS check)
   * Only returns if user has access via usuario_empresa
   */
  async getEmpresaById(id: number, userId: number): Promise<EmpresaResponse> {
    const result = await this.pool.query<EmpresaResponse>(
      `SELECT e.id, e.cnpj, e.nome, e.responsavel_id, e.ativa, e.criado_em, e.atualizado_em
       FROM empresas e
       INNER JOIN usuario_empresa ue ON e.id = ue.empresa_id
       WHERE e.id = $1 AND ue.usuario_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Empresa not found or no access');
    }

    return result.rows[0];
  }

  /**
   * Update empresa (partial update)
   * Only updates fields that are provided
   * RLS: User can only update their own empresas
   */
  async updateEmpresa(
    id: number,
    userId: number,
    data: EmpresaUpdateRequest
  ): Promise<EmpresaResponse> {
    // Check RLS first: verify user has access to this empresa
    const accessCheck = await this.pool.query(
      `SELECT 1 FROM usuario_empresa WHERE empresa_id = $1 AND usuario_id = $2`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied');
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.cnpj !== undefined) {
      if (!validateCNPJ(data.cnpj)) {
        throw new Error('Invalid CNPJ format');
      }
      updates.push(`cnpj = $${paramIndex++}`);
      values.push(data.cnpj);
    }

    if (data.nome !== undefined) {
      if (!validateNome(data.nome)) {
        throw new Error('Invalid name');
      }
      updates.push(`nome = $${paramIndex++}`);
      values.push(data.nome);
    }

    if (data.ativa !== undefined) {
      updates.push(`ativa = $${paramIndex++}`);
      values.push(data.ativa);
    }

    // Always update atualizado_em
    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      // Only atualizado_em, no actual changes
      const result = await this.pool.query<EmpresaResponse>(
        `SELECT id, cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em
         FROM empresas
         WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    }

    values.push(id);
    const query = `UPDATE empresas SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em`;

    const result = await this.pool.query<EmpresaResponse>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Empresa not found');
    }

    return result.rows[0];
  }

  /**
   * Delete empresa (with CASCADE delete of related records)
   * RLS: User can only delete their own empresas
   * PostgreSQL CASCADE automatically deletes:
   * - usuario_empresa records
   * - impostos_mensal records
   */
  async deleteEmpresa(id: number, userId: number): Promise<void> {
    // Check RLS: verify user has access to this empresa
    const accessCheck = await this.pool.query(
      `SELECT 1 FROM usuario_empresa WHERE empresa_id = $1 AND usuario_id = $2`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      throw new Error('Access denied');
    }

    // Delete empresa (CASCADE will handle usuario_empresa and impostos_mensal)
    const result = await this.pool.query(
      `DELETE FROM empresas WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Empresa not found');
    }
  }
}
