/**
 * Empresa Service Tests
 * Unit tests for CRUD operations with RLS
 */

import { EmpresaService } from '../src/services/EmpresaService';
import { Pool } from 'pg';

// Mock pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
} as unknown as Pool;

describe('EmpresaService', () => {
  let service: EmpresaService;

  beforeEach(() => {
    service = new EmpresaService(mockPool);
    jest.clearAllMocks();
  });

  describe('createEmpresa', () => {
    it('should create empresa with valid CNPJ and name', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              cnpj: '12.345.678/0001-90',
              nome: 'Test Company',
              responsavel_id: 100,
              ativa: true,
              criado_em: new Date(),
              atualizado_em: new Date(),
            },
          ],
        }) // INSERT into empresas
        .mockResolvedValueOnce({ rows: [] }) // INSERT into usuario_empresa
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await service.createEmpresa(
        '12.345.678/0001-90',
        'Test Company',
        100
      );

      expect(result.id).toBe(1);
      expect(result.cnpj).toBe('12.345.678/0001-90');
      expect(result.nome).toBe('Test Company');
      expect(mockClient.query).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should reject invalid CNPJ format', async () => {
      await expect(
        service.createEmpresa('invalid-cnpj', 'Test Company', 100)
      ).rejects.toThrow('Invalid CNPJ format');
    });

    it('should reject empty name', async () => {
      await expect(
        service.createEmpresa('12.345.678/0001-90', '', 100)
      ).rejects.toThrow('Invalid name');
    });

    it('should reject name longer than 255 characters', async () => {
      const longName = 'a'.repeat(256);
      await expect(
        service.createEmpresa('12.345.678/0001-90', longName, 100)
      ).rejects.toThrow('Invalid name');
    });

    it('should handle duplicate CNPJ error', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(new Error('unique violation')); // INSERT fails

      await expect(
        service.createEmpresa('12.345.678/0001-90', 'Test Company', 100)
      ).rejects.toThrow('CNPJ already exists');
    });
  });

  describe('getEmpresas', () => {
    it('should return empresas for user (RLS)', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            cnpj: '12.345.678/0001-90',
            nome: 'Company 1',
            responsavel_id: 100,
            ativa: true,
            criado_em: new Date(),
            atualizado_em: new Date(),
          },
        ],
      });

      const result = await service.getEmpresas(100);

      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Company 1');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('usuario_empresa'),
        [100]
      );
    });

    it('should return empty array if user has no empresas', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await service.getEmpresas(999);

      expect(result).toHaveLength(0);
    });
  });

  describe('getEmpresaById', () => {
    it('should return empresa if user has access (RLS)', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            cnpj: '12.345.678/0001-90',
            nome: 'Company 1',
            responsavel_id: 100,
            ativa: true,
            criado_em: new Date(),
            atualizado_em: new Date(),
          },
        ],
      });

      const result = await service.getEmpresaById(1, 100);

      expect(result.id).toBe(1);
      expect(result.nome).toBe('Company 1');
    });

    it('should throw error if user has no access (RLS)', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await expect(service.getEmpresaById(1, 999)).rejects.toThrow(
        'Empresa not found or no access'
      );
    });
  });

  describe('updateEmpresa', () => {
    it('should update empresa name if user has access', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ 1: 1 }] }) // RLS check
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              cnpj: '12.345.678/0001-90',
              nome: 'Updated Name',
              responsavel_id: 100,
              ativa: true,
              criado_em: new Date(),
              atualizado_em: new Date(),
            },
          ],
        }); // UPDATE

      const result = await service.updateEmpresa(1, 100, { nome: 'Updated Name' });

      expect(result.nome).toBe('Updated Name');
      expect(mockPool.query).toHaveBeenCalled();
    });

    it('should throw error if user has no access (RLS)', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // RLS check fails

      await expect(
        service.updateEmpresa(1, 999, { nome: 'Updated Name' })
      ).rejects.toThrow('Access denied');
    });

    it('should reject invalid CNPJ in update', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ 1: 1 }] }); // RLS check

      await expect(
        service.updateEmpresa(1, 100, { cnpj: 'invalid' })
      ).rejects.toThrow('Invalid CNPJ format');
    });
  });

  describe('deleteEmpresa', () => {
    it('should delete empresa if user has access', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ 1: 1 }] }) // RLS check
        .mockResolvedValueOnce({ rowCount: 1 }); // DELETE

      await expect(service.deleteEmpresa(1, 100)).resolves.toBeUndefined();
    });

    it('should throw error if user has no access (RLS)', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // RLS check fails

      await expect(service.deleteEmpresa(1, 999)).rejects.toThrow(
        'Access denied'
      );
    });

    it('should throw error if empresa not found', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ 1: 1 }] }) // RLS check
        .mockResolvedValueOnce({ rowCount: 0 }); // DELETE returns no rows

      await expect(service.deleteEmpresa(1, 100)).rejects.toThrow(
        'Empresa not found'
      );
    });
  });
});
