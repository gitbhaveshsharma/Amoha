// app/api/engagement/recent-views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRecentViews } from '@/lib/server/artwork-engagement';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const device_id = searchParams.get('device_id');
        const limit = searchParams.get('limit');

        if (!device_id) {
            return NextResponse.json(
                { error: 'device_id is required' },
                { status: 400 }
            );
        }

        const recentViews = await getRecentViews(
            device_id,
            limit ? parseInt(limit) : undefined
        );

        return NextResponse.json({ recent_views: recentViews });
    } catch (error) {
        console.error('Error getting recent views:', error);
        return NextResponse.json(
            { error: 'Failed to get recent views' },
            { status: 500 }
        );
    }
}