// app/api/engagement/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/server/redis';
import { supabase } from '@/lib/supabase';
import { ArtworkEngagement } from '@/types/artwork_engagement';

// Redis key patterns
const REDIS_KEY_PATTERNS = {
    ENGAGEMENT: 'engagement:*',
    DEVICE_ENGAGEMENTS: 'device_engagements:*',
    RECENT_VIEWS: 'views:*',
    ACTIVE_ENGAGEMENT: 'active_engagement:*'
};

interface ProcessingStats {
    totalEngagements: number;
    successfulStores: number;
    failedStores: number;
    cleanedKeys: number;
    errors: string[];
}

function convertToSupabaseFormat(engagement: Record<string, string>): ArtworkEngagement {
    return {
        user_id: engagement.user_id === 'null' ? null : engagement.user_id,
        artwork_id: engagement.artwork_id,
        device_id: engagement.device_id,
        ip_address: engagement.ip_address,
        user_agent: engagement.user_agent,
        view_start_time: engagement.view_start_time,
        view_duration: parseInt(engagement.view_duration) || 0,
        last_interaction: engagement.last_interaction === 'null' ? null : engagement.last_interaction,
        referrer: engagement.referrer === 'null' ? null : engagement.referrer,
        session_id: engagement.session_id === 'null' ? null : engagement.session_id,
        created_at: engagement.created_at,
        updated_at: engagement.updated_at
    };
}

async function getAllEngagementKeys(): Promise<string[]> {
    try {
        return await redisClient.keys(REDIS_KEY_PATTERNS.ENGAGEMENT);
    } catch (error) {
        console.error('Error getting engagement keys:', error);
        return [];
    }
}

async function getEngagementData(key: string): Promise<Record<string, string> | null> {
    try {
        const data = await redisClient.hGetAll(key);
        return data && Object.keys(data).length > 0 ? data : null;
    } catch (error) {
        console.error(`Error getting engagement data for key ${key}:`, error);
        return null;
    }
}

async function cleanRedisKeys(engagementKeys: string[], deviceIds: Set<string>): Promise<number> {
    let cleanedCount = 0;

    try {
        if (engagementKeys.length > 0) {
            await redisClient.del(engagementKeys);
            cleanedCount += engagementKeys.length;
        }

        for (const deviceId of deviceIds) {
            const keysToDelete = [`device_engagements:${deviceId}`];
            await redisClient.del(keysToDelete);
            cleanedCount += keysToDelete.length;
        }
    } catch (error) {
        console.error('Error cleaning Redis keys:', error);
    }

    return cleanedCount;
}

async function processEngagements(): Promise<ProcessingStats> {
    const stats: ProcessingStats = {
        totalEngagements: 0,
        successfulStores: 0,
        failedStores: 0,
        cleanedKeys: 0,
        errors: []
    };

    try {
        const engagementKeys = await getAllEngagementKeys();
        stats.totalEngagements = engagementKeys.length;

        if (engagementKeys.length === 0) {
            return stats;
        }

        const deviceIds = new Set<string>();
        const engagementsToStore: ArtworkEngagement[] = [];

        for (const key of engagementKeys) {
            const engagementData = await getEngagementData(key);
            if (engagementData) {
                engagementsToStore.push(convertToSupabaseFormat(engagementData));
                deviceIds.add(engagementData.device_id);
            }
        }

        if (engagementsToStore.length > 0) {
            const { error } = await supabase
                .from('artwork_engagements')
                .insert(engagementsToStore);

            if (error) {
                stats.errors.push(`Batch insert failed: ${error.message}`);
                stats.failedStores = engagementsToStore.length;
            } else {
                stats.successfulStores = engagementsToStore.length;
                stats.cleanedKeys = await cleanRedisKeys(engagementKeys, deviceIds);
            }
        }
    } catch (error) {
        stats.errors.push(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return stats;
}

export async function POST(request: NextRequest) {
    // Simple cron secret verification
    const url = new URL(request.url);
    if (url.searchParams.get('secret') !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Starting engagement data migration...');
        const startTime = Date.now();
        const stats = await processEngagements();

        return NextResponse.json({
            success: stats.errors.length === 0,
            stats: {
                ...stats,
                processingTimeMs: Date.now() - startTime
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Migration failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const [engagementKeys, deviceEngagementKeys, recentViewsKeys, activeEngagementKeys] =
            await Promise.all([
                redisClient.keys(REDIS_KEY_PATTERNS.ENGAGEMENT),
                redisClient.keys(REDIS_KEY_PATTERNS.DEVICE_ENGAGEMENTS),
                redisClient.keys(REDIS_KEY_PATTERNS.RECENT_VIEWS),
                redisClient.keys(REDIS_KEY_PATTERNS.ACTIVE_ENGAGEMENT)
            ]);

        return NextResponse.json({
            redis_stats: {
                engagement_keys: engagementKeys.length,
                device_engagement_keys: deviceEngagementKeys.length,
                recent_views_keys: recentViewsKeys.length,
                active_engagement_keys: activeEngagementKeys.length,
                total_keys: engagementKeys.length +
                    deviceEngagementKeys.length +
                    recentViewsKeys.length +
                    activeEngagementKeys.length
            },
            last_check: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting Redis stats:', error);
        return NextResponse.json(
            { error: 'Failed to get Redis stats' },
            { status: 500 }
        );
    }
}