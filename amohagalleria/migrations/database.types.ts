// Auto-generated TypeScript types for AmohaGalleria database schema
// Generated from migration files on 2025-06-04

export type GenderType = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';
export type ArtworkStatusType = 'draft' | 'pending_review' | 'active' | 'sold' | 'removed' | 'rejected';
export type BidStatusType = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'won';
export type SaleStatusType = 'pending' | 'completed' | 'disputed' | 'refunded';
export type TransactionType = 'sale' | 'payout' | 'refund' | 'fee' | 'adjustment' | 'tax' | 'discount' | 'shipping';
export type PaymentMethodType = 'bank_account' | 'paypal' | 'stripe' | 'other';
export type PayoutStatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'on_hold';
export type TicketStatusType = 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
export type UserRoleType = 'admin' | 'artist' | 'bidder' | 'moderator';
export type ProcessingStatusType = 'queued' | 'processing' | 'completed' | 'failed';
export type VerdictType = 'approved' | 'rejected' | 'pending';
export type DiscountType = 'percentage' | 'fixed_amount';
export type ShippingRuleType = 'free' | 'flat' | 'calculated';
export type TaxAppliesToType = 'sale' | 'payout' | 'both';

export interface Profile {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    role: string;
    created_at: string;
    bio?: string;
    address?: string;
    avatar_url?: string;
    is_temp: boolean;
    device_id?: string;
    notification_opt_in: boolean;
    last_notification_shown_at?: string;
    is_active: boolean;
    country?: string;
    state?: string;
    postal_code?: string;
    city?: string;
    gender?: GenderType;
    pronouns?: string[];
    preferred_languages?: string[];
    accessibility_needs?: string[];
    cultural_identity?: string[];
}

export interface ArtCategory {
    id: string;
    slug: string;
    label: string;
    is_banned: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    banned_by?: string;
    banned_at?: string;
}

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimal_digits: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface Artwork {
    id: string;
    title: string;
    description?: string;
    medium?: string;
    dimensions?: string;
    date?: string;
    art_location?: string;
    artist_price?: number;
    user_id: string;
    image_url?: string;
    status: string;
    created_at: string;
    updated_at: string;
    currency: string;
    art_category?: string;
    is_featured: boolean;
    image_1_url?: string;
    image_2_url?: string;
    image_3_url?: string;
    image_4_url?: string;
    is_original: boolean;
    edition_number?: string;
}

export interface UserDevice {
    id: string;
    user_id?: string;
    device_fingerprint: string;
    device_type?: string;
    browser?: string;
    os?: string;
    push_subscription?: any;
    created_at: string;
    updated_at: string;
    last_active_at: string;
}

export interface Notification {
    id: string;
    user_id?: string;
    device_id?: string;
    email?: string;
    is_push_enabled: boolean;
    is_email_enabled: boolean;
    is_sms_enabled: boolean;
    preferences?: any;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    event_type: string;
    user_id: string;
    metadata?: any;
    created_at: string;
}

export interface NotificationMessage {
    id: string;
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    metadata?: any;
    created_at: string;
    notification_type?: string;
    event_id?: string;
}

export interface Bid {
    id: string;
    artwork_id: string;
    bidder_id: string;
    amount: number;
    status: BidStatusType;
    is_auto_bid: boolean;
    max_auto_bid?: number;
    message?: string;
    created_at: string;
    updated_at: string;
    expires_at?: string;
    deleted_at?: string;
    withdrawal_reason?: string;
}

export interface Cart {
    id: string;
    user_id: string;
    artwork_id: string;
    created_at: string;
    updated_at: string;
    status?: string;
    last_notified_at?: string;
    notification_count?: number;
}

export interface Wishlist {
    id: string;
    user_id: string;
    artwork_id: string;
    created_at: string;
    updated_at: string;
    status?: string;
}

export interface PaymentMethod {
    id: string;
    user_id: string;
    method_type: PaymentMethodType;
    details: any;
    is_verified: boolean;
    is_default: boolean;
    created_at: string;
    is_valid: boolean;
}

export interface ExchangeRate {
    id: string;
    base_currency: string;
    target_currency: string;
    rate: number;
    effective_date: string;
    source?: string;
    created_at: string;
}

