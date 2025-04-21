// src/lib/notificationMigration.ts
import { supabase } from './supabase';
import { getDeviceId } from './deviceFingerprint';

// Default notification preferences - moved to top of file
const DEFAULT_NOTIFICATION_PREFERENCES = {
    marketing: false,
    order_updates: true,
    abandoned_cart: true,
    price_drops: true,
    back_in_stock: true,
};

export const migrateGuestNotificationPreferences = async (userId: string) => {
    try {
        const deviceId = await getDeviceId();
        if (!deviceId) return;

        // 1. Find the device record
        const { data: device, error: deviceError } = await supabase
            .from('user_devices')
            .select('id')
            .eq('device_fingerprint', deviceId)
            .single();

        if (deviceError || !device) return;

        // 2. Check for existing guest preferences
        const { data: guestPreferences } = await supabase
            .from('notification')
            .select('*')
            .eq('device_id', device.id)
            .is('user_id', null)
            .maybeSingle();

        // 3. Check for existing user preferences
        const { data: userPreferences } = await supabase
            .from('notification')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        // 4. Migration logic
        if (guestPreferences && !userPreferences) {
            // Migrate guest preferences to user
            // IMPORTANT: Keep the device_id to maintain the association
            await supabase
                .from('notification')
                .update({
                    user_id: userId,
                    // Don't remove device_id - keep it associated with both user and device
                    updated_at: new Date().toISOString(),
                })
                .eq('id', guestPreferences.id);
        } else if (guestPreferences && userPreferences) {
            // Merge preferences (user preferences take precedence)
            const mergedPreferences = {
                ...guestPreferences.preferences,
                ...userPreferences.preferences,
            };

            // Update user preferences with merged values
            await supabase
                .from('notification')
                .update({
                    preferences: mergedPreferences,
                    // Ensure device is associated with the user record too
                    device_id: device.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userPreferences.id);

            // Delete the guest preferences
            await supabase
                .from('notification')
                .delete()
                .eq('id', guestPreferences.id);
        } else if (!guestPreferences && !userPreferences) {
            // Create new user preferences with device association
            await supabase
                .from('notification')
                .insert({
                    user_id: userId,
                    device_id: device.id,
                    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
        }

        // 5. Update device record with user ID and ensure it's properly updated
        const { error: updateError } = await supabase
            .from('user_devices')
            .update({
                user_id: userId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', device.id);

        if (updateError) {
            console.error('Error updating user device:', updateError);
        } else {
            console.log(`Successfully updated user_id for device_id: ${device.id}`);
        }

        // Verify the update was successful by retrieving the record again
        const { data: verifiedDevice, error: verifyError } = await supabase
            .from('user_devices')
            .select('user_id')
            .eq('id', device.id)
            .single();

        if (verifyError) {
            console.error('Error verifying user_id update in user_devices:', verifyError);
        } else if (!verifiedDevice || verifiedDevice.user_id !== userId) {
            console.error('Failed to persist user_id in user_devices table. Retrying...');
            // Retry the update if verification fails
            await supabase
                .from('user_devices')
                .update({
                    user_id: userId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', device.id);
        } else {
            console.log('Verified user_id update in user_devices table.');
        }

        // Additional safeguard: Log the current state of the user_devices table for debugging
        const { data: allDevices } = await supabase
            .from('user_devices')
            .select('*')
            .eq('id', device.id);

        console.log('Current state of user_devices record:', allDevices);

    } catch (error) {
        console.error('Error migrating notification preferences:', error);
    }
};