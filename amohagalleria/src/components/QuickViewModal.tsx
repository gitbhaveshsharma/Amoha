// components/QuickViewModal.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Share2, Palette, User, Heart } from 'lucide-react';
import { Artwork } from '@/types';
import { ProfileData } from '@/types/profile';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    artwork: Artwork | null;
    artist?: ProfileData | null;
    images?: string[];
}

export const QuickViewModal = ({
    isOpen,
    onClose,
    artwork,
    artist,
    images = []
}: QuickViewModalProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (isOpen && artwork) {
            setCurrentImageIndex(0);
            // Here you would check if the artwork is in wishlist
            // setIsWishlisted(checkIfWishlisted(artwork.id));
        }
    }, [isOpen, artwork]);

    if (!isOpen || !artwork) return null;

    const artworkImages = images.length > 0 ? images : [artwork.image_url].filter(Boolean);

    const handleShare = () => {
        const url = `${window.location.origin}/artwork/${artwork?.id}`;
        if (navigator.share) {
            navigator.share({
                title: artwork?.title,
                text: `Check out this artwork: ${artwork?.title}`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        }
    };

    const handleWishlistToggle = () => {
        setIsWishlisted(!isWishlisted);
        toast.success(!isWishlisted ? 'Added to favorites' : 'Removed from favorites');
    }; return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Background overlay - Made more transparent */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal container */}
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors shadow-md"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Left side - Image */}
                        <div className="lg:w-2/3 bg-gray-50 flex items-center justify-center p-4 lg:p-8">
                            <div className="relative w-full h-full min-h-[300px] max-h-[70vh] flex items-center justify-center">
                                {artworkImages[currentImageIndex] ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <Image
                                            src={artworkImages[currentImageIndex]}
                                            alt={artwork.title}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 66vw"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gray-100 w-full">
                                        <Palette className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}

                                {/* Image navigation */}
                                {artworkImages.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {artworkImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side - Details */}
                        <div className="lg:w-1/3 p-6 flex flex-col h-full overflow-y-auto">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 line-clamp-2 mb-3">
                                    {artwork.title}
                                </h2>

                                {artist && (
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <User className="h-4 w-4 mr-2" />
                                        <span className="text-sm">by {artist.name}</span>
                                    </div>
                                )}

                                {artwork.artist_price && (
                                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                        <div className="text-xl font-bold text-gray-900">
                                            {artwork.currency} {artwork.artist_price}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {artwork.description || 'No description available'}
                                    </p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <h3 className="font-semibold text-gray-900">Details</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {artwork.art_category && (
                                            <div>
                                                <div className="text-gray-500 text-xs">Category</div>
                                                <div className="font-medium">{artwork.art_category.replace('_', ' ')}</div>
                                            </div>
                                        )}
                                        {artwork.medium && (
                                            <div>
                                                <div className="text-gray-500 text-xs">Medium</div>
                                                <div className="font-medium">{artwork.medium}</div>
                                            </div>
                                        )}
                                        {artwork.dimensions && (
                                            <div>
                                                <div className="text-gray-500 text-xs">Dimensions</div>
                                                <div className="font-medium">{artwork.dimensions}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-gray-500 text-xs">Created</div>
                                            <div className="font-medium">
                                                {new Date(artwork.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button className="flex-1" asChild>
                                        <a href={`/artwork/${artwork.id}`}>
                                            View Full Details
                                        </a>
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleWishlistToggle}
                                            className="aspect-square"
                                            aria-label={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleShare}
                                            className="aspect-square"
                                            aria-label="Share"
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};