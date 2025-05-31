// types/artwork_engagement.ts

export type ArtworkEngagement = {
    user_id: string | null;
    artwork_id: string;
    device_id: string;
    ip_address: string;
    user_agent: string;
    view_start_time: string;
    view_duration: number;
    last_interaction: string | null;
    referrer: string | null;
    session_id: string | null;
    created_at: string;
    updated_at: string;

};

export type EngagementConfig = {
    engagementTTL: number; // TTL for individual engagement hashes (in seconds)
    deviceEngagementsTTL: number; // TTL for device engagements set (in seconds)
    recentViewsTTL: number; // TTL for recent views list (in seconds)
    maxRecentViews: number; // Maximum number of recent views to keep
};

export type EngagementCreateData = {
    user_id?: string | null;
    artwork_id: string;
    device_id: string;
    ip_address: string;
    user_agent: string;
    referrer?: string | null;
    session_id?: string | null;
};

export type EngagementUpdateData = {
    view_duration?: number;
    last_interaction?: string;
};

export type RecentView = {
    artwork_id: string;
    viewed_at: string;
};