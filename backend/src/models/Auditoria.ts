export interface AuditoriaRecord {
  id: number;
  usuarioId: number | null;
  tabela: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  empresaId: number | null;
  registroId: number | null;
  dadosAntes: Record<string, any> | null;
  dadosDepois: Record<string, any> | null;
  timestamp: Date;
}

export interface CreateAuditoriaInput {
  usuarioId: number | null;
  tabela: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  empresaId?: number | null;
  registroId?: number | null;
  dadosAntes?: Record<string, any> | null;
  dadosDepois?: Record<string, any> | null;
}
