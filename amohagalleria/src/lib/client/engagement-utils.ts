// lib/client/engagement-utils.ts
import { ArtworkEngagement } from '@/types/artwork_engagement';

// Client-side utilities for engagement tracking

export const getRecentViews = async (deviceId: string, limit?: number): Promise<string[]> => {
    try {
        const params = new URLSearchParams({ device_id: deviceId });
        if (limit) {
            params.append('limit', limit.toString());
        }

        const response = await fetch(`/api/engagement/recent-views?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch recent views');
        }

        const data = await response.json();
        return data.recent_views || [];
    } catch (error) {
        console.error('Error fetching recent views:', error);
        return [];
    }
};

export const getDeviceEngagements = async (deviceId: string): Promise<ArtworkEngagement[]> => {
    try {
        const params = new URLSearchParams({ device_id: deviceId });
        const response = await fetch(`/api/engagement/device?${params}`);

        if (!response.ok) {
            throw new Error('Failed to fetch device engagements');
        }

        const data = await response.json();
        return data.engagements || [];
    } catch (error) {
        console.error('Error fetching device engagements:', error);
        return [];
    }
};

export const clearDeviceEngagements = async (deviceId: string): Promise<boolean> => {
    try {
        const params = new URLSearchParams({ device_id: deviceId });
        const response = await fetch(`/api/engagement/device?${params}`, {
            method: 'DELETE'
        });

        return response.ok;
    } catch (error) {
        console.error('Error clearing device engagements:', error);
        return false;
    }
};

export const formatEngagementDuration = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
};

export const getEngagementStats = (engagements: ArtworkEngagement[]) => {
    const totalViews = engagements.length;
    const totalDuration = engagements.reduce((sum, eng) => sum + eng.view_duration, 0);
    const averageDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

    const uniqueArtworks = new Set(engagements.map(eng => eng.artwork_id)).size;

    const mostViewedArtwork = engagements.length > 0
        ? engagements.reduce((acc, curr) => {
            acc[curr.artwork_id] = (acc[curr.artwork_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
        : {};

    const topArtwork = Object.entries(mostViewedArtwork)
        .sort(([, a], [, b]) => b - a)[0];

    return {
        totalViews,
        totalDuration,
        averageDuration,
        uniqueArtworks,
        mostViewedArtwork: topArtwork ? {
            artwork_id: topArtwork[0],
            view_count: topArtwork[1]
        } : null
    };
};