//components/CardGrid.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WishlistButton } from '@/components/WishlistButton';
import { AddToCartButton } from '@/components/addToCartButton';

// Types
export interface BaseCardItem {
    id: string;
    title: string;
    image_url?: string;
}

export interface ArtworkCardItem extends BaseCardItem {
    artist_name?: string;
    artist_avatar?: string;
    user_id?: string;
    medium?: string;
    art_category?: string;
    artist_price?: number;
    currency?: string;
    is_featured?: boolean;
}

export interface CardGridProps<T extends BaseCardItem> {
    items: T[];
    isLoading?: boolean;
    skeletonCount?: number;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
    };
    gap?: string;
    renderCard: (item: T) => React.ReactNode;
    className?: string;
}

export interface CardSkeletonProps {
    className?: string;
}

// Card Skeleton Component
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ className = "" }) => (
    <div className={`break-inside-avoid bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
        <div className="bg-gray-200 w-full h-80" />
        <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    </div>
);

// Generic Card Grid Component
export const CardGrid = <T extends BaseCardItem>({
    items,
    isLoading = false,
    skeletonCount = 8,
    columns = { sm: 2, md: 2, lg: 3 },
    gap = "gap-6 space-y-6",
    renderCard,
    className = ""
}: CardGridProps<T>) => {
    const getColumnsClass = () => {
        const { sm = 1, md = 2, lg = 3 } = columns;
        return `columns-1 sm:columns-${sm} md:columns-${md} lg:columns-${lg}`;
    };

    if (isLoading && items.length === 0) {
        return (
            <div className={`${getColumnsClass()} ${gap} ${className}`}>
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <CardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <div className={`${getColumnsClass()} ${gap} ${className}`}>
            {items.map((item) => (
                <div key={item.id} className="break-inside-avoid">
                    {renderCard(item)}
                </div>
            ))}
        </div>
    );
};

// Artwork Card Component (extracted from your original code)
export const ArtworkCard: React.FC<{ artwork: ArtworkCardItem }> = ({ artwork }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
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

            {/* Artist info section */}
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
);

// Loading More Skeletons Component
export const LoadingMoreSkeletons: React.FC<{
    count?: number;
    columns?: { sm?: number; md?: number; lg?: number };
}> = ({ count = 4, columns = { sm: 2, md: 2, lg: 3 } }) => {
    const getColumnsClass = () => {
        const { sm = 1, md = 2, lg = 3 } = columns;
        return `columns-1 sm:columns-${sm} md:columns-${md} lg:columns-${lg}`;
    };

    return (
        <div className={`${getColumnsClass()} gap-6 space-y-6 mt-6`}>
            {Array.from({ length: count }).map((_, index) => (
                <CardSkeleton key={`loading-more-${index}`} />
            ))}
        </div>
    );
};
