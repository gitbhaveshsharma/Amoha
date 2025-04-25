// app/api/notifications/send/route.ts
import { NextResponse } from 'next/server';
import webPush from 'web-push';

// Initialize web-push with VAPID keys
webPush.setVapidDetails(
    `mailto:${process.env.NEXT_PUBLIC_VAPID_EMAIL || 'notifications@yourdomain.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
    try {
        const { subscription, title, body, data, icon } = await request.json();

        // Validate subscription
        if (!subscription?.endpoint) {
            throw new Error('Invalid push subscription: Missing endpoint');
        }

        // Validate required fields
        if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
            throw new Error('Server misconfigured: Missing VAPID keys');
        }

        // Prepare notification payload
        const payload = JSON.stringify({
            title: title || 'New notification',
            body: body || 'You have a new message',
            icon: icon || '/icons/notification.png',
            badge: '/icons/badge.png',
            data: data || { url: '/' },
            vibrate: [200, 100, 200]
        });

        // Send notification
        await webPush.sendNotification(subscription, payload);

        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully'
        });

    } catch (error) {
        console.error('Notification error:', error);

        return NextResponse.json(
            {
                error: 'Failed to send notification',
                message: error instanceof Error ? error.message : 'Unknown error',
                ...(process.env.NODE_ENV === 'development' ? { stack: error instanceof Error ? error.stack : undefined } : {})
            },
            { status: 500 }
        );
    }
}

// Type definitions for better type safety
declare global {
    export interface ProcessEnv {
        VAPID_PRIVATE_KEY: string;
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: string;
        VAPID_EMAIL?: string;
    }
}