'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search/searchStore';
import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { WishlistButton } from '@/components/WishlistButton';
import { Button } from '@/components/ui/Button';
import { AddToCartButton } from '@/components/addToCartButton';

const ArtworkCardSkeleton: React.FC = () => (
    <div className="break-inside-avoid bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="bg-gray-200 w-full h-80" />
        <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    </div>
);

const SearchResultsContent: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter(); const [currentQuery, setCurrentQuery] = useState('');

    const {
        searchResults,
        isLoadingResults,
        totalResults,
        hasMore,
        currentPage,
        searchArtworks,
        setQuery,
        clearSearch,
        error,
        isArtistDetected
    } = useSearchStore();

    const query = searchParams.get('q') || '';

    // Handle query changes (including when user types new search terms)
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
                {query && (
                    <div className="mb-6">                        <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Search Results for &quot;{query}&quot;
                        </h1>
                    </div>                        <p className="text-gray-600">
                            {isLoadingResults && searchResults.length === 0
                                ? 'Searching...'
                                : `${totalResults} ${totalResults === 1 ? 'artwork' : 'artworks'} found`}
                            {isArtistDetected && ' (showing artworks by this artist)'}
                        </p>
                    </div>
                )}

                {/* Dynamic Masonry Grid */}
                {searchResults.length > 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 mb-8">
                        {searchResults.map((artwork) => (
                            <div
                                key={artwork.id}
                                className="break-inside-avoid bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                            >
                                <Link href={`/artwork/${artwork.id}`}>
                                    <div className="relative w-full">
                                        <Image
                                            src={artwork.image_url || '/placeholder-artwork.jpg'}
                                            alt={artwork.title}
                                            width={600}
                                            height={400}
                                            layout="responsive"
                                            objectFit="cover"
                                            className="hover:scale-105 transition-transform duration-200"
                                        />
                                        {artwork.is_featured && (
                                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                                Featured
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <Link href={`/artwork/${artwork.id}`}>
                                        <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary transition-colors line-clamp-2">
                                            {artwork.title}
                                        </h3>
                                    </Link>

                                    {/* Artist info section - new addition */}
                                    {artwork.artist_name && (
                                        <div className="flex items-center mb-2">
                                            {artwork.artist_avatar && (
                                                <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                                    <Image
                                                        src={artwork.artist_avatar}
                                                        alt={artwork.artist_name}
                                                        width={24}
                                                        height={24}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <Link
                                                href={`/artist/${artwork.user_id}`}
                                                className="text-sm text-gray-600 hover:text-primary transition-colors"
                                            >
                                                {artwork.artist_name}
                                            </Link>
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-600 mb-2">
                                        {artwork.medium} • {artwork.art_category}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-bold text-gray-900">
                                            {artwork.artist_price ? (
                                                `${artwork.currency} ${artwork.artist_price.toLocaleString()}`
                                            ) : (
                                                'Price on request'
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                <WishlistButton artworkId={artwork.id} />
                                            </div>
                                            <AddToCartButton artworkId={artwork.id} showTitle={false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading Skeletons */}
                {isLoadingResults && searchResults.length === 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 mb-8">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <ArtworkCardSkeleton key={index} />
                        ))}
                    </div>
                )}

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
                            </h3>                            <p className="text-gray-600 mb-4">
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

                {/* Skeletons while loading more */}
                {isLoadingResults && searchResults.length > 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 mt-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <ArtworkCardSkeleton key={`loading-${index}`} />
                        ))}
                    </div>
                )}
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