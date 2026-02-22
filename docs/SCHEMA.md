# Database Schema

**Version:** 1.0
**Created:** 2026-02-22
**Database:** PostgreSQL 14+

---

## Overview

O schema contém 6 tabelas principais para gerenciar:
- Autenticação e autorização (users)
- Cadastro de empresas (empresas)
- Relacionamento usuário-empresa com RLS (usuario_empresa)
- Registros de impostos mensais (impostos_mensal)
- Auditoria de mudanças (auditoria)
- Controle de migrações (migrations)

---

## Tables

### 1. users
Armazena contas de usuários do sistema.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| email | VARCHAR(255) | UNIQUE NOT NULL | Email da conta (login) |
| senha_hash | VARCHAR(255) | NOT NULL | Senha hasheada (bcrypt) |
| nome | VARCHAR(255) | NOT NULL | Nome completo do usuário |
| role | VARCHAR(50) | NOT NULL, CHECK | admin, contador, gerente, visualizador |
| ativo | BOOLEAN | DEFAULT true | Ativa/Inativa |
| criado_em | TIMESTAMP | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMP | DEFAULT NOW() | Data da última atualização |

**Índices:**
- `idx_users_email` (email) — para login rápido

---

### 2. empresas
Cadastro de empresas a monitorar.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| cnpj | VARCHAR(18) | UNIQUE NOT NULL | CNPJ da empresa |
| nome | VARCHAR(255) | NOT NULL | Nome da empresa |
| responsavel_id | INTEGER | FK → users.id ON DELETE SET NULL | Responsável (usuário admin) |
| ativa | BOOLEAN | DEFAULT true | Empresa ativa/inativa |
| criado_em | TIMESTAMP | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMP | DEFAULT NOW() | Data da última atualização |

**Índices:**
- `idx_empresas_cnpj` (cnpj) — para buscar por CNPJ

**Foreign Keys:**
- `responsavel_id` → `users.id` (ON DELETE SET NULL)

---

### 3. usuario_empresa
Vincula usuários a empresas (Row Level Security base).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| usuario_id | INTEGER | NOT NULL, FK → users.id | ID do usuário |
| empresa_id | INTEGER | NOT NULL, FK → empresas.id | ID da empresa |
| - | - | UNIQUE(usuario_id, empresa_id) | Cada usuário pode ter acesso uma vez por empresa |

**Índices:**
- `idx_usuario_empresa` (usuario_id, empresa_id) — para RLS queries

**Foreign Keys:**
- `usuario_id` → `users.id` (ON DELETE CASCADE)
- `empresa_id` → `empresas.id` (ON DELETE CASCADE)

---

### 4. impostos_mensal
Registro de impostos mensais por empresa.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| empresa_id | INTEGER | NOT NULL, FK → empresas.id | ID da empresa |
| mes | INTEGER | NOT NULL, CHECK (1-12) | Mês (1-12) |
| ano | INTEGER | NOT NULL | Ano (ex: 2026) |
| irpj | NUMERIC(12,2) | DEFAULT 0 | IRPJ em reais |
| csll | NUMERIC(12,2) | DEFAULT 0 | CSLL em reais |
| pis | NUMERIC(12,2) | DEFAULT 0 | PIS/PASEP em reais |
| cofins | NUMERIC(12,2) | DEFAULT 0 | COFINS em reais |
| icms | NUMERIC(12,2) | DEFAULT 0 | ICMS em reais |
| inss | NUMERIC(12,2) | DEFAULT 0 | INSS em reais |
| fgts | NUMERIC(12,2) | DEFAULT 0 | FGTS em reais |
| honorario | NUMERIC(12,2) | DEFAULT 0 | Honorários em reais |
| criado_em | TIMESTAMP | DEFAULT NOW() | Data de criação |
| atualizado_em | TIMESTAMP | DEFAULT NOW() | Data da última atualização |
| - | - | UNIQUE(empresa_id, mes, ano) | Uma entrada por empresa/mês/ano |

**Índices:**
- `idx_impostos_empresa_id` (empresa_id) — para listar impostos por empresa
- `idx_impostos_mes_ano` (mes, ano) — para filtrar por período

**Foreign Keys:**
- `empresa_id` → `empresas.id` (ON DELETE CASCADE)

---

