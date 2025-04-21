// lib/server/cron/authNotifications.ts
import { AuthNotificationService } from '../cart/auth/authNotifications';
import { supabase } from '@/lib/supabase';

export async function checkAuthNotifications() {
    try {
        console.log('[Cron] Checking for abandoned carts (auth users)...');

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: pendingNotifications, error } = await supabase
            .from('cart')
            .select('user_id, artwork_id, notification_count, last_notified_at')
            .eq('status', 'active')
            .or(`last_notified_at.is.null,last_notified_at.lte.${oneHourAgo}`)
            .lt('notification_count', 3);

        if (error) {
            console.error('[Cron] Error fetching pending notifications:', error);
            return;
        }

        console.log(`[Cron] Found ${pendingNotifications.length} notifications to process`);

        for (const { user_id: userId, artwork_id: artworkId } of pendingNotifications) {
            try {
                console.log(`Processing user ${userId}, artwork ${artworkId}`);

                const subscription = await AuthNotificationService.getPushSubscription(userId);
                if (!subscription) {
                    console.log(`No subscription found for user ${userId}`);
                    continue;
                }

                const { data: artwork, error: artworkError } = await supabase
                    .from('artworks')
                    .select('title, image_url')
                    .eq('id', artworkId)
                    .single();

                if (artworkError || !artwork) {
                    console.log(`Artwork ${artworkId} not found:`, artworkError);
                    continue;
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/send`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subscription,
                            title: 'Still interested?',
                            body: `Your "${artwork.title}" is waiting in your cart!`,
                            icon: artwork.image_url || '/icons/notification.png',
                            data: {
                                url: `/artwork/${artworkId}`,
                                image: artwork.image_url,
                            }
                        })
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Failed to send notification:`, errorText);
                    continue;
                }

                console.log(`Notification sent successfully`);
                try {
                    await AuthNotificationService.markAsNotified(userId, artworkId);
                } catch (error) {
                    console.error(`Error marking as notified for user ${userId}, artwork ${artworkId}:`, error);
                }

            } catch (error) {
                console.error(`Failed to process notification:`, error);
            }
        }
    } catch (error) {
        console.error('Cron job failed:', error);
    }
}