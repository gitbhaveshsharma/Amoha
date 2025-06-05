// pages/browse/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useFilterStore } from "@/stores/filter/filterStore";
import { CardGrid, ArtworkCard, LoadingMoreSkeletons } from "@/components/CardGrid";
import { Button } from "@/components/ui/Button";

export default function BrowseResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        filters,
        filteredResults,
        isLoading,
        error,
        totalResults,
        hasMore,
        applyFilters,
        loadMoreResults,
        fetchFilterOptions,
    } = useFilterStore();

    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    useEffect(() => {
        const category = searchParams.get('category');
        const medium = searchParams.get('medium');

        const newFilters: { categories?: string[]; mediums?: string[] } = {};
        if (category) {
            newFilters.categories = [category];
        }
        if (medium) {
            newFilters.mediums = [medium];
        }

        applyFilters();
    }, [searchParams, applyFilters]);

    const getPageTitle = () => {
        if (filters.categories.length > 0) {
            return `${filters.categories[0]} Artworks`;
        }
        if (filters.mediums.length > 0) {
            return `${filters.mediums[0]} Artworks`;
        }
        return "Browse Artworks";
    };

    if (error) {
        return (
            <div className="container py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-medium text-gray-900">Error loading results</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <Button
                        onClick={() => applyFilters()}
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {getPageTitle()}
                    </h1>
                    {totalResults > 0 && (
                        <p className="text-gray-600 mt-1">
                            {totalResults} {totalResults === 1 ? "result" : "results"}
                        </p>
                    )}
                </div>

                {/* Main Content */}
                {filteredResults.length > 0 ? (
                    <>
                        {/* CardGrid for Artworks */}
                        <CardGrid
                            items={filteredResults}
                            isLoading={isLoading && filteredResults.length === 0}
                            skeletonCount={8}
                            columns={{ sm: 2, md: 3, lg: 4 }}
                            gap="gap-6 space-y-6"
                            renderCard={(artwork) => <ArtworkCard artwork={artwork} />}
                            className="mb-8"
                        />

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mb-8">
                                <Button
                                    onClick={loadMoreResults}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="min-w-40 px-8"
                                >
                                    {isLoading ? "Loading..." : "Load More"}
                                </Button>
                            </div>
                        )}

                        {/* Loading More Skeletons */}
                        {isLoading && filteredResults.length > 0 && (
                            <LoadingMoreSkeletons
                                count={4}
                                columns={{ sm: 2, md: 3, lg: 4 }}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {/* Initial Loading State */}
                        {isLoading ? (
                            <CardGrid
                                items={[]}
                                isLoading={true}
                                skeletonCount={8}
                                columns={{ sm: 2, md: 3, lg: 4 }}
                                gap="gap-6 space-y-6"
                                renderCard={() => null}
                            />
                        ) : (
                            /* No Results State */
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <div className="mb-4">
                                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        No results found
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        Try adjusting your filters or search criteria to find what you&#39;re looking for.
                                    </p>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => router.push('/artworks')}
                                            variant="outline"
                                        >
                                            Browse All Artworks
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}