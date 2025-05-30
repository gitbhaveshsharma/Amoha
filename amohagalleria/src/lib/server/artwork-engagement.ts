// lib/server/artwork-engagement.ts
import { redisClient } from './redis';
import {
    ArtworkEngagement,
    EngagementConfig,
    EngagementCreateData,
    EngagementUpdateData,
} from '@/types/artwork_engagement';

// Updated configuration - removed TTL for data persistence
const DEFAULT_CONFIG: EngagementConfig = {
    engagementTTL: 0, // No expiration - data persists until cron job cleans it
    deviceEngagementsTTL: 0, // No expiration
    recentViewsTTL: 7 * 24 * 60 * 60, // Keep this for UX - 7 days
    maxRecentViews: 20
};

// Redis key generators
const getEngagementKey = (deviceId: string, artworkId: string): string =>
    `engagement:${deviceId}:${artworkId}`;

const getDeviceEngagementsKey = (deviceId: string): string =>
    `device_engagements:${deviceId}`;

const getRecentViewsKey = (deviceId: string): string =>
    `views:${deviceId}`;

const getActiveEngagementKey = (deviceId: string): string =>
    `active_engagement:${deviceId}`;

// Create or update engagement
export const createEngagement = async (
    data: EngagementCreateData,
    config: EngagementConfig = DEFAULT_CONFIG
): Promise<void> => {
    const now = new Date().toISOString();
    const engagementKey = getEngagementKey(data.device_id, data.artwork_id);
    const deviceEngagementsKey = getDeviceEngagementsKey(data.device_id);
    const recentViewsKey = getRecentViewsKey(data.device_id);
    const activeEngagementKey = getActiveEngagementKey(data.device_id);

    // Check if engagement already exists for this specific device-artwork combination
    const existingEngagement = await redisClient.exists(engagementKey);

    if (existingEngagement) {
        console.log(`Engagement already exists for device ${data.device_id} and artwork ${data.artwork_id}`);
        // Just update the existing engagement instead of creating a new one
        await updateEngagement(data.device_id, data.artwork_id, {
            view_duration: 0,
            last_interaction: now
        });

        // Update active engagement tracker (no expiration)
        await redisClient.set(activeEngagementKey, data.artwork_id);
        return;
    }

    // End any previous active engagement for this device (different artwork)
    const previousActiveArtwork = await redisClient.get(activeEngagementKey);
    if (previousActiveArtwork && previousActiveArtwork !== data.artwork_id) {
        console.log(`Ending previous engagement for artwork ${previousActiveArtwork}`);
        await endEngagement(data.device_id, previousActiveArtwork);
    }

    const engagement: ArtworkEngagement = {
        user_id: data.user_id || null,
        artwork_id: data.artwork_id,
        device_id: data.device_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        view_start_time: now,
        view_duration: 0,
        last_interaction: null,
        referrer: data.referrer || null,
        session_id: data.session_id || null,
        created_at: now,
        updated_at: now
    };

    // Convert nulls to strings for Redis compatibility
    const engagementForRedis: Record<string, string | number> = {
        ...engagement,
        user_id: engagement.user_id === null ? 'null' : engagement.user_id,
        last_interaction: engagement.last_interaction === null ? 'null' : engagement.last_interaction,
        referrer: engagement.referrer === null ? 'null' : engagement.referrer,
        session_id: engagement.session_id === null ? 'null' : engagement.session_id
    };

    // Store individual engagement as hash (NO EXPIRATION)
    await redisClient.hSet(engagementKey, engagementForRedis);
    // REMOVED: await redisClient.expire(engagementKey, config.engagementTTL);

    // Add to device engagements set (NO EXPIRATION)
    await redisClient.sAdd(deviceEngagementsKey, engagementKey);
    // REMOVED: await redisClient.expire(deviceEngagementsKey, config.deviceEngagementsTTL);

    // Set active engagement tracker (NO EXPIRATION)
    await redisClient.set(activeEngagementKey, data.artwork_id);
    // REMOVED: await redisClient.set(activeEngagementKey, data.artwork_id, { EX: config.engagementTTL });

    // Add to recent views list ONLY if it's not already the most recent view
    const recentViews = await redisClient.lRange(recentViewsKey, 0, 0);
    const mostRecentView = recentViews[0];

    if (mostRecentView !== data.artwork_id) {
        // Remove any existing instances of this artwork_id from the list
        await redisClient.lRem(recentViewsKey, 0, data.artwork_id);

        // Add to the front of the list
        await redisClient.lPush(recentViewsKey, data.artwork_id);

        // Trim to keep only the most recent views
        await redisClient.lTrim(recentViewsKey, 0, config.maxRecentViews - 1);
    }

    // Keep expiration only for recent views (for UX purposes)
    if (config.recentViewsTTL > 0) {
        await redisClient.expire(recentViewsKey, config.recentViewsTTL);
    }

    console.log(`New engagement created for device ${data.device_id} and artwork ${data.artwork_id}`);
};

