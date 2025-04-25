// stores/cart/userCart.ts
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { CartOperations } from './types';

export const userCart: CartOperations = {
    fetchCart: async (): Promise<string[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('cart')
                .select('artwork_id')
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (error) throw error;
            return data?.map(item => item.artwork_id) || [];
        } catch (error) {
            console.error("Failed to load cart:", error);
            toast.error("Failed to load cart");
            return [];
        }
    },

    toggleCartItem: async (artworkId: string): Promise<boolean> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            // First check if the item exists
            const { data: existing } = await supabase
                .from('cart')
                .select()
                .eq('user_id', user.id)
                .eq('artwork_id', artworkId)
                .maybeSingle();

            if (existing) {
                // Toggle the status
                const newStatus = existing.status === 'active' ? 'removed' : 'active';
                const { error } = await supabase
                    .from('cart')
                    .update({
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id)
                    .eq('artwork_id', artworkId);

                if (error) throw error;
                toast.success(newStatus === 'active' ? "Added to cart" : "Removed from cart");
                return newStatus === 'active';
            } else {
                // Check if a similar record already exists to avoid duplicates
                const { data: duplicateCheck } = await supabase
                    .from('cart')
                    .select()
                    .eq('user_id', user.id)
                    .eq('artwork_id', artworkId)
                    .eq('status', 'active')
                    .maybeSingle();

                if (duplicateCheck) {
                    toast.info("Item is already in the cart");
                    return true;
                }

                // Create new record
                const { error } = await supabase
                    .from('cart')
                    .insert({
                        user_id: user.id,
                        artwork_id: artworkId,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (error) throw error;
                toast.success("Added to cart");
                return true;
            }
        } catch (error) {
            console.error("Failed to toggle cart item:", error);
            toast.error("Failed to update cart");
            throw error;
        }
    },

    clearCart: async (): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('cart')
                .update({
                    status: 'removed',
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (error) throw error;
            toast.success("Cart cleared");
        } catch (error) {
            console.error("Failed to clear cart:", error);
            toast.error("Failed to clear cart");
            throw error;
        }
    },
};