import { create } from 'zustand';
import { Bid, BidUpdate, Artwork } from '@/types';
import { bidService } from './bidService';

interface BidState {
    bids: Bid[];
    loading: boolean;
    error: string | null;
    artworks: Artwork[]; // Changed from currentArtwork to artworks

    // Actions
    fetchBids: (userId: string) => Promise<void>;
    fetchArtworksForBids: () => Promise<void>; // Renamed from fetchArtworkForBid to fetchArtworksForBids
    updateBid: (bidId: string, updateData: BidUpdate) => Promise<void>;
    cancelBid: (bidId: string, withdrawalReason: string) => Promise<void>;
    clearArtworks: () => void; // Renamed from clearCurrentArtwork to clearArtworks
}
export const useBidStore = create<BidState>((set) => ({
    bids: [],
    loading: false,
    error: null,
    artworks: [], // Initialize as an empty array

    fetchBids: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const bids = await bidService.getUserBids(userId);
            set({ bids, loading: false });
        } catch {
            set({ error: 'Failed to fetch bids', loading: false });
        }
    },

    fetchArtworksForBids: async () => {
        set({ loading: true, error: null });
        try {
            const bids = useBidStore.getState().bids;
            const artworkIds = Array.from(new Set(bids.map((bid) => bid.artwork_id)));

            const fetchPromises = artworkIds.map(async (artworkId) => {
                const artwork = await bidService.getArtworkForBid(artworkId);
                if (artwork) {
                    set((state) => ({
                        artworks: [...state.artworks, artwork], // Add artwork to the list
                    }));
                }
            });

            await Promise.all(fetchPromises);
        } catch {
            set({
                error: 'Failed to fetch artwork details',
                loading: false,
            });
        }
    },

    updateBid: async (bidId: string, updateData: BidUpdate) => {
        set({ loading: true, error: null });
        try {
            const updatedBid = await bidService.updateBid(bidId, updateData);
            set((state) => ({
                bids: state.bids.map((bid) =>
                    bid.id === bidId ? { ...bid, ...updatedBid } : bid
                ),
                loading: false,
            }));
        } catch {
            set({ error: 'Failed to update bid', loading: false });
        }
    },

    cancelBid: async (bidId: string, withdrawalReason: string) => {
        set({ loading: true, error: null });
        try {
            await bidService.cancelBid(bidId, withdrawalReason);
            set((state) => ({
                bids: state.bids.filter((bid) => bid.id !== bidId),
                loading: false,
            }));
        } catch {
            set({ error: 'Failed to cancel bid', loading: false });
            throw new Error('Failed to cancel bid');
        }
    },

    clearArtworks: () => set({ artworks: [] }), // Clear all artworks
}));