// app/api/engagement/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createEngagement, updateEngagement, getEngagement } from '@/lib/server/artwork-engagement';
import { EngagementCreateData, EngagementUpdateData } from '@/types/artwork_engagement';

// Create new engagement
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { artwork_id, device_id, user_id, session_id } = body;

        if (!artwork_id || !device_id) {
            return NextResponse.json(
                { error: 'artwork_id and device_id are required' },
                { status: 400 }
            );
        }

        // Get client information
        const ip_address = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const user_agent = request.headers.get('user-agent') || 'unknown';
        const referrer = request.headers.get('referer') || null;

        const engagementData: EngagementCreateData = {
            artwork_id,
            device_id,
            user_id: user_id || null,
            ip_address,
            user_agent,
            referrer,
            session_id: session_id || null
        };

        await createEngagement(engagementData);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Error creating engagement:', error);
        return NextResponse.json(
            { error: 'Failed to create engagement' },
            { status: 500 }
        );
    }
}

// Update existing engagement
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { artwork_id, device_id, view_duration, last_interaction } = body;

        if (!artwork_id || !device_id) {
            return NextResponse.json(
                { error: 'artwork_id and device_id are required' },
                { status: 400 }
            );
        }

        const updates: EngagementUpdateData = {};

        if (view_duration !== undefined) {
            updates.view_duration = view_duration;
        }

        if (last_interaction !== undefined) {
            updates.last_interaction = last_interaction;
        }

        await updateEngagement(device_id, artwork_id, updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating engagement:', error);
        return NextResponse.json(
            { error: 'Failed to update engagement' },
            { status: 500 }
        );
    }
}

// Get engagement data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const artwork_id = searchParams.get('artwork_id');
        const device_id = searchParams.get('device_id');

        if (!artwork_id || !device_id) {
            return NextResponse.json(
                { error: 'artwork_id and device_id are required' },
                { status: 400 }
            );
        }

        const engagement = await getEngagement(device_id, artwork_id);

        if (!engagement) {
            return NextResponse.json(
                { error: 'Engagement not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ engagement });
    } catch (error) {
        console.error('Error getting engagement:', error);
        return NextResponse.json(
            { error: 'Failed to get engagement' },
            { status: 500 }
        );
    }
}