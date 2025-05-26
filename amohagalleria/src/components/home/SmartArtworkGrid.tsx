// components/ui/artwork-grid.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Eye, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Artwork } from '@/types';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface GridColumns {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

interface ArtworkCardProps {
    artwork: Artwork;
    className?: string;
    showActions?: boolean;
    priority?: boolean;
}

interface BaseGridProps {
    artworks: Artwork[];
    loading?: boolean;
    error?: string | null;
    title?: string;
    className?: string;
    columns?: GridColumns;
}

interface BasicArtworkGridProps extends BaseGridProps {
    showRefresh?: boolean;
    onRefresh?: () => void;
}

interface InfiniteScrollGridProps extends BaseGridProps {
    hasMore?: boolean;
    loadMore?: () => Promise<void>;
    loadingMore?: boolean;
}

interface VirtualArtworkGridProps {
    artworks: Artwork[];
    loading?: boolean;
    hasMore?: boolean;
    loadMore?: () => Promise<void>;
    title?: string;
    height?: number;
    itemWidth?: number;
    itemHeight?: number;
    gap?: number;
    className?: string;
}

interface SmartArtworkGridProps extends BaseGridProps {
    hasMore?: boolean;
    loadMore?: () => Promise<void>;
    loadingMore?: boolean;
    showRefresh?: boolean;
    onRefresh?: () => void;
    height?: number;
    itemWidth?: number;
    itemHeight?: number;
    gap?: number;
    smallThreshold?: number;
    largeThreshold?: number;
}

interface ItemRendererProps {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
}

interface DebugInfo {
    totalItems: number;
    gridType: string;
    thresholds: {
        small: string;
        medium: string;
        large: string;
    };
}

