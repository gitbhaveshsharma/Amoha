"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist";

export function WishlistButton({ artworkId }: { artworkId: string }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const {
        isInWishlist,
        isLoading,
        toggleWishlistItem,
        fetchWishlist
    } = useWishlistStore();

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const isActive = isInWishlist(artworkId);

    const handleClick = async () => {
        if (isLoading || isProcessing) return;
        setIsProcessing(true);

        try {
            await toggleWishlistItem(artworkId);
            // The toast messages are now handled in the userWishlist.toggleWishlistItem
        } catch (error) {
            console.error("Error toggling wishlist item:", error);
            // Error handling is done in the store and userWishlist
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || isProcessing}
            aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            data-testid="wishlist-button"
        >
            <Heart
                size={20}
                className={isActive ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
        </button>
    );
}