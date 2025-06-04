-- Migration: 07_insert_seed_data.sql
-- Description: Inserts initial seed data
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, decimal_digits, is_active, created_at) VALUES
('USD', 'US Dollar', '$', 2, true, NOW()),
('EUR', 'Euro', '€', 2, true, NOW()),
('GBP', 'British Pound', '£', 2, true, NOW()),
('CAD', 'Canadian Dollar', 'C$', 2, true, NOW()),
('AUD', 'Australian Dollar', 'A$', 2, true, NOW()),
('JPY', 'Japanese Yen', '¥', 0, true, NOW()),
('CHF', 'Swiss Franc', 'CHF', 2, true, NOW()),
('CNY', 'Chinese Yuan', '¥', 2, true, NOW()),
('INR', 'Indian Rupee', '₹', 2, true, NOW()),
('BRL', 'Brazilian Real', 'R$', 2, true, NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert default art categories
INSERT INTO public.art_categories (id, slug, label, is_banned, created_at) VALUES
(gen_random_uuid(), 'painting', 'Painting', false, NOW()),
(gen_random_uuid(), 'sculpture', 'Sculpture', false, NOW()),
(gen_random_uuid(), 'photography', 'Photography', false, NOW()),
(gen_random_uuid(), 'digital_art', 'Digital Art', false, NOW()),
(gen_random_uuid(), 'drawing', 'Drawing', false, NOW()),
(gen_random_uuid(), 'printmaking', 'Printmaking', false, NOW()),
(gen_random_uuid(), 'ceramics', 'Ceramics', false, NOW()),
(gen_random_uuid(), 'textiles', 'Textiles', false, NOW()),
(gen_random_uuid(), 'jewelry', 'Jewelry', false, NOW()),
(gen_random_uuid(), 'mixed_media', 'Mixed Media', false, NOW()),
(gen_random_uuid(), 'installation', 'Installation', false, NOW()),
(gen_random_uuid(), 'performance', 'Performance Art', false, NOW()),
(gen_random_uuid(), 'video_art', 'Video Art', false, NOW()),
(gen_random_uuid(), 'street_art', 'Street Art', false, NOW()),
(gen_random_uuid(), 'abstract', 'Abstract', false, NOW()),
(gen_random_uuid(), 'landscape', 'Landscape', false, NOW()),
(gen_random_uuid(), 'portrait', 'Portrait', false, NOW()),
(gen_random_uuid(), 'still_life', 'Still Life', false, NOW()),
(gen_random_uuid(), 'conceptual', 'Conceptual Art', false, NOW()),
(gen_random_uuid(), 'illustration', 'Illustration', false, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert default shipping zones
INSERT INTO public.shipping_zones (id, zone_name, is_active, created_at) VALUES
(gen_random_uuid(), 'North America', true, NOW()),
(gen_random_uuid(), 'Europe', true, NOW()),
(gen_random_uuid(), 'Asia Pacific', true, NOW()),
(gen_random_uuid(), 'South America', true, NOW()),
(gen_random_uuid(), 'Africa', true, NOW()),
(gen_random_uuid(), 'Middle East', true, NOW()),
(gen_random_uuid(), 'Oceania', true, NOW());

-- Insert shipping zone countries for North America
WITH north_america_zone AS (
    SELECT id FROM shipping_zones WHERE zone_name = 'North America' LIMIT 1
)
INSERT INTO public.shipping_zone_countries (zone_id, country_code, region_code)
SELECT na.id, country_code, region_code FROM north_america_zone na
CROSS JOIN (VALUES 
    ('US', 'US'),
    ('CA', 'CA'),
    ('MX', 'MX')
) AS countries(country_code, region_code);

-- Insert shipping zone countries for Europe
WITH europe_zone AS (
    SELECT id FROM shipping_zones WHERE zone_name = 'Europe' LIMIT 1
)
INSERT INTO public.shipping_zone_countries (zone_id, country_code, region_code)
SELECT eu.id, country_code, region_code FROM europe_zone eu
CROSS JOIN (VALUES 
    ('GB', 'GB'),
    ('DE', 'DE'),
    ('FR', 'FR'),
    ('IT', 'IT'),
    ('ES', 'ES'),
    ('NL', 'NL'),
    ('BE', 'BE'),
    ('AT', 'AT'),
    ('CH', 'CH'),
    ('SE', 'SE'),
    ('NO', 'NO'),
    ('DK', 'DK'),
    ('FI', 'FI'),
    ('PL', 'PL'),
    ('CZ', 'CZ'),
    ('IE', 'IE'),
    ('PT', 'PT'),
    ('GR', 'GR')
) AS countries(country_code, region_code);

-- Insert default shipping rules
WITH shipping_zones_data AS (
    SELECT id, zone_name FROM shipping_zones
)
INSERT INTO public.shipping_rules (id, zone_id, rule_type, base_price, free_threshold, carrier, delivery_time, is_active, priority)
SELECT 
    gen_random_uuid(),
    sz.id,
    'flat',
    CASE 
        WHEN sz.zone_name = 'North America' THEN 15.00
        WHEN sz.zone_name = 'Europe' THEN 20.00
        WHEN sz.zone_name = 'Asia Pacific' THEN 25.00
        ELSE 30.00
    END,
    CASE 
        WHEN sz.zone_name = 'North America' THEN 100.00
        WHEN sz.zone_name = 'Europe' THEN 150.00
        ELSE 200.00
    END,
    'Standard',
    CASE 
        WHEN sz.zone_name = 'North America' THEN '5-7 business days'
        WHEN sz.zone_name = 'Europe' THEN '7-10 business days'
        ELSE '10-15 business days'
    END,
    true,
    1
FROM shipping_zones_data sz;

-- Insert default tax types
INSERT INTO public.tax_types (code, name, description, is_digital_service, requires_registration, calculation_method, valid_from) VALUES
('VAT', 'Value Added Tax', 'Standard VAT for EU countries', false, true, 'percentage', NOW()),
('GST', 'Goods and Services Tax', 'GST for applicable countries', false, true, 'percentage', NOW()),
('SALES', 'Sales Tax', 'State/Provincial sales tax', false, true, 'percentage', NOW()),
('DIGITAL', 'Digital Services Tax', 'Tax on digital services and downloads', true, true, 'percentage', NOW())
ON CONFLICT (code) DO NOTHING;

-- Insert default tax configurations
INSERT INTO public.tax_configurations (id, tax_type_code, tax_name, tax_rate, country_code, region_code, is_active, applies_to, valid_from) VALUES
-- US Sales Tax (example rates)
(gen_random_uuid(), 'SALES', 'California Sales Tax', 7.25, 'US', 'CA', true, 'sale', NOW()),
(gen_random_uuid(), 'SALES', 'New York Sales Tax', 8.00, 'US', 'NY', true, 'sale', NOW()),
(gen_random_uuid(), 'SALES', 'Texas Sales Tax', 6.25, 'US', 'TX', true, 'sale', NOW()),
-- EU VAT
(gen_random_uuid(), 'VAT', 'Germany VAT', 19.00, 'DE', 'DE', true, 'sale', NOW()),
(gen_random_uuid(), 'VAT', 'France VAT', 20.00, 'FR', 'FR', true, 'sale', NOW()),
(gen_random_uuid(), 'VAT', 'UK VAT', 20.00, 'GB', 'GB', true, 'sale', NOW()),
(gen_random_uuid(), 'VAT', 'Italy VAT', 22.00, 'IT', 'IT', true, 'sale', NOW()),
-- Canada GST
(gen_random_uuid(), 'GST', 'Canada GST', 5.00, 'CA', 'CA', true, 'sale', NOW()),
-- Digital Services
(gen_random_uuid(), 'DIGITAL', 'EU Digital Services Tax', 3.00, 'EU', 'ALL', true, 'sale', NOW());

-- Insert support ticket categories
INSERT INTO public.ticket_categories (id, name, description, created_at) VALUES
(gen_random_uuid(), 'Technical Issue', 'Problems with platform functionality', NOW()),
(gen_random_uuid(), 'Account Support', 'Account access and profile issues', NOW()),
(gen_random_uuid(), 'Payment Issue', 'Payment processing and payout problems', NOW()),
(gen_random_uuid(), 'Artwork Issue', 'Issues related to artwork uploads or listings', NOW()),
(gen_random_uuid(), 'Bidding Issue', 'Problems with bidding process', NOW()),
(gen_random_uuid(), 'Shipping Issue', 'Shipping and delivery related problems', NOW()),
(gen_random_uuid(), 'General Inquiry', 'General questions and information requests', NOW()),
(gen_random_uuid(), 'Report Abuse', 'Report inappropriate content or behavior', NOW()),
(gen_random_uuid(), 'Feature Request', 'Suggestions for new features', NOW()),
(gen_random_uuid(), 'Bug Report', 'Report software bugs and errors', NOW());

-- Insert support ticket priorities
INSERT INTO public.ticket_priorities (id, name, description, created_at) VALUES
(gen_random_uuid(), 'Low', 'Non-urgent issues that can be addressed later', NOW()),
(gen_random_uuid(), 'Medium', 'Standard priority for most issues', NOW()),
(gen_random_uuid(), 'High', 'Important issues that need prompt attention', NOW()),
(gen_random_uuid(), 'Critical', 'Urgent issues that require immediate attention', NOW()),
(gen_random_uuid(), 'Emergency', 'System-breaking issues that need instant response', NOW());

-- Insert sample exchange rates (these should be updated regularly in production)
INSERT INTO public.exchange_rates (id, base_currency, target_currency, rate, effective_date, source, created_at) VALUES
-- USD base rates
(gen_random_uuid(), 'USD', 'EUR', 0.85, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'GBP', 0.73, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'CAD', 1.25, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'AUD', 1.35, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'JPY', 110.00, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'CHF', 0.92, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'CNY', 6.45, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'INR', 74.50, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'USD', 'BRL', 5.20, CURRENT_DATE, 'manual_seed', NOW()),
-- EUR base rates
(gen_random_uuid(), 'EUR', 'USD', 1.18, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'EUR', 'GBP', 0.86, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'EUR', 'CAD', 1.47, CURRENT_DATE, 'manual_seed', NOW()),
-- GBP base rates
(gen_random_uuid(), 'GBP', 'USD', 1.37, CURRENT_DATE, 'manual_seed', NOW()),
(gen_random_uuid(), 'GBP', 'EUR', 1.16, CURRENT_DATE, 'manual_seed', NOW());

-- Insert sample promo codes (for testing)
INSERT INTO public.promo_codes (id, code, description, discount_type, discount_value, currency, max_discount_amount, min_order_value, valid_from, valid_until, max_uses, current_uses, is_active, applies_to, created_at) VALUES
(gen_random_uuid(), 'WELCOME10', 'Welcome discount for new users', 'percentage', 10.00, 'USD', 50.00, 25.00, NOW(), NOW() + INTERVAL '1 year', 1000, 0, true, 'all', NOW()),
(gen_random_uuid(), 'FIRSTBUY20', '20% off first purchase', 'percentage', 20.00, 'USD', 100.00, 50.00, NOW(), NOW() + INTERVAL '1 year', 500, 0, true, 'all', NOW()),
(gen_random_uuid(), 'SAVE50', '$50 off orders over $500', 'fixed_amount', 50.00, 'USD', NULL, 500.00, NOW(), NOW() + INTERVAL '6 months', 100, 0, true, 'all', NOW());

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('07_insert_seed_data.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify seed data is inserted
SELECT 
    'Seed data inserted successfully' AS status,
    (SELECT count(*) FROM currencies) AS currencies_count,
    (SELECT count(*) FROM art_categories) AS categories_count,
    (SELECT count(*) FROM shipping_zones) AS shipping_zones_count,
    (SELECT count(*) FROM tax_types) AS tax_types_count,
    (SELECT count(*) FROM ticket_categories) AS ticket_categories_count;
