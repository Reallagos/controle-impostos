export interface AuditoriaRecord {
  id: number;
  usuarioId: number | null;
  tabela: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  empresaId: number | null;
  registroId: number | null;
  dadosAntes: Record<string, unknown> | null;
  dadosDepois: Record<string, unknown> | null;
  timestamp: Date;
}

export interface CreateAuditoriaInput {
  usuarioId: number | null;
  tabela: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  empresaId?: number | null;
  registroId?: number | null;
  dadosAntes?: Record<string, unknown> | null;
  dadosDepois?: Record<string, unknown> | null;
}
