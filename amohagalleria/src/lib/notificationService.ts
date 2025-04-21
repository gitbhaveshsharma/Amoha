import { createClient } from '@supabase/supabase-js';
import { getDeviceId } from './deviceFingerprint';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache for prompt decisions
const promptCache = new Map<string, boolean>();

const DEFAULT_NOTIFICATION_PREFERENCES = {
    marketing: false,
    order_updates: true,
    abandoned_cart: true,
    price_drops: true,
    back_in_stock: true,
};

export const NotificationService = {
    async trackDeviceAndCheckPrompt(userId?: string): Promise<boolean> {
        try {
            const deviceId = await getDeviceId();
            if (!deviceId) return false;

            // Check cache first
            const cacheKey = `${deviceId}-${userId || 'anon'}`;
            if (promptCache.has(cacheKey)) {
                return promptCache.get(cacheKey)!;
            }

            // Get device information
            const deviceInfo = await this.getDeviceInfo();

            // First, get the existing device record if it exists
            const { data: existingDevice } = await supabase
                .from('user_devices')
                .select('user_id')
                .eq('device_fingerprint', deviceId)
                .maybeSingle();

            // Prepare the update data
            interface UpdateData {
                device_fingerprint: string;
                device_type: string;
                browser: string;
                os: string;
                last_active_at: string;
                user_id?: string;
            }

            const updateData: UpdateData = {
                device_fingerprint: deviceId,
                device_type: deviceInfo.device_type,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                last_active_at: new Date().toISOString(),
            };

            // Only update user_id if:
            // 1. We have a userId (user is logged in)
            // 2. The existing record either has no user_id or the same user_id
            if (userId && (!existingDevice || !existingDevice.user_id || existingDevice.user_id === userId)) {
                updateData.user_id = userId;
            }

            // Get or create device record
            const { error: deviceError } = await supabase
                .from('user_devices')
                .upsert(
                    updateData,
                    { onConflict: 'device_fingerprint' }
                )
                .select();

            if (deviceError) {
                console.error('Error upserting device:', deviceError);
                return false;
            }

            // Now check if we should show the notification prompt
            const shouldShow = await this.shouldShowNotificationPrompt(deviceId, userId);
            promptCache.set(cacheKey, shouldShow);
            return shouldShow;
        } catch (error) {
            console.error('Error tracking device:', error);
            return false;
        }
    },
    // Get device information
    async getDeviceInfo(): Promise<{
        device_type: string;
        browser: string;
        os: string;
    }> {
        if (typeof window === 'undefined') {
            return { device_type: 'unknown', browser: 'unknown', os: 'unknown' };
        }

        const userAgent = navigator.userAgent;
        let deviceType = 'other';
        let browser = 'unknown';
        let os = 'unknown';

        // Detect device type
        if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
            deviceType = /Tablet|iPad/i.test(userAgent) ? 'tablet' : 'mobile';
        } else {
            deviceType = 'desktop';
        }

        // Detect browser
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        // Detect OS
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac OS')) os = 'Mac OS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        return { device_type: deviceType, browser, os };
    },

    async shouldShowNotificationPrompt(deviceId: string, userId?: string): Promise<boolean> {
        try {
            // Check user opt-in status if logged in
            if (userId) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('notification_opt_in, notification_prompt_dismissed_at')
                    .eq('id', userId)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError);
                    return false;
                }

                if (profile?.notification_opt_in) return false;

                // Don't show if dismissed in last 30 days
                if (profile?.notification_prompt_dismissed_at) {
                    const lastDismissed = new Date(profile.notification_prompt_dismissed_at);
                    const daysSinceDismissal = (Date.now() - lastDismissed.getTime()) / (86400 * 1000);
                    if (daysSinceDismissal < 30) return false;
                }
            }

            // First get the device record
            const { data: deviceRecord, error: deviceRecordError } = await supabase
                .from('user_devices')
                .select('id')
                .eq('device_fingerprint', deviceId)
                .single();

            if (deviceRecordError && deviceRecordError.code !== 'PGRST116') {
                console.error('Error fetching device record:', deviceRecordError);
                return false;
            }

            if (!deviceRecord) {
                // Device not found in database, so we should show the prompt
                return true;
            }

            // Check if notification preferences exist for this device
            const { data: preferences, error: prefError } = await supabase
                .from('notification')
                .select('id')
                .eq('device_id', deviceRecord.id)
                .single();

            if (prefError && prefError.code !== 'PGRST116') {
                console.error('Error checking notification preferences:', prefError);
                return false;
            }

            // If preferences exist, don't show prompt; otherwise, show it
            return !preferences;
        } catch (error) {
            console.error('Error checking notification prompt:', error);
            return false;
        }
    },

    async savePreferences(
        deviceId: string,
        email: string,
        preferences: NotificationPreferences,
        userId?: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!email && !userId) {
                return { success: false, error: 'Email is required for anonymous users' };
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return { success: false, error: 'Invalid email format' };
            }

            // Get device record
            const { data: device, error: deviceError } = await supabase
                .from('user_devices')
                .select('id')
                .eq('device_fingerprint', deviceId)
                .single();

            if (deviceError || !device) {
                return { success: false, error: 'Device not found' };
            }

            // Update user profile if logged in
            if (userId) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        notification_opt_in: true,
                        notification_prompt_dismissed_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                if (profileError) {
                    console.error('Error updating profile:', profileError);
                    return { success: false, error: 'Failed to update profile' };
                }
            }

            // Merge with default preferences
            const mergedPreferences = {
                ...DEFAULT_NOTIFICATION_PREFERENCES,
                ...preferences,
            };

            // Save notification preferences
            const { error: prefError } = await supabase
                .from('notification')
                .upsert(
                    {
                        user_id: userId || null,
                        device_id: device.id,
                        email: email || null,
                        is_push_enabled: preferences.is_push_enabled || false,
                        is_email_enabled: preferences.is_email_enabled || false,
                        preferences: mergedPreferences,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: 'device_id' }
                );

            if (prefError) {
                console.error('Error saving preferences:', prefError);
                return { success: false, error: 'Failed to save preferences' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error saving preferences:', error);
            return { success: false, error: 'Failed to save preferences' };
        }
    },

    async initializePushNotifications(): Promise<{ success: boolean; error?: string }> {
        try {
            if (typeof window === 'undefined') {
                return { success: false, error: 'Not in browser environment' };
            }

            if (!('serviceWorker' in navigator)) {
                return { success: false, error: 'Service workers not supported' };
            }

            if (!('PushManager' in window)) {
                return { success: false, error: 'Push API not supported' };
            }

            const deviceId = await getDeviceId();
            if (!deviceId) {
                return { success: false, error: 'Device ID missing' };
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });

            await navigator.serviceWorker.ready;

            // Check existing subscription
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                return { success: true };
            }

            // Subscribe to push notifications
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                return { success: false, error: 'Notification permission denied' };
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            // Get device record
            const { data: device, error: deviceError } = await supabase
                .from('user_devices')
                .select('id')
                .eq('device_fingerprint', deviceId)
                .single();

            if (deviceError || !device) {
                return { success: false, error: 'Device not found' };
            }

            // Save subscription to database
            const serializedSubscription = JSON.stringify(subscription);
            const { error } = await supabase
                .from('user_devices')
                .update({
                    push_subscription: JSON.parse(serializedSubscription),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', device.id);

            if (error) {
                console.error('Error saving push subscription:', error);
                return { success: false, error: 'Failed to save subscription' };
            }

            return { success: true };
        } catch (error) {
            console.error('Push notification initialization failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },

    urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    },
};

interface NotificationPreferences {
    is_push_enabled?: boolean;
    is_email_enabled?: boolean;
    marketing?: boolean;
    order_updates?: boolean;
    abandoned_cart?: boolean;
    price_drops?: boolean;
    back_in_stock?: boolean;
}