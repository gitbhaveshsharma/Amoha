// components/ui/artwork-grid.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import type { GridChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Eye, Heart, Share2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Artwork } from '@/types';
import { cn } from '@/lib/utils';

// Enhanced artwork card component
interface ArtworkCardProps {
    artwork: Artwork;
    className?: string;
    showActions?: boolean;
    priority?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
    artwork,
    className,
    showActions = true,
    priority = false
}) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const artworkUrl = `/artwork/${artwork.id}`;

    const handleActionClick = (e: React.MouseEvent, action: string) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`${action} clicked for artwork:`, artwork.id);
    };

    return (
        <Link href={artworkUrl} className="block h-full">
            <Card className={cn(
                "h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30",
                "border border-muted/50 hover:border-muted/70",
                className
            )}>
                <div className="relative aspect-square overflow-hidden">
                    {imageLoading && (
                        <Skeleton className="absolute inset-0 z-10" />
                    )}

                    {!imageError && artwork.image_url ? (
                        <Image
                            src={artwork.image_url}
                            alt={artwork.title}
                            fill
                            className={cn(
                                "object-cover transition-transform duration-300 group-hover:scale-105",
                                imageLoading ? "opacity-0" : "opacity-100"
                            )}
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                                setImageError(true);
                                setImageLoading(false);
                            }}
                            priority={priority}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-muted">
                            <div className="text-center text-muted-foreground">
                                <p className="text-sm">Image not available</p>
                            </div>
                        </div>
                    )}

                    {/* Actions overlay */}
                    {showActions && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                    onClick={(e) => handleActionClick(e, 'view')}
                                    title="Quick View"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                    onClick={(e) => handleActionClick(e, 'favorite')}
                                    title="Add to Favorites"
                                >
                                    <Heart className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                    onClick={(e) => handleActionClick(e, 'share')}
                                    title="Share"
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* View Details Button */}
                            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                    size="sm"
                                    className="w-full bg-white/90 hover:bg-white text-foreground"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.location.href = artworkUrl;
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Featured badge */}
                    {artwork.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                            Featured
                        </Badge>
                    )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {artwork.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {artwork.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <Badge variant="outline" className="text-xs w-fit">
                                {artwork.art_category}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">{artwork.medium}</span>
                        </div>

                        {artwork.artist_price && (
                            <div className="text-right">
                                <p className="text-sm font-semibold">
                                    {artwork.currency} {artwork.artist_price}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

// Loading skeleton card
export const ArtworkCardSkeleton: React.FC = () => (
    <Card className="overflow-hidden h-full">
        <div className="aspect-square">
            <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3 mb-3" />
            <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-12" />
            </div>
        </CardContent>
    </Card>
);

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
    columns = { sm: 1, md: 2, lg: 3, xl: 4 }
}) => {
    const gridCols = useMemo(() => {
        return {
            base: `grid-cols-${columns.sm || 1}`,
            md: `md:grid-cols-${columns.md || 2}`,
            lg: `lg:grid-cols-${columns.lg || 3}`,
            xl: `xl:grid-cols-${columns.xl || 4}`
        };
    }, [columns]);

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                {onRefresh && (
                    <Button onClick={onRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {(title || showRefresh) && (
                <div className="flex items-center justify-between mb-6">
                    {title && <h2 className="text-2xl font-bold">{title}</h2>}
                    {showRefresh && onRefresh && (
                        <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            Refresh
                        </Button>
                    )}
                </div>
            )}

            <div className={cn(
                "grid gap-4",
                gridCols.base,
                gridCols.md,
                gridCols.lg,
                gridCols.xl
            )}>
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ArtworkCardSkeleton key={`skeleton-${i}`} />
                    ))
                ) : (
                    artworks.map((artwork, index) => (
                        <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            priority={index < 4}
                        />
                    ))
                )}
            </div>

            {!loading && artworks.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                    <p className="text-muted-foreground">Please try a different search or check back later</p>
                </div>
            )}
        </div>
    );
};

// Virtual scrolling grid for large datasets
interface VirtualArtworkGridProps {
    artworks: Artwork[];
    loading?: boolean;
    hasMore?: boolean;
    loadMore?: () => void;
    title?: string;
    height?: number;
    itemWidth?: number;
    itemHeight?: number;
    gap?: number;
    className?: string;
}

