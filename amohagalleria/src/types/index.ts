// types/index.ts
export interface Artwork {
    id: string;
    title: string;
    image_url: string;
    artist_price: number;
    description?: string;
    artist_id?: string;
    is_auction?: boolean;
    current_bid?: number | null;
}

export interface CartItem {
    id: string;
    user_id: string;
    artwork_id: string;
    artwork: Artwork;
    created_at: string;
    updated_at: string;
}

export interface CartContextType {
    cart: CartItem[];
    addToCart: (artworkId: string) => Promise<void>;
    removeFromCart: (artworkId: string) => Promise<void>;
    updateQuantity: (artworkId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    cartCount: number;
    isLoading: boolean;
}

export interface MakeOffer {
    artworkId: string;
    artistId: string;
    currentPrice: number;
    isAuction?: boolean;
    minOfferPercentage?: number;
    bidIncrementPercentage?: number;
    amount: number | string;
    message?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    className?: string;
}

export interface MakeOfferButtonProps extends MakeOffer {
    makeOffer: (offer: MakeOffer) => Promise<boolean>;
    isLoading: boolean;
}

export type WishlistContextType = {
    wishlist: string[];
    toggleWishlist: (artworkId: string) => Promise<void>;
    isLoading: boolean;
    refreshWishlist: () => Promise<void>;
    isGuest: boolean;
    migrateGuestWishlist: () => Promise<void>;
};