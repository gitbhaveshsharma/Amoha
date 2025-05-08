// stores/cart/index.ts
import { create } from 'zustand';
import { guestCart } from './guestCart';
import { userCart } from './userCart';
import { supabase } from '@/lib/supabase';
import { Artwork } from '@/types';

type CartState = {
    cart: string[];
    artworks: Artwork[];
    isLoading: boolean;
    isAdding: boolean;
    isRemoving: boolean;
    isInCart: (artworkId: string) => boolean;
    fetchCart: () => Promise<void>;
    toggleCartItem: (artworkId: string) => Promise<boolean>;
    clearCart: () => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
    cart: [],
    artworks: [],
    isLoading: true,
    isAdding: false,
    isRemoving: false,

    isInCart: (artworkId: string) => {
        return get().cart.includes(artworkId);
    },

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const operations = user ? userCart : guestCart;

            const cart = await operations.fetchCart();
            let artworks: Artwork[] = [];

            if (cart.length > 0) {
                // Only fetch artworks that are in active cart items
                const { data, error } = await supabase
                    .from("artworks")
                    .select("*")
                    .in("id", cart);

                if (error) throw error;
                artworks = data || [];
            }

            set({ cart, artworks, isLoading: false });
        } catch (error) {
            console.error('fetchCart error:', error);
            set({ isLoading: false });
        }
    },

    toggleCartItem: async (artworkId: string) => {
        const isInCart = get().isInCart(artworkId);
        set({ isLoading: true, isAdding: !isInCart, isRemoving: isInCart });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const operations = user ? userCart : guestCart;

            // Optimistic update
            set(state => ({
                cart: isInCart
                    ? state.cart.filter(id => id !== artworkId)
                    : [...state.cart, artworkId],
                artworks: isInCart
                    ? state.artworks.filter(art => art.id !== artworkId)
                    : state.artworks
            }));

            const result = await operations.toggleCartItem(artworkId);

            // If the operation failed, revert the optimistic update
            if (result === isInCart) {
                await get().fetchCart();
            }

            return result;
        } catch (error) {
            console.error('toggleCartItem error:', error);
            await get().fetchCart(); // Revert to server state on error
            throw error;
        } finally {
            set({ isLoading: false, isAdding: false, isRemoving: false });
        }
    },

    clearCart: async () => {
        set({ isLoading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const operations = user ? userCart : guestCart;

            await operations.clearCart();
            set({ cart: [], artworks: [], isLoading: false });
        } catch (error) {
            console.error('clearCart error:', error);
            set({ isLoading: false });
            throw error;
        }
    },
}));