import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { ArtworkCard, ArtworkCardSkeleton } from './ArtworkCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { Artwork } from '@/types'; // Adjust the import path as necessary

// Infinite scroll grid (traditional approach)
interface InfiniteScrollGridProps {
    artworks: Artwork[];
    loading?: boolean;
    error?: string | null;
    title?: string;
    hasMore?: boolean;
    loadMore?: () => void;
    loadingMore?: boolean;
    className?: string;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

export const InfiniteScrollGrid: React.FC<InfiniteScrollGridProps> = ({
    artworks,
    loading = false,
    error,
    title,
    hasMore = false,
    loadMore,
    loadingMore = false,
    className,
    columns = { sm: 2, md: 2, lg: 3, xl: 4 }
}) => {
    // Quick View Modal state
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

    const [isLoadingRef, setIsLoadingRef] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleQuickView = (artwork: Artwork) => {
        setSelectedArtwork(artwork);
        setQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setQuickViewOpen(false);
        setSelectedArtwork(null);
    };

    const gridCols = {
        base: `grid-cols-2`, // Always default to 2 columns on mobile
        md: `md:grid-cols-${columns.md || 2}`,
        lg: `lg:grid-cols-${columns.lg || 3}`,
        xl: `xl:grid-cols-${columns.xl || 4}`
    };

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || !loadMore || isLoadingRef || loading || loadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsLoadingRef(true);
                    Promise.resolve(loadMore()).finally(() => setIsLoadingRef(false));
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadMore, isLoadingRef, loading, loadingMore]);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                {loadMore && (
                    <button
                        onClick={loadMore}
                        className="inline-flex items-center px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                </div>
            )}            <div className={`grid gap-3 sm:gap-4 ${gridCols.base} ${gridCols.md} ${gridCols.lg} ${gridCols.xl}`}>
                {artworks.map((artwork, index) => (
                    <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        priority={index < 4}
                        onQuickView={handleQuickView}
                    />
                ))}

                {loading && artworks.length === 0 && (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ArtworkCardSkeleton key={`skeleton-${i}`} />
                    ))
                )}
            </div>

            {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                    {(loadingMore || isLoadingRef) ? (
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading more...</span>
                        </div>
                    ) : (
                        <button
                            onClick={loadMore}
                            className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
                        >
                            Load More
                        </button>
                    )}
                </div>
            )}            {!loading && artworks.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                    <p className="text-gray-500">Please try a different search or check back later</p>
                </div>
            )}

            {/* Quick View Modal */}
            <QuickViewModal
                isOpen={quickViewOpen}
                onClose={handleCloseQuickView}
                artwork={selectedArtwork}
            />
        </div>
    );
};