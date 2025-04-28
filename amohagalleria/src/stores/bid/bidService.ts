import { supabase } from '@/lib/supabase';
import { Bid, BidUpdate, Artwork } from '@/types';

export const bidService = {
    async getUserBids(userId: string): Promise<Bid[]> {
        const { data, error } = await supabase
            .from('bids')
            .select('*')
            .eq('bidder_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Bid[];
    },

    async getArtworkForBid(artworkId: string): Promise<Artwork | null> {
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', artworkId)
            .single();

        if (error) return null;
        return data as Artwork;
    },

    async updateBid(bidId: string, updateData: BidUpdate): Promise<Bid> {
        const { data, error } = await supabase
            .from('bids')
            .update(updateData)
            .eq('id', bidId)
            .select()
            .single();

        if (error) throw error;
        return data as Bid;
    },

    async cancelBid(bidId: string, withdrawalReason: string): Promise<void> {
        const { error } = await supabase
            .from('bids')
            .update({
                status: 'withdrawn',
                withdrawal_reason: withdrawalReason,
                updated_at: new Date().toISOString(),
                deleted_at: new Date().toISOString()
            })
            .eq('id', bidId);

        if (error) throw error;
    }
};