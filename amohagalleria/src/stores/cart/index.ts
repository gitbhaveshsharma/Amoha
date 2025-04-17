// stores/cart/index.ts
import { create } from 'zustand';
import { guestCart } from './guestCart';
import { userCart } from './userCart';
import { supabase } from '@/lib/supabase';

type CartState = {
    cart: string[];
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

            console.log("Fetching cart..."); // Debug log
            const cart = await operations.fetchCart();
            set({ cart, isLoading: false });
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
            set(state => {
                const updatedCart = isInCart
                    ? state.cart.filter(id => id !== artworkId)
                    : [...state.cart, artworkId];
                return { cart: updatedCart, isLoading: true };
            });

            const result = await operations.toggleCartItem(artworkId);
            return result;
        } catch (error) {
            console.error('toggleCartItem error:', error);
            await get().fetchCart();
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

            set({ cart: [], isLoading: true });
            await operations.clearCart();
        } catch (error) {
            console.error('clearCart error:', error);
            await get().fetchCart();
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}));
