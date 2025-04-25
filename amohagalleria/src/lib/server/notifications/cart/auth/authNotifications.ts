// lib/server/auth/authNotifications.ts
import { supabase } from '@/lib/supabase';

export const AuthNotificationService = {
    async scheduleAbandonedCartNotification(userId: string, artworkId: string): Promise<void> {
        try {
            // Check if item already exists in cart
            const { data: existingItem } = await supabase
                .from('cart')
                .select()
                .eq('user_id', userId)
                .eq('artwork_id', artworkId)
                .maybeSingle();

            if (existingItem) {
                // Update existing item
                await supabase
                    .from('cart')
                    .update({
                        status: 'active',
                        updated_at: new Date().toISOString(),
                        notification_count: 0
                    })
                    .eq('id', existingItem.id);
            } else {
                // Add new item
                await supabase
                    .from('cart')
                    .insert({
                        user_id: userId,
                        artwork_id: artworkId,
                        status: 'active',
                        last_notified_at: null,
                        notification_count: 0
                    });
            }
        } catch (error) {
            console.error('Error scheduling notification:', error);
            throw error;
        }
    },

    async markAsNotified(userId: string, artworkId: string): Promise<void> {
        try {
            const { error } = await supabase
                .rpc('increment', {
                    table_name: 'cart',
                    column_name: 'notification_count',
                    conditions: `user_id = '${userId}' AND artwork_id = '${artworkId}'`
                });

            if (error) {
                throw error;
            }

            const { error: updateError } = await supabase
                .from('cart')
                .update({ last_notified_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('artwork_id', artworkId);

            if (updateError) {
                throw updateError;
            }

            console.log(`Marked as notified for user ${userId}, artwork ${artworkId}`);
        } catch (error) {
            console.error('Error marking as notified:', error);
            throw error;
        }
    },

    async getPushSubscription(userId: string): Promise<object | null> {
        try {
            const { data, error } = await supabase
                .from('user_devices')
                .select('push_subscription')
                .eq('user_id', userId)
                .order('last_active_at', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            return data?.push_subscription;
        } catch (error) {
            console.error('Error getting push subscription:', error);
            return null;
        }
    }
};