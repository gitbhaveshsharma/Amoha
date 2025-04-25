// app/api/notifications/process/route.ts
import { triggerNotificationCheck } from '../../../../lib/server/notifications/cron';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await triggerNotificationCheck();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Job failed' }), { status: 500 });
    }
}