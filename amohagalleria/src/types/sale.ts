import { Artwork } from '@/types';

export interface Sale {
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
}

export interface SaleWithArtwork extends Sale {
    artwork: Pick<Artwork, 'id' | 'title' | 'user_id' | 'image_url'>;
}