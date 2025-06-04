-- Migration: 06_create_triggers.sql
-- Description: Creates database triggers
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Trigger for updating updated_at timestamp on profile
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_profile_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_art_categories_updated_at
    BEFORE UPDATE ON public.art_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_currencies_updated_at
    BEFORE UPDATE ON public.currencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_artworks_updated_at
    BEFORE UPDATE ON public.artworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_devices_updated_at
    BEFORE UPDATE ON public.user_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notification_updated_at
    BEFORE UPDATE ON public.notification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bids_updated_at
    BEFORE UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cart_updated_at
    BEFORE UPDATE ON public.cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_wishlist_updated_at
    BEFORE UPDATE ON public.wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tax_configurations_updated_at
    BEFORE UPDATE ON public.tax_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_artwork_engagements_updated_at
    BEFORE UPDATE ON public.artwork_engagements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_artwork_reviews_updated_at
    BEFORE UPDATE ON public.artwork_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ticket_categories_updated_at
    BEFORE UPDATE ON public.ticket_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ticket_priorities_updated_at
    BEFORE UPDATE ON public.ticket_priorities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ticket_threads_updated_at
    BEFORE UPDATE ON public.ticket_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bid status changes
CREATE OR REPLACE FUNCTION handle_bid_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes for audit trail
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO events (event_type, user_id, metadata)
        VALUES (
            'bid_status_changed',
            NEW.bidder_id,
            jsonb_build_object(
                'bid_id', NEW.id,
                'artwork_id', NEW.artwork_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'amount', NEW.amount
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bid_status_change
    AFTER UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION handle_bid_status_change();

-- Trigger for artwork status changes
CREATE OR REPLACE FUNCTION handle_artwork_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes for audit trail
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO events (event_type, user_id, metadata)
        VALUES (
            'artwork_status_changed',
            NEW.user_id,
            jsonb_build_object(
                'artwork_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'title', NEW.title
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_artwork_status_change
    AFTER UPDATE ON public.artworks
    FOR EACH ROW
    EXECUTE FUNCTION handle_artwork_status_change();

-- Trigger for sale status changes and audit logging
CREATE OR REPLACE FUNCTION handle_sale_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes in audit table
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO sale_audit_log (sale_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
        
        -- Log event for notifications
        INSERT INTO events (event_type, user_id, metadata)
        VALUES (
            'sale_status_changed',
            NEW.buyer_id,
            jsonb_build_object(
                'sale_id', NEW.id,
                'artwork_id', NEW.artwork_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'sale_price', NEW.sale_price
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sale_status_change
    AFTER UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION handle_sale_status_change();

-- Trigger for cart item additions (for notifications)
CREATE OR REPLACE FUNCTION handle_cart_item_added()
RETURNS TRIGGER AS $$
BEGIN
    -- Log cart addition event
    INSERT INTO events (event_type, user_id, metadata)
    VALUES (
        'cart_item_added',
        NEW.user_id,
        jsonb_build_object(
            'cart_id', NEW.id,
            'artwork_id', NEW.artwork_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cart_item_added
    AFTER INSERT ON public.cart
    FOR EACH ROW
    EXECUTE FUNCTION handle_cart_item_added();

-- Trigger for wishlist item additions (for notifications)
CREATE OR REPLACE FUNCTION handle_wishlist_item_added()
RETURNS TRIGGER AS $$
BEGIN
    -- Log wishlist addition event
    INSERT INTO events (event_type, user_id, metadata)
    VALUES (
        'wishlist_item_added',
        NEW.user_id,
        jsonb_build_object(
            'wishlist_id', NEW.id,
            'artwork_id', NEW.artwork_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_wishlist_item_added
    AFTER INSERT ON public.wishlist
    FOR EACH ROW
    EXECUTE FUNCTION handle_wishlist_item_added();

-- Trigger for support ticket status changes
CREATE OR REPLACE FUNCTION handle_support_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes for audit trail
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO events (event_type, user_id, metadata)
        VALUES (
            'support_ticket_status_changed',
            NEW.user_id,
            jsonb_build_object(
                'ticket_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'subject', NEW.subject
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_support_ticket_status_change
    AFTER UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION handle_support_ticket_status_change();

-- Trigger for new support ticket creation
CREATE OR REPLACE FUNCTION handle_new_support_ticket()
RETURNS TRIGGER AS $$
BEGIN
    -- Log new ticket creation event
    INSERT INTO events (event_type, user_id, metadata)
    VALUES (
        'support_ticket_created',
        NEW.user_id,
        jsonb_build_object(
            'ticket_id', NEW.id,
            'subject', NEW.subject,
            'category_id', NEW.category_id,
            'priority_id', NEW.priority_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_support_ticket
    AFTER INSERT ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_support_ticket();

-- Trigger for new ticket comments
CREATE OR REPLACE FUNCTION handle_new_ticket_comment()
RETURNS TRIGGER AS $$
DECLARE
    ticket_user_id UUID;
BEGIN
    -- Get the ticket owner's user_id
    SELECT user_id INTO ticket_user_id 
    FROM support_tickets 
    WHERE id = NEW.ticket_id;
    
    -- Log new comment event (notify ticket owner if comment is from staff)
    IF NEW.user_id != ticket_user_id THEN
        INSERT INTO events (event_type, user_id, metadata)
        VALUES (
            'support_ticket_comment_added',
            ticket_user_id,
            jsonb_build_object(
                'ticket_id', NEW.ticket_id,
                'comment_id', NEW.id,
                'commenter_id', NEW.user_id,
                'is_internal', NEW.is_internal
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_ticket_comment
    AFTER INSERT ON public.ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_ticket_comment();

-- Trigger for new bid notifications
CREATE OR REPLACE FUNCTION handle_new_bid()
RETURNS TRIGGER AS $$
DECLARE
    artwork_owner_id UUID;
BEGIN
    -- Get the artwork owner's user_id
    SELECT user_id INTO artwork_owner_id 
    FROM artworks 
    WHERE id = NEW.artwork_id;
    
    -- Log new bid event (notify artwork owner)
    INSERT INTO events (event_type, user_id, metadata)
    VALUES (
        'new_bid_received',
        artwork_owner_id,
        jsonb_build_object(
            'bid_id', NEW.id,
            'artwork_id', NEW.artwork_id,
            'bidder_id', NEW.bidder_id,
            'amount', NEW.amount
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_bid
    AFTER INSERT ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_bid();

-- Trigger for promo code usage tracking
CREATE OR REPLACE FUNCTION handle_promo_code_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment the current_uses counter
    UPDATE promo_codes 
    SET current_uses = current_uses + 1
    WHERE id = NEW.promo_code_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_promo_code_usage
    AFTER INSERT ON public.promo_code_uses
    FOR EACH ROW
    EXECUTE FUNCTION handle_promo_code_usage();

-- Trigger to clean up expired system locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM system_locks WHERE expires_at < NOW();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_expired_locks
    AFTER INSERT ON public.system_locks
    FOR EACH STATEMENT
    EXECUTE FUNCTION cleanup_expired_locks();

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('06_create_triggers.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify triggers are created
SELECT 
    'Triggers created successfully' AS status,
    count(*) AS total_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
