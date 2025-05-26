
// components/home/sections.tsx
import React from 'react';
import { useHomeStore } from '@/stores/home/homeStore';
import {
    ArtworkGrid,
    InfiniteScrollGrid,
    VirtualArtworkGrid
} from './artwork-grid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Sparkles, Clock, Shuffle, Grid3X3 } from 'lucide-react';

// Featured This Week Section
export const FeaturedSection: React.FC = () => {
    const {
        featuredArtworks,
        featuredLoading,
        featuredError,
        fetchFeaturedArtworks
    } = useHomeStore();

    return (
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <h2 className="text-3xl font-bold">Featured This Week</h2>
                <Badge variant="secondary" className="ml-2">
                    {featuredArtworks.length}
                </Badge>
            </div>

            <ArtworkGrid
                artworks={featuredArtworks}
                loading={featuredLoading}
                error={featuredError}
                onRefresh={fetchFeaturedArtworks}
                showRefresh
                columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                className="mb-8"
            />

            {featuredArtworks.length > 0 && (
                <div className="text-center">
                    <Button variant="outline" className="group">
                        View All Featured
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            )}
        </section>
    );
};

// Just Added Section with Infinite Scroll
export const NewestSection: React.FC = () => {
    const {
        newestArtworks,
        newestLoading,
        newestError,
        newestPagination,
        loadMoreNewest
    } = useHomeStore();

    const handleLoadMore = () => {
        if (!newestLoading && newestPagination.hasMore) {
            loadMoreNewest();
        }
    };

    return (
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-blue-500" />
                <h2 className="text-3xl font-bold">Just Added</h2>
                <Badge variant="secondary" className="ml-2">
                    {newestPagination.totalCount}
                </Badge>
            </div>

            <InfiniteScrollGrid
                artworks={newestArtworks}
                loading={newestLoading && newestArtworks.length === 0}
                loadingMore={newestLoading && newestArtworks.length > 0}
                error={newestError}
                hasMore={newestPagination.hasMore}
                loadMore={handleLoadMore}
                columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
            />
        </section>
    );
};

// Virtual Scrolling Section for Random Picks
export const RandomSection: React.FC = () => {
    const {
        randomArtworks,
        randomLoading,
        refreshRandomSeed
    } = useHomeStore();

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Shuffle className="h-6 w-6 text-purple-500" />
                    <h2 className="text-3xl font-bold">Random Picks</h2>
                    <Badge variant="secondary" className="ml-2">
                        {randomArtworks.length}
                    </Badge>
                </div>

                <Button
                    onClick={refreshRandomSeed}
                    variant="outline"
                    size="sm"
                    disabled={randomLoading}
                >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle
                </Button>
            </div>

            <Card className="p-4">
                <VirtualArtworkGrid
                    artworks={randomArtworks}
                    loading={randomLoading}
                    title="Discover Something New"
                    height={500}
                    itemWidth={250}
                    itemHeight={320}
                />
            </Card>
        </section>
    );
};

// Explore by Style Section
export const CategoriesSection: React.FC = () => {
    const {
        categories,
        categoryArtworks,
        categoriesLoading,
        categoriesError,
        fetchCategoriesAndArtworks
    } = useHomeStore();

    return (
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Grid3X3 className="h-6 w-6 text-green-500" />
                <h2 className="text-3xl font-bold">Explore by Style</h2>
            </div>

            {categoriesError ? (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{categoriesError}</p>
                    <Button onClick={fetchCategoriesAndArtworks} variant="outline">
                        Try Again
                    </Button>
                </div>
            ) : (
                <Tabs defaultValue={categories[0]} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
                        {categories.map((category) => (
                            <TabsTrigger key={category} value={category} className="capitalize">
                                {category}
                                <Badge variant="outline" className="ml-2 text-xs">
                                    {categoryArtworks[category]?.length || 0}
                                </Badge>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {categories.map((category) => (
                        <TabsContent key={category} value={category}>
                            <ArtworkGrid
                                artworks={categoryArtworks[category] || []}
                                loading={categoriesLoading}
                                columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                            />

                            {categoryArtworks[category]?.length > 0 && (
                                <div className="text-center mt-6">
                                    <Button variant="outline" className="group">
                                        View All {category}
                                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </section>
    );
};

// Hero section with featured artwork
export const HeroSection: React.FC = () => {
    const { featuredArtworks } = useHomeStore();
    const heroArtwork = featuredArtworks[0];

    if (!heroArtwork) return null;

    return (
        <section className="mb-12">
            <Card className="relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
                        <div className="p-8">
                            <Badge className="mb-4 bg-yellow-500 hover:bg-yellow-600">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Featured Artwork
                            </Badge>

                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {heroArtwork.title}
                            </h1>

                            <p className="text-lg text-muted-foreground mb-6 line-clamp-3">
                                {heroArtwork.description}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <Badge variant="outline" className="text-sm">
                                    {heroArtwork.art_category}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    {heroArtwork.medium}
                                </Badge>
                                {heroArtwork.artist_price && (
                                    <Badge variant="outline" className="text-sm">
                                        {heroArtwork.currency} {heroArtwork.artist_price}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button size="lg" className="group">
                                    View Details
                                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button variant="outline" size="lg">
                                    Add to Favorites
                                </Button>
                            </div>
                        </div>

                        <div className="relative aspect-square md:aspect-auto md:h-[400px]">
                            {heroArtwork.image_url && (
                                <img
                                    src={heroArtwork.image_url}
                                    alt={heroArtwork.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};

// Stats section
export const StatsSection: React.FC = () => {
    const {
        featuredArtworks,
        newestPagination,
        randomArtworks,
        categories
    } = useHomeStore();

    const stats = [
        {
            label: 'Featured Artworks',
            value: featuredArtworks.length,
            icon: Sparkles,
            color: 'text-yellow-500'
        },
        {
            label: 'Total Artworks',
            value: newestPagination.totalCount,
            icon: Grid3X3,
            color: 'text-blue-500'
        },
        {
            label: 'Categories',
            value: categories.length,
            icon: Grid3X3,
            color: 'text-green-500'
        },
        {
            label: 'Random Picks',
            value: randomArtworks.length,
            icon: Shuffle,
            color: 'text-purple-500'
        }
    ];

    return (
        <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6 text-center">
                            <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                            <div className="text-2xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
};