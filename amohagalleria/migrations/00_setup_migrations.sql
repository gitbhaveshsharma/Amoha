-- Migration: 00_setup_migrations.sql
-- Description: Sets up the migration tracking system
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Create migrations_log table to track which migrations have been executed
CREATE TABLE IF NOT EXISTS public.migrations_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_by VARCHAR(255) DEFAULT 'system'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_migrations_log_name ON public.migrations_log(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_log_executed_at ON public.migrations_log(executed_at);

-- Insert this migration into the log
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('00_setup_migrations.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.migrations_log TO authenticated;
GRANT SELECT ON public.migrations_log TO anon;

COMMIT;

-- Verify the setup
SELECT 'Migration tracking system setup completed successfully' AS status;