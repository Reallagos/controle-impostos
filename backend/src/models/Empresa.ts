export interface Empresa {
  id: number;
  cnpj: string;
  nome: string;
  responsavelId: number | null;
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CreateEmpresaInput {
  cnpj: string;
  nome: string;
  responsavelId?: number | null;
}

export interface UpdateEmpresaInput {
  nome?: string;
  responsavelId?: number | null;
  ativa?: boolean;
}