export interface PromoCode {
    id: string;
    code: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    currency?: string;
    max_discount_amount?: number;
    min_order_value?: number;
    valid_from: string;
    valid_until?: string;
    max_uses?: number;
    current_uses: number;
    is_active: boolean;
    applies_to?: string;
    applies_to_ids?: string[];
    created_by?: string;
    created_at: string;
}

export interface Sale {
    id: string;
    artwork_id: string;
    winning_bid_id: string;
    sale_price: number;
    original_currency: string;
    base_currency: string;
    exchange_rate_id?: string;
    artist_payout_amount?: number;
    platform_fee?: number;
    discount_amount?: number;
    promo_code_id?: string;
    shipping_cost?: number;
    shipping_rule_id?: string;
    tax_amount?: number;
    tax_configuration_id?: string;
    status: SaleStatusType;
    buyer_id?: string;
    shipping_country?: string;
    shipping_region?: string;
    shipping_city?: string;
    sold_at: string;
    payout_initiated_at?: string;
    payout_completed_at?: string;
    created_at: string;
    is_expired: boolean;
    expires_at?: string;
}

export interface PayoutRequest {
    id: string;
    artist_id: string;
    sale_id: string;
    amount: number;
    original_currency: string;
    requested_currency: string;
    exchange_rate?: number;
    tax_deducted?: number;
    net_amount: number;
    status: PayoutStatusType;
    payment_method_id: string;
    created_at: string;
    processed_at?: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    artwork_id?: string;
    bid_id?: string;
    sale_id?: string;
    amount: number;
    original_currency: string;
    base_currency: string;
    exchange_rate?: number;
    tax_amount?: number;
    type: TransactionType;
    balance_before?: number;
    balance_after?: number;
    payout_id?: string;
    promo_code_id?: string;
    created_at: string;
}

export interface SupportTicket {
    id: string;
    user_id: string;
    category_id: string;
    priority_id: string;
    subject: string;
    description: string;
    status: TicketStatusType;
    assignee_id?: string;
    created_at: string;
    updated_at: string;
}

export interface TicketComment {
    id: string;
    ticket_id: string;
    user_id: string;
    message: string;
    is_internal: boolean;
    created_at: string;
}

export interface ArtworkEngagement {
    id: string;
    user_id?: string;
    artwork_id?: string;
    device_id: string;
    ip_address?: string;
    user_agent?: string;
    view_start_time: string;
    view_duration: number;
    last_interaction?: string;
    referrer?: string;
    session_id?: string;
    created_at: string;
    updated_at: string;
}

export interface ArtworkReview {
    id: string;
    artwork_id: string;
    user_id: string;
    processing_status: ProcessingStatusType;
    image_verdict?: VerdictType;
    nsfw_scores?: any;
    image_rejection_reasons?: string[];
    text_verdict?: VerdictType;
    grammar_issues?: any;
    text_rejection_reasons?: string[];
    attempt_count: number;
    last_processed_at?: string;
    created_at: string;
    updated_at: string;
}

// Database Tables Union Type
export type DatabaseTables = {
    profile: Profile;
    art_categories: ArtCategory;
    currencies: Currency;
    artworks: Artwork;
    user_devices: UserDevice;
    notification: Notification;
    events: Event;
    notification_messages: NotificationMessage;
    bids: Bid;
    cart: Cart;
    wishlist: Wishlist;
    payment_methods: PaymentMethod;
    exchange_rates: ExchangeRate;
    promo_codes: PromoCode;
    sales: Sale;
    payout_requests: PayoutRequest;
    transactions: Transaction;
    support_tickets: SupportTicket;
    ticket_comments: TicketComment;
    artwork_engagements: ArtworkEngagement;
    artwork_reviews: ArtworkReview;
};

// Supabase Database Type
export interface Database {
    public: {
        Tables: DatabaseTables;
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            gender_type: GenderType;
            artwork_status_type: ArtworkStatusType;
            bid_status_type: BidStatusType;
            sale_status_type: SaleStatusType;
            transaction_type: TransactionType;
            payment_method_type: PaymentMethodType;
            payout_status_type: PayoutStatusType;
            ticket_status_type: TicketStatusType;
            user_role_type: UserRoleType;
            processing_status_type: ProcessingStatusType;
            verdict_type: VerdictType;
            discount_type: DiscountType;
            shipping_rule_type: ShippingRuleType;
            tax_applies_to_type: TaxAppliesToType;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
