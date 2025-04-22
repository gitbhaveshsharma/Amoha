"use client";

import { Button } from "@/components/ui/Button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCartStore } from "@/stores/cart";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Utility function to handle Supabase-related logic for creating events and notifications.
 */
async function createEventAndNotification(
    artworkId: string,
    eventType: 'cart_added' | 'cart_removed'
): Promise<void> {
    try {
        // Check if the user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.warn('User is not authenticated. Skipping event and notification creation.');
            return;
        }

        // Fetch artwork details
        const { data: artwork, error: artworkError } = await supabase
            .from('artworks')
            .select('id, title, user_id, image_url')
            .eq('id', artworkId)
            .single();

        if (artworkError) throw artworkError;

        // Fetch artist details
        const { data: artist, error: artistError } = await supabase
            .from('profile')
            .select('name')
            .eq('user_id', artwork.user_id)
            .single();

        if (artistError) throw artistError;

        // Create event in the 'events' table
        const { error: eventError } = await supabase.from('events').insert({
            user_id: user.id,
            event_type: eventType,
            artwork_id: artwork.id,
            metadata: {
                artist_id: artwork.user_id,
                artwork_title: artwork.title,
                artist_name: artist?.name,
                image_url: artwork.image_url,
                event_type: eventType
            }
        });

        if (eventError) {
            console.error(`Failed to create event for ${eventType}:`, eventError);
            throw eventError;
        }

        // Create notification in the 'notification_messages' table
        const notificationTitle = eventType === 'cart_added' ? 'New Cart Item' : 'Cart Item Removed';
        const notificationMessage = eventType === 'cart_added'
            ? `Added ${artwork.title} to cart`
            : `Removed ${artwork.title} from cart`;
        const notificationType = eventType === 'cart_added' ? 'cart_added' : 'cart_removed';

        const { error: notificationError } = await supabase.from('notification_messages').insert({
            user_id: user.id,
            artwork_id: artwork.id,
            title: notificationTitle,
            message: notificationMessage,
            notification_type: notificationType,
            metadata: {
                artist_id: artwork.user_id,
                artwork_title: artwork.title,
                artist_name: artist?.name,
                image_url: artwork.image_url,
                event_type: notificationType
            }
        });

        if (notificationError) {
            console.error(`Failed to create notification for ${notificationType}:`, notificationError);
            throw notificationError;
        }
    } catch (error) {
        console.error('Error in createEventAndNotification:', error);
        throw error;
    }
}

export function AddToCartButton({ artworkId }: { artworkId: string }) {
    const {
        isInCart,
        toggleCartItem,
        isLoading,
        isRemoving,
        isAdding,
        fetchCart
    } = useCartStore();

    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions

    const isProcessing = isLoading || (isInCart(artworkId) ? isRemoving : isAdding);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleCartAction = async () => {
        if (isSubmitting) return; // Prevent duplicate execution
        setIsSubmitting(true);

        try {
            const wasAdded = await toggleCartItem(artworkId);
            const actionType = wasAdded ? "Added to cart" : "Removed from cart";
            toast.success(actionType);

            // Call the utility function to handle Supabase logic
            await createEventAndNotification(artworkId, wasAdded ? 'cart_added' : 'cart_removed');
        } catch (error) {
            toast.error("Failed to update cart");
            console.error(error);
        } finally {
            setIsSubmitting(false); // Reset the flag
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCartAction}
            disabled={isProcessing || isSubmitting} // Disable button while processing
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