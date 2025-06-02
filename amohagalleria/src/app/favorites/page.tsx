// app/favorites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/stores/wishlist';
import { ArtworkService } from '@/stores/view-artwork/viewArtworkService';
import { Artwork } from '@/types';
import { ProfileData } from '@/types/profile';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Share2, ExternalLink, Palette } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { QuickViewModal } from '@/components/QuickViewModal';

interface WishlistArtwork {
    artwork: Artwork;
    artist: ProfileData | null;
    images: string[];
}

const FavoriteArtworkCard = ({ artwork, artist, images, onRemove, onQuickView }: {
    artwork: Artwork;
    artist: ProfileData | null;
    images: string[];
    onRemove: (artworkId: string) => void;
    onQuickView: (artwork: Artwork, artist: ProfileData | null, images: string[]) => void;
}) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const artworkUrl = `/artwork/${artwork.id}`;

    const handleActionClick = (e: React.MouseEvent, action: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (action === 'view') {
            onQuickView(artwork, artist, images);
        } else {
            console.log(`${action} clicked for artwork:`, artwork.id);
        }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(artwork.id);
    };

    return (
        <a href={artworkUrl} className="block h-full group">
            <div className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer hover:border-primary/30 border border-gray-200 rounded-lg">
                <div className="relative aspect-square overflow-hidden">
                    {imageLoading && (
                        <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse"></div>
                    )}
                    {!imageError && (images[0] || artwork.image_url) ? (
                        <Image
                            src={images[0] || artwork.image_url || '/placeholder-artwork.jpg'}
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
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center"
                                onClick={(e) => handleActionClick(e, 'view')}
                                title="Quick View"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full flex items-center justify-center"
                                onClick={handleRemoveClick}
                                title="Remove from favorites"
                            >
                                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            </button>
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
                    {artist && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                            by {artist.name}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {artwork.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                            <Badge variant="secondary" className="text-sm font-medium">
                                {artwork.art_category?.replace('_', ' ')}
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
};

export default function FavoritesPage() {
    const { wishlist, isLoading, fetchWishlist, toggleWishlistItem } = useWishlistStore();
    const [wishlistArtworks, setWishlistArtworks] = useState<WishlistArtwork[]>([]);
    const [fetchingArtworks, setFetchingArtworks] = useState(false);

    // Quick View Modal state
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<{
        artwork: Artwork;
        artist: ProfileData | null;
        images: string[];
    } | null>(null);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    useEffect(() => {
        const fetchArtworkDetails = async () => {
            if (wishlist.length === 0) {
                setWishlistArtworks([]);
                return;
            }

            setFetchingArtworks(true);
            try {
                const artworkPromises = wishlist.map(async (artworkId) => {
                    try {
                        const details = await ArtworkService.getArtworkDetails(artworkId);
                        return details;
                    } catch (error) {
                        console.error(`Failed to fetch artwork ${artworkId}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(artworkPromises);
                const validArtworks = results.filter((result): result is WishlistArtwork => result !== null);
                setWishlistArtworks(validArtworks);
            } catch (error) {
                console.error('Error fetching artwork details:', error);
                toast.error('Failed to load some artwork details');
            } finally {
                setFetchingArtworks(false);
            }
        };

        fetchArtworkDetails();
    }, [wishlist]); const handleRemoveFromWishlist = async (artworkId: string) => {
        try {
            await toggleWishlistItem(artworkId);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleQuickView = (artwork: Artwork, artist: ProfileData | null, images: string[]) => {
        setSelectedArtwork({ artwork, artist, images });
        setQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setQuickViewOpen(false);
        setSelectedArtwork(null);
    };

    const LoadingSkeleton = () => (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="aspect-square bg-gray-200 animate-pulse"></div>
                        <div className="p-4">
                            <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                            <div className="flex justify-between mb-3">
                                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (isLoading || fetchingArtworks) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* Stats and Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Heart className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-lg font-semibold text-gray-900">
                            {wishlistArtworks.length} {wishlistArtworks.length === 1 ? 'Artwork' : 'Artworks'} in your collection
                        </span>
                    </div>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Recently Added</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Artist Name</option>
                    </select>
                </div>
            </div>

            {wishlistArtworks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <div className="max-w-md mx-auto">
                        <Heart size={64} className="mx-auto mb-6 text-gray-300" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Start exploring our collection and add artworks you love to your favorites.
                            Build your personal gallery of inspiring pieces.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/artworks"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Browse Artworks
                            </Link>
                            <Link
                                href="/artists"
                                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Discover Artists
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistArtworks.map(({ artwork, artist, images }) => (
                    <FavoriteArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        artist={artist}
                        images={images}
                        onRemove={handleRemoveFromWishlist}
                        onQuickView={handleQuickView}
                    />
                ))}
            </div>
            )}

            {/* Quick View Modal */}
            <QuickViewModal
                isOpen={quickViewOpen}
                onClose={handleCloseQuickView}
                artwork={selectedArtwork?.artwork || null}
                artist={selectedArtwork?.artist}
                images={selectedArtwork?.images}
            />
        </div>
    );
}