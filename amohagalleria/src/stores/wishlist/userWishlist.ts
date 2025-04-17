// stores/wishlist/userWishlist.ts
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { WishlistOperations } from './types';

export const userWishlist: WishlistOperations = {
    fetchWishlist: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        try {
            const { data, error } = await supabase
                .from('wishlist')
                .select('artwork_id')
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (error) throw error;
            return data?.map(item => item.artwork_id) || [];
        } catch (error) {
            console.error("Failed to load wishlist:", error);
            toast.error("Failed to load wishlist");
            return [];
        }
    },

    toggleWishlistItem: async (artworkId: string): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            // First check if there's an existing record (active or removed)
            const { data: existing } = await supabase
                .from('wishlist')
                .select('status')
                .eq('user_id', user.id)
                .eq('artwork_id', artworkId)
                .maybeSingle();

            if (existing) {
                // Toggle the status
                const newStatus = existing.status === 'active' ? 'removed' : 'active';
                const { error } = await supabase
                    .from('wishlist')
                    .update({
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id)
                    .eq('artwork_id', artworkId);

                if (error) throw error;
                toast.success(newStatus === 'active' ? "Added to wishlist" : "Removed from wishlist");
                return;
            } else {
                // Create new record
                const { error } = await supabase
                    .from('wishlist')
                    .insert({
                        user_id: user.id,
                        artwork_id: artworkId,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (error) throw error;
                toast.success("Added to wishlist");
                return;
            }
        } catch (error) {
            console.error("Failed to toggle wishlist item:", error);
            toast.error("Failed to update wishlist");
            throw error;
        }
    },

    clearWishlist: async () => {
        // Keep your existing clear implementation
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            const { error } = await supabase
                .from('wishlist')
                .update({
                    status: 'removed',
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (error) throw error;
            toast.success("Wishlist cleared");
        } catch (error) {
            console.error("Failed to clear wishlist:", error);
            toast.error("Failed to clear wishlist");
            throw error;
        }
    },
};