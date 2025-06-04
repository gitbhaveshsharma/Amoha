-- Migration: 03_create_tables.sql
-- Description: Creates all application tables
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Create profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'bidder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    address TEXT,
    avatar_url TEXT,
    is_temp BOOLEAN DEFAULT FALSE,
    device_id TEXT,
    notification_opt_in BOOLEAN DEFAULT TRUE,
    last_notification_shown_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    country TEXT,
    state TEXT,
    postal_code TEXT,
    city TEXT,
    gender gender_type,
    pronouns TEXT[],
    preferred_languages TEXT[],
    accessibility_needs TEXT[],
    cultural_identity TEXT[]
);

-- Create art_categories table
CREATE TABLE IF NOT EXISTS public.art_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9_]+$'::text),
    label TEXT NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    banned_by UUID REFERENCES auth.users(id),
    banned_at TIMESTAMP WITH TIME ZONE
);

-- Create currencies table
CREATE TABLE IF NOT EXISTS public.currencies (
    code VARCHAR(3) PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    decimal_digits INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    medium TEXT,
    dimensions TEXT,
    date DATE,
    art_location VARCHAR,
    artist_price NUMERIC,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    currency TEXT NOT NULL DEFAULT 'USD' REFERENCES currencies(code),
    art_category TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    image_1_url TEXT,
    image_2_url TEXT,
    image_3_url TEXT,
    image_4_url TEXT,
    is_original BOOLEAN DEFAULT TRUE,
    edition_number TEXT
);

-- Create user_devices table
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL UNIQUE,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    push_subscription JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create notification table
CREATE TABLE IF NOT EXISTS public.notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id UUID UNIQUE REFERENCES user_devices(id) ON DELETE CASCADE,
    email TEXT,
    is_push_enabled BOOLEAN DEFAULT FALSE,
    is_email_enabled BOOLEAN DEFAULT FALSE,
    is_sms_enabled BOOLEAN DEFAULT FALSE,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_messages table
CREATE TABLE IF NOT EXISTS public.notification_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_type TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0::numeric),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'withdrawn'::text, 'won'::text])),
    is_auto_bid BOOLEAN DEFAULT FALSE,
    max_auto_bid NUMERIC,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    withdrawal_reason TEXT
);

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'removed')),
    last_notified_at TEXT,
    notification_count NUMERIC DEFAULT 0
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'removed'))
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL CHECK (method_type = ANY (ARRAY['bank_account'::text, 'paypal'::text, 'stripe'::text, 'other'::text])),
    details JSONB NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_valid BOOLEAN DEFAULT TRUE
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    effective_date DATE NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text])),
    discount_value NUMERIC NOT NULL,
    currency TEXT,
    max_discount_amount NUMERIC,
    min_order_value NUMERIC,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to TEXT CHECK (applies_to = ANY (ARRAY['all'::text, 'artworks'::text, 'users'::text, 'categories'::text])),
    applies_to_ids TEXT[],
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_zones table
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_zone_countries table
CREATE TABLE IF NOT EXISTS public.shipping_zone_countries (
    zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
    country_code TEXT NOT NULL,
    region_code TEXT NOT NULL,
    PRIMARY KEY (zone_id, country_code, region_code)
);

-- Create shipping_rules table
CREATE TABLE IF NOT EXISTS public.shipping_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL CHECK (rule_type = ANY (ARRAY['free'::text, 'flat'::text, 'calculated'::text])),
    base_price NUMERIC,
    free_threshold NUMERIC,
    carrier TEXT,
    delivery_time TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_types table
CREATE TABLE IF NOT EXISTS public.tax_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_digital_service BOOLEAN DEFAULT FALSE,
    requires_registration BOOLEAN DEFAULT TRUE,
    calculation_method TEXT DEFAULT 'percentage' CHECK (calculation_method = ANY (ARRAY['percentage'::text, 'fixed_per_unit'::text])),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_configurations table