// Basic artwork card component
export const ArtworkCard: React.FC<ArtworkCardProps> = ({
    artwork,
    className,
    showActions = true,
    priority = false
}) => {
    const [imageLoading, setImageLoading] = useState<boolean>(true);
    const [imageError, setImageError] = useState<boolean>(false);

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

// 1. BASIC GRID - For small datasets (<100 items)
export const BasicArtworkGrid: React.FC<BasicArtworkGridProps> = ({
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
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Basic Grid • {artworks.length} items
                        </Badge>
                        {showRefresh && onRefresh && (
                            <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                                Refresh
                            </Button>
                        )}
                    </div>
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
                            priority={index < 4}
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

// 2. INFINITE SCROLL GRID - For medium datasets (100-1000 items)
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
    const [isLoadingRef, setIsLoadingRef] = useState<boolean>(false);

    const gridCols = useMemo(() => {
        const { sm = 1, md = 2, lg = 3, xl = 4 } = columns;
        return `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`;
    }, [columns]);

    const loadMoreRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading || loadingMore || !hasMore || !loadMore || isLoadingRef) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !isLoadingRef) {
                        setIsLoadingRef(true);
                        loadMore().finally(() => {
                            setIsLoadingRef(false);
                        });
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: '100px'
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
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <Badge variant="outline" className="text-xs">
                        Infinite Scroll • {artworks.length} items
                    </Badge>
                </div>
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

            {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                    {(loadingMore || isLoadingRef) ? (
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading more...</span>
                        </div>
                    ) : loadMore && (
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

// 3. VIRTUAL GRID - For large datasets (1000+ items)
export const VirtualArtworkGrid: React.FC<VirtualArtworkGridProps> = ({
    artworks,
    loading = false,
    hasMore = false,
    loadMore,
    title,
    height = 600,
    itemWidth = 280,
    itemHeight = 380,
    gap = 16,
    className
}) => {
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<Grid>(null);
    const loadingRef = useRef<boolean>(false);

    // Debounced resize observer to prevent excessive re-renders
    useEffect(() => {
        if (!containerRef.current) return;

        let timeoutId: NodeJS.Timeout;
        const resizeObserver = new ResizeObserver((entries) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    if (width > 0 && Math.abs(width - containerWidth) > 10) {
                        setContainerWidth(width);
                    }
                }
            }, 100); // Debounce resize events
        });

        resizeObserver.observe(containerRef.current);

        // Set initial width
        const initialWidth = containerRef.current.offsetWidth;
        if (initialWidth > 0) {
            setContainerWidth(initialWidth);
        }

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [containerWidth]);

    // Memoized grid calculations with improved sizing
    const gridCalculations = useMemo(() => {
        if (containerWidth <= 0) {
            return { columnsCount: 1, rowsCount: 0, totalItemCount: 0, columnWidth: itemWidth, rowHeight: itemHeight };
        }

        const availableWidth = containerWidth - gap;
        const cols = Math.max(1, Math.floor(availableWidth / (itemWidth + gap)));
        const actualColumnWidth = Math.floor((availableWidth - (cols - 1) * gap) / cols);

        // Calculate total items including placeholder items for loading
        const placeholderItems = hasMore ? Math.min(cols * 2, 10) : 0;
        const totalItems = artworks.length + placeholderItems;
        const rows = Math.ceil(totalItems / cols);

        return {
            columnsCount: cols,
            rowsCount: rows,
            totalItemCount: totalItems,
            columnWidth: actualColumnWidth,
            rowHeight: itemHeight + gap
        };
    }, [containerWidth, gap, itemWidth, itemHeight, artworks.length, hasMore]);

    const { columnsCount, rowsCount, totalItemCount, } = gridCalculations;

    // Optimized item loaded check
    const isItemLoaded = useCallback(
        (index: number): boolean => {
            return index < artworks.length;
        },
        [artworks.length]
    );

    // Improved load more function with proper throttling
    const loadMoreItems = useCallback(
        async (startIndex: number): Promise<void> => {
            if (!loadMore || !hasMore || loading || loadingRef.current || isLoadingMore) {
                return;
            }

            const needsLoading = startIndex >= artworks.length - columnsCount * 2;
            if (!needsLoading) return;

            try {
                loadingRef.current = true;
                setIsLoadingMore(true);
                await loadMore();
            } catch (error) {
                console.error('Error loading more items:', error);
            } finally {
                loadingRef.current = false;
                setIsLoadingMore(false);
            }
        },
        [loadMore, hasMore, loading, artworks.length, columnsCount, isLoadingMore]
    );

    // Memoized item renderer for better performance
    const ItemRenderer = useCallback(
        ({ columnIndex, rowIndex, style }: ItemRendererProps) => {
            const index = rowIndex * columnsCount + columnIndex;
            const artwork = artworks[index];

            // Improved styling calculation
            const itemStyle: React.CSSProperties = {
                ...style,
                padding: `${gap / 2}px`,
                boxSizing: 'border-box',
            };

            const contentStyle: React.CSSProperties = {
                width: '100%',
                height: `${itemHeight}px`,
            };

            // Show skeleton for loading items
            if (!artwork && index >= artworks.length && hasMore) {
                return (
                    <div style={itemStyle}>
                        <div style={contentStyle}>
                            <ArtworkCardSkeleton />
                        </div>
                    </div>
                );
            }

            // Empty cell for out of bounds items
            if (!artwork) {
                return <div style={itemStyle} />;
            }

            return (
                <div style={itemStyle}>
                    <div style={contentStyle}>
                        <ArtworkCard
                            artwork={artwork}
                            priority={index < columnsCount * 3} // Increase priority range
                            className="h-full"
                        />
                    </div>
                </div>
            );
        },
        [artworks, columnsCount, gap, hasMore, itemHeight]
    );

    // Reset scroll position when artworks change significantly
    useEffect(() => {
        if (gridRef.current && artworks.length === 0) {
            gridRef.current.scrollToItem({ align: 'start', columnIndex: 0, rowIndex: 0 });
        }
    }, [artworks.length]);

    return (
        <div className={className}>
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <Badge variant="outline" className="text-xs">
                        Virtual Grid • {artworks.length} items
                    </Badge>
                </div>
            )}

            <div ref={containerRef} style={{ height }} className="w-full">
                {containerWidth > 0 && (
                    <InfiniteLoader
                        isItemLoaded={isItemLoaded}
                        itemCount={totalItemCount}
                        loadMoreItems={loadMoreItems}
                        threshold={5}
                        minimumBatchSize={columnsCount * 2}
                    >
                        {({ onItemsRendered, ref }) => (
                            <Grid
                                ref={(grid) => {
                                    gridRef.current = grid;
                                    if (typeof ref === 'function') {
                                        ref(grid);
                                    } else if (ref) {
                                        (ref as React.MutableRefObject<Grid | null>).current = grid;
                                    }
                                }}
                                columnCount={columnsCount}
                                rowCount={rowsCount}
                                columnWidth={itemWidth + gap}
                                rowHeight={itemHeight + gap}
                                height={height}
                                width={containerWidth}
                                overscanRowCount={3}
                                overscanColumnCount={2}
                                onItemsRendered={({
                                    visibleRowStartIndex,
                                    visibleRowStopIndex,
                                }) => {
                                    const startIndex = visibleRowStartIndex * columnsCount;
                                    const stopIndex = visibleRowStopIndex * columnsCount + columnsCount - 1;

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

            {(loading || isLoadingMore) && (
                <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin" />
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

// 4. SMART ARTWORK GRID - Automatically chooses the right grid based on data size
export const SmartArtworkGrid: React.FC<SmartArtworkGridProps> = ({
    artworks = [],
    loading = false,
    error,
    title,
    hasMore = false,
    loadMore,
    loadingMore = false,
    showRefresh = false,
    onRefresh,
    className,
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    // Virtual grid specific props
    height = 600,
    itemWidth = 280,
    itemHeight = 380,
    gap = 16,
    // Thresholds for switching between grid types
    smallThreshold = 100,
    largeThreshold = 1000
}) => {
    const totalItems = artworks.length;

    // Determine which grid to use based on data size
    const gridType = useMemo(() => {
        if (totalItems >= largeThreshold) {
            return 'virtual';
        } else if (totalItems >= smallThreshold) {
            return 'infinite';
        } else {
            return 'basic';
        }
    }, [totalItems, smallThreshold, largeThreshold]);

    // Show debug info in development
    const debugInfo: DebugInfo = useMemo(() => {
        return {
            totalItems,
            gridType,
            thresholds: {
                small: `< ${smallThreshold}`,
                medium: `${smallThreshold} - ${largeThreshold}`,
                large: `> ${largeThreshold}`
            }
        };
    }, [totalItems, gridType, smallThreshold, largeThreshold]);

    console.log('SmartArtworkGrid Debug:', debugInfo);

    const commonProps = {
        artworks,
        loading,
        error,
        title,
        className,
        columns
    };

    // Render appropriate grid based on data size
    switch (gridType) {
        case 'virtual':
            return (
                <VirtualArtworkGrid
                    {...commonProps}
                    hasMore={hasMore}
                    loadMore={loadMore}
                    height={height}
                    itemWidth={itemWidth}
                    itemHeight={itemHeight}
                    gap={gap}
                />
            );

        case 'infinite':
            return (
                <InfiniteScrollGrid
                    {...commonProps}
                    hasMore={hasMore}
                    loadMore={loadMore}
                    loadingMore={loadingMore}
                />
            );

        case 'basic':
        default:
            return (
                <BasicArtworkGrid
                    {...commonProps}
                    showRefresh={showRefresh}
                    onRefresh={onRefresh}
                />
            );
    }
};

// Main export - Use this component in your app
export default SmartArtworkGrid;