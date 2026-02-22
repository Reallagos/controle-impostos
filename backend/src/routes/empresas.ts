/**
 * Empresa Routes
 * REST endpoints for empresa CRUD operations
 * All routes require JWT authentication
 */

import { Router, Request, Response } from 'express';
import { EmpresaService } from '../services/EmpresaService';
import { EmpresaRequest, EmpresaUpdateRequest } from '../types/empresa';
import { authMiddleware } from '../middleware/authMiddleware';
import { JWTPayload } from '../types/auth';
import pool from '../config/database';

const router = Router();
const empresaService = new EmpresaService(pool);

/**
 * POST /api/empresas
 * Create a new empresa
 * Required: JWT token in Authorization header
 * Body: { cnpj: string, nome: string }
 * Returns: { id, cnpj, nome, responsavel_id, ativa, criado_em }
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as JWTPayload;
    const { cnpj, nome } = req.body as EmpresaRequest;

    // Validate inputs
    if (!cnpj || !nome) {
      res.status(400).json({ error: 'CNPJ and name are required' });
      return;
    }

    // Create empresa
    const empresa = await empresaService.createEmpresa(cnpj, nome, user.userId);

    res.status(201).json(empresa);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Invalid CNPJ')) {
      res.status(400).json({ error: 'Invalid CNPJ format' });
    } else if (message.includes('Invalid name')) {
      res.status(400).json({ error: 'Invalid name' });
    } else if (message.includes('already exists')) {
      res.status(400).json({ error: 'CNPJ already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /api/empresas
 * List all empresas for authenticated user (Row Level Security)
 * Returns: [{ id, cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em }]
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as JWTPayload;

    // Get empresas for this user
    const empresas = await empresaService.getEmpresas(user.userId);

    res.status(200).json({
      empresas,
      total: empresas.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/empresas/:id
 * Get single empresa by ID (with RLS check)
 * Returns: { id, cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em }
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as JWTPayload;
    const empresaId = parseInt(req.params.id, 10);

    if (isNaN(empresaId)) {
      res.status(400).json({ error: 'Invalid empresa ID' });
      return;
    }

    // Get empresa with RLS check
    const empresa = await empresaService.getEmpresaById(empresaId, user.userId);

    res.status(200).json(empresa);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found') || message.includes('no access')) {
      res.status(404).json({ error: 'Empresa not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * PUT /api/empresas/:id
 * Update empresa (partial update)
 * Body: { cnpj?: string, nome?: string, ativa?: boolean }
 * Returns: { id, cnpj, nome, responsavel_id, ativa, criado_em, atualizado_em }
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as JWTPayload;
    const empresaId = parseInt(req.params.id, 10);
    const data = req.body as EmpresaUpdateRequest;

    if (isNaN(empresaId)) {
      res.status(400).json({ error: 'Invalid empresa ID' });
      return;
    }

    // Update empresa
    const empresa = await empresaService.updateEmpresa(empresaId, user.userId, data);

    res.status(200).json(empresa);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Access denied')) {
      res.status(403).json({ error: 'Access denied' });
    } else if (message.includes('not found')) {
      res.status(404).json({ error: 'Empresa not found' });
    } else if (message.includes('Invalid')) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * DELETE /api/empresas/:id
 * Delete empresa (with CASCADE delete of related records)
 * Returns: 204 No Content on success
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as JWTPayload;
    const empresaId = parseInt(req.params.id, 10);

    if (isNaN(empresaId)) {
      res.status(400).json({ error: 'Invalid empresa ID' });
      return;
    }

    // Delete empresa
    await empresaService.deleteEmpresa(empresaId, user.userId);

    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Access denied')) {
      res.status(403).json({ error: 'Access denied' });
    } else if (message.includes('not found')) {
      res.status(404).json({ error: 'Empresa not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
