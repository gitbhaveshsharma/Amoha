// lib/server/redis-config.ts
import { EngagementConfig } from '@/types/artwork_engagement';

// Default Redis configuration for artwork engagement tracking
export const DEFAULT_ENGAGEMENT_CONFIG: EngagementConfig = {
    // Individual engagement TTL - 30 minutes
    engagementTTL: 30 * 60,

    // Device engagements set TTL - 30 minutes
    deviceEngagementsTTL: 30 * 60,

    // Recent views list TTL - 7 days
    recentViewsTTL: 7 * 24 * 60 * 60,

    // Maximum recent views to keep per device
    maxRecentViews: 20
};

// Alternative configuration for development/testing
export const DEV_ENGAGEMENT_CONFIG: EngagementConfig = {
    engagementTTL: 5 * 60, // 5 minutes
    deviceEngagementsTTL: 5 * 60, // 5 minutes
    recentViewsTTL: 24 * 60 * 60, // 1 day
    maxRecentViews: 10
};

// Configuration for production with longer retention
export const PROD_ENGAGEMENT_CONFIG: EngagementConfig = {
    engagementTTL: 60 * 60, // 1 hour
    deviceEngagementsTTL: 60 * 60, // 1 hour
    recentViewsTTL: 30 * 24 * 60 * 60, // 30 days
    maxRecentViews: 50
};

// Get configuration based on environment
export const getEngagementConfig = (): EngagementConfig => {
    const env = process.env.NODE_ENV;

    switch (env) {
        case 'development':
            return DEV_ENGAGEMENT_CONFIG;
        case 'production':
            return PROD_ENGAGEMENT_CONFIG;
        default:
            return DEFAULT_ENGAGEMENT_CONFIG;
    }
};

// Redis key patterns for monitoring and cleanup
export const REDIS_KEY_PATTERNS = {
    ENGAGEMENT: 'engagement:*',
    DEVICE_ENGAGEMENTS: 'device_engagements:*',
    RECENT_VIEWS: 'views:*'
} as const;