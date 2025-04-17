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

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    isLoading: true,

    isInWishlist: (artworkId: string) => {
        const result = get().wishlist.includes(artworkId);
        console.log('isInWishlist:', { artworkId, result });
        return result;
    },

    fetchWishlist: async () => {
        console.log('fetchWishlist: started');
        set({ isLoading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('fetchWishlist: user', user);
            const operations = user ? userWishlist : guestWishlist;

            const wishlist = await operations.fetchWishlist();
            console.log('fetchWishlist: fetched wishlist', wishlist);
            set({ wishlist, isLoading: false });
        } catch (error) {
            console.error('fetchWishlist: error', error);
            set({ isLoading: false });
        }
    },

    toggleWishlistItem: async (artworkId: string) => {
        console.log('toggleWishlistItem: started', { artworkId });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('toggleWishlistItem: user', user);
            const operations = user ? userWishlist : guestWishlist;

            // Get current state before optimistic update
            const wasInWishlist = get().isInWishlist(artworkId);

            // Optimistic update
            set((state) => {
                const updatedWishlist = wasInWishlist
                    ? state.wishlist.filter((id) => id !== artworkId)
                    : [...state.wishlist, artworkId];
                console.log('toggleWishlistItem: optimistic update', updatedWishlist);
                return { wishlist: updatedWishlist };
            });

            // Perform the actual toggle operation
            const wasAdded = await operations.toggleWishlistItem(artworkId);
            console.log('toggleWishlistItem: success', { wasAdded });
            return wasAdded;
        } catch (error) {
            console.error('toggleWishlistItem: error', error);
            await get().fetchWishlist(); // Revert to server state
            throw error;
        }
    },

    clearWishlist: async () => {
        console.log('clearWishlist: started');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('clearWishlist: user', user);
            const operations = user ? userWishlist : guestWishlist;

            // Optimistic update
            set({ wishlist: [] });
            console.log('clearWishlist: optimistic update', []);

            await operations.clearWishlist();
            console.log('clearWishlist: success');
        } catch (error) {
            console.error('clearWishlist: error', error);
            await get().fetchWishlist();
            throw error;
        }
    },
}));