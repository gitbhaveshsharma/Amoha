"use client";

import { Button } from "@/components/ui/Button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCartStore } from "@/stores/cart";
import { useEffect } from "react";

export function AddToCartButton({ artworkId }: { artworkId: string }) {
    const {
        isInCart,
        toggleCartItem,
        isLoading,
        isRemoving,
        isAdding,
        fetchCart
    } = useCartStore();

    const isProcessing = isLoading || (isInCart(artworkId) ? isRemoving : isAdding);

    // Fetch cart data when the component mounts
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleCartAction = async () => {
        try {
            const wasAdded = await toggleCartItem(artworkId);
            toast.success(wasAdded ? "Added to cart" : "Removed from cart");
        } catch (error) {
            toast.error("Failed to update cart");
            console.error(error);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCartAction}
            disabled={isProcessing}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            {isInCart(artworkId) ? "Remove from Cart" : "Add to Cart"}
        </Button>
    );
}