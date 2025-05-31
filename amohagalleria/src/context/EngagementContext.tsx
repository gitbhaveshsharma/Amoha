// contexts/EngagementContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDeviceId } from '@/lib/deviceFingerprint';
import { ArtworkEngagement } from '@/types/artwork_engagement';
import { getRecentViews, getDeviceEngagements } from '@/lib/client/engagement-utils';

type EngagementContextType = {
    deviceId: string;
    recentViews: string[];
    engagements: ArtworkEngagement[];
    isLoading: boolean;
    refreshData: () => Promise<void>;
    clearData: () => Promise<void>;
};

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

export const useEngagementContext = () => {
    const context = useContext(EngagementContext);
    if (!context) {
        throw new Error('useEngagementContext must be used within an EngagementProvider');
    }
    return context;
};

type EngagementProviderProps = {
    children: React.ReactNode;
};

export const EngagementProvider: React.FC<EngagementProviderProps> = ({ children }) => {
    const [deviceId, setDeviceId] = useState<string>('');
    const [recentViews, setRecentViews] = useState<string[]>([]);
    const [engagements, setEngagements] = useState<ArtworkEngagement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        if (!deviceId) return;

        setIsLoading(true);
        try {
            const [views, deviceEngagements] = await Promise.all([
                getRecentViews(deviceId),
                getDeviceEngagements(deviceId)
            ]);

            setRecentViews(views);
            setEngagements(deviceEngagements);
        } catch (error) {
            console.error('Error refreshing engagement data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearData = async () => {
        setRecentViews([]);
        setEngagements([]);
    };

    useEffect(() => {
        const fetchDeviceId = async () => {
            setIsLoading(true);
            try {
                const id = await getDeviceId();
                setDeviceId(id);
            } catch (error) {
                console.error('Error fetching deviceId:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDeviceId();
    }, []);

    useEffect(() => {
        if (deviceId) {
            refreshData();
        }
    }, [deviceId]);

    const value: EngagementContextType = {
        deviceId,
        recentViews,
        engagements,
        isLoading,
        refreshData,
        clearData
    };

    return (
        <EngagementContext.Provider value={value}>
            {children}
        </EngagementContext.Provider>
    );
};