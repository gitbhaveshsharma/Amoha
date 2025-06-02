import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import type { GridChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { RefreshCw } from 'lucide-react';
import { ArtworkCard, ArtworkCardSkeleton } from './ArtworkCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { Artwork } from '@/types';

interface VirtualArtworkGridProps {
    artworks: Artwork[];
    loading?: boolean;
    hasMore?: boolean;
    loadMore?: () => void;
    title?: string;
    height?: number;
    className?: string;
}

export const VirtualArtworkGrid: React.FC<VirtualArtworkGridProps> = ({
    artworks,
    loading = false,
    hasMore = false,
    loadMore,
    title,
    height = 800,
    className
}) => {
    // Quick View Modal state
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

    const [containerWidth, setContainerWidth] = useState(1200);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<FixedSizeGrid>(null);

    const calculateGridDimensions = useCallback((width: number) => {
        const gap = 16;
        let columns = 4;
        let itemWidth = 280;

        if (width < 640) {
            columns = 2;
            const mobileGap = 12;
            itemWidth = (width - ((columns + 1) * mobileGap)) / columns;
        } else if (width < 768) {
            columns = 2;
            itemWidth = (width - ((columns + 1) * gap)) / columns;
        } else if (width < 1024) {
            columns = 3;
            itemWidth = (width - ((columns + 1) * gap)) / columns;
        } else {
            itemWidth = (width - ((columns + 1) * gap)) / columns;
        }

        const itemHeight = itemWidth + 160;
        return { columns, itemWidth, itemHeight, gap };
    }, []); const [gridDimensions, setGridDimensions] = useState(() =>
        calculateGridDimensions(containerWidth)
    );

    const handleQuickView = useCallback((artwork: Artwork) => {
        setSelectedArtwork(artwork);
        setQuickViewOpen(true);
    }, []);

    const handleCloseQuickView = useCallback(() => {
        setQuickViewOpen(false);
        setSelectedArtwork(null);
    }, []); useEffect(() => {
        if (!containerRef.current) return;

        const currentContainer = containerRef.current;

        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.getBoundingClientRect().width;
                setContainerWidth(width);
                setGridDimensions(calculateGridDimensions(width));
            }
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(currentContainer);

        return () => {
            if (currentContainer) {
                resizeObserver.unobserve(currentContainer);
            }
            resizeObserver.disconnect();
        };
    }, [calculateGridDimensions]);

    const { columnsCount, rowsCount, totalItemCount } = useMemo(() => {
        const { columns } = gridDimensions;
        const totalItems = artworks.length + (hasMore ? columns : 0);
        const rows = Math.ceil(totalItems / columns);

        return {
            columnsCount: columns,
            rowsCount: rows,
            totalItemCount: totalItems
        };
    }, [gridDimensions, artworks.length, hasMore]);

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
            const { gap } = gridDimensions;
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

            if (!artwork) return <div style={itemStyle} />; return (
                <div style={itemStyle}>
                    <ArtworkCard
                        artwork={artwork}
                        priority={index < columnsCount * 2}
                        onQuickView={handleQuickView}
                    />
                </div>
            );
        },
        [artworks, columnsCount, gridDimensions, hasMore, handleQuickView]
    );

    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.scrollToItem({ align: 'start', columnIndex: 0, rowIndex: 0 });
        }
    }, [artworks.length]);

    return (
        <div className={className}>
            {title && (
                <h2 className="text-xl sm:text-2xl font-bold mb-6">{title}</h2>
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
                            <FixedSizeGrid
                                ref={(grid) => {
                                    gridRef.current = grid;
                                    if (typeof ref === 'function') {
                                        ref(grid);
                                    } else if (ref && typeof ref === 'object') {
                                        (ref as React.MutableRefObject<FixedSizeGrid | null>).current = grid;
                                    }
                                }}
                                columnCount={columnsCount}
                                rowCount={rowsCount}
                                columnWidth={gridDimensions.itemWidth + gridDimensions.gap}
                                rowHeight={gridDimensions.itemHeight + gridDimensions.gap}
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
                            </FixedSizeGrid>
                        )}
                    </InfiniteLoader>
                )}
            </div>

            {loading && (
                <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin" />
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