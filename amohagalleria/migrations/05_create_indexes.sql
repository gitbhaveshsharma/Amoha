-- Migration: 05_create_indexes.sql
-- Description: Creates database indexes for performance
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Profile table indexes
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON public.profile(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_role ON public.profile(role);
CREATE INDEX IF NOT EXISTS idx_profile_is_active ON public.profile(is_active);
CREATE INDEX IF NOT EXISTS idx_profile_device_id ON public.profile(device_id);
CREATE INDEX IF NOT EXISTS idx_profile_created_at ON public.profile(created_at);

-- Art categories indexes
CREATE INDEX IF NOT EXISTS idx_art_categories_slug ON public.art_categories(slug);
CREATE INDEX IF NOT EXISTS idx_art_categories_is_banned ON public.art_categories(is_banned);
CREATE INDEX IF NOT EXISTS idx_art_categories_created_at ON public.art_categories(created_at);

-- Currencies indexes
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON public.currencies(is_active);
CREATE INDEX IF NOT EXISTS idx_currencies_code ON public.currencies(code);

-- Artworks table indexes
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON public.artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_currency ON public.artworks(currency);
CREATE INDEX IF NOT EXISTS idx_artworks_art_category ON public.artworks(art_category);
CREATE INDEX IF NOT EXISTS idx_artworks_is_featured ON public.artworks(is_featured);
CREATE INDEX IF NOT EXISTS idx_artworks_artist_price ON public.artworks(artist_price);
CREATE INDEX IF NOT EXISTS idx_artworks_title_gin ON public.artworks USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_artworks_description_gin ON public.artworks USING gin(to_tsvector('english', description));

-- User devices indexes
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON public.user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_active_at ON public.user_devices(last_active_at);

-- Notification table indexes
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON public.notification(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_device_id ON public.notification(device_id);
CREATE INDEX IF NOT EXISTS idx_notification_email ON public.notification(email);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin ON public.events USING gin(metadata);

-- Notification messages indexes
CREATE INDEX IF NOT EXISTS idx_notification_messages_user_id ON public.notification_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_is_read ON public.notification_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_messages_created_at ON public.notification_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_messages_event_id ON public.notification_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_notification_messages_type ON public.notification_messages(notification_type);

-- Bids table indexes
CREATE INDEX IF NOT EXISTS idx_bids_artwork_id ON public.bids(artwork_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON public.bids(amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_expires_at ON public.bids(expires_at);
CREATE INDEX IF NOT EXISTS idx_bids_is_auto_bid ON public.bids(is_auto_bid);
CREATE INDEX IF NOT EXISTS idx_bids_deleted_at ON public.bids(deleted_at);

-- Cart table indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_artwork_id ON public.cart(artwork_id);
CREATE INDEX IF NOT EXISTS idx_cart_status ON public.cart(status);
CREATE INDEX IF NOT EXISTS idx_cart_created_at ON public.cart(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_artwork_unique ON public.cart(user_id, artwork_id) WHERE status = 'active';

-- Wishlist table indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_artwork_id ON public.wishlist(artwork_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_status ON public.wishlist(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_user_artwork_unique ON public.wishlist(user_id, artwork_id) WHERE status = 'active';

-- Payment methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_method_type ON public.payment_methods(method_type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_verified ON public.payment_methods(is_verified);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON public.payment_methods(is_default);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_valid ON public.payment_methods(is_valid);

-- Exchange rates indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_currency ON public.exchange_rates(base_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_target_currency ON public.exchange_rates(target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_effective_date ON public.exchange_rates(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_created_at ON public.exchange_rates(created_at);

-- Promo codes indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON public.promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_from ON public.promo_codes(valid_from);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_until ON public.promo_codes(valid_until);
CREATE INDEX IF NOT EXISTS idx_promo_codes_applies_to ON public.promo_codes(applies_to);

-- Shipping zones indexes
CREATE INDEX IF NOT EXISTS idx_shipping_zones_is_active ON public.shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_zone_name ON public.shipping_zones(zone_name);

-- Shipping zone countries indexes
CREATE INDEX IF NOT EXISTS idx_shipping_zone_countries_zone_id ON public.shipping_zone_countries(zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_zone_countries_country_code ON public.shipping_zone_countries(country_code);

-- Shipping rules indexes
CREATE INDEX IF NOT EXISTS idx_shipping_rules_zone_id ON public.shipping_rules(zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rules_rule_type ON public.shipping_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_shipping_rules_is_active ON public.shipping_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_rules_priority ON public.shipping_rules(priority);

-- Tax types indexes
CREATE INDEX IF NOT EXISTS idx_tax_types_code ON public.tax_types(code);
CREATE INDEX IF NOT EXISTS idx_tax_types_is_digital_service ON public.tax_types(is_digital_service);
CREATE INDEX IF NOT EXISTS idx_tax_types_valid_from ON public.tax_types(valid_from);
CREATE INDEX IF NOT EXISTS idx_tax_types_valid_until ON public.tax_types(valid_until);

-- Tax configurations indexes
CREATE INDEX IF NOT EXISTS idx_tax_configurations_tax_type_code ON public.tax_configurations(tax_type_code);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_is_active ON public.tax_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_applies_to ON public.tax_configurations(applies_to);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_country_code ON public.tax_configurations(country_code);
CREATE INDEX IF NOT EXISTS idx_tax_configurations_valid_from ON public.tax_configurations(valid_from);

-- Sales table indexes
CREATE INDEX IF NOT EXISTS idx_sales_artwork_id ON public.sales(artwork_id);
CREATE INDEX IF NOT EXISTS idx_sales_winning_bid_id ON public.sales(winning_bid_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_id ON public.sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_sold_at ON public.sales(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_sale_price ON public.sales(sale_price);
CREATE INDEX IF NOT EXISTS idx_sales_original_currency ON public.sales(original_currency);
CREATE INDEX IF NOT EXISTS idx_sales_expires_at ON public.sales(expires_at);
CREATE INDEX IF NOT EXISTS idx_sales_is_expired ON public.sales(is_expired);

-- Payout requests indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_artist_id ON public.payout_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_sale_id ON public.payout_requests(sale_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON public.payout_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_requests_processed_at ON public.payout_requests(processed_at);
CREATE INDEX IF NOT EXISTS idx_payout_requests_payment_method_id ON public.payout_requests(payment_method_id);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON public.transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bid_id ON public.transactions(bid_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sale_id ON public.transactions(sale_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON public.transactions(amount);
CREATE INDEX IF NOT EXISTS idx_transactions_original_currency ON public.transactions(original_currency);
CREATE INDEX IF NOT EXISTS idx_transactions_payout_id ON public.transactions(payout_id);

-- Sales taxes indexes
CREATE INDEX IF NOT EXISTS idx_sales_taxes_sale_id ON public.sales_taxes(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_taxes_tax_configuration_id ON public.sales_taxes(tax_configuration_id);

-- Promo code uses indexes
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_promo_code_id ON public.promo_code_uses(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_user_id ON public.promo_code_uses(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_sale_id ON public.promo_code_uses(sale_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_created_at ON public.promo_code_uses(created_at);

-- Sale audit log indexes
CREATE INDEX IF NOT EXISTS idx_sale_audit_log_sale_id ON public.sale_audit_log(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_audit_log_changed_at ON public.sale_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_audit_log_new_status ON public.sale_audit_log(new_status);

-- Artwork engagements indexes
CREATE INDEX IF NOT EXISTS idx_artwork_engagements_user_id ON public.artwork_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_engagements_artwork_id ON public.artwork_engagements(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_engagements_device_id ON public.artwork_engagements(device_id);
CREATE INDEX IF NOT EXISTS idx_artwork_engagements_view_start_time ON public.artwork_engagements(view_start_time DESC);
CREATE INDEX IF NOT EXISTS idx_artwork_engagements_session_id ON public.artwork_engagements(session_id);
CREATE INDEX IF NOT EXISTS idx_artwork_engagements_created_at ON public.artwork_engagements(created_at);

-- Artwork reviews indexes
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_artwork_id ON public.artwork_reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_user_id ON public.artwork_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_processing_status ON public.artwork_reviews(processing_status);
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_image_verdict ON public.artwork_reviews(image_verdict);
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_text_verdict ON public.artwork_reviews(text_verdict);
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_created_at ON public.artwork_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_artwork_reviews_last_processed_at ON public.artwork_reviews(last_processed_at);

-- Ticket categories indexes
CREATE INDEX IF NOT EXISTS idx_ticket_categories_name ON public.ticket_categories(name);
CREATE INDEX IF NOT EXISTS idx_ticket_categories_created_at ON public.ticket_categories(created_at);

-- Ticket priorities indexes
CREATE INDEX IF NOT EXISTS idx_ticket_priorities_name ON public.ticket_priorities(name);
CREATE INDEX IF NOT EXISTS idx_ticket_priorities_created_at ON public.ticket_priorities(created_at);

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category_id ON public.support_tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority_id ON public.support_tickets(priority_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assignee_id ON public.support_tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_updated_at ON public.support_tickets(updated_at DESC);

-- Ticket comments indexes
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON public.ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_is_internal ON public.ticket_comments(is_internal);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON public.ticket_comments(created_at DESC);

-- Ticket attachments indexes
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_uploaded_by ON public.ticket_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_created_at ON public.ticket_attachments(created_at);

-- Ticket threads indexes
CREATE INDEX IF NOT EXISTS idx_ticket_threads_ticket_id ON public.ticket_threads(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_threads_created_at ON public.ticket_threads(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_threads_updated_at ON public.ticket_threads(updated_at);

-- System locks indexes
CREATE INDEX IF NOT EXISTS idx_system_locks_expires_at ON public.system_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_locks_created_at ON public.system_locks(created_at);

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('05_create_indexes.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify indexes are created
SELECT 
    'Indexes created successfully' AS status,
    count(*) AS total_indexes
FROM pg_indexes 
WHERE schemaname = 'public';
