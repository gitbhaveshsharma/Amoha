// lib/server/cron/index.ts
import { checkGuestNotifications } from './guestNotifications';
import { checkAuthNotifications } from './authNotifications';
import { supabase } from '@/lib/supabase';

const LOCK_KEY = 'abandoned_cart_notifications_lock';
const LOCK_TIMEOUT_MINUTES = 15;

export async function triggerNotificationCheck() {
    try {
        // 1. Check for existing lock
        const { data: existingLock, error: lockCheckError } = await supabase
            .from('system_locks')
            .select()
            .eq('key', LOCK_KEY)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (lockCheckError) {
            console.error('[Notifications] Error checking lock:', lockCheckError);
            throw lockCheckError;
        }

        if (existingLock) {
            console.log('[Notifications] Job already running, exiting');
            return;
        }

        // 2. Create lock
        const { error: upsertError } = await supabase
            .from('system_locks')
            .upsert({
                key: LOCK_KEY,
                expires_at: new Date(Date.now() + LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            });

        if (upsertError) {
            console.error('[Notifications] Error creating lock:', upsertError);
            throw upsertError;
        }

        console.log('[Notifications] Lock acquired, starting notification checks');

        // 3. Run both guest and auth notification checks
        await Promise.all([
            checkGuestNotifications(),
            checkAuthNotifications()
        ]);

    } catch (error) {
        console.error('[Notifications] Job failed:', error);
        throw error;
    } finally {
        try {
            // 4. Release lock
            const { error: deleteError } = await supabase
                .from('system_locks')
                .delete()
                .eq('key', LOCK_KEY);

            if (deleteError) {
                console.error('[Notifications] Error releasing lock:', deleteError);
            } else {
                console.log('[Notifications] Lock released');
            }
        } catch (cleanupError) {
            console.error('[Notifications] Error during lock cleanup:', cleanupError);
        }
    }
}