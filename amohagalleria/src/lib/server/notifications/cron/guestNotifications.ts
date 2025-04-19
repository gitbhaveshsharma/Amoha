// lib/server/cron/guestNotifications.ts
import { GuestNotificationService } from '../guest/guestNotifications';
import { supabase } from '@/lib/supabase';

export async function checkGuestNotifications() {
    try {
        console.log('[Cron] Checking for abandoned carts...');
        const pendingNotifications = await GuestNotificationService.getPendingCartNotifications();

        for (const { deviceId, artworkId } of pendingNotifications) {
            try {
                console.log(`Processing device ${deviceId}, artwork ${artworkId}`);

                // Get push subscription
                const { data: device, error: deviceError } = await supabase
                    .from('user_devices')
                    .select('push_subscription')
                    .eq('device_fingerprint', deviceId)
                    .single();

                if (deviceError || !device?.push_subscription) {
                    console.log(`No subscription for device ${deviceId}`);
                    continue;
                }

                // Get artwork details
                const { data: artwork, error: artworkError } = await supabase
                    .from('artworks')
                    .select('title, image_url')
                    .eq('id', artworkId)
                    .single();

                if (artworkError || !artwork) {
                    console.log(`Artwork ${artworkId} not found`);
                    continue;
                }

                // Send notification
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/send`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subscription: device.push_subscription,
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
                    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
                }

                console.log(`Notification sent for ${deviceId}, ${artworkId}`);

            } catch (error) {
                console.error(`Failed to process ${deviceId}:`, error);
            }
        }
    } catch (error) {
        console.error('Cron job failed:', error);
    }
}