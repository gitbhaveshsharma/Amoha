import React, { useState, memo } from 'react';
import Image from 'next/image';
import { Eye, Share2, ExternalLink, Palette } from 'lucide-react';
import { Artwork } from '@/types';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from '@/components/WishlistButton';

interface ArtworkCardProps {
    artwork: Artwork;
    className?: string;
    showActions?: boolean;
    priority?: boolean;
}

export const ArtworkCard = memo(function ArtworkCard({
    artwork,
    className = "",
    showActions = true,
    priority = false
}: ArtworkCardProps) {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const artworkUrl = `/artwork/${artwork.id}`;

    const handleActionClick = (e: React.MouseEvent, action: string) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`${action} clicked for artwork:`, artwork.id);
    };

    return (
        <a href={artworkUrl} className={`block h-full group ${className}`}>
            <div className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer hover:border-primary/30 border border-gray-200 rounded-lg">
                <div className="relative aspect-square overflow-hidden">
                    {imageLoading && (
                        <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse"></div>
                    )}
                    {!imageError && artwork.image_url ? (
                        <Image
                            src={artwork.image_url}
                            alt={artwork.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className={`object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 ${imageLoading ? "opacity-0" : "opacity-100"
                                }`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                                setImageError(true);
                                setImageLoading(false);
                            }}
                            priority={priority}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                            <div className="text-center text-gray-500">
                                <Palette className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-sm">Image not available</p>
                            </div>
                        </div>
                    )}

                    {/* Actions overlay */}
                    {showActions && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center"
                                    onClick={(e) => handleActionClick(e, 'view')}
                                    title="Quick View"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>

                                {/* <WishlistButton artworkId={artwork.id} /> */}

                                <button
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center"
                                    onClick={(e) => handleActionClick(e, 'share')}
                                    title="Share"
                                >
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </div>

                            {/* View Details Button */}
                            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    className="w-full py-1 px-3 bg-white/90 hover:bg-white text-gray-800 rounded text-sm font-medium flex items-center justify-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.location.href = artworkUrl;
                                    }}
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    )}

                    {artwork.is_featured && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                Featured
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {artwork.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {artwork.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <Badge variant="secondary" className="text-sm font-medium">
                                {artwork.art_category}
                            </Badge>
                            <span className="text-xs text-gray-500 mt-1">{artwork.medium}</span>
                        </div>

                        {artwork.artist_price && (
                            <div className="text-right">
                                <p className="text-sm font-semibold">
                                    {artwork.currency} {artwork.artist_price}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </a>
    );
});

export const ArtworkCardSkeleton: React.FC = () => (
    <div className="overflow-hidden h-full rounded-lg border border-gray-200">
        <div className="aspect-square bg-gray-200 animate-pulse"></div>
        <div className="p-4">
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-3 w-full bg-gray-200 rounded mb-1 animate-pulse"></div>
            <div className="h-3 w-2/3 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div className="flex justify-between">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);