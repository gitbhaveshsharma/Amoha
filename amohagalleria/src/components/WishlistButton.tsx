"use client";

import { Heart } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { useWishlistStore } from "@/stores/wishlist";

// Global flag to ensure we only fetch once across all button instances
let hasFetchedGlobally = false;

export const WishlistButton = memo(function WishlistButton({
    artworkId
}: {
    artworkId: string
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Select only what we need from the store
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);
    const isLoading = useWishlistStore((state) => state.isLoading);
    const toggleWishlistItem = useWishlistStore((state) => state.toggleWishlistItem);
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

    // Memoize the active state to prevent unnecessary re-renders
    const isActive = isInWishlist(artworkId);

    // Memoize the click handler
    const handleClick = useCallback(async () => {
        if (isLoading || isProcessing) return;
        setIsProcessing(true);

        try {
            await toggleWishlistItem(artworkId);
        } catch (error) {
            console.error("Error toggling wishlist item:", error);
        } finally {
            setIsProcessing(false);
        }
    }, [isLoading, isProcessing, toggleWishlistItem, artworkId]);

    // Fetch wishlist only once globally, not per component instance
    if (!hasFetchedGlobally && isLoading) {
        hasFetchedGlobally = true;
        fetchWishlist();
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || isProcessing}
            aria-label={isActive ? "Remove from wishlist" : "Add to wishlist"}
            className="p-2 rounded-full "
            data-testid="wishlist-button"
        >
            <Heart
                size={20}
                className={isActive ? "fill-red-500 text-red-500" : "text-gray-900"}
            />
        </button>
    );
});