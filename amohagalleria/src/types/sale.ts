// types/sale.ts
import { Artwork } from '@/types';

export interface Sale {
    id: string;
    artwork_id: string;
    winning_bid_id: string | null;
    sale_price: number;
    original_currency: string;
    artist_payout_amount: number;
    platform_fee: number;
    tax_amount: number;
    tax_configuration_id: string | null;
    status: 'pending' | 'completed' | 'disputed' | 'refunded';
    sold_at: string;
    payout_initiated_at: string | null;
    payout_completed_at: string | null;
    created_at: string;
    shipping_country: string | null;
    shipping_region: string | null;
    exchange_rate: number | null;
    payment_method: string | null;
}

export interface SaleWithArtwork extends Sale {
    artwork: Pick<Artwork, 'id' | 'title' | 'user_id' | 'image_url'>;
}

export interface Profile {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: string;
    bio?: string;
    address?: string;
    avatar_url?: string;
    created_at: string;
    gender?: string;
    pronouns?: string[];
    date_of_birth?: string;
    country?: string;
    state?: string;
    city?: string;
    postal_code?: string;
    phone_number?: string;
    updated_at?: string;
}

export interface AdminSale extends Sale {
    artwork: Artwork;
    artist: Pick<Profile, 'id' | 'email' | 'name'>;
    buyer: Pick<Profile, 'id' | 'email' | 'name'> | null;
    tax_breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
    tax_type: string;
    tax_name: string;
    tax_rate: number;
    amount: number;
    currency: string;
}

export interface SalesSummary {
    total_sales: number;
    group_by_period: string;
    revenue_after_fees: number;
    artist_payouts: number;
    taxes_collected: number;
    sales_by_region: { country: string; count: number; amount: number }[];
    top_selling_artworks: { artwork_id: string; title: string; count: number; revenue: number }[];
    conversion_rate: number;
    total_artworks_sold: number;
    time_periods: {
        period: string;
        count: number;
        total_sales: number;
        revenue_after_fees: number;
        artist_payouts: number;
        taxes_collected: number;
    }[];
}

export interface SalesFilterParams {
    date_from?: string;
    date_to?: string;
    artist_id?: string;
    buyer_id?: string;
    status?: 'pending' | 'completed' | 'disputed' | 'refunded' | string;
    country?: string;
    group_by_period?: 'day' | 'week' | 'month' | 'year';
    currency?: string;
}

export interface SalesPagination {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
}

export interface SalesResponse {
    data: AdminSale[];
    pagination: SalesPagination;
}