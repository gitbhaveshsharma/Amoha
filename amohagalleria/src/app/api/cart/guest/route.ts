// app/api/cart/guest/route.ts
import { NextResponse } from 'next/server';
import { getGuestCart, updateGuestCart, clearGuestCart } from '@/lib/server/redis';
import { GuestNotificationService } from '@/lib/server/notifications/guest/guestNotifications';

export async function GET(request: Request) {
    try {
        const deviceId = request.headers.get('device-id');
        if (!deviceId) return NextResponse.json({ cart: [] });

        const cart = await getGuestCart(deviceId);
        const activeCart = cart.filter(item => item.status === 'active');
        return NextResponse.json({
            cart: activeCart.map(item => item.artwork_id)
        });
    } catch (error) {
        console.error('[GET Cart] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const deviceId = request.headers.get('device-id');
        if (!deviceId) {
            return NextResponse.json(
                { error: 'Device ID not found' },
                { status: 400 }
            );
        }

        const { action, artworkId } = await request.json();

        if (action === 'TOGGLE') {
            const cart = await getGuestCart(deviceId);
            const existingItem = cart.find(item => item.artwork_id === artworkId);
            const newStatus = existingItem?.status === 'active' ? 'removed' : 'active';

            await updateGuestCart(deviceId, artworkId, newStatus);

            // Only schedule notification if item was added (not removed)
            if (newStatus === 'active') {
                await GuestNotificationService.scheduleAbandonedCartNotification(deviceId, artworkId);
            }

            return NextResponse.json({
                success: true,
                wasAdded: newStatus === 'active'
            });
        }

        if (action === 'CLEAR') {
            await clearGuestCart(deviceId);
            return NextResponse.json({ success: true });
        }

        // Handle ADD action (if you have it)
        if (action === 'ADD') {
            await updateGuestCart(deviceId, artworkId, 'active');
            await GuestNotificationService.scheduleAbandonedCartNotification(deviceId, artworkId);
            return NextResponse.json({ success: true, wasAdded: true });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error("[POST Cart] Error:", error);
        return NextResponse.json(
            { error: 'Failed to update cart' },
            { status: 500 }
        );
    }
}