// End engagement for a specific artwork
export const endEngagement = async (
    deviceId: string,
    artworkId: string
): Promise<void> => {
    const engagementKey = getEngagementKey(deviceId, artworkId);
    const exists = await redisClient.exists(engagementKey);

    if (!exists) {
        console.log(`No engagement found to end for device ${deviceId} and artwork ${artworkId}`);
        return;
    }

    // Get current engagement data to calculate final duration
    const engagementData = await redisClient.hGetAll(engagementKey);
    if (engagementData.view_start_time) {
        const startTime = new Date(engagementData.view_start_time).getTime();
        const endTime = Date.now();
        const finalDuration = Math.floor((endTime - startTime) / 1000);

        // Update with final duration (engagement data remains in Redis for cron job)
        await redisClient.hSet(engagementKey, {
            view_duration: finalDuration,
            last_interaction: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    console.log(`Engagement ended for device ${deviceId} and artwork ${artworkId} - data preserved for storage`);
};

// Update existing engagement
export const updateEngagement = async (
    deviceId: string,
    artworkId: string,
    updates: EngagementUpdateData
): Promise<void> => {
    const engagementKey = getEngagementKey(deviceId, artworkId);
    const exists = await redisClient.exists(engagementKey);

    if (!exists) {
        console.log(`No engagement found for device ${deviceId} and artwork ${artworkId}`);
        return; // Engagement doesn't exist, skip update
    }

    const updateData: Record<string, string | number> = {
        updated_at: new Date().toISOString()
    };

    if (updates.view_duration !== undefined) {
        updateData.view_duration = updates.view_duration;
    }

    if (updates.last_interaction !== undefined) {
        updateData.last_interaction = updates.last_interaction;
    }

    await redisClient.hSet(engagementKey, updateData);

    // No need to update TTL since we're not using expiration anymore
    console.log(`Engagement updated for device ${deviceId} and artwork ${artworkId}`);
};

// Get engagement data
export const getEngagement = async (
    deviceId: string,
    artworkId: string
): Promise<ArtworkEngagement | null> => {
    const engagementKey = getEngagementKey(deviceId, artworkId);
    const data = await redisClient.hGetAll(engagementKey);

    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    return {
        user_id: data.user_id === 'null' ? null : data.user_id,
        artwork_id: data.artwork_id,
        device_id: data.device_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        view_start_time: data.view_start_time,
        view_duration: parseInt(data.view_duration) || 0,
        last_interaction: data.last_interaction === 'null' ? null : data.last_interaction,
        referrer: data.referrer === 'null' ? null : data.referrer,
        session_id: data.session_id === 'null' ? null : data.session_id,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
};

// Get all engagements for a device
export const getDeviceEngagements = async (deviceId: string): Promise<ArtworkEngagement[]> => {
    const deviceEngagementsKey = getDeviceEngagementsKey(deviceId);
    const engagementKeys = await redisClient.sMembers(deviceEngagementsKey);

    if (engagementKeys.length === 0) {
        return [];
    }

    const engagements: ArtworkEngagement[] = [];

    for (const key of engagementKeys) {
        const data = await redisClient.hGetAll(key);
        if (data && Object.keys(data).length > 0) {
            engagements.push({
                user_id: data.user_id === 'null' ? null : data.user_id,
                artwork_id: data.artwork_id,
                device_id: data.device_id,
                ip_address: data.ip_address,
                user_agent: data.user_agent,
                view_start_time: data.view_start_time,
                view_duration: parseInt(data.view_duration) || 0,
                last_interaction: data.last_interaction === 'null' ? null : data.last_interaction,
                referrer: data.referrer === 'null' ? null : data.referrer,
                session_id: data.session_id === 'null' ? null : data.session_id,
                created_at: data.created_at,
                updated_at: data.updated_at
            });
        }
    }

    return engagements;
};

// Get recent views for a device (returns unique artwork IDs)
export const getRecentViews = async (deviceId: string, limit?: number): Promise<string[]> => {
    const recentViewsKey = getRecentViewsKey(deviceId);
    const maxLimit = limit || DEFAULT_CONFIG.maxRecentViews;

    return await redisClient.lRange(recentViewsKey, 0, maxLimit - 1);
};

// Get currently active engagement for a device
export const getActiveEngagement = async (deviceId: string): Promise<string | null> => {
    const activeEngagementKey = getActiveEngagementKey(deviceId);
    return await redisClient.get(activeEngagementKey);
};

// UPDATED: Clear all engagement data for a device (only for manual cleanup)
export const clearDeviceEngagements = async (deviceId: string): Promise<void> => {
    const deviceEngagementsKey = getDeviceEngagementsKey(deviceId);
    const recentViewsKey = getRecentViewsKey(deviceId);
    const activeEngagementKey = getActiveEngagementKey(deviceId);

    // Get all engagement keys for this device
    const engagementKeys = await redisClient.sMembers(deviceEngagementsKey);

    // Delete all individual engagement hashes
    if (engagementKeys.length > 0) {
        await redisClient.del(engagementKeys);
    }

    // Delete device engagements set, recent views, and active engagement
    await redisClient.del([deviceEngagementsKey, recentViewsKey, activeEngagementKey]);

    console.log(`Manually cleared all engagement data for device ${deviceId}`);
};

// Check if engagement exists
export const hasEngagement = async (deviceId: string, artworkId: string): Promise<boolean> => {
    const engagementKey = getEngagementKey(deviceId, artworkId);
    return await redisClient.exists(engagementKey) === 1;
};

// NEW: Get engagement statistics for monitoring
export const getEngagementStats = async (): Promise<{
    totalEngagements: number;
    totalDevices: number;
    oldestEngagement: string | null;
    newestEngagement: string | null;
}> => {
    try {
        const engagementKeys = await redisClient.keys('engagement:*');
        const deviceKeys = await redisClient.keys('device_engagements:*');

        let oldestEngagement: string | null = null;
        let newestEngagement: string | null = null;

        if (engagementKeys.length > 0) {
            // Sample a few engagements to get date range
            const sampleSize = Math.min(10, engagementKeys.length);
            const sampleKeys = engagementKeys.slice(0, sampleSize);

            for (const key of sampleKeys) {
                const data = await redisClient.hGetAll(key);
                if (data.created_at) {
                    if (!oldestEngagement || data.created_at < oldestEngagement) {
                        oldestEngagement = data.created_at;
                    }
                    if (!newestEngagement || data.created_at > newestEngagement) {
                        newestEngagement = data.created_at;
                    }
                }
            }
        }

        return {
            totalEngagements: engagementKeys.length,
            totalDevices: deviceKeys.length,
            oldestEngagement,
            newestEngagement
        };
    } catch (error) {
        console.error('Error getting engagement stats:', error);
        return {
            totalEngagements: 0,
            totalDevices: 0,
            oldestEngagement: null,
            newestEngagement: null
        };
    }
};