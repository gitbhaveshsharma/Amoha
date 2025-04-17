// stores/cart/guestCart.ts
import { getDeviceId } from '@/lib/deviceFingerprint';
import { toast } from 'react-toastify';
import { CartOperations } from './types';

export const guestCart: CartOperations = {
    fetchCart: async () => {
        const deviceId = await getDeviceId();
        if (!deviceId) {
            console.error("Device ID not found");
            toast.error("Device ID not found");
            return [];
        }

        try {
            console.log("Fetching cart with device ID:", deviceId); // Debug log
            const response = await fetch('/api/cart/guest', {
                headers: { 'device-id': deviceId },
            });

            if (!response.ok) {
                console.error("Failed to fetch cart:", response.statusText);
                throw new Error('Failed to fetch cart');
            }

            const { cart } = await response.json();
            return cart || [];
        } catch (error) {
            console.error("Failed to load cart:", error);
            toast.error("Failed to load cart");
            return [];
        }
    },

    toggleCartItem: async (artworkId: string) => {
        const deviceId = await getDeviceId();
        if (!deviceId) {
            console.error("Device ID not found");
            throw new Error('Device ID not found');
        }

        try {
            console.log("Toggling cart item with device ID:", deviceId, "and artwork ID:", artworkId); // Debug log
            const response = await fetch('/api/cart/guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'device-id': deviceId,
                },
                body: JSON.stringify({
                    action: 'TOGGLE',
                    artworkId,
                }),
            });

            if (!response.ok) {
                console.error("Failed to toggle cart item:", response.statusText);
                throw new Error('Failed to toggle cart item');
            }

            const { wasAdded } = await response.json();
            const message = wasAdded ? "Added to cart" : "Removed from cart";
            toast.success(message);
            return wasAdded;
        } catch (error) {
            console.error("Failed to toggle cart item:", error);
            toast.error("Failed to update cart");
            throw error;
        }
    },

    clearCart: async () => {
        const deviceId = await getDeviceId();
        if (!deviceId) {
            console.error("Device ID not found");
            throw new Error('Device ID not found');
        }

        try {
            console.log("Clearing cart with device ID:", deviceId); // Debug log
            const response = await fetch('/api/cart/guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'device-id': deviceId,
                },
                body: JSON.stringify({
                    action: 'CLEAR',
                }),
            });

            if (!response.ok) {
                console.error("Failed to clear cart:", response.statusText);
                throw new Error('Failed to clear cart');
            }
            toast.success("Cart cleared");
        } catch (error) {
            console.error("Failed to clear cart:", error);
            toast.error("Failed to clear cart");
            throw error;
        }
    },
};