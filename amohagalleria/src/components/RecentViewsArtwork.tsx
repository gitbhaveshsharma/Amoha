// app/artwork/[id]/components/RecentViewedArtworks.tsx
'use client';

import { useEffect, useState } from 'react';
import { useArtworkStore } from '@/stores/view-artwork/viewArtworkStore';
import { getDeviceId } from '@/lib/deviceFingerprint';
import { getRecentViews } from '@/lib/client/engagement-utils';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export function RecentViewedArtworks() {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [recentArtworks, setRecentArtworks] = useState<Array<{
        id: string;
        title: string;
        image_url: string | null;
    }> | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const currentArtworkId = pathname.split('/').pop();

    const { fetchArtworkDetails } = useArtworkStore();

    // Get device ID on mount
    useEffect(() => {
        console.log('[RecentViewed] Component mounted - fetching device ID');
        const fetchDeviceId = async () => {
            try {
                const id = await getDeviceId();
                console.log('[RecentViewed] Retrieved device ID:', id);
                setDeviceId(id);
            } catch (error) {
                console.error('[RecentViewed] Error getting device ID:', error);
            }
        };
        fetchDeviceId();
    }, []);

    // Fetch recent views when deviceId changes
    useEffect(() => {
        if (!deviceId) {
            console.log('[RecentViewed] No device ID yet, skipping fetch');
            return;
        }

        console.log('[RecentViewed] Device ID available, loading recent artworks');
        const loadRecentArtworks = async () => {
            try {
                setLoading(true);
                // Get last 5 viewed artwork IDs
                let artworkIds: string[] = [];
                try {
                    console.log('[RecentViewed] Fetching recent views from Redis...');
                    artworkIds = await getRecentViews(deviceId, 5);
                    console.log('[RecentViewed] Received artwork IDs from Redis:', artworkIds);
                } catch (error) {
                    console.error('[RecentViewed] Error fetching recent views:', error);
                }

                // Fetch minimal details for each artwork
                const artworks = await Promise.all(
                    artworkIds.map(async (id) => {
                        try {
                            console.log(`[RecentViewed] Fetching details for artwork ${id}...`);
                            const artwork = await fetchArtworkDetails(id);
                            console.log(`[RecentViewed] Received artwork ${id} details:`, artwork);

                            if (
                                artwork !== undefined &&
                                artwork !== null &&
                                typeof artwork === 'object' &&
                                'id' in artwork
                            ) {
                                return {
                                    id: (artwork as { id: string; title: string; image_url: string | null }).id,
                                    title: (artwork as { id: string; title: string; image_url: string | null }).title,
                                    image_url: (artwork as { id: string; title: string; image_url: string | null }).image_url
                                };
                            }
                            return null;
                        } catch (error) {
                            console.error(`[RecentViewed] Error loading artwork ${id}:`, error);
                            return null;
                        }
                    })
                );

                console.log('[RecentViewed] All artworks fetched:', artworks);

                // Filter out null values and current artwork
                const filteredArtworks = artworks
                    .filter((artwork): artwork is { id: string; title: string; image_url: string | null } =>
                        artwork !== null && artwork.id !== currentArtworkId
                    )
                    .slice(0, 4); // Limit to 4 most recent

                console.log('[RecentViewed] Filtered artworks (excluding current and null):', filteredArtworks);
                setRecentArtworks(filteredArtworks);
            } catch (error) {
                console.error('[RecentViewed] Error loading recent views:', error);
            } finally {
                console.log('[RecentViewed] Finished loading, setting loading to false');
                setLoading(false);
            }
        };

        loadRecentArtworks();
    }, [deviceId, fetchArtworkDetails, currentArtworkId]);

    console.log('[RecentViewed] Render - loading:', loading, 'recentArtworks:', recentArtworks);

    if (loading || !recentArtworks || recentArtworks.length === 0) {
        console.log('[RecentViewed] Not rendering - loading:', loading, 'or no artworks:', !recentArtworks || recentArtworks.length === 0);
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-12 border-t pt-8"
        >
            <h3 className="text-xl font-semibold mb-6">Recently Viewed</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentArtworks.map((artwork) => (
                    <Link
                        key={artwork.id}
                        href={`/artwork/${artwork.id}`}
                        className="group"
                    >
                        <div className="aspect-square rounded-lg overflow-hidden relative">
                            {artwork.image_url ? (
                                <Image
                                    src={artwork.image_url}
                                    alt={artwork.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    sizes="(max-width: 640px) 50vw, 25vw"
                                    priority={false}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                                    <span className="text-gray-400">No image</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-sm font-medium line-clamp-1 group-hover:underline">
                            {artwork.title}
                        </p>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}