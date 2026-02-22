export interface ImpostoMensal {
  id: number;
  empresaId: number;
  mes: number;
  ano: number;
  irpj: number;
  csll: number;
  pis: number;
  cofins: number;
  icms: number;
  inss: number;
  fgts: number;
  honorario: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CreateImpostoInput {
  empresaId: number;
  mes: number;
  ano: number;
  irpj?: number;
  csll?: number;
  pis?: number;
  cofins?: number;
  icms?: number;
  inss?: number;
  fgts?: number;
  honorario?: number;
}

export interface UpdateImpostoInput {
  irpj?: number;
  csll?: number;
  pis?: number;
  cofins?: number;
  icms?: number;
  inss?: number;
  fgts?: number;
  honorario?: number;
}

export interface ImpostoComparacao {
  empresaId: number;
  empresaNome: string;
  mes: number;
  ano: number;
  total: number;
  impostos: ImpostoMensal;
}