### 5. auditoria
Log de todas as mudanças nas tabelas principais.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| usuario_id | INTEGER | FK → users.id ON DELETE SET NULL | Usuário que fez a mudança |
| tabela | VARCHAR(100) | NOT NULL | Nome da tabela modificada |
| acao | VARCHAR(50) | CHECK (INSERT/UPDATE/DELETE) | Tipo de operação |
| empresa_id | INTEGER | FK → empresas.id ON DELETE SET NULL | Empresa afetada (se aplicável) |
| registro_id | INTEGER | - | ID do registro modificado |
| dados_antes | JSONB | - | Valores antes da mudança |
| dados_depois | JSONB | - | Valores depois da mudança |
| timestamp | TIMESTAMP | DEFAULT NOW() | Quando aconteceu |

**Índices:**
- `idx_auditoria_usuario` (usuario_id) — para auditoria por usuário
- `idx_auditoria_timestamp` (timestamp) — para auditoria por período

**Foreign Keys:**
- `usuario_id` → `users.id` (ON DELETE SET NULL)
- `empresa_id` → `empresas.id` (ON DELETE SET NULL)

---

### 6. migrations
Controla quais migrações foram aplicadas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | SERIAL | PRIMARY KEY | Identificador único |
| name | VARCHAR(255) | UNIQUE NOT NULL | Nome da migração (ex: 001_create_initial_schema) |
| executed_at | TIMESTAMP | DEFAULT NOW() | Quando foi executada |

---

## Seed Data

Na primeira execução, o sistema cria automaticamente:

**Usuários:**
- admin@controle-impostos.dev (senha: admin123, role: admin)
- contador@controle-impostos.dev (senha: contador123, role: contador)
- gerente@controle-impostos.dev (senha: gerente123, role: gerente)

**Empresas:**
- Empresa Teste A (CNPJ: 01.234.567/0001-89)
- Empresa Teste B (CNPJ: 98.765.432/0001-10)

---

## Constraints & Validations

### Primary Keys
- Todas as tabelas têm `id SERIAL PRIMARY KEY`

### Unique Constraints
- `users.email` — um email por usuário
- `empresas.cnpj` — um CNPJ por empresa
- `impostos_mensal(empresa_id, mes, ano)` — uma entrada por empresa/mês/ano
- `usuario_empresa(usuario_id, empresa_id)` — cada usuário uma vez por empresa

### Check Constraints
- `users.role` IN ('admin', 'contador', 'gerente', 'visualizador')
- `impostos_mensal.mes` BETWEEN 1 AND 12
- `auditoria.acao` IN ('INSERT', 'UPDATE', 'DELETE')

### Foreign Keys (Cascading Deletes)
- Deletar empresa → deleta impostos e auditoria
- Deletar usuário → deleta relacionamento usuario_empresa

---

## Row Level Security (RLS)

**Base Table:** `usuario_empresa`

A tabela `usuario_empresa` é usada para implementar RLS na aplicação:
- Cada usuário só vê empresas às quais tem acesso
- A implementação de RLS acontece no código da aplicação (próximas stories)

---

## Performance Tuning

### Índices Criados
1. `idx_users_email` — Speedup para login (uniqueness check)
2. `idx_empresas_cnpj` — Speedup para busca por CNPJ
3. `idx_impostos_empresa_id` — Speedup para listar impostos por empresa
4. `idx_impostos_mes_ano` — Speedup para filtros de período
5. `idx_usuario_empresa` — Speedup para RLS queries
6. `idx_auditoria_usuario` — Speedup para auditoria por usuário
7. `idx_auditoria_timestamp` — Speedup para auditoria por período

### Estratégia de Escala
- NUMERIC(12,2) para valores monetários (precisão decimal)
- JSONB para dados de auditoria (compressão + indexação)
- Índices compostos para queries comuns (mes, ano)

---

## Migrações

### Aplicar Migration
```bash
npm run migrate:up
```

### Rollback
```bash
npm run migrate:down
```

### Status
```bash
npm run migrate:status
```

---

## Related Stories

- **STORY-1.3:** Autenticação JWT (usa `users` table)
- **STORY-1.4:** RLS implementação (usa `usuario_empresa`)
- **STORY-1.5:** Roles & Permissões (usa `users.role`)
- **STORY-2.1:** CRUD de Empresas (usa `empresas`)
- **STORY-2.2:** Formulário de Impostos (usa `impostos_mensal`)
