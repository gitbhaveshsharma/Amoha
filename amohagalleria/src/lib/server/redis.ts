// lib/server/redis.ts
import { createClient } from 'redis';

export const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
await redisClient.connect();

type Status = 'active' | 'removed';

type WishlistItem = {
    artwork_id: string;
    status: Status;
    updated_at: string;
};

type CartItem = {
    artwork_id: string;
    status: Status;
    updated_at: string;
};

// Generic functions to handle both wishlist and cart
const getGuestData = async <T extends WishlistItem | CartItem>(deviceId: string, type: 'wishlist' | 'cart'): Promise<T[]> => {
    const dataJson = await redisClient.hGet(`guest:${deviceId}`, type);
    return dataJson ? JSON.parse(dataJson) as T[] : [];
};

const updateGuestData = async <T extends WishlistItem | CartItem>(deviceId: string, type: 'wishlist' | 'cart', artworkId: string, status: Status) => {
    const currentData = await getGuestData<T>(deviceId, type);

    const existingIndex = currentData.findIndex(item => item.artwork_id === artworkId);
    const newItem: T = {
        artwork_id: artworkId,
        status,
        updated_at: new Date().toISOString()
    } as T;

    const updatedData = existingIndex >= 0
        ? [
            ...currentData.slice(0, existingIndex),
            newItem,
            ...currentData.slice(existingIndex + 1)
        ]
        : [...currentData, newItem];

    await redisClient.hSet(`guest:${deviceId}`, type, JSON.stringify(updatedData));
};

const clearGuestData = async (deviceId: string, type: 'wishlist' | 'cart') => {
    await redisClient.hSet(`guest:${deviceId}`, type, JSON.stringify([]));
};

// Wishlist specific exports
export const getGuestWishlist = (deviceId: string) => getGuestData<WishlistItem>(deviceId, 'wishlist');
export const updateGuestWishlist = (deviceId: string, artworkId: string, status: Status) =>
    updateGuestData<WishlistItem>(deviceId, 'wishlist', artworkId, status);
export const clearGuestWishlist = (deviceId: string) => clearGuestData(deviceId, 'wishlist');

// Cart specific exports
export const getGuestCart = (deviceId: string) => getGuestData<CartItem>(deviceId, 'cart');
export const updateGuestCart = (deviceId: string, artworkId: string, status: Status) =>
    updateGuestData<CartItem>(deviceId, 'cart', artworkId, status);
export const clearGuestCart = (deviceId: string) => clearGuestData(deviceId, 'cart');