export const VirtualArtworkGrid: React.FC<VirtualArtworkGridProps> = ({
    artworks,
    loading = false,
    hasMore = false,
    loadMore,
    title,
    height = 800,
    itemWidth = 280,
    itemHeight = 380,
    gap = 16,
    className
}) => {
    const [containerWidth, setContainerWidth] = useState(1200);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<Grid>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                setContainerWidth(width);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const { columnsCount, rowsCount, totalItemCount } = useMemo(() => {
        const cols = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
        const totalItems = artworks.length + (hasMore ? cols : 0);
        const rows = Math.ceil(totalItems / cols);

        return {
            columnsCount: cols,
            rowsCount: rows,
            totalItemCount: totalItems
        };
    }, [containerWidth, gap, itemWidth, artworks.length, hasMore]);

    const isItemLoaded = useCallback(
        (index: number) => index < artworks.length,
        [artworks.length]
    );

    const loadMoreItems = useCallback(
        async (startIndex: number) => {
            if (loadMore && hasMore && !loading && startIndex >= artworks.length) {
                try {
                    await loadMore();
                } catch (error) {
                    console.error('Error loading more items:', error);
                }
            }
        },
        [loadMore, hasMore, loading, artworks.length]
    );

    const ItemRenderer = useCallback(
        ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
            const index = rowIndex * columnsCount + columnIndex;
            const artwork = artworks[index];

            const itemStyle = {
                ...style,
                left: (style.left as number) + gap / 2,
                top: (style.top as number) + gap / 2,
                width: (style.width as number) - gap,
                height: (style.height as number) - gap,
            };

            if (!artwork && index >= artworks.length && hasMore) {
                return (
                    <div style={itemStyle}>
                        <ArtworkCardSkeleton />
                    </div>
                );
            }

            if (!artwork) return <div style={itemStyle} />;

            return (
                <div style={itemStyle}>
                    <ArtworkCard
                        artwork={artwork}
                        priority={index < columnsCount * 2}
                    />
                </div>
            );
        },
        [artworks, columnsCount, gap, hasMore]
    );

    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.scrollToItem({ align: 'start', columnIndex: 0, rowIndex: 0 });
        }
    }, [artworks.length]);

    return (
        <div className={className}>
            {title && (
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
            )}

            <div ref={containerRef} style={{ height }} className="w-full">
                {containerWidth > 0 && (
                    <InfiniteLoader
                        isItemLoaded={isItemLoaded}
                        itemCount={totalItemCount}
                        loadMoreItems={loadMoreItems}
                        threshold={8}
                        minimumBatchSize={columnsCount * 4}
                    >
                        {({ onItemsRendered, ref }) => (
                            <Grid
                                ref={(grid) => {
                                    gridRef.current = grid;
                                    if (typeof ref === 'function') {
                                        ref(grid);
                                    } else if (ref && typeof ref === 'object') {
                                        (ref as React.MutableRefObject<Grid | null>).current = grid;
                                    }
                                }}
                                columnCount={columnsCount}
                                rowCount={rowsCount}
                                columnWidth={itemWidth + gap}
                                rowHeight={itemHeight + gap}
                                height={height}
                                width={containerWidth}
                                overscanRowCount={4}
                                overscanColumnCount={2}
                                onItemsRendered={({
                                    visibleRowStartIndex,
                                    visibleRowStopIndex,
                                    visibleColumnStartIndex,
                                    visibleColumnStopIndex,
                                }) => {
                                    const startIndex = visibleRowStartIndex * columnsCount + visibleColumnStartIndex;
                                    const stopIndex = visibleRowStopIndex * columnsCount + visibleColumnStopIndex;

                                    onItemsRendered({
                                        overscanStartIndex: Math.max(0, startIndex - columnsCount),
                                        overscanStopIndex: Math.min(totalItemCount - 1, stopIndex + columnsCount),
                                        visibleStartIndex: startIndex,
                                        visibleStopIndex: stopIndex,
                                    });
                                }}
                            >
                                {ItemRenderer}
                            </Grid>
                        )}
                    </InfiniteLoader>
                )}
            </div>

            {loading && (
                <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
            )}

            {!loading && artworks.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                    <p className="text-muted-foreground">Please try a different search or check back later</p>
                </div>
            )}
        </div>
    );
};

// Infinite scroll grid (traditional approach)
interface InfiniteScrollGridProps extends ArtworkGridProps {
    hasMore?: boolean;
    loadMore?: () => void;
    loadingMore?: boolean;
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
    columns = { sm: 1, md: 2, lg: 3, xl: 4 }
}) => {
    const [isLoadingRef, setIsLoadingRef] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const gridCols = useMemo(() => {
        return {
            base: `grid-cols-${columns.sm || 1}`,
            md: `md:grid-cols-${columns.md || 2}`,
            lg: `lg:grid-cols-${columns.lg || 3}`,
            xl: `xl:grid-cols-${columns.xl || 4}`
        };
    }, [columns]);

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
                    <Button onClick={loadMore} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
            )}

            <div className={cn(
                "grid gap-4",
                gridCols.base,
                gridCols.md,
                gridCols.lg,
                gridCols.xl
            )}>
                {artworks.map((artwork, index) => (
                    <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        priority={index < 4}
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
                        <Button onClick={loadMore} variant="outline">
                            Load More
                        </Button>
                    )}
                </div>
            )}

            {!loading && artworks.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                    <p className="text-muted-foreground">Please try a different search or check back later</p>
                </div>
            )}
        </div>
    );
};