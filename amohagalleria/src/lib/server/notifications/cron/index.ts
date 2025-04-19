// lib/server/cron/index.ts (REPLACED)
import { checkGuestNotifications } from './guestNotifications';
import { supabase } from '@/lib/supabase';

const LOCK_KEY = 'abandoned_cart_notifications_lock';
const LOCK_TIMEOUT_MINUTES = 15;

export async function triggerNotificationCheck() {
    // 1. Check for existing lock
    const { data: existingLock } = await supabase
        .from('system_locks')
        .select()
        .eq('key', LOCK_KEY)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (existingLock) {
        console.log('[Notifications] Job already running');
        return;
    }

    // 2. Create lock
    await supabase.from('system_locks').upsert({
        key: LOCK_KEY,
        expires_at: new Date(Date.now() + LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString()
    });

    try {
        // 3. Run your existing logic
        await checkGuestNotifications();
    } finally {
        // 4. Release lock
        await supabase
            .from('system_locks')
            .delete()
            .eq('key', LOCK_KEY);
    }
}