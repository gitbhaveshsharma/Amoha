"use client";

import { Button } from "@/components/ui/Button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCartStore } from "@/stores/cart";
import { useEffect, useState } from "react";

interface AddToCartButtonProps {
    artworkId: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function AddToCartButton({
    artworkId,
    variant = "outline",
    size = "sm",
    className = "",
}: AddToCartButtonProps) {
    const {
        isInCart,
        toggleCartItem,
        isLoading,
        isRemoving,
        isAdding,
        fetchCart,
    } = useCartStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isProcessing = isLoading || (isInCart(artworkId) ? isRemoving : isAdding);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleCartAction = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const wasAdded = await toggleCartItem(artworkId);
            const actionType = wasAdded ? "Added to cart" : "Removed from cart";
            toast.success(actionType);
        } catch (error) {
            toast.error("Failed to update cart");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCartAction}
            disabled={isProcessing || isSubmitting}
            className={className}
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