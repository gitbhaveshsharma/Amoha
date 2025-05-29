// hooks/useArtworkEngagement.ts
import { useEffect, useRef, useCallback } from 'react';

type UseArtworkEngagementProps = {
    artworkId: string;
    deviceId: string;
    userId?: string | null;
    sessionId?: string | null;
    enabled?: boolean;
};

type EngagementAPI = {
    startEngagement: () => Promise<void>;
    updateEngagement: (duration: number) => Promise<void>;
    endEngagement: () => Promise<void>;
};

export const useArtworkEngagement = ({
    artworkId,
    deviceId,
    userId = null,
    sessionId = null,
    enabled = true
}: UseArtworkEngagementProps): EngagementAPI => {
    const startTimeRef = useRef<number | null>(null);
    const engagementCreatedRef = useRef<boolean>(false);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef<boolean>(false);

    const startEngagement = useCallback(async () => {
        if (!enabled || !artworkId || !deviceId || engagementCreatedRef.current) {
            return;
        }

        try {
            startTimeRef.current = Date.now();

            const response = await fetch('/api/engagement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artwork_id: artworkId,
                    device_id: deviceId,
                    user_id: userId,
                    session_id: sessionId
                }),
            });

            if (response.ok) {
                engagementCreatedRef.current = true;
                console.log('Engagement started successfully');

                // Start periodic updates every 10 seconds
                updateIntervalRef.current = setInterval(() => {
                    if (startTimeRef.current) {
                        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                        updateEngagement(duration);
                    }
                }, 10000);
            }
        } catch (error) {
            console.error('Failed to start engagement tracking:', error);
        }
    }, [artworkId, deviceId, userId, sessionId, enabled]);

    const updateEngagement = useCallback(async (duration: number) => {
        if (!enabled || !artworkId || !deviceId || !engagementCreatedRef.current) {
            return;
        }

        try {
            await fetch('/api/engagement', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artwork_id: artworkId,
                    device_id: deviceId,
                    view_duration: duration,
                    last_interaction: new Date().toISOString()
                }),
            });
        } catch (error) {
            console.error('Failed to update engagement:', error);
        }
    }, [artworkId, deviceId, enabled]);

    const endEngagement = useCallback(async () => {
        if (!enabled || !startTimeRef.current || !engagementCreatedRef.current) {
            return;
        }

        try {
            const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

            await fetch('/api/engagement', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artwork_id: artworkId,
                    device_id: deviceId,
                    view_duration: finalDuration,
                    last_interaction: new Date().toISOString()
                }),
            });

            console.log('Engagement ended successfully');
        } catch (error) {
            console.error('Failed to end engagement tracking:', error);
        } finally {
            // Cleanup
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
                updateIntervalRef.current = null;
            }
            startTimeRef.current = null;
            engagementCreatedRef.current = false;
            isInitializedRef.current = false;
        }
    }, [artworkId, deviceId, enabled]);

    // Auto-start engagement when component mounts - ONLY ONCE
    useEffect(() => {
        // Prevent multiple initializations
        if (isInitializedRef.current) {
            return;
        }

        if (enabled && artworkId && deviceId) {
            isInitializedRef.current = true;
            startEngagement();
        }

        return () => {
            endEngagement();
        };
    }, [enabled, artworkId, deviceId]); // Removed startEngagement and endEngagement from deps

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!engagementCreatedRef.current) return;

            if (document.hidden) {
                // Just update, don't end engagement completely
                if (startTimeRef.current) {
                    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    updateEngagement(duration);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [updateEngagement]);

    // Handle beforeunload event
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (engagementCreatedRef.current && startTimeRef.current) {
                const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

                // Use sendBeacon for reliable final update
                const data = JSON.stringify({
                    artwork_id: artworkId,
                    device_id: deviceId,
                    view_duration: finalDuration,
                    last_interaction: new Date().toISOString()
                });

                navigator.sendBeacon('/api/engagement', data);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [artworkId, deviceId]);

    return {
        startEngagement,
        updateEngagement,
        endEngagement
    };
};