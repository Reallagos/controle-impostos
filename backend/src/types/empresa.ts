/**
 * Empresa Types
 * Interfaces for company management
 */

export interface Empresa {
  id: number;
  cnpj: string;
  nome: string;
  responsavel_id: number | null;
  ativa: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface EmpresaRequest {
  cnpj: string;
  nome: string;
}

export interface EmpresaUpdateRequest {
  cnpj?: string;
  nome?: string;
  ativa?: boolean;
}

export interface EmpresaResponse {
  id: number;
  cnpj: string;
  nome: string;
  responsavel_id: number | null;
  ativa: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

export interface CreateEmpresaResponse {
  id: number;
  cnpj: string;
  nome: string;
  responsavel_id: number;
  ativa: boolean;
  criado_em: Date;
}

export interface ListaEmpresasResponse {
  empresas: EmpresaResponse[];
  total: number;
}
