// stores/wishlist/guestWishlist.ts
import { getDeviceId } from '@/lib/deviceFingerprint';
import { toast } from 'react-toastify';
import { WishlistOperations } from './types';

export const guestWishlist: WishlistOperations = {
    fetchWishlist: async () => {
        const deviceId = await getDeviceId();
        if (!deviceId) return [];

        try {
            const response = await fetch('/api/wishlist/guest', {
                headers: { 'device-id': deviceId },
            });

            if (!response.ok) throw new Error('Failed to fetch wishlist');

            const { wishlist } = await response.json();
            return wishlist || [];
        } catch (error) {
            console.error("Failed to load wishlist:", error);
            toast.error("Failed to load wishlist");
            return [];
        }
    },

    toggleWishlistItem: async (artworkId: string) => {
        const deviceId = await getDeviceId();
        if (!deviceId) throw new Error('Device ID not found');

        try {
            const response = await fetch('/api/wishlist/guest', {
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

            if (!response.ok) throw new Error('Failed to toggle wishlist item');

            const { wasAdded } = await response.json();
            const message = wasAdded ? "Added to wishlist" : "Removed from wishlist";
            toast.success(message);
            return wasAdded;
        } catch (error) {
            console.error("Failed to toggle wishlist item:", error);
            toast.error("Failed to update wishlist");
            throw error;
        }
    },

    clearWishlist: async () => {
        const deviceId = await getDeviceId();
        if (!deviceId) throw new Error('Device ID not found');

        try {
            const response = await fetch('/api/wishlist/guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'device-id': deviceId,
                },
                body: JSON.stringify({
                    action: 'CLEAR',
                }),
            });

            if (!response.ok) throw new Error('Failed to clear wishlist');
            toast.success("Wishlist cleared");
        } catch (error) {
            console.error("Failed to clear wishlist:", error);
            toast.error("Failed to clear wishlist");
            throw error;
        }
    },
};