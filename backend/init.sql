-- Initial database schema setup
-- This will be expanded in STORY-1.2 with actual tables

CREATE SCHEMA IF NOT EXISTS public;

-- Table for migrations (will be used for future migrations)
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Basic placeholder comment
COMMENT ON TABLE migrations IS 'Tracks database schema migrations';
