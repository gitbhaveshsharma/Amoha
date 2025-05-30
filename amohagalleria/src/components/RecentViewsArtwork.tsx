// app/artwork/[id]/components/RecentViewedArtworks.tsx
'use client';

import { useEffect, useState } from 'react';
import { getDeviceId } from '@/lib/deviceFingerprint';
import { getRecentViews } from '@/lib/client/engagement-utils';
import { ArtworkService } from '@/stores/view-artwork/viewArtworkService';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentArtwork {
    id: string;
    title: string;
    image_url: string | null;
}

export function RecentViewedArtworks() {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [recentArtworks, setRecentArtworks] = useState<RecentArtwork[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const currentArtworkId = pathname.split('/').pop();

    useEffect(() => {
        const fetchDeviceId = async () => {
            try {
                const id = await getDeviceId();
                setDeviceId(id);
            } catch (error) {
                console.error('[RecentViewed] Error getting device ID:', error);
            }
        };
        fetchDeviceId();
    }, []);

    useEffect(() => {
        if (!deviceId) return;

        const loadRecentArtworks = async () => {
            try {
                setLoading(true);
                let artworkIds: string[] = [];
                try {
                    artworkIds = await getRecentViews(deviceId, 6);
                } catch (error) {
                    console.error('[RecentViewed] Error fetching recent views:', error);
                }

                const filteredArtworkIds = artworkIds.filter(id => id !== currentArtworkId);
                const artworks: RecentArtwork[] = [];

                for (const id of filteredArtworkIds) {
                    try {
                        const { artwork } = await ArtworkService.getArtworkDetails(id);
                        if (artwork) {
                            artworks.push({
                                id: artwork.id,
                                title: artwork.title,
                                image_url: artwork.image_url
                            });
                        }
                    } catch (error) {
                        console.error(`[RecentViewed] Error loading artwork ${id}:`, error);
                    }

                    if (artworks.length >= 6) break;
                }

                setRecentArtworks(artworks);
            } catch (error) {
                console.error('[RecentViewed] Error loading recent views:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRecentArtworks();
    }, [deviceId, currentArtworkId]);

    if (!loading && recentArtworks.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-12 border-t pt-8 w-full"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Recently Viewed</h3>
            </div>

            {loading ? (
                <div className="flex justify-end gap-2">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="w-[200px] h-[200px] rounded-md" />
                    ))}
                </div>
            ) : (
                <div className={`flex justify-end gap-2 flex-wrap`}>
                    {recentArtworks.map((artwork) => (
                        <Link
                            key={artwork.id}
                            href={`/artwork/${artwork.id}`}
                            className="group relative block w-[200px] h-[200px]"
                        >
                            <div className="relative w-full h-full rounded-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/40 border border-solid hover:border-primary/30">
                                {artwork.image_url ? (
                                    <Image
                                        src={artwork.image_url}
                                        alt={artwork.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                        sizes="200px"
                                        priority={false}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="bg-muted h-full w-full flex items-center justify-center">
                                        <span className="text-muted-foreground text-sm">No image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                                    <p className="text-white text-sm font-medium text-center line-clamp-3">
                                        {artwork.title}
                                    </p>
                                </div>
                            </div>
                            {/* Frame effect */}
                            <div className="absolute inset-0 border-8 border-white/35 pointer-events-none rounded-lg" />
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
}