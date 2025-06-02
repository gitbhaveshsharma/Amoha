
// app/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { ArtworkService } from '@/stores/view-artwork/viewArtworkService';
import { Artwork } from '@/types';
import { ProfileData } from '@/types/profile';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Share2, ExternalLink, Palette, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { QuickViewModal } from '@/components/QuickViewModal';

interface CartArtwork {
    artwork: Artwork;
    artist: ProfileData | null;
    images: string[];
}

const CartArtworkCard = ({ artwork, artist, images, onRemove, onQuickView }: {
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
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                onClick={(e) => handleActionClick(e, 'view')}
                                title="Quick View"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                onClick={handleRemoveClick}
                                title="Remove from cart"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                onClick={(e) => handleActionClick(e, 'share')}
                                title="Share"
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* View Details Button */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-white/90 hover:bg-white"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = artworkUrl;
                                }}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
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

export default function CartPage() {
    const { cart, isLoading, fetchCart, toggleCartItem, clearCart } = useCartStore();
    const [cartArtworks, setCartArtworks] = useState<CartArtwork[]>([]);
    const [fetchingArtworks, setFetchingArtworks] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);

    // Quick View Modal state
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState<{
        artwork: Artwork;
        artist: ProfileData | null;
        images: string[];
    } | null>(null);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        const fetchArtworkDetails = async () => {
            if (cart.length === 0) {
                setCartArtworks([]);
                setTotalPrice(0);
                return;
            }

            setFetchingArtworks(true);
            try {
                const artworkPromises = cart.map(async (artworkId) => {
                    try {
                        const details = await ArtworkService.getArtworkDetails(artworkId);
                        return details;
                    } catch (error) {
                        console.error(`Failed to fetch artwork ${artworkId}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(artworkPromises);
                const validArtworks = results.filter((result): result is CartArtwork => result !== null);
                setCartArtworks(validArtworks);

                // Calculate total price
                const total = validArtworks.reduce((sum, { artwork }) => {
                    const price = parseFloat(String(artwork.artist_price ?? '0'));
                    return sum + price;
                }, 0);
                setTotalPrice(total);
            } catch (error) {
                console.error('Error fetching artwork details:', error);
                toast.error('Failed to load some artwork details');
            } finally {
                setFetchingArtworks(false);
            }
        };

        fetchArtworkDetails();
    }, [cart]);

    const handleRemoveFromCart = async (artworkId: string) => {
        try {
            await toggleCartItem(artworkId);
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item from cart');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your entire cart?')) {
            try {
                await clearCart();
                toast.success('Cart cleared successfully');
            } catch (error) {
                console.error('Error clearing cart:', error);
                toast.error('Failed to clear cart');
            }
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                                <div className="p-4">
                                    <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                                    <div className="flex justify-between mb-3">
                                        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                                        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                        <div className="space-y-3 mb-6">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading || fetchingArtworks) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        <span className="text-lg font-semibold text-gray-900">
                            Shopping Cart ({cartArtworks.length} {cartArtworks.length === 1 ? 'item' : 'items'})
                        </span>
                    </div>
                </div>

                {cartArtworks.length > 0 && (
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearCart}
                        >
                            Clear Cart
                        </Button>
                    </div>
                )}
            </div>

            {cartArtworks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <div className="max-w-md mx-auto">
                        <ShoppingCart size={64} className="mx-auto mb-6 text-gray-300" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Browse our amazing collection of artworks and add pieces you&#39;d like to purchase to your cart.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild>
                                <Link href="/artworks">
                                    Browse Artworks
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/artists">
                                    Discover Artists
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {cartArtworks.map(({ artwork, artist, images }) => (
                                <CartArtworkCard
                                    key={artwork.id}
                                    artwork={artwork}
                                    artist={artist}
                                    images={images}
                                    onRemove={handleRemoveFromCart}
                                    onQuickView={handleQuickView}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items ({cartArtworks.length})</span>
                                    <span className="font-medium">
                                        {cartArtworks.length > 0 && cartArtworks[0].artwork.currency} {totalPrice.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">Free</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>
                                            {cartArtworks.length > 0 && cartArtworks[0].artwork.currency} {totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full" size="lg">
                                Proceed to Checkout
                            </Button>

                            <div className="mt-4 text-center">
                                <Button variant="link" asChild>
                                    <Link href="/artworks">
                                        Continue Shopping
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
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