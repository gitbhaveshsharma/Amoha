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
    const currentArtworkIdRef = useRef<string | null>(null);

    const startEngagement = useCallback(async () => {
        if (!enabled || !artworkId || !deviceId) {
            return;
        }

        // If we're already tracking this artwork, don't create a new engagement
        if (engagementCreatedRef.current && currentArtworkIdRef.current === artworkId) {
            return;
        }

        // If we're tracking a different artwork, end the previous one first
        if (engagementCreatedRef.current && currentArtworkIdRef.current !== artworkId) {
            await endEngagement();
        }

        try {
            startTimeRef.current = Date.now();
            currentArtworkIdRef.current = artworkId;

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
                console.log('Engagement started successfully for artwork:', artworkId);

                // Start periodic updates every 10 seconds
                updateIntervalRef.current = setInterval(() => {
                    if (startTimeRef.current && currentArtworkIdRef.current === artworkId) {
                        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                        updateEngagement(duration);
                    }
                }, 10000);
            } else {
                console.error('Failed to start engagement tracking:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to start engagement tracking:', error);
        }
    }, [artworkId, deviceId, userId, sessionId, enabled]);

    const updateEngagement = useCallback(async (duration: number) => {
        if (!enabled || !artworkId || !deviceId || !engagementCreatedRef.current) {
            return;
        }

        // Only update if we're still tracking the same artwork
        if (currentArtworkIdRef.current !== artworkId) {
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

        const artworkToEnd = currentArtworkIdRef.current || artworkId;

        try {
            const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

            await fetch('/api/engagement', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artwork_id: artworkToEnd,
                    device_id: deviceId,
                    view_duration: finalDuration,
                    last_interaction: new Date().toISOString()
                }),
            });

            console.log('Engagement ended successfully for artwork:', artworkToEnd);
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
            currentArtworkIdRef.current = null;
        }
    }, [artworkId, deviceId, enabled]);

    // Auto-start engagement when component mounts or artworkId changes
    useEffect(() => {
        // Reset initialization flag when artworkId changes
        if (currentArtworkIdRef.current !== artworkId) {
            isInitializedRef.current = false;
        }

        // Prevent multiple initializations for the same artwork
        if (isInitializedRef.current && currentArtworkIdRef.current === artworkId) {
            return;
        }

        if (enabled && artworkId && deviceId) {
            isInitializedRef.current = true;
            startEngagement();
        }

        return () => {
            // Only end engagement if we're unmounting completely
            // or if the artworkId is changing
        };
    }, [enabled, artworkId, deviceId, startEngagement]);

    // Clean up when component unmounts or artworkId changes
    useEffect(() => {
        return () => {
            if (engagementCreatedRef.current) {
                endEngagement();
            }
        };
    }, [artworkId]); // This will run when artworkId changes

    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!engagementCreatedRef.current || currentArtworkIdRef.current !== artworkId) return;

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
    }, [updateEngagement, artworkId]);

    // Handle beforeunload event
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (engagementCreatedRef.current && startTimeRef.current && currentArtworkIdRef.current) {
                const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

                // Use sendBeacon for reliable final update
                const data = JSON.stringify({
                    artwork_id: currentArtworkIdRef.current,
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
    }, [deviceId]);

    return {
        startEngagement,
        updateEngagement,
        endEngagement
    };
};