import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ArtworkCard, ArtworkCardSkeleton } from './ArtworkCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { Artwork } from '@/types';

// Standard grid component with improved responsiveness
interface ArtworkGridProps {
    artworks: Artwork[];
    loading?: boolean;
    error?: string | null;
    title?: string;
    showRefresh?: boolean;
    onRefresh?: () => void;
    className?: string;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

export const ArtworkGrid: React.FC<ArtworkGridProps> = ({
    artworks,
    loading = false,
    error,
    title,
    showRefresh = false,
    onRefresh,
    className,
    columns = { sm: 2, md: 2, lg: 3, xl: 4 }
}) => {
    // Quick View Modal state
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

    const gridCols = useMemo(() => {
        // Always default to 2 columns on mobile
        return {
            base: `grid-cols-2`,
            md: `md:grid-cols-${columns.md || 2}`,
            lg: `lg:grid-cols-${columns.lg || 3}`,
            xl: `xl:grid-cols-${columns.xl || 4}`
        };
    }, [columns]);

    const handleQuickView = (artwork: Artwork) => {
        setSelectedArtwork(artwork);
        setQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setQuickViewOpen(false);
        setSelectedArtwork(null);
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
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
            {(title || showRefresh) && (
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    {title && <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>}
                    {showRefresh && onRefresh && (
                        <button
                            onClick={onRefresh}
                            className={`inline-flex items-center px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    )}
                </div>
            )}

            <div className={`grid gap-3 sm:gap-4 ${gridCols.base} ${gridCols.md} ${gridCols.lg} ${gridCols.xl}`}>
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ArtworkCardSkeleton key={`skeleton-${i}`} />
                    ))) : (
                    artworks.map((artwork, index) => (
                        <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            priority={index < 4}
                            onQuickView={handleQuickView}
                        />
                    ))
                )}
            </div>            {!loading && artworks.length === 0 && (
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