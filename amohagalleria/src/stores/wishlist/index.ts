// stores/wishlist/index.ts
import { create } from 'zustand';
import { guestWishlist } from './guestWishlist';
import { userWishlist } from './userWishlist';
import { supabase } from '@/lib/supabase';

type WishlistState = {
    wishlist: string[];
    isLoading: boolean;
    isInWishlist: (artworkId: string) => boolean;
    fetchWishlist: () => Promise<void>;
    toggleWishlistItem: (artworkId: string) => Promise<boolean>;
    clearWishlist: () => Promise<void>;
};

let isFetching = false; // Global flag to prevent concurrent fetches

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    isLoading: true,

    isInWishlist: (artworkId: string) => {
        return get().wishlist.includes(artworkId);
    },

    fetchWishlist: async () => {
        // Prevent concurrent fetches
        if (isFetching) return;

        isFetching = true;
        set({ isLoading: true });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const operations = user ? userWishlist : guestWishlist;

            const wishlist = await operations.fetchWishlist();
            set({ wishlist, isLoading: false });
        } catch (error) {
            console.error('fetchWishlist: error', error);
            set({ isLoading: false });
        } finally {
            isFetching = false;
        }
    },

    toggleWishlistItem: async (artworkId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const operations = user ? userWishlist : guestWishlist;

            // Get current state before optimistic update
            const wasInWishlist = get().isInWishlist(artworkId);

            // Optimistic update
            set((state) => {
                const updatedWishlist = wasInWishlist
                    ? state.wishlist.filter((id) => id !== artworkId)
                    : [...state.wishlist, artworkId];
                return { wishlist: updatedWishlist };
            });

            // Perform the actual toggle operation
            const wasAdded = await operations.toggleWishlistItem(artworkId);
            return wasAdded;
        } catch (error) {
            console.error('toggleWishlistItem: error', error);
            await get().fetchWishlist(); // Revert to server state
            throw error;
        }
    },

    clearWishlist: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const operations = user ? userWishlist : guestWishlist;

            // Optimistic update
            set({ wishlist: [] });

            await operations.clearWishlist();
        } catch (error) {
            console.error('clearWishlist: error', error);
            await get().fetchWishlist();
            throw error;
        }
    },
}));