export type UserRole = 'admin' | 'contador' | 'gerente' | 'visualizador';

export interface User {
  id: number;
  email: string;
  senhaHash: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CreateUserInput {
  email: string;
  senhaHash: string;
  nome: string;
  role: UserRole;
}

export interface UpdateUserInput {
  nome?: string;
  ativo?: boolean;
  role?: UserRole;
}
