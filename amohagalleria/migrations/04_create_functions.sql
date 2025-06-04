-- Database Functions for AmohaGalleria

-- Increment a column value in a table
CREATE OR REPLACE FUNCTION public.increment(
  table_name text,
  column_name text,
  conditions text
) RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE %s', 
    table_name, column_name, column_name, conditions);
END;
$$ LANGUAGE plpgsql;

-- Update support_tickets updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Append a message to a support ticket thread
CREATE OR REPLACE FUNCTION append_ticket_message(
  p_ticket_id uuid,
  new_message jsonb,
  user_id uuid
) RETURNS void AS $$
DECLARE
  current_messages jsonb;
BEGIN
  -- Check if thread exists
  SELECT messages INTO current_messages FROM ticket_threads 
  WHERE ticket_id = p_ticket_id;
  
  IF current_messages IS NULL THEN
    -- Create new thread with first message
    INSERT INTO ticket_threads (ticket_id, messages, participants)
    VALUES (
      p_ticket_id, 
      jsonb_build_array(new_message), 
      jsonb_build_object(
        CASE 
          WHEN new_message->>'author_ref' LIKE 'user_%' THEN 'user_' || user_id
          ELSE 'agent_' || user_id
        END, 
        user_id
      )
    );
  ELSE
    -- Update existing thread by appending the new message
    UPDATE ticket_threads
    SET 
      messages = messages || new_message,
      participants = participants || jsonb_build_object(
        CASE 
          WHEN new_message->>'author_ref' LIKE 'user_%' THEN 'user_' || user_id
          ELSE 'agent_' || user_id
        END, 
        user_id
      ),
      updated_at = now()
    WHERE ticket_id = p_ticket_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Payout-related Functions for AmohaGalleria

