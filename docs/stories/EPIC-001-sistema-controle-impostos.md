# EPIC 1 — Sistema de Controle e Comparação de Impostos

**Epic ID:** EPIC-001
**Status:** Ready ✅
**Created:** 22/02/2026
**Owner:** @pm (Morgan)
**Target:** 8 semanas
**Validated by:** @po (Pax) — 22/02/2026 (10/10 points)

---

## Epic Overview

Sistema integrado de gestão fiscal para escritórios de contabilidade. Equipes preenchem dados de impostos mensalmente, gerentes comparam múltiplas empresas e identificam economias.

**Aligned with:** `docs/prd/PRD-controle-impostos.md`

---

## Epic Scope

### IN Scope ✅
- [ ] Autenticação multi-role (Admin, Contador, Gerente, Visualizador)
- [ ] Row Level Security por empresa
- [ ] CRUD de empresas
- [ ] Formulário mensal de impostos (8 campos)
- [ ] Comparação muitos-para-muitos entre empresas
- [ ] Dashboard com KPIs
- [ ] Relatórios (PDF/Excel export)
- [ ] Auditoria de mudanças
- [ ] Notificações/Lembretes

### OUT of Scope ❌
- [ ] Integração com sistemas bancários
- [ ] Processamento automático de notas fiscais
- [ ] Cálculo automático de impostos (apenas entrada manual)
- [ ] Mobile app nativo (web responsivo apenas)
- [ ] Integração com governo (e-CAC, etc)

---

## Stories Mapeadas

### Phase 1: Infraestrutura & Autenticação (Semanas 1-2)

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| **STORY-1.1** | Setup do projeto (Node/Express/React/PostgreSQL) | P (Pequeno) |
| **STORY-1.2** | Modelo de dados (Empresas, Usuários, Impostos) | P |
| **STORY-1.3** | Autenticação JWT (login/logout/reset senha) | M (Médio) |
| **STORY-1.4** | Implementar RLS no PostgreSQL | M |
| **STORY-1.5** | Roles & Permissões (Admin, Contador, Gerente) | M |

### Phase 2: MVP Core (Semanas 2-4)

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| **STORY-2.1** | CRUD de Empresas | P |
| **STORY-2.2** | Formulário de preenchimento mensal (8 impostos) | M |
| **STORY-2.3** | Validações & Salvamento (rascunho + publish) | P |
| **STORY-2.4** | Tela de Comparação (2+ empresas lado-a-lado) | G (Grande) |
| **STORY-2.5** | Cálculo de economia (gaps e %) | M |
| **STORY-2.6** | Auditoria de mudanças (quem mudou, quando) | M |

### Phase 3: Dashboard & Relatórios (Semanas 4-6)

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| **STORY-3.1** | Dashboard com KPIs (totais, spreads) | M |
| **STORY-3.2** | Gráficos de série temporal | M |
| **STORY-3.3** | Export para PDF | P |
| **STORY-3.4** | Export para Excel | P |
| **STORY-3.5** | Filtros por período (data range) | P |

### Phase 4: Notificações & Polish (Semanas 6-8)

| Story | Descrição | Complexidade |
|-------|-----------|-------------|
| **STORY-4.1** | Sistema de notificações (email/dashboard) | M |
| **STORY-4.2** | Lembretes de dados faltantes | P |
| **STORY-4.3** | Testes de cobertura (unit + integration) | G |
| **STORY-4.4** | Segurança: rate limiting, XSS, CSRF | M |
| **STORY-4.5** | Performance: índices de DB, caching | M |
| **STORY-4.6** | Deploy em produção + backup diário | M |

---

## Technical Architecture (High-Level)

```
Frontend (React/TypeScript)
├── Auth (Login, Reset Senha)
├── Dashboard (KPIs, Gráficos)
├── Empresas (CRUD)
├── Impostos (Formulário Mensal)
└── Comparação (Múltiplas Empresas)

Backend (Node/Express/TypeScript)
├── Auth Service (JWT, RLS)
├── Empresa Service (CRUD + RLS)
├── Imposto Service (Preenchimento + Histórico)
├── Comparação Service (Cálculos)
├── Auditoria Service (Logs)
└── Notificação Service (Email/Dashboard)

Database (PostgreSQL)
├── users (com role-based access)
├── empresas (com RLS)
├── impostos_mensal (grande tabela: empresa_id, mês, 8 campos)
├── auditoria (log de mudanças)
└── notificacoes (fila)
```

---

## Dependency Map

```
STORY-1.1 (Setup)
  ↓
STORY-1.2 (Data Model)
  ↓
STORY-1.3 (Auth) ← STORY-1.4 (RLS) ← STORY-1.5 (Roles)
  ↓
STORY-2.1 (Empresas)
  ↓
STORY-2.2 (Formulário) → STORY-2.3 (Validação) → STORY-2.6 (Auditoria)
  ↓
STORY-2.4 (Comparação) → STORY-2.5 (Cálculos)
  ↓
STORY-3.* (Dashboard & Relatórios)
  ↓
STORY-4.* (Notificações & Deploy)
```

---

## Acceptance Criteria (Epic-Level)

### Functional
- [ ] Equipe consegue preencher impostos de qualquer empresa atribuída
- [ ] Gerente consegue comparar 2+ empresas em < 5 cliques
- [ ] Dashboard mostra KPIs atualizados em < 1s
- [ ] Relatórios exportam corretamente (PDF + Excel)
- [ ] Cada usuário vê APENAS suas empresas (RLS funcionando)

### Quality
- [ ] Unit test coverage >= 80%
- [ ] Zero XSS/CSRF vulnerabilities
- [ ] Performance: P99 latência < 2s
- [ ] Backup automático confirmado
- [ ] Documentação técnica completa

### Business
- [ ] Equipe treinada e produtiva
- [ ] NPS >= 4/5
- [ ] Zero perdas de dados em produção

---

## Team & Roles

| Role | Responsável | Allocation |
|------|-------------|-----------|
| @pm | Epic Owner, Requirements | 50% |
| @architect | Design da arquitetura, DB | 30% |
| @dev | Implementação (histórias) | 80% |
| @qa | Testes, gate | 60% |
| @devops | Deploy, CI/CD, backups | 40% |
| @data-engineer | Schema design, RLS, performance | 40% |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| RLS complexity underestimated | Medium | High | @data-engineer review early |
| Performance issues with large dataset | Low | Medium | Index strategy defined upfront |
| Scope creep (custom exports, etc) | Medium | Medium | Strict scope control, defer to Phase 2 |
| Integration issues Auth/RLS | Medium | High | E2E tests for permission matrix |

---

## Success Metrics

- [ ] Sistema disponível (99.5% uptime)
- [ ] Equipe preenchendo dados regularmente (>90% compliance)
- [ ] Comparações geradas sem erro
- [ ] NPS da equipe >= 4/5
- [ ] Economia média identificada por empresa documentada

---

## Notes

- Fase 1 é BLOCKER para Fase 2 (auth/RLS deve estar perfeito)
- Ênfase em segurança (RLS) desde o início
- CodeRabbit para auto-fix de issues CRITICAL/HIGH durante dev
- Backup deve estar testado antes de produção

---

**Next Step:** @sm cria STORY-1.1 (Setup) e outras histórias da Fase 1
