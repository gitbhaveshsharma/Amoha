// app/api/engagement/device/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDeviceEngagements, clearDeviceEngagements } from '@/lib/server/artwork-engagement';

// Get all engagements for a device
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const device_id = searchParams.get('device_id');

        if (!device_id) {
            return NextResponse.json(
                { error: 'device_id is required' },
                { status: 400 }
            );
        }

        const engagements = await getDeviceEngagements(device_id);

        return NextResponse.json({ engagements });
    } catch (error) {
        console.error('Error getting device engagements:', error);
        return NextResponse.json(
            { error: 'Failed to get device engagements' },
            { status: 500 }
        );
    }
}

// Clear all engagements for a device
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const device_id = searchParams.get('device_id');

        if (!device_id) {
            return NextResponse.json(
                { error: 'device_id is required' },
                { status: 400 }
            );
        }

        await clearDeviceEngagements(device_id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error clearing device engagements:', error);
        return NextResponse.json(
            { error: 'Failed to clear device engagements' },
            { status: 500 }
        );
    }
}