-- Function to create pending sale when a bid is accepted
CREATE OR REPLACE FUNCTION create_pending_sale_on_bid_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_artwork RECORD;
  v_payment_window INTERVAL := '24 hours';
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT a.* INTO v_artwork 
    FROM artworks a 
    WHERE a.id = NEW.artwork_id 
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Artwork not found';
    END IF;
    
    IF v_artwork.status != 'listed' THEN
      RAISE EXCEPTION 'Artwork is not available';
    END IF;

    v_expires_at := NOW() + v_payment_window;

    INSERT INTO sales (
      artwork_id,
      winning_bid_id,
      buyer_id,
      sale_price,
      original_currency,
      status,
      expires_at,
      is_expired
    ) VALUES (
      NEW.artwork_id,
      NEW.id,
      NEW.bidder_id,
      NEW.amount,
      v_artwork.currency,
      'pending',
      v_expires_at,
      FALSE
    );

    UPDATE bids SET
      status = 'accepted',
      expires_at = v_expires_at
    WHERE id = NEW.id;

    UPDATE artworks SET status = 'reserved' WHERE id = NEW.artwork_id;

    INSERT INTO sale_audit_log (sale_id, new_status, change_reason)
    SELECT id, 'pending', 'Bid accepted'
    FROM sales 
    WHERE winning_bid_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION complete_sale_after_payment(
  p_sale_id UUID,
  p_payment_provider_id TEXT DEFAULT NULL,
  p_tax_configuration_id UUID DEFAULT NULL,
  p_shipping_rule_id UUID DEFAULT NULL,
  p_promo_code_id UUID DEFAULT NULL,
  p_discount_amount DECIMAL(12,2) DEFAULT 0,
  p_shipping_country TEXT DEFAULT NULL,
  p_shipping_region TEXT DEFAULT NULL,
  p_shipping_city TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_sale RECORD;
  v_artwork RECORD;
  v_bid RECORD;
  v_default_payment_method UUID;
  v_payout_request_id UUID;
  v_payout_status TEXT;
  v_total_charged DECIMAL(12,2);
BEGIN
  BEGIN
    SELECT * INTO v_sale FROM sales WHERE id = p_sale_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN json_build_object('error', 'Sale not found');
    END IF;

    IF v_sale.status != 'pending' THEN
      RETURN json_build_object('error', 'Sale is not in pending state');
    END IF;

    IF v_sale.is_expired THEN
      RETURN json_build_object('error', 'Cannot complete expired sale');
    END IF;

    SELECT * INTO v_artwork FROM artworks WHERE id = v_sale.artwork_id;
    SELECT * INTO v_bid FROM bids WHERE id = v_sale.winning_bid_id;

    v_total_charged := v_sale.sale_price + COALESCE(v_sale.tax_amount, 0) + 
                      COALESCE(v_sale.shipping_cost, 0) - 
                      COALESCE(p_discount_amount, 0);

    UPDATE sales SET
      tax_configuration_id = p_tax_configuration_id,
      shipping_rule_id = p_shipping_rule_id,
      promo_code_id = p_promo_code_id,
      discount_amount = p_discount_amount,
      shipping_country = p_shipping_country,
      shipping_region = p_shipping_region,
      shipping_city = p_shipping_city,
      status = 'completed',
      payout_initiated_at = NOW(),
      sold_at = NOW()
    WHERE id = p_sale_id
    RETURNING * INTO v_sale;

    UPDATE artworks SET status = 'sold' WHERE id = v_sale.artwork_id;
    UPDATE bids SET status = 'won' WHERE id = v_sale.winning_bid_id;

    SELECT id INTO v_default_payment_method
    FROM payment_methods
    WHERE user_id = v_artwork.user_id 
      AND is_default = TRUE 
      AND is_valid = TRUE
    LIMIT 1;

    IF v_default_payment_method IS NOT NULL THEN
      v_payout_status := 'pending';
    ELSE
      v_payout_status := 'on_hold';
    END IF;

    INSERT INTO payout_requests (
      artist_id, 
      sale_id, 
      amount,
      original_currency, 
      requested_currency, 
      net_amount, 
      status, 
      payment_method_id,
      payment_provider_id
    ) VALUES (
      v_artwork.user_id, 
      v_sale.id, 
      v_sale.artist_payout_amount,
      v_sale.original_currency, 
      v_sale.base_currency, 
      v_sale.artist_payout_amount, 
      v_payout_status, 
      v_default_payment_method,
      p_payment_provider_id
    ) RETURNING id INTO v_payout_request_id;

    INSERT INTO sale_audit_log (sale_id, old_status, new_status, change_reason)
    VALUES (p_sale_id, 'pending', 'completed', 'Payment completed');

    RETURN json_build_object(
      'success', true,
      'sale_id', v_sale.id,
      'payout_request_id', v_payout_request_id,
      'payout_status', v_payout_status,
      'total_charged', v_total_charged,
      'currency', v_sale.original_currency,
      'artist_payout', v_sale.artist_payout_amount,
      'platform_fee', v_sale.platform_fee
    );

  EXCEPTION WHEN OTHERS THEN
    INSERT INTO sale_audit_log (sale_id, old_status, new_status, change_reason)
    VALUES (p_sale_id, 'pending', 'error', SQLERRM);

    RETURN json_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'sale_id', p_sale_id
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION expire_unpaid_sales()
RETURNS JSON AS $$
DECLARE
  v_expired_count INTEGER;
  v_notification_count INTEGER := 0;
BEGIN
  WITH expired_sales AS (
    UPDATE sales
    SET is_expired = TRUE,
        status = 'expired'
    WHERE status = 'pending'
      AND expires_at <= NOW()
      AND is_expired = FALSE
    RETURNING id, artwork_id, winning_bid_id, buyer_id
  ),
  reset_bids AS (
    UPDATE bids
    SET status = 'pending',
        expires_at = NULL
    FROM expired_sales
    WHERE bids.id = expired_sales.winning_bid_id
    RETURNING bids.id
  ),
  released_artworks AS (
    UPDATE artworks
    SET status = 'listed'
    FROM expired_sales
    WHERE artworks.id = expired_sales.artwork_id
    RETURNING artworks.id
  )
  SELECT COUNT(*) INTO v_expired_count
  FROM expired_sales;

  INSERT INTO sale_audit_log (sale_id, old_status, new_status, change_reason)
  SELECT id, 'pending', 'expired', 'Payment window expired'
  FROM sales
  WHERE status = 'expired'
    AND is_expired = TRUE
    AND expires_at <= NOW();

  RETURN json_build_object(
    'success', true,
    'expired_count', v_expired_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION get_sale_status(p_sale_id UUID)
RETURNS JSON AS $$
DECLARE
  v_sale RECORD;
  v_time_left INTERVAL;
BEGIN
  SELECT 
    s.*,
    a.title as artwork_title,
    u1.email as buyer_email,
    u2.email as artist_email
  INTO v_sale
  FROM sales s
  JOIN artworks a ON s.artwork_id = a.id
  JOIN auth.users u1 ON s.buyer_id = u1.id
  JOIN auth.users u2 ON a.user_id = u2.id
  WHERE s.id = p_sale_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Sale not found');
  END IF;

  v_time_left := v_sale.expires_at - NOW();

  RETURN json_build_object(
    'status', v_sale.status,
    'is_expired', v_sale.is_expired,
    'expires_at', v_sale.expires_at,
    'time_left_seconds', EXTRACT(EPOCH FROM v_time_left),
    'artwork_title', v_sale.artwork_title,
    'parties', json_build_object(
      'buyer', v_sale.buyer_email,
      'artist', v_sale.artist_email
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



CREATE OR REPLACE FUNCTION public.get_artist_available_balance()
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_sales DECIMAL(12,2);
    total_paid_out DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(s.artist_payout_amount), 0) INTO total_sales
    FROM sales s
    JOIN artworks a ON s.artwork_id = a.id
    WHERE a.user_id = auth.uid()
    AND s.status = 'completed';

    SELECT COALESCE(SUM(amount), 0) INTO total_paid_out
    FROM payouts
    WHERE artist_id = auth.uid()
    AND status = 'completed';

    RETURN total_sales - total_paid_out;
END;
$$;

-- function: artwork_reviews

CREATE TABLE artwork_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Processing Status
  processing_status TEXT NOT NULL DEFAULT 'queued' 
    CHECK (processing_status IN ('queued', 'processing', 'completed', 'failed')),

  -- Image Analysis Results
  image_verdict TEXT CHECK (image_verdict IN ('approved', 'rejected', 'pending')),
  nsfw_scores JSONB, -- Stores {porn: 0.xx, sexy: 0.xx, hentai: 0.xx, neutral: 0.xx, drawing: 0.xx}
  image_rejection_reasons TEXT[],

  -- Text Analysis Results
  text_verdict TEXT CHECK (text_verdict IN ('approved', 'rejected', 'pending')),
  grammar_issues JSONB, -- Stores LanguageTool API response
  text_rejection_reasons TEXT[],

  -- Metadata
  attempt_count INTEGER DEFAULT 0,
  last_processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artwork_reviews_queued ON artwork_reviews (processing_status) 
  WHERE processing_status = 'queued';

CREATE INDEX idx_artwork_reviews_artwork_id ON artwork_reviews (artwork_id);


CREATE OR REPLACE FUNCTION fn_queue_artwork_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process new pending submissions
  IF NEW.status = 'pending_review' THEN
    INSERT INTO artwork_reviews (artwork_id, user_id)
    VALUES (NEW.id, NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER trg_queue_artwork_review
AFTER INSERT ON artworks
FOR EACH ROW
EXECUTE FUNCTION fn_queue_artwork_review();


CREATE OR REPLACE FUNCTION fn_update_artwork_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when review is completed
  IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
    -- Update artwork status based on verdicts
    UPDATE artworks
    SET status = CASE
      WHEN NEW.image_verdict = 'approved' AND NEW.text_verdict = 'approved' THEN 'listed'
      ELSE 'rejected'
    END,
    updated_at = NOW()
    WHERE id = NEW.artwork_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER trg_update_artwork_status
AFTER UPDATE ON artwork_reviews
FOR EACH ROW
EXECUTE FUNCTION fn_update_artwork_status();


CREATE OR REPLACE FUNCTION public.get_sales_summary(
  p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_artist_id UUID DEFAULT NULL,
  p_buyer_id UUID DEFAULT NULL,
  p_status_filter TEXT DEFAULT NULL,
  p_country_filter TEXT DEFAULT NULL,
  p_group_by_period TEXT DEFAULT NULL -- 'day', 'week', 'month', 'year'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  time_grouping TEXT;
BEGIN
  -- Validate group_by_period parameter
  IF p_group_by_period IS NOT NULL AND p_group_by_period NOT IN ('day', 'week', 'month', 'year') THEN
    RAISE EXCEPTION 'Invalid group_by_period value. Must be one of: day, week, month, year';
  END IF;

  -- Set the appropriate date truncation based on group_by_period
  time_grouping := CASE 
    WHEN p_group_by_period = 'day' THEN 'day'
    WHEN p_group_by_period = 'week' THEN 'week'
    WHEN p_group_by_period = 'month' THEN 'month'
    WHEN p_group_by_period = 'year' THEN 'year'
    ELSE NULL
  END;

  IF time_grouping IS NULL THEN
    -- Summary without time grouping
    SELECT json_build_object(
      'total_sales', COALESCE(SUM(
        CASE WHEN (p_date_from IS NULL OR s.sold_at >= p_date_from) AND
                  (p_date_to IS NULL OR s.sold_at <= p_date_to) AND
                  (p_artist_id IS NULL OR a.user_id = p_artist_id) AND
                  (p_buyer_id IS NULL OR s.buyer_id = p_buyer_id) AND
                  (p_status_filter IS NULL OR s.status = p_status_filter) AND
                  (p_country_filter IS NULL OR s.shipping_country = p_country_filter)
            THEN s.sale_price ELSE 0 END
      ), 0),
      'revenue_after_fees', COALESCE(SUM(
        CASE WHEN (p_date_from IS NULL OR s.sold_at >= p_date_from) AND
                  (p_date_to IS NULL OR s.sold_at <= p_date_to) AND
                  (p_artist_id IS NULL OR a.user_id = p_artist_id) AND
                  (p_buyer_id IS NULL OR s.buyer_id = p_buyer_id) AND
                  (p_status_filter IS NULL OR s.status = p_status_filter) AND
                  (p_country_filter IS NULL OR s.shipping_country = p_country_filter)
            THEN s.platform_fee + COALESCE(s.tax_amount, 0) ELSE 0 END
      ), 0),
      'artist_payouts', COALESCE(SUM(
        CASE WHEN (p_date_from IS NULL OR s.sold_at >= p_date_from) AND
                  (p_date_to IS NULL OR s.sold_at <= p_date_to) AND
                  (p_artist_id IS NULL OR a.user_id = p_artist_id) AND
                  (p_buyer_id IS NULL OR s.buyer_id = p_buyer_id) AND
                  (p_status_filter IS NULL OR s.status = p_status_filter) AND
                  (p_country_filter IS NULL OR s.shipping_country = p_country_filter)
            THEN s.artist_payout_amount ELSE 0 END
      ), 0),
      'taxes_collected', COALESCE(SUM(
        CASE WHEN (p_date_from IS NULL OR s.sold_at >= p_date_from) AND
                  (p_date_to IS NULL OR s.sold_at <= p_date_to) AND
                  (p_artist_id IS NULL OR a.user_id = p_artist_id) AND
                  (p_buyer_id IS NULL OR s.buyer_id = p_buyer_id) AND
                  (p_status_filter IS NULL OR s.status = p_status_filter) AND
                  (p_country_filter IS NULL OR s.shipping_country = p_country_filter)
            THEN COALESCE(s.tax_amount, 0) ELSE 0 END
      ), 0)
    ) INTO result
    FROM sales s
    JOIN artworks a ON s.artwork_id = a.id;
  ELSE
    -- Summary with time grouping
    WITH sales_data AS (
      SELECT
        date_trunc(time_grouping, s.sold_at) AS time_period,
        s.sale_price,
        s.platform_fee,
        COALESCE(s.tax_amount, 0) AS tax_amount,
        s.artist_payout_amount,
        s.status,
        s.shipping_country,
        s.artwork_id
      FROM sales s
      JOIN artworks a ON s.artwork_id = a.id
      WHERE (p_date_from IS NULL OR s.sold_at >= p_date_from)
        AND (p_date_to IS NULL OR s.sold_at <= p_date_to)
        AND (p_artist_id IS NULL OR a.user_id = p_artist_id)
        AND (p_buyer_id IS NULL OR s.buyer_id = p_buyer_id)
        AND (p_status_filter IS NULL OR s.status = p_status_filter)
        AND (p_country_filter IS NULL OR s.shipping_country = p_country_filter)
    ),
    time_aggregated AS (
      SELECT
        time_period,
        SUM(sale_price) AS total_sales,
        SUM(platform_fee + tax_amount) AS revenue_after_fees,
        SUM(artist_payout_amount) AS artist_payouts,
        SUM(tax_amount) AS taxes_collected,
        COUNT(*) AS sale_count
      FROM sales_data
      GROUP BY time_period
      ORDER BY time_period
    ),
    region_data AS (
      SELECT
        shipping_country,
        COUNT(*) AS count,
        SUM(sale_price) AS amount
      FROM sales_data
      WHERE shipping_country IS NOT NULL
      GROUP BY shipping_country
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ),
    artwork_data AS (
      SELECT
        a.id AS artwork_id,
        a.title,
        COUNT(*) AS count,
        SUM(sd.sale_price) AS revenue
      FROM sales_data sd
      JOIN artworks a ON sd.artwork_id = a.id
      GROUP BY a.id, a.title
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ),
    conversion_rate AS (
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed')::float / 
        NULLIF(COUNT(*), 0) * 100 AS rate
      FROM sales_data
    )
    SELECT json_build_object(
      'total_sales', (SELECT COALESCE(SUM(total_sales), 0) FROM time_aggregated),
      'revenue_after_fees', (SELECT COALESCE(SUM(revenue_after_fees), 0) FROM time_aggregated),
      'artist_payouts', (SELECT COALESCE(SUM(artist_payouts), 0) FROM time_aggregated),
      'taxes_collected', (SELECT COALESCE(SUM(taxes_collected), 0) FROM time_aggregated),
      'sales_by_region', COALESCE(
        (SELECT json_agg(json_build_object(
          'country', shipping_country,
          'count', count,
          'amount', amount
        )) FROM region_data),
        '[]'::json
      ),
      'top_selling_artworks', COALESCE(
        (SELECT json_agg(json_build_object(
          'artwork_id', artwork_id,
          'title', title,
          'count', count,
          'revenue', revenue
        )) FROM artwork_data),
        '[]'::json
      ),
      'conversion_rate', (SELECT COALESCE(rate, 0) FROM conversion_rate),
      'time_periods', COALESCE(
        (SELECT json_agg(json_build_object(
          'period', time_period,
          'total_sales', total_sales,
          'revenue_after_fees', revenue_after_fees,
          'artist_payouts', artist_payouts,
          'taxes_collected', taxes_collected,
          'count', sale_count
        )) FROM time_aggregated),
        '[]'::json
      )
    ) INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the function
SELECT proname, pg_get_function_arguments(p.oid), pg_get_function_result(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'get_sales_summary';

SELECT * FROM pg_constraint 
WHERE conrelid = 'sales'::regclass 
  AND confrelid = 'auth.users'::regclass;



CREATE OR REPLACE FUNCTION get_artwork_suggestions(input_text TEXT)
RETURNS TABLE(suggestion TEXT, similarity_score REAL, artwork_count BIGINT, suggestion_type TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    normalized_input TEXT := LOWER(TRIM(input_text));
BEGIN
    IF LENGTH(normalized_input) < 2 THEN
        RETURN;
    END IF;

    RETURN QUERY
    WITH combined_suggestions AS (
        -- Title matches
        SELECT 
            title AS suggestion_text,
            similarity(LOWER(title), normalized_input) AS sim_score,
            'title' AS type
        FROM artworks
        WHERE 
            status IN ('active', 'listed') AND title IS NOT NULL
            AND (
                LOWER(title) ILIKE '%' || normalized_input || '%'
                OR similarity(LOWER(title), normalized_input) > 0.1
            )

        UNION ALL

        -- Medium matches
        SELECT 
            medium AS suggestion_text,
            similarity(LOWER(medium), normalized_input) AS sim_score,
            'medium' AS type
        FROM artworks
        WHERE 
            status IN ('active', 'listed') AND medium IS NOT NULL
            AND (
                LOWER(medium) ILIKE '%' || normalized_input || '%'
                OR similarity(LOWER(medium), normalized_input) > 0.1
            )

        UNION ALL

        -- Art category matches
        SELECT 
            art_category AS suggestion_text,
            similarity(LOWER(art_category), normalized_input) AS sim_score,
            'category' AS type
        FROM artworks
        WHERE 
            status IN ('active', 'listed') AND art_category IS NOT NULL
            AND (
                LOWER(art_category) ILIKE '%' || normalized_input || '%'
                OR similarity(LOWER(art_category), normalized_input) > 0.1
            )
            
        UNION ALL
        
        -- Artist name matches
        SELECT 
            p.name AS suggestion_text,
            similarity(LOWER(p.name), normalized_input) AS sim_score,
            'artist' AS type
        FROM profile p
        JOIN artworks a ON p.user_id = a.user_id
        WHERE 
            p.role = 'artist' AND 
            a.status IN ('active', 'listed') AND 
            p.name IS NOT NULL AND
            (
                LOWER(p.name) ILIKE '%' || normalized_input || '%'
                OR similarity(LOWER(p.name), normalized_input) > 0.1
            )
    ),
    grouped_suggestions AS (
        SELECT 
            suggestion_text,
            type,
            MAX(sim_score) AS max_similarity,
            COUNT(*) AS suggestion_count
        FROM combined_suggestions
        GROUP BY suggestion_text, type
        HAVING suggestion_text IS NOT NULL
    )
    SELECT 
        suggestion_text AS suggestion,
        max_similarity AS similarity_score,
        suggestion_count AS artwork_count,
        type AS suggestion_type
    FROM grouped_suggestions
    ORDER BY 
        CASE 
            WHEN type = 'artist' THEN 0 -- Prioritize artist matches
            ELSE 1
        END,
        max_similarity DESC, 
        suggestion_count DESC, 
        suggestion_text
    LIMIT 10;
END;
$$;

-- Search for artworks using the function
CREATE OR REPLACE FUNCTION search_artworks(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0,
  include_listed BOOLEAN DEFAULT TRUE,
  search_by_artist BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  medium TEXT,
  dimensions TEXT,
  date DATE,
  art_location VARCHAR,
  artist_price NUMERIC,
  user_id UUID,
  image_url TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  currency TEXT,
  art_category TEXT,
  is_featured BOOLEAN,
  image_1_url TEXT,
  image_2_url TEXT,
  image_3_url TEXT,
  image_4_url TEXT,
  similarity_score REAL,
  artist_name TEXT,
  artist_avatar TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_query TEXT := LOWER(TRIM(search_query));
  status_filter TEXT := CASE WHEN include_listed THEN 'active,listed' ELSE 'active' END;
  auto_detected_artist BOOLEAN := FALSE;
  final_search_by_artist BOOLEAN := search_by_artist;
BEGIN
  IF LENGTH(normalized_query) < 2 THEN
    RETURN;
  END IF;

  -- Auto-detect if this should be an artist search
  IF NOT search_by_artist THEN
    -- Check if query matches any artist names with high similarity
    SELECT EXISTS(
      SELECT 1 FROM profile p
      WHERE p.role = 'artist' 
      AND (
        LOWER(p.name) ILIKE '%' || normalized_query || '%'
        OR similarity(LOWER(p.name), normalized_query) > 0.3
      )
    ) INTO auto_detected_artist;
    
    -- If we found artist matches, prioritize artist search
    IF auto_detected_artist THEN
      final_search_by_artist := TRUE;
    END IF;
  END IF;

  RETURN QUERY
  WITH search_results AS (
    SELECT 
      a.id,
      a.title,
      a.description,
      a.medium,
      a.dimensions,
      a.date,
      a.art_location,
      a.artist_price,
      a.user_id,
      a.image_url,
      a.status,
      a.created_at,
      a.updated_at,
      a.currency,
      a.art_category,
      a.is_featured,
      a.image_1_url,
      a.image_2_url,
      a.image_3_url,
      a.image_4_url,
      p.name AS artist_name,
      p.avatar_url AS artist_avatar,
      CASE
        WHEN final_search_by_artist THEN
          similarity(LOWER(p.name), normalized_query)
        ELSE
          GREATEST(
            similarity(LOWER(a.title), normalized_query),
            similarity(LOWER(a.medium), normalized_query),
            similarity(LOWER(a.art_category), normalized_query),
            similarity(LOWER(a.description), normalized_query) * 0.8,
            -- Include artist name similarity even in artwork search but with lower weight
            similarity(LOWER(p.name), normalized_query) * 0.6
          )
      END::REAL AS similarity_score,
      CASE 
        WHEN final_search_by_artist AND LOWER(p.name) = normalized_query THEN 1.0
        WHEN final_search_by_artist AND LOWER(p.name) LIKE normalized_query || '%' THEN 0.9
        WHEN final_search_by_artist AND LOWER(p.name) LIKE '%' || normalized_query || '%' THEN 0.8
        WHEN LOWER(a.title) = normalized_query THEN 1.0
        WHEN LOWER(a.title) LIKE normalized_query || '%' THEN 0.9
        WHEN LOWER(a.title) LIKE '%' || normalized_query || '%' THEN 0.8
        WHEN NOT final_search_by_artist AND LOWER(p.name) LIKE '%' || normalized_query || '%' THEN 0.7
        ELSE 0.0
      END AS exact_match_score
    FROM artworks a
    LEFT JOIN profile p ON a.user_id = p.user_id
    WHERE 
      a.status = ANY(string_to_array(status_filter, ',')::text[])
      AND (
        (final_search_by_artist AND (
          LOWER(p.name) ILIKE '%' || normalized_query || '%'
          OR similarity(LOWER(p.name), normalized_query) > 0.1
        ))
        OR
        (NOT final_search_by_artist AND (
          LOWER(a.title) ILIKE '%' || normalized_query || '%'
          OR LOWER(a.description) ILIKE '%' || normalized_query || '%'
          OR LOWER(a.medium) ILIKE '%' || normalized_query || '%'
          OR LOWER(a.art_category) ILIKE '%' || normalized_query || '%'
          OR LOWER(p.name) ILIKE '%' || normalized_query || '%'
          OR similarity(LOWER(a.title), normalized_query) > 0.1
          OR similarity(LOWER(a.medium), normalized_query) > 0.1
          OR similarity(LOWER(a.art_category), normalized_query) > 0.1
          OR similarity(LOWER(p.name), normalized_query) > 0.1
        ))
      )
  )
  SELECT 
    sr.id,
    sr.title,
    sr.description,
    sr.medium,
    sr.dimensions,
    sr.date,
    sr.art_location,
    sr.artist_price,
    sr.user_id,
    sr.image_url,
    sr.status,
    sr.created_at,
    sr.updated_at,
    sr.currency,
    sr.art_category,
    sr.is_featured,
    sr.image_1_url,
    sr.image_2_url,
    sr.image_3_url,
    sr.image_4_url,
    sr.similarity_score,
    sr.artist_name,
    sr.artist_avatar
  FROM search_results sr
  ORDER BY 
    sr.exact_match_score DESC,
    sr.similarity_score DESC,
    sr.is_featured DESC,
    sr.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Filter artworks 
CREATE OR REPLACE FUNCTION filter_artworks(
  -- Filter by specific artwork IDs (e.g. from search results)
  artwork_ids UUID[] DEFAULT NULL,

  -- Basic filters
  categories TEXT[] DEFAULT NULL,
  mediums TEXT[] DEFAULT NULL,
  status_filter TEXT DEFAULT 'active', -- 'active', 'listed', or 'active,listed'

  -- Price range
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,

  -- Artist filters
  artist_ids UUID[] DEFAULT NULL,
  artist_name_filter TEXT DEFAULT NULL,  -- renamed to avoid conflict

  -- Date range
  min_year INTEGER DEFAULT NULL,
  max_year INTEGER DEFAULT NULL,

  -- Dimensions from string (e.g. "120 x 80")
  min_width_cm INTEGER DEFAULT NULL,
  max_width_cm INTEGER DEFAULT NULL,
  min_height_cm INTEGER DEFAULT NULL,
  max_height_cm INTEGER DEFAULT NULL,

  -- Location
  locations TEXT[] DEFAULT NULL,

  -- Featured/trending
  only_featured BOOLEAN DEFAULT FALSE,
  only_trending BOOLEAN DEFAULT FALSE,

  -- Sorting
  sort_by TEXT DEFAULT 'created_at_desc',

  -- Pagination
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  medium TEXT,
  dimensions TEXT,
  date DATE,
  art_location VARCHAR,
  artist_price NUMERIC,
  user_id UUID,
  image_url TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  currency TEXT,
  art_category TEXT,
  is_featured BOOLEAN,
  image_1_url TEXT,
  image_2_url TEXT,
  image_3_url TEXT,
  image_4_url TEXT,
  artist_name TEXT,
  artist_avatar TEXT,
  view_count BIGINT,
  like_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH artwork_stats AS (
    SELECT 
      a.id,
      COUNT(DISTINCT v.id) AS view_count,
      COUNT(DISTINCT l.id) AS like_count
    FROM artworks a
    LEFT JOIN artwork_views v ON a.id = v.artwork_id
    LEFT JOIN likes l ON a.id = l.artwork_id
    GROUP BY a.id
  ),
  filtered_artworks AS (
    SELECT 
      a.*,
      p.name AS artist_name,
      p.avatar_url AS artist_avatar,
      COALESCE(s.view_count, 0) AS view_count,
      COALESCE(s.like_count, 0) AS like_count,
      (
        SELECT COUNT(*) FROM artwork_views v 
        WHERE v.artwork_id = a.id 
        AND v.viewed_at > NOW() - INTERVAL '30 days'
      ) + (
        SELECT COUNT(*) FROM likes l 
        WHERE l.artwork_id = a.id 
        AND l.created_at > NOW() - INTERVAL '30 days'
      ) AS recent_engagement
    FROM artworks a
    JOIN profile p ON a.user_id = p.user_id
    LEFT JOIN artwork_stats s ON a.id = s.id
    WHERE 
      -- Filter by artwork IDs if provided (e.g., from search results)
      (artwork_ids IS NULL OR a.id = ANY(artwork_ids))

      -- Status
      AND a.status = ANY(string_to_array(status_filter, ',')::text[])

      -- Categories
      AND (categories IS NULL OR a.art_category = ANY(categories))

      -- Mediums
      AND (mediums IS NULL OR a.medium = ANY(mediums))

      -- Price range
      AND (min_price IS NULL OR a.artist_price >= min_price)
      AND (max_price IS NULL OR a.artist_price <= max_price)

      -- Artist filters
      AND (artist_ids IS NULL OR a.user_id = ANY(artist_ids))
      AND (
        artist_name_filter IS NULL 
        OR p.name ILIKE '%' || artist_name_filter || '%'
        OR similarity(LOWER(p.name), LOWER(artist_name_filter)) > 0.2
      )

      -- Date range
      AND (min_year IS NULL OR EXTRACT(YEAR FROM a.date) >= min_year)
      AND (max_year IS NULL OR EXTRACT(YEAR FROM a.date) <= max_year)

      -- Dimensions from string (e.g., "120 x 80")
      AND (
        min_width_cm IS NULL OR 
        (SUBSTRING(a.dimensions FROM '^(\d+)')::INTEGER >= min_width_cm)
      )
      AND (
        max_width_cm IS NULL OR 
        (SUBSTRING(a.dimensions FROM '^(\d+)')::INTEGER <= max_width_cm)
      )
      AND (
        min_height_cm IS NULL OR 
        (SUBSTRING(a.dimensions FROM '\d+\s*x\s*(\d+)')::INTEGER >= min_height_cm)
      )
      AND (
        max_height_cm IS NULL OR 
        (SUBSTRING(a.dimensions FROM '\d+\s*x\s*(\d+)')::INTEGER <= max_height_cm)
      )

      -- Location
      AND (locations IS NULL OR a.art_location = ANY(locations))

      -- Featured
      AND (NOT only_featured OR a.is_featured)

      -- Trending (more than 50 engagements in last 30 days)
      AND (
        NOT only_trending OR (
          (
            SELECT COUNT(*) FROM artwork_views v 
            WHERE v.artwork_id = a.id AND v.viewed_at > NOW() - INTERVAL '30 days'
          ) + (
            SELECT COUNT(*) FROM likes l 
            WHERE l.artwork_id = a.id AND l.created_at > NOW() - INTERVAL '30 days'
          ) > 50
        )
      )
  )
  SELECT 
    fa.id,
    fa.title,
    fa.description,
    fa.medium,
    fa.dimensions,
    fa.date,
    fa.art_location,
    fa.artist_price,
    fa.user_id,
    fa.image_url,
    fa.status,
    fa.created_at,
    fa.updated_at,
    fa.currency,
    fa.art_category,
    fa.is_featured,
    fa.image_1_url,
    fa.image_2_url,
    fa.image_3_url,
    fa.image_4_url,
    fa.artist_name,
    fa.artist_avatar,
    fa.view_count,
    fa.like_count
  FROM filtered_artworks fa
  ORDER BY
    CASE sort_by
      WHEN 'price_asc' THEN fa.artist_price
      WHEN 'price_desc' THEN -fa.artist_price
      WHEN 'featured' THEN CASE WHEN fa.is_featured THEN 0 ELSE 1 END
      WHEN 'trending' THEN -fa.recent_engagement
      ELSE EXTRACT(EPOCH FROM fa.created_at) * -1
    END
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
