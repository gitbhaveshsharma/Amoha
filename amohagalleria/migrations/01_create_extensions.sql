-- Migration: 01_create_extensions.sql
-- Description: Creates necessary PostgreSQL extensions
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable pg_trgm for text search and similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable unaccent for better text search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('01_create_extensions.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify extensions are installed
SELECT 
    'Extensions created successfully' AS status,
    array_agg(extname) AS installed_extensions
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent');