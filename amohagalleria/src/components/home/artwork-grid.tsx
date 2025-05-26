// components/ui/artwork-grid.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import type { GridChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Eye, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Artwork } from '@/types';
import { cn } from '@/lib/utils';

// Basic artwork card component
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

    return (
        <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-lg", className)}>
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
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                        <div className="text-center text-muted-foreground">
                            <div className="text-4xl mb-2">🎨</div>
                            <p className="text-sm">No Image</p>
                        </div>
                    </div>
                )}

                {/* Actions overlay */}
                {showActions && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Heart className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                <Share2 className="h-4 w-4" />
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

            <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{artwork.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{artwork.description}</p>

                <div className="flex items-center justify-between">
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
    );
};

// Loading skeleton card
export const ArtworkCardSkeleton: React.FC = () => (
    <Card className="overflow-hidden">
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

// Standard grid component
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
        const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;
        return `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`;
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
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    {showRefresh && onRefresh && (
                        <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            Refresh
                        </Button>
                    )}
                </div>
            )}

            <div className={cn("grid gap-4", gridCols)}>
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <ArtworkCardSkeleton key={`skeleton-${i}`} />
                    ))
                ) : (
                    artworks.map((artwork, index) => (
                        <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            priority={index < 4} // Priority loading for first 4 images
                        />
                    ))
                )}
            </div>

            {!loading && artworks.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                    <p className="text-muted-foreground">Check back later for new additions</p>
                </div>
            )}
        </div>
    );
};

// Virtual scrolling grid for large datasets - FIXED VERSION
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

    // Use ResizeObserver for better performance
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

    // Calculate columns and rows - memoized to prevent unnecessary recalculations
    const { columnsCount, rowsCount, totalItemCount } = useMemo(() => {
        const cols = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
        const totalItems = artworks.length + (hasMore ? cols : 0); // Add placeholder items for loading
        const rows = Math.ceil(totalItems / cols);

        return {
            columnsCount: cols,
            rowsCount: rows,
            totalItemCount: totalItems
        };
    }, [containerWidth, gap, itemWidth, artworks.length, hasMore]);

    // Check if item is loaded
    const isItemLoaded = useCallback(
        (index: number) => {
            return index < artworks.length;
        },
        [artworks.length]
    );

    // Load more items - debounced to prevent multiple calls
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

    // Memoized item renderer to prevent unnecessary re-renders
    const ItemRenderer = useCallback(
        ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
            const index = rowIndex * columnsCount + columnIndex;
            const artwork = artworks[index];

            // Apply padding inside the style to prevent layout shifts
            const itemStyle = {
                ...style,
                left: (style.left as number) + gap / 2,
                top: (style.top as number) + gap / 2,
                width: (style.width as number) - gap,
                height: (style.height as number) - gap,
            };

            // Show skeleton for loading items
            if (!artwork && index >= artworks.length && hasMore) {
                return (
                    <div style={itemStyle}>
                        <ArtworkCardSkeleton />
                    </div>
                );
            }

            // Don't render anything for empty slots beyond available items
            if (!artwork) {
                return <div style={itemStyle} />;
            }

            return (
                <div style={itemStyle}>
                    <ArtworkCard
                        artwork={artwork}
                        priority={index < columnsCount * 2} // Priority for first 2 rows
                    />
                </div>
            );
        },
        [artworks, columnsCount, gap, hasMore]
    );

    // Reset grid position when artworks change
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
                        threshold={8} // Start loading when 8 items away from the end
                        minimumBatchSize={columnsCount * 4} // Load at least 4 rows at a time
                    >
                        {({
                            onItemsRendered,
                            ref,
                        }: {
                            onItemsRendered: (params: {
                                overscanStartIndex: number;
                                overscanStopIndex: number;
                                visibleStartIndex: number;
                                visibleStopIndex: number;
                            }) => void;
                            ref: React.Ref<Grid>;
                        }) => (
                            <Grid
                                ref={(grid) => {
                                    gridRef.current = grid;
                                    if (typeof ref === 'function') {
                                        ref(grid);
                                    } else if (ref && typeof ref === 'object' && 'current' in ref) {
                                        (ref as React.MutableRefObject<Grid | null>).current = grid;
                                    }
                                }}
                                columnCount={columnsCount}
                                rowCount={rowsCount}
                                columnWidth={itemWidth + gap}
                                rowHeight={itemHeight + gap}
                                height={height}
                                width={containerWidth}
                                overscanRowCount={4} // Render 2 extra rows for smoother scrolling
                                overscanColumnCount={2}
                                onItemsRendered={({
                                    visibleRowStartIndex,
                                    visibleRowStopIndex,
                                    visibleColumnStartIndex,
                                    visibleColumnStopIndex,
                                }) => {
                                    // Convert grid indices to list indices for InfiniteLoader
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

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
            )}
        </div>
    );
};

// Infinite scroll grid (traditional approach) - Also optimized
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

    const gridCols = useMemo(() => {
        const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;
        return `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`;
    }, [columns]);

    // Optimized intersection observer with debouncing
    const loadMoreRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading || loadingMore || !hasMore || !loadMore || isLoadingRef) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !isLoadingRef) {
                        setIsLoadingRef(true);
                        const maybePromise = loadMore();
                        if (
                            typeof maybePromise !== 'undefined' &&
                            typeof (maybePromise as Promise<unknown>).finally === 'function'
                        ) {
                            (maybePromise as Promise<unknown>).finally(() => {
                                setIsLoadingRef(false);
                            });
                        } else {
                            setIsLoadingRef(false);
                        }
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: '100px' // Start loading 100px before the element is visible
                }
            );

            if (node) observer.observe(node);

            return () => {
                if (node) observer.unobserve(node);
            };
        },
        [loading, loadingMore, hasMore, loadMore, isLoadingRef]
    );

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
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
            )}

            <div className={cn("grid gap-4", gridCols)}>
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

            {/* Load more trigger */}
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
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                    <p className="text-muted-foreground">Check back later for new additions</p>
                </div>
            )}
        </div>
    );
};