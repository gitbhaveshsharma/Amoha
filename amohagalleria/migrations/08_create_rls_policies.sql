-- Migration: 08_create_rls_policies.sql
-- Description: Creates Row Level Security policies
-- Created: 2025-06-04
-- Author: AmohaGalleria Team

BEGIN;

-- Enable RLS on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zone_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_locks ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" ON public.profile
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Art categories policies (read-only for most users)
CREATE POLICY "Anyone can view active art categories" ON public.art_categories
  FOR SELECT USING (is_banned = false);

CREATE POLICY "Admin can manage art categories" ON public.art_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Currencies policies (read-only for most users)
CREATE POLICY "Anyone can view active currencies" ON public.currencies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage currencies" ON public.currencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Artworks policies
CREATE POLICY "Users can view active artworks" ON public.artworks
  FOR SELECT USING (status IN ('active', 'sold'));

CREATE POLICY "Artists can view their own artworks" ON public.artworks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can insert their own artworks" ON public.artworks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Artists can update their own artworks" ON public.artworks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all artworks" ON public.artworks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- User devices policies
CREATE POLICY "Users can view their own devices" ON public.user_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON public.user_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON public.user_devices
  FOR UPDATE USING (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON public.notification
  FOR ALL USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert events" ON public.events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Notification messages policies
CREATE POLICY "Users can view their own notification messages" ON public.notification_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification messages" ON public.notification_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification messages" ON public.notification_messages
  FOR INSERT WITH CHECK (true);

-- Bids policies
CREATE POLICY "Users can view bids on their artworks" ON public.bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.artworks 
      WHERE id = artwork_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own bids" ON public.bids
  FOR SELECT USING (auth.uid() = bidder_id);

CREATE POLICY "Users can insert bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can update their own bids" ON public.bids
  FOR UPDATE USING (auth.uid() = bidder_id);

CREATE POLICY "Artwork owners can update bid status" ON public.bids
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.artworks 
      WHERE id = artwork_id AND user_id = auth.uid()
    )
  );

-- Cart policies
CREATE POLICY "Users can manage their own cart" ON public.cart
  FOR ALL USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Exchange rates policies (read-only for most users)
CREATE POLICY "Anyone can view exchange rates" ON public.exchange_rates
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage exchange rates" ON public.exchange_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Promo codes policies
CREATE POLICY "Users can view active promo codes" ON public.promo_codes
  FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

CREATE POLICY "Admin can manage promo codes" ON public.promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Shipping zones and rules policies (read-only for most users)
CREATE POLICY "Anyone can view active shipping zones" ON public.shipping_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view shipping zone countries" ON public.shipping_zone_countries
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active shipping rules" ON public.shipping_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage shipping" ON public.shipping_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage shipping countries" ON public.shipping_zone_countries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage shipping rules" ON public.shipping_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tax policies (read-only for most users)
CREATE POLICY "Anyone can view tax types" ON public.tax_types
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active tax configurations" ON public.tax_configurations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage tax types" ON public.tax_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage tax configurations" ON public.tax_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Sales policies
CREATE POLICY "Buyers can view their own sales" ON public.sales
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Artists can view sales of their artworks" ON public.sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.artworks 
      WHERE id = artwork_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create sales" ON public.sales
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sales" ON public.sales
  FOR UPDATE USING (true);

CREATE POLICY "Admin can view all sales" ON public.sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Payout requests policies
CREATE POLICY "Artists can view their own payout requests" ON public.payout_requests
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create payout requests" ON public.payout_requests
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Admin can manage payout requests" ON public.payout_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Sales taxes policies
CREATE POLICY "Users can view sales taxes for their sales" ON public.sales_taxes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sales 
      WHERE id = sale_id AND buyer_id = auth.uid()
    )
  );

CREATE POLICY "Artists can view sales taxes for their sales" ON public.sales_taxes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sales s
      JOIN public.artworks a ON s.artwork_id = a.id
      WHERE s.id = sale_id AND a.user_id = auth.uid()
    )
  );

-- Promo code uses policies
CREATE POLICY "Users can view their own promo code uses" ON public.promo_code_uses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create promo code uses" ON public.promo_code_uses
  FOR INSERT WITH CHECK (true);

-- Sale audit log policies (admin only)
CREATE POLICY "Admin can view sale audit log" ON public.sale_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Artwork engagements policies
CREATE POLICY "Users can view their own engagements" ON public.artwork_engagements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can view engagements on their artworks" ON public.artwork_engagements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.artworks 
      WHERE id = artwork_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create engagements" ON public.artwork_engagements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own engagements" ON public.artwork_engagements
  FOR UPDATE USING (auth.uid() = user_id);

-- Artwork reviews policies
CREATE POLICY "Users can view reviews of their artworks" ON public.artwork_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage artwork reviews" ON public.artwork_reviews
  FOR ALL WITH CHECK (true);

CREATE POLICY "Admin can view all artwork reviews" ON public.artwork_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Support ticket categories and priorities (read-only for most users)
CREATE POLICY "Anyone can view ticket categories" ON public.ticket_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view ticket priorities" ON public.ticket_priorities
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage ticket categories" ON public.ticket_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage ticket priorities" ON public.ticket_priorities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin and assigned agents can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR auth.uid() = assignee_id
  );

CREATE POLICY "Admin can assign and manage tickets" ON public.support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Ticket comments policies
CREATE POLICY "Users can view comments on their tickets" ON public.ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add comments to their tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    ) AND auth.uid() = user_id
  );

CREATE POLICY "Admin can view and add comments to all tickets" ON public.ticket_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Assigned agents can view and add comments" ON public.ticket_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND assignee_id = auth.uid()
    )
  );

-- Ticket attachments policies
CREATE POLICY "Users can view attachments on their tickets" ON public.ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add attachments to their tickets" ON public.ticket_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    ) AND auth.uid() = uploaded_by
  );

CREATE POLICY "Admin can manage all ticket attachments" ON public.ticket_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Ticket threads policies
CREATE POLICY "Users can view threads for their tickets" ON public.ticket_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage ticket threads" ON public.ticket_threads
  FOR ALL WITH CHECK (true);

CREATE POLICY "Admin can view all ticket threads" ON public.ticket_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- System locks policies (admin only)
CREATE POLICY "Admin can manage system locks" ON public.system_locks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Log this migration
INSERT INTO public.migrations_log (migration_name, executed_at, success) 
VALUES ('08_create_rls_policies.sql', NOW(), TRUE)
ON CONFLICT (migration_name) DO NOTHING;

COMMIT;

-- Verify RLS policies are created
SELECT 
    'RLS policies created successfully' AS status,
    count(*) AS total_policies
FROM pg_policies 
WHERE schemaname = 'public';