CREATE TABLE IF NOT EXISTS public.tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_type_code TEXT NOT NULL REFERENCES tax_types(code),
    tax_name TEXT NOT NULL,
    tax_rate NUMERIC NOT NULL,
    country_code TEXT,
    region_code TEXT,
    city TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to TEXT NOT NULL CHECK (applies_to = ANY (ARRAY['sale'::text, 'payout'::text, 'both'::text])),
    threshold NUMERIC,
    tax_number_format TEXT,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id),
    winning_bid_id UUID NOT NULL REFERENCES bids(id),
    sale_price NUMERIC NOT NULL CHECK (sale_price > 0::numeric),
    original_currency TEXT NOT NULL,
    base_currency TEXT NOT NULL DEFAULT 'USD',
    exchange_rate_id UUID REFERENCES exchange_rates(id),
    artist_payout_amount NUMERIC CHECK (artist_payout_amount >= 0::numeric),
    platform_fee NUMERIC CHECK (platform_fee >= 0::numeric),
    discount_amount NUMERIC DEFAULT 0 CHECK (discount_amount >= 0::numeric),
    promo_code_id UUID REFERENCES promo_codes(id),
    shipping_cost NUMERIC DEFAULT 0,
    shipping_rule_id UUID REFERENCES shipping_rules(id),
    tax_amount NUMERIC DEFAULT 0 CHECK (tax_amount >= 0::numeric),
    tax_configuration_id UUID REFERENCES tax_configurations(id),
    status TEXT NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'disputed'::text, 'refunded'::text])),
    buyer_id UUID REFERENCES auth.users(id),
    shipping_country TEXT,
    shipping_region TEXT,
    shipping_city TEXT,
    sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payout_initiated_at TIMESTAMP WITH TIME ZONE,
    payout_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_expired BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES auth.users(id),
    sale_id UUID NOT NULL REFERENCES sales(id),
    amount NUMERIC NOT NULL CHECK (amount > 0::numeric),
    original_currency TEXT NOT NULL,
    requested_currency TEXT NOT NULL,
    exchange_rate NUMERIC,
    tax_deducted NUMERIC DEFAULT 0 CHECK (tax_deducted >= 0::numeric),
    net_amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'on_hold'::text])),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    artwork_id UUID REFERENCES artworks(id),
    bid_id UUID REFERENCES bids(id),
    sale_id UUID REFERENCES sales(id),
    amount NUMERIC NOT NULL,
    original_currency TEXT NOT NULL,
    base_currency TEXT NOT NULL DEFAULT 'USD',
    exchange_rate NUMERIC,
    tax_amount NUMERIC DEFAULT 0 CHECK (tax_amount >= 0::numeric),
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['sale'::text, 'payout'::text, 'refund'::text, 'fee'::text, 'adjustment'::text, 'tax'::text, 'discount'::text, 'shipping'::text])),
    balance_before NUMERIC,
    balance_after NUMERIC,
    payout_id UUID REFERENCES payout_requests(id),
    promo_code_id UUID REFERENCES promo_codes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_taxes table
CREATE TABLE IF NOT EXISTS public.sales_taxes (
    sale_id UUID NOT NULL REFERENCES sales(id),
    tax_configuration_id UUID NOT NULL REFERENCES tax_configurations(id),
    amount NUMERIC NOT NULL CHECK (amount >= 0::numeric),
    currency TEXT NOT NULL,
    exchange_rate NUMERIC,
    PRIMARY KEY (sale_id, tax_configuration_id)
);

-- Create promo_code_uses table
CREATE TABLE IF NOT EXISTS public.promo_code_uses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    sale_id UUID NOT NULL REFERENCES sales(id),
    discount_applied NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_audit_log table
CREATE TABLE IF NOT EXISTS public.sale_audit_log (
    sale_id UUID REFERENCES sales(id),
    old_status TEXT,
    new_status TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_reason TEXT
);

-- Create artwork_engagements table
CREATE TABLE IF NOT EXISTS public.artwork_engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    view_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    view_duration INTEGER NOT NULL,
    last_interaction TIMESTAMP WITH TIME ZONE,
    referrer TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artwork_reviews table
CREATE TABLE IF NOT EXISTS public.artwork_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    processing_status TEXT NOT NULL DEFAULT 'queued' CHECK (processing_status = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
    image_verdict TEXT CHECK (image_verdict = ANY (ARRAY['approved'::text, 'rejected'::text, 'pending'::text])),
    nsfw_scores JSONB,
    image_rejection_reasons TEXT[],
    text_verdict TEXT CHECK (text_verdict = ANY (ARRAY['approved'::text, 'rejected'::text, 'pending'::text])),
    grammar_issues JSONB,
    text_rejection_reasons TEXT[],
    attempt_count INTEGER DEFAULT 0,
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create ticket_categories table
CREATE TABLE IF NOT EXISTS public.ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_priorities table
CREATE TABLE IF NOT EXISTS public.ticket_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    category_id UUID NOT NULL REFERENCES ticket_categories(id),
    priority_id UUID NOT NULL REFERENCES ticket_priorities(id),
    subject VARCHAR NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'open',
    assignee_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_threads table
CREATE TABLE IF NOT EXISTS public.ticket_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES support_tickets(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    participants JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_locks table
CREATE TABLE IF NOT EXISTS public.system_locks (
    key TEXT PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('03_create_tables.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify tables are created
SELECT 
    'Tables created successfully' AS status,
    count(*) AS total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';