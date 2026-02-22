-- Migration 001: Create initial schema for Sistema de Controle de Impostos
-- Created: 2026-02-22
-- Description: Create base tables for users, companies, tax data, and audit logs

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'contador', 'gerente', 'visualizador')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- 2. EMPRESAS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  responsavel_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ativa BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);

-- ============================================================================
-- 3. USUARIO_EMPRESA (RLS - Row Level Security)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuario_empresa (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, empresa_id)
);

CREATE INDEX idx_usuario_empresa ON usuario_empresa(usuario_id, empresa_id);

-- ============================================================================
-- 4. IMPOSTOS_MENSAL TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS impostos_mensal (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  irpj NUMERIC(12, 2) DEFAULT 0,
  csll NUMERIC(12, 2) DEFAULT 0,
  pis NUMERIC(12, 2) DEFAULT 0,
  cofins NUMERIC(12, 2) DEFAULT 0,
  icms NUMERIC(12, 2) DEFAULT 0,
  inss NUMERIC(12, 2) DEFAULT 0,
  fgts NUMERIC(12, 2) DEFAULT 0,
  honorario NUMERIC(12, 2) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, mes, ano)
);

CREATE INDEX idx_impostos_empresa_id ON impostos_mensal(empresa_id);
CREATE INDEX idx_impostos_mes_ano ON impostos_mensal(mes, ano);

-- ============================================================================
-- 5. AUDITORIA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tabela VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE SET NULL,
  registro_id INTEGER,
  dados_antes JSONB,
  dados_depois JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_timestamp ON auditoria(timestamp);

-- ============================================================================
-- 6. MIGRATIONS TABLE (for tracking applied migrations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mark this migration as applied
INSERT INTO migrations (name) VALUES ('001_create_initial_schema') ON CONFLICT DO NOTHING;
