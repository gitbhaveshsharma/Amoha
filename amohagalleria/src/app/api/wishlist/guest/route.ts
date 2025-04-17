// app/api/wishlist/guest/route.ts
import { NextResponse } from 'next/server';
import { getGuestWishlist, updateGuestWishlist, clearGuestWishlist } from '@/lib/server/redis';

// app/api/wishlist/guest/route.ts
export async function GET(request: Request) {
    try {
        const deviceId = request.headers.get('device-id');
        if (!deviceId) {
            return NextResponse.json({ wishlist: [] });
        }

        const wishlist = await getGuestWishlist(deviceId);

        // For migration requests, return full items with status
        if (request.headers.get('x-migration-request') === 'true') {
            return NextResponse.json({ wishlist });
        }

        // Normal requests return only active items
        const activeWishlist = wishlist.filter(item => item.status === 'active');
        return NextResponse.json({
            wishlist: activeWishlist.map(item => item.artwork_id)
        });
    } catch (error) {
        console.error('[GET Wishlist] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
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
            // Get current wishlist to determine the toggle action
            const wishlist = await getGuestWishlist(deviceId);
            const existingItem = wishlist.find(item => item.artwork_id === artworkId);
            const newStatus = existingItem?.status === 'active' ? 'removed' : 'active';

            console.log(`[POST Wishlist] TOGGLE action: deviceId=${deviceId}, artworkId=${artworkId}, newStatus=${newStatus}`);
            await updateGuestWishlist(deviceId, artworkId, newStatus);

            return NextResponse.json({
                success: true,
                wasAdded: newStatus === 'active'
            });
        }

        if (action === 'CLEAR') {
            console.log(`[POST Wishlist] CLEAR action: deviceId=${deviceId}`);
            await clearGuestWishlist(deviceId);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error("[POST Wishlist] Error:", error);
        return NextResponse.json(
            { error: 'Failed to update wishlist' },
            { status: 500 }
        );
    }
}