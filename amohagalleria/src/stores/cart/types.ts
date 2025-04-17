// stores/cart/types.ts
export type CartOperations = {
    fetchCart: () => Promise<string[]>;
    toggleCartItem: (artworkId: string) => Promise<boolean>;
    clearCart: () => Promise<void>;
};