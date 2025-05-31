// app/page.tsx or pages/index.tsx
'use client';

import React, { useEffect } from 'react';
import { useHomeStore } from '@/stores/home/homeStore';
import { HeroSection } from './components/HeroSection';
import {
    StatsSection,
    FeaturedSection,
    NewestSection,
    RandomSection,
    CategoriesSection
} from './home-sections';
import { RecentViewedArtworks } from '@/components/RecentViewsArtwork';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';

// Loading component for initial page load
const HomePageSkeleton: React.FC = () => (
    <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero skeleton */}
        <Card>
            <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
                    <div className="p-8 space-y-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-2/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </CardContent>
        </Card>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6 text-center space-y-2">
                        <Skeleton className="h-8 w-8 mx-auto" />
                        <Skeleton className="h-8 w-16 mx-auto" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Section skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, j) => (
                        <Card key={j} className="overflow-hidden">
                            <Skeleton className="aspect-square w-full" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

// Error component for failed page load
const HomePageError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
                We couldn&#39;t load the artworks. Please check your connection and try again.
            </p>
            <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
            </Button>
        </div>
    </div>
);

// Main Home Page Component
const HomePage: React.FC = () => {
    const {
        isInitialLoading,
        lastUpdated,
        featuredError,
        newestError,
        randomError,
        categoriesError,
        fetchHomePageData,
        resetStore
    } = useHomeStore();

    // Check if there are any critical errors
    const hasCriticalError = featuredError || newestError || randomError || categoriesError;

    // Initialize data on component mount
    useEffect(() => {
        if (!lastUpdated) {
            fetchHomePageData();
        }
    }, [lastUpdated, fetchHomePageData]);

    // Handle page refresh
    const handleRefresh = () => {
        resetStore();
        fetchHomePageData();
    };

    // Show loading state on initial load or if we have no data yet
    if (isInitialLoading || !lastUpdated) {
        return <HomePageSkeleton />;
    }

    // Show error state if critical errors and no data
    if (hasCriticalError && !lastUpdated) {
        return <HomePageError onRetry={handleRefresh} />;
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/* Show error alerts if there are issues but we have some data */}
                {hasCriticalError && (
                    <Alert className="mb-8 border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Some sections may not be up to date due to connection issues.
                            <Button
                                variant="link"
                                className="h-auto p-0 ml-2 text-yellow-700 hover:text-yellow-800"
                                onClick={handleRefresh}
                            >
                                Try refreshing the page
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Hero Section */}
                <HeroSection />

                {/* Stats Section */}
                <StatsSection />

                {/* Featured This Week */}
                <FeaturedSection />

                {/* Just Added (with infinite scroll) */}
                <NewestSection />

                {/* Random Picks (with virtual scrolling) */}
                <RandomSection />

                {/* Explore by Style */}
                <CategoriesSection />
                {/* Recently Viewed Artworks */}
                <RecentViewedArtworks />            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;