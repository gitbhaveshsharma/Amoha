export type Database = {
    public: {
        Tables: {
            profile: {
                Row: {
                    user_id: string;
                    email: string;
                    name: string | null;
                    role: 'admin' | 'bidder' | 'artist';
                    notification_opt_in: boolean;
                    created_at: string;
                    updated_at: string | null;
                };
                Insert: {
                    user_id: string;
                    email: string;
                    name?: string | null;
                    role: 'admin' | 'bidder' | 'artist';
                    notification_opt_in?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
                Update: {
                    user_id?: string;
                    email?: string;
                    name?: string | null;
                    role?: 'admin' | 'bidder' | 'artist';
                    notification_opt_in?: boolean;
                    created_at?: string;
                    updated_at?: string | null;
                };
            };
            artworks: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    image_url: string | null;
                    status: string;
                    dimensions: string;
                    date: string;
                    art_category: string;
                    medium: string;
                    art_location: string;
                    artist_price: number | null;
                    user_id: string;
                    created_at: string;
                    updated_at: string;
                    is_original: boolean;
                    edition_number: string | null;
                    currency: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    image_url?: string | null;
                    status?: string;
                    dimensions: string;
                    date: string;
                    art_category: string;
                    medium: string;
                    art_location: string;
                    artist_price?: number | null;
                    user_id: string;
                    created_at?: string;
                    updated_at?: string;
                    is_original?: boolean;
                    edition_number?: string | null;
                    currency: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    image_url?: string | null;
                    status?: string;
                    dimensions?: string;
                    date?: string;
                    art_category?: string;
                    medium?: string;
                    art_location?: string;
                    artist_price?: number | null;
                    user_id?: string;
                    created_at?: string;
                    updated_at?: string;
                    is_original?: boolean;
                    edition_number?: string | null;
                    currency?: string;
                };
            };
            sales: {
                Row: {
                    id: string;
                    artwork_id: string;
                    winning_bid_id: string;
                    sale_price: number;
                    currency: string;
                    artist_payout_amount: number;
                    platform_fee: number;
                    tax_amount: number;
                    tax_configuration_id: string | null;
                    status: 'pending' | 'completed' | 'disputed' | 'refunded';
                    sold_at: string;
                    payout_initiated_at: string | null;
                    payout_completed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    artwork_id: string;
                    winning_bid_id: string;
                    sale_price: number;
                    currency: string;
                    artist_payout_amount: number;
                    platform_fee: number;
                    tax_amount: number;
                    tax_configuration_id?: string | null;
                    status?: 'pending' | 'completed' | 'disputed' | 'refunded';
                    sold_at: string;
                    payout_initiated_at?: string | null;
                    payout_completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    artwork_id?: string;
                    winning_bid_id?: string;
                    sale_price?: number;
                    currency?: string;
                    artist_payout_amount?: number;
                    platform_fee?: number;
                    tax_amount?: number;
                    tax_configuration_id?: string | null;
                    status?: 'pending' | 'completed' | 'disputed' | 'refunded';
                    sold_at?: string;
                    payout_initiated_at?: string | null;
                    payout_completed_at?: string | null;
                    created_at?: string;
                };
            };
            artwork_engagements: {
                Row: {
                    id: string;
                    user_id: string | null;
                    artwork_id: string;
                    device_id: string;
                    ip_address: string;
                    user_agent: string;
                    view_start_time: string;
                    view_duration: number;
                    last_interaction: string | null;
                    referrer: string | null;
                    session_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    artwork_id: string;
                    device_id: string;
                    ip_address: string;
                    user_agent: string;
                    view_start_time: string;
                    view_duration?: number;
                    last_interaction?: string | null;
                    referrer?: string | null;
                    session_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    artwork_id?: string;
                    device_id?: string;
                    ip_address?: string;
                    user_agent?: string;
                    view_start_time?: string;
                    view_duration?: number;
                    last_interaction?: string | null;
                    referrer?: string | null;
                    session_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            // Add other tables as needed
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
};