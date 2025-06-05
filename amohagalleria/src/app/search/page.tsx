'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search/searchStore';
import { SearchFilter } from '@/components/search/SearchFilter';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CardGrid, ArtworkCard, LoadingMoreSkeletons } from '@/components/CardGrid';
import { FilterOptions } from '@/types/filter';

const SearchResultsContent: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentQuery, setCurrentQuery] = useState('');
    const [currentFilters, setCurrentFilters] = useState<Partial<FilterOptions>>({
        categories: [],
        mediums: [],
        locations: [],
        min_price: null,
        max_price: null,
        only_featured: false,
        sort_by: 'created_at_desc'
    });

    const {
        searchResults,
        isLoadingResults,
        totalResults,
        hasMore,
        currentPage,
        searchArtworks,
        searchWithFilters,
        setQuery,
        clearSearch,
        error,
        isArtistDetected
    } = useSearchStore();
    const query = searchParams.get('q') || '';

    const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
        setCurrentFilters(newFilters);
    };

    const handleApplyFilters = () => {
        if (query && query.trim()) {
            const filterOptions = {
                categories: currentFilters.categories || [],
                mediums: currentFilters.mediums || [],
                locations: currentFilters.locations || [],
                min_price: currentFilters.min_price,
                max_price: currentFilters.max_price,
                only_featured: currentFilters.only_featured || false,
                sort_by: currentFilters.sort_by || 'created_at_desc',
                status_filter: 'active,listed' as const
            };
            searchWithFilters(query, filterOptions, 1);
        }
    };

    useEffect(() => {
        if (query !== currentQuery) {
            setCurrentQuery(query);
            if (query && query.trim()) {
                setQuery(query);
                searchArtworks(query, 1);
            } else {
                clearSearch();
            }
        }
    }, [query, currentQuery, searchArtworks, setQuery, clearSearch]);

    const handleLoadMore = () => {
        if (hasMore && !isLoadingResults) {
            searchArtworks(query, currentPage + 1);
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Error</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filter Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-4">
                            <SearchFilter
                                onFiltersChange={handleFiltersChange}
                                onApplyFilters={handleApplyFilters}
                                currentFilters={currentFilters}
                                isLoading={isLoadingResults}
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:w-3/4">
                        {query && (
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Search Results for &quot;{query}&quot;
                                    </h1>
                                </div>
                                <p className="text-gray-600">
                                    {isLoadingResults && searchResults.length === 0
                                        ? 'Searching...'
                                        : `${totalResults} ${totalResults === 1 ? 'artwork' : 'artworks'} found`}
                                    {isArtistDetected && ' (showing artworks by this artist)'}
                                </p>
                            </div>
                        )}

                        {/* Artwork Grid using CardGrid component */}
                        <CardGrid
                            items={searchResults.map(item => ({
                                ...item,
                                image_url: item.image_url === null ? undefined : item.image_url,
                                artist_price: item.artist_price === null ? undefined : item.artist_price
                            }))}
                            isLoading={isLoadingResults && searchResults.length === 0}
                            skeletonCount={8}
                            columns={{ sm: 2, md: 2, lg: 3 }}
                            gap="gap-6 space-y-6 mb-8"
                            renderCard={(artwork) => <ArtworkCard artwork={artwork} />}
                        />

                        {/* No Results */}
                        {!isLoadingResults && searchResults.length === 0 && query && (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <div className="mb-4">
                                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                            <Eye size={24} className="text-gray-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        No artworks found
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        We couldn&apos;t find any artworks matching &quot;{query}&quot;. Try adjusting your search terms or browse our categories.
                                    </p>
                                    <div className="space-y-2">
                                        <Button onClick={() => router.push('/artworks')} variant="outline">
                                            Browse All Artworks
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Load More */}
                        {hasMore && searchResults.length > 0 && (
                            <div className="text-center">
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingResults}
                                    variant="outline"
                                    className="px-8"
                                >
                                    {isLoadingResults ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}

                        {/* Loading more skeletons */}
                        {isLoadingResults && searchResults.length > 0 && (
                            <LoadingMoreSkeletons count={4} columns={{ sm: 2, md: 2, lg: 3 }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SearchPage: React.FC = () => {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading search...</p>
                    </div>
                </div>
            }
        >
            <SearchResultsContent />
        </Suspense>
    );
};

export default SearchPage;