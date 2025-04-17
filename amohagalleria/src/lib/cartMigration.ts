// lib/cartMigration.ts
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/lib/deviceFingerprint';
import { toast } from 'react-toastify';

export async function migrateGuestCart(userId: string) {
    console.log('Starting cart migration for user:', userId);
    const deviceId = await getDeviceId();
    if (!deviceId) {
        console.log('No device ID found, skipping cart migration');
        return;
    }

    try {
        console.log('Fetching guest cart for device:', deviceId);
        const guestResponse = await fetch('/api/cart/guest', {
            headers: {
                'device-id': deviceId,
                'x-migration-request': 'true',
            },
        });

        if (!guestResponse.ok) {
            const errorText = await guestResponse.text();
            console.error('Failed to fetch guest cart:', errorText);
            throw new Error(`Failed to fetch guest cart: ${guestResponse.status}`);
        }

        const responseData = await guestResponse.json();
        console.log('Guest cart response:', responseData);

        if (!responseData.cart) {
            console.log('No cart data in response');
            return;
        }

        let guestItems = responseData.cart;
        console.log('Raw guest cart items:', guestItems);

        // Handle both formats - array of objects or array of IDs
        let guestCart: string[];
        if (guestItems.length > 0 && typeof guestItems[0] === 'object') {
            // Format: [{artwork_id, status, updated_at}]
            guestCart = guestItems
                .filter((item: any) => item.status === 'active')
                .map((item: any) => item.artwork_id);
        } else {
            // Format: ["artwork_id1", "artwork_id2"]
            // Assume all items are active if only IDs are provided
            guestCart = guestItems;
        }

        console.log('Active guest cart items:', guestCart);

        if (!guestCart.length) {
            console.log('No active items in guest cart to migrate');
            return;
        }

        // Rest of the migration logic remains the same...
        console.log('Fetching user cart for user:', userId);
        const { data: userCart, error: fetchError } = await supabase
            .from('cart')
            .select('artwork_id')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (fetchError) {
            console.error('Error fetching user cart:', fetchError);
            throw fetchError;
        }

        const userCartIds = userCart?.map(item => item.artwork_id) || [];
        console.log('User cart items:', userCartIds);

        const itemsToMigrate = guestCart.filter(
            (artworkId: string) => !userCartIds.includes(artworkId)
        );

        console.log('Items to migrate:', itemsToMigrate);
        if (!itemsToMigrate.length) {
            console.log('No new items to migrate');
            return;
        }

        console.log('Inserting items into user cart:', itemsToMigrate);
        const { error: insertError } = await supabase
            .from('cart')
            .insert(
                itemsToMigrate.map((artworkId: string) => ({
                    user_id: userId,
                    artwork_id: artworkId,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }))
            );

        if (insertError) {
            console.error('Error inserting cart items:', insertError);
            throw insertError;
        }

        console.log('Clearing guest cart');
        const clearResponse = await fetch('/api/cart/guest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'device-id': deviceId,
            },
            body: JSON.stringify({ action: 'CLEAR' }),
        });

        if (!clearResponse.ok) {
            console.error('Failed to clear guest cart');
        }

        toast.success(`${itemsToMigrate.length} cart items migrated to your account`);
        console.log('Cart migration completed successfully');
    } catch (error) {
        console.error('Cart migration failed:', error);
        toast.error('Failed to migrate cart items');
    }
}