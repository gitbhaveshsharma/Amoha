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



export interface Ticket {
    id: string;
    user_id: string;
    category_id: string;
    priority_id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignee_id?: string;
    created_at: string;
    updated_at: string;
    comments?: Comment[];
}

export interface Comment {
    id: string;
    ticket_id: string;
    user_id: string;
    message: string;
    is_internal: boolean;
    created_at: string;
    user_avatar: string;
    user_name: string;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface Comment {
    id: string;
    ticket_id: string;
    user_id: string;
    message: string;
    is_internal: boolean;
    created_at: string;
    content: string;
}


export interface ChatMessage {
    id: string;
    author_ref: string;
    content: string;
    created_at: string;
    is_internal: boolean;
    attachments?: Array<{
        id: string;
        url: string;
        name: string;
        type: string;
        size: number;
    }>;
}

export interface SupportChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    currentFile: File | null;
    fetchMessages: (ticketId: string) => Promise<void>;
    sendMessage: (params: {
        ticketId: string;
        userId: string;
        content: string;
        file?: File | null;
    }) => Promise<void>;
    setFile: (file: File | null) => void;
    clearMessages: () => void;
}


// Define the type of payout
export type BalanceDisplayState = {
    balance: number | null;
    loading: boolean;
    error: string | null;
};

export type BalanceDisplayActions = {
    fetchBalance: () => Promise<void>;
    reset: () => void;
};

export type BalanceDisplayStore = BalanceDisplayState & BalanceDisplayActions;

export interface PaymentMethod {
    id: string;
    method_type: 'bank_account' | 'paypal' | 'stripe' | 'other';
    details: {
        bank_name?: string;
        last4?: string;
        email?: string;
        [key: string]: string | number | boolean | undefined;
    };
    is_default: boolean;
    is_verified: boolean;
    created_at: string;
}

export type PaymentMethodState = {
    paymentMethods: PaymentMethod[];
    loading: boolean;
    error: string | null;
    success: boolean;
};

export type PaymentMethodActions = {
    fetchPaymentMethods: () => Promise<void>;
    addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'created_at'>) => Promise<void>;
    setDefaultMethod: (id: string) => Promise<void>;
    deleteMethod: (id: string) => Promise<void>;
    reset: () => void;
};

export type PaymentMethodStore = PaymentMethodState & PaymentMethodActions;


import { z } from "zod";

export type PaymentMethodType = 'bank_account' | 'paypal' | 'stripe';

export const paymentMethodSchemas = {
    bank_account: z.object({
        account_name: z.string().min(2),
        account_number: z.string().min(4).max(17),
        routing_number: z.string().length(9),
        bank_name: z.string().min(2),
    }),
    paypal: z.object({
        email: z.string().email(),
    }),
    stripe: z.object({
        card_number: z.string().length(16),
        expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/),
        cvc: z.string().length(3),
    })
};

export type PaymentMethodFormValues = {
    method_type: PaymentMethodType;
    is_default: boolean;
    details: z.infer<typeof paymentMethodSchemas.bank_account> |
    z.infer<typeof paymentMethodSchemas.paypal> |
    z.infer<typeof paymentMethodSchemas.stripe>;
};