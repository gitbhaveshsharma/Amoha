// lib/wishlistMigration.ts
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/lib/deviceFingerprint';
import { toast } from 'react-toastify';

export async function migrateGuestWishlist(userId: string) {
    const deviceId = await getDeviceId();
    if (!deviceId) return;

    try {
        // 1. Fetch guest wishlist
        const guestResponse = await fetch('/api/wishlist/guest', {
            headers: { 'device-id': deviceId },
        });

        if (!guestResponse.ok) throw new Error('Failed to fetch guest wishlist');

        const { wishlist: guestWishlist } = await guestResponse.json();
        if (!guestWishlist?.length) return;

        // 2. Fetch current user wishlist
        const { data: userWishlist, error: fetchError } = await supabase
            .from('wishlist')
            .select('artwork_id')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (fetchError) throw fetchError;

        const userWishlistIds = userWishlist?.map(item => item.artwork_id) || [];

        // 3. Find items to migrate (not already in user wishlist)
        const itemsToMigrate = guestWishlist.filter(
            (artworkId: string) => !userWishlistIds.includes(artworkId)
        );

        if (!itemsToMigrate.length) return;

        // 4. Insert new items
        const { error: insertError } = await supabase
            .from('wishlist')
            .insert(
                itemsToMigrate.map((artworkId: string) => ({
                    user_id: userId,
                    artwork_id: artworkId,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }))
            );

        if (insertError) throw insertError;

        // 5. Clear guest wishlist
        await fetch('/api/wishlist/guest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'device-id': deviceId,
            },
            body: JSON.stringify({ action: 'CLEAR' }),
        });

        toast.success(`${itemsToMigrate.length} items migrated to your account`);
    } catch (error) {
        console.error('Wishlist migration failed:', error);
        toast.error('Failed to migrate wishlist items');
    }
}