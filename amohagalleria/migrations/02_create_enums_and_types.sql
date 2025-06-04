-- Migration: 02_create_enums_and_types.sql
-- Description: Creates custom types and enums
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Create gender enum
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create artwork status enum
DO $$ BEGIN
    CREATE TYPE artwork_status_type AS ENUM ('draft', 'pending_review', 'active', 'sold', 'removed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create bid status enum
DO $$ BEGIN
    CREATE TYPE bid_status_type AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn', 'won');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sale status enum
DO $$ BEGIN
    CREATE TYPE sale_status_type AS ENUM ('pending', 'completed', 'disputed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create transaction type enum
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('sale', 'payout', 'refund', 'fee', 'adjustment', 'tax', 'discount', 'shipping');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment method type enum
DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('bank_account', 'paypal', 'stripe', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payout status enum
DO $$ BEGIN
    CREATE TYPE payout_status_type AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create support ticket status enum
DO $$ BEGIN
    CREATE TYPE ticket_status_type AS ENUM ('open', 'in_progress', 'pending_customer', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'artist', 'bidder', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create processing status enum for artwork reviews
DO $$ BEGIN
    CREATE TYPE processing_status_type AS ENUM ('queued', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create verdict enum for reviews
DO $$ BEGIN
    CREATE TYPE verdict_type AS ENUM ('approved', 'rejected', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create discount type enum
DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create shipping rule type enum
DO $$ BEGIN
    CREATE TYPE shipping_rule_type AS ENUM ('free', 'flat', 'calculated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tax applies to enum
DO $$ BEGIN
    CREATE TYPE tax_applies_to_type AS ENUM ('sale', 'payout', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('02_create_enums_and_types.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify types are created
SELECT 
    'Custom types and enums created successfully' AS status,
    count(*) AS total_types
FROM pg_type 
WHERE typname LIKE '%_type';
