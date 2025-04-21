// lib/server/guest/guestNotifications.ts
import { redisClient } from '../../../redis';
import { supabase } from '@/lib/supabase';

interface NotificationData {
    artwork_id: string;
    status: 'active' | 'removed';
    updated_at: string;
    last_notified_at?: string;
}

export const GuestNotificationService = {
    async scheduleAbandonedCartNotification(deviceId: string, artworkId: string): Promise<void> {
        try {
            // Get current cart data
            const cartJson = await redisClient.hGet(`guest:${deviceId}`, 'cart');
            if (!cartJson) return;

            const cart: NotificationData[] = JSON.parse(cartJson);

            // Update the specific cart item
            const updatedCart = cart.map(item =>
                item.artwork_id === artworkId ? item : item
            );

            // Save back to Redis
            await redisClient.hSet(`guest:${deviceId}`, 'cart', JSON.stringify(updatedCart));
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    },

    async getPendingCartNotifications(): Promise<Array<{
        deviceId: string;
        artworkId: string;
    }>> {
        try {
            const guestKeys = await redisClient.keys('guest:*');
            const pendingNotifications = [];

            for (const key of guestKeys) {
                const cartJson = await redisClient.hGet(key, 'cart');
                if (!cartJson) continue;

                const cart: NotificationData[] = JSON.parse(cartJson);
                const deviceId = key.replace('guest:', '');

                for (const item of cart) {
                    // Check if item is active and either:
                    // - Never been notified before (no last_notified_at)
                    // - Or last notified more than 1 minute ago
                    if (item.status === 'active') {
                        const shouldNotify = !item.last_notified_at ||
                            new Date(item.last_notified_at) < new Date(Date.now() - 60000);

                        if (shouldNotify) {
                            pendingNotifications.push({
                                deviceId,
                                artworkId: item.artwork_id
                            });
                        }
                    }
                }
            }

            return pendingNotifications;
        } catch (error) {
            console.error('Error getting pending notifications:', error);
            return [];
        }
    },

    async markAsNotified(deviceId: string, artworkId: string): Promise<void> {
        try {
            const cartJson = await redisClient.hGet(`guest:${deviceId}`, 'cart');
            if (!cartJson) return;

            const cart: NotificationData[] = JSON.parse(cartJson);

            const updatedCart = cart.map(item =>
                item.artwork_id === artworkId
                    ? {
                        ...item,
                        last_notified_at: new Date().toISOString()
                    }
                    : item
            );

            await redisClient.hSet(`guest:${deviceId}`, 'cart', JSON.stringify(updatedCart));
        } catch (error) {
            console.error('Error marking as notified:', error);
        }
    },

    async getPushSubscription(deviceId: string): Promise<object | null> {
        try {
            const { data } = await supabase
                .from('user_devices')
                .select('push_subscription')
                .eq('device_fingerprint', deviceId)
                .single();

            return data?.push_subscription;
        } catch (error) {
            console.error('Error getting push subscription:', error);
            return null;
        }
    }
};