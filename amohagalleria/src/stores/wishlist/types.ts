// stores/wishlist/types.ts
export type WishlistItem = {
    artwork_id: string;
    status: 'active' | 'removed';
    updated_at: string;
};

export type WishlistError = {
    code: number;
    message: string;
};

export type WishlistOperations = {
    fetchWishlist: () => Promise<string[]>;
    toggleWishlistItem: (artworkId: string) => Promise<boolean>;
    clearWishlist: () => Promise<void>;
};