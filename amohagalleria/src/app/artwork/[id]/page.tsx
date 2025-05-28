'use client';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { useArtworkStore } from '@/stores/view-artwork/viewArtworkStore';
import ArtworkDetails from './components/ArtworkDetails';
import ArtistProfile from './components/ArtistProfile';
import RelatedArtworks from './components/RelatedArtworks';
import ArtworkImages from './components/ArtworkImages';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface ArtworkPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ArtworkPage({ params }: ArtworkPageProps) {
    const { id } = use(params);
    const {
        artwork,
        artist,
        images,
        relatedArtworks,
        loading,
        error,
        fetchArtworkDetails,
        fetchRelatedArtworks,
        clearArtworkDetails
    } = useArtworkStore();

    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            try {
                await fetchArtworkDetails(id);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setInitialLoad(false);
            }
        };

        loadData();

        return () => {
            clearArtworkDetails();
        };
    }, [id, fetchArtworkDetails, clearArtworkDetails]);

    useEffect(() => {
        if (!artwork) return;

        if (artwork.art_category && artwork.id) {
            fetchRelatedArtworks(artwork.id, artwork.art_category);
        }
    }, [artwork, fetchRelatedArtworks]);

    if (initialLoad) {
        return (
            <div className="container py-8 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[0, 1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-20 rounded-md" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <div className="py-4 border-t border-b space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-1/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-1/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </div>
                        <Skeleton className="h-40 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="container py-8 text-center"
            >
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
                    <h3 className="text-red-800 font-medium">Error loading artwork</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    if (!artwork) {
        return notFound();
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="container py-8 space-y-12"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ArtworkImages images={images} title={artwork.title} />
                <div className="space-y-6">
                    <ArtworkDetails artwork={artwork} />
                    <ArtistProfile artist={artist} />
                </div>
            </div>

            {relatedArtworks.length > 0 && (
                <RelatedArtworks artworks={relatedArtworks} />
            )}
        </motion.div>
    );
}