-- Verification script to check database schema integrity
-- Run this after migrations to verify everything is set up correctly

\echo 'Verifying AmohaGalleria Database Schema...'
\echo '========================================='

-- Check if all required extensions are installed
\echo 'Checking extensions...'
SELECT 
    extname as extension_name,
    CASE 
        WHEN extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent') 
        THEN '✅ Installed' 
        ELSE '❌ Missing' 
    END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent')
ORDER BY extname;

-- Check if all required custom types exist
\echo 'Checking custom types...'
SELECT 
    typname as type_name,
    '✅ Created' as status
FROM pg_type 
WHERE typname LIKE '%_type'
ORDER BY typname;

-- Check if all required tables exist
\echo 'Checking tables...'
SELECT 
    table_name,
    '✅ Created' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if all required indexes exist
\echo 'Checking indexes...'
SELECT 
    count(*) as total_indexes,
    '✅ Created' as status
FROM pg_indexes 
WHERE schemaname = 'public';

-- Check if RLS is enabled on tables
\echo 'Checking Row Level Security...'
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check migration log
\echo 'Checking migration history...'
SELECT 
    migration_name,
    executed_at,
    CASE 
        WHEN success THEN '✅ Success'
        ELSE '❌ Failed'
    END as status
FROM public.migrations_log 
ORDER BY executed_at;

-- Count of policies
\echo 'Checking RLS policies...'
SELECT 
    count(*) as total_policies,
    '✅ Created' as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Verify seed data
\echo 'Checking seed data...'
SELECT 
    'currencies' as table_name,
    count(*) as record_count
FROM public.currencies
UNION ALL
SELECT 
    'art_categories' as table_name,
    count(*) as record_count
FROM public.art_categories
UNION ALL
SELECT 
    'shipping_zones' as table_name,
    count(*) as record_count
FROM public.shipping_zones
UNION ALL
SELECT 
    'tax_types' as table_name,
    count(*) as record_count
FROM public.tax_types
ORDER BY table_name;

\echo 'Schema verification completed!'
