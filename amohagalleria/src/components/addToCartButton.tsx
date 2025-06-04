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
    showTitle?: boolean;
}

export function AddToCartButton({
    artworkId,
    variant = "outline",
    size = "sm",
    className = "",
    showTitle = true,
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
    const isItemInCart = isInCart(artworkId);

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

    // Adjust styles when only icon is shown
    const buttonClass = showTitle
        ? className
        : `${className} p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800`;

    return (
        <Button
            variant={showTitle ? variant : "ghost"}
            size={showTitle ? size : "icon"}
            onClick={handleCartAction}
            disabled={isProcessing || isSubmitting}
            className={buttonClass}
            aria-label={isItemInCart ? "Remove from cart" : "Add to cart"}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <ShoppingCart
                        className={`h-4 w-4 ${showTitle ? "mr-2" : ""}`}
                        style={{
                            color: isItemInCart && !showTitle ? 'var(--destructive)' : undefined
                        }}
                    />
                    {showTitle && (isItemInCart ? "Remove from Cart" : "Add to Cart")}
                </>
            )}
        </Button>
    );
}