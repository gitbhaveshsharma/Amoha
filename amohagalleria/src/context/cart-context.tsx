// // context/cart-context.tsx
// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { CartItem } from "@/types";

// type CartContextType = {
//     cart: CartItem[];
//     addToCart: (artworkId: string) => Promise<void>;
//     removeFromCart: (artworkId: string) => Promise<void>;
//     updateQuantity: (artworkId: string, quantity: number) => Promise<void>;
//     clearCart: () => Promise<void>;
//     cartCount: number;
//     isLoading: boolean;
// };

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({ children }: { children: React.ReactNode }) {
//     const [cart, setCart] = useState<CartItem[]>([]);
//     const [isLoading, setIsLoading] = useState(true);

//     const fetchCart = async () => {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) {
//             setCart([]);
//             setIsLoading(false);
//             return;
//         }

//         const { data, error } = await supabase
//             .from("cart")
//             .select("*, artwork:artworks(id, title, image_url, artist_price)")
//             .eq("user_id", user.id);

//         if (error) {
//             console.error("Error fetching cart:", error);
//         } else {
//             setCart(data || []);
//         }
//         setIsLoading(false);
//     };

//     useEffect(() => {
//         fetchCart();

//         const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
//             fetchCart();
//         });

//         return () => subscription.unsubscribe();
//     }, []);

//     const addToCart = async (artworkId: string) => {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) {
//             throw new Error("User not authenticated");
//         }

//         const { error } = await supabase
//             .from("cart")
//             .upsert({
//                 user_id: user.id,
//                 artwork_id: artworkId,
//                 quantity: 1,
//                 updated_at: new Date().toISOString()
//             }, { onConflict: "user_id,artwork_id" });

//         if (error) throw error;
//         await fetchCart();
//     };

//     const removeFromCart = async (artworkId: string) => {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) return;

//         const { error } = await supabase
//             .from("cart")
//             .delete()
//             .eq("user_id", user.id)
//             .eq("artwork_id", artworkId);

//         if (error) throw error;
//         await fetchCart();
//     };

//     const updateQuantity = async (artworkId: string, quantity: number) => {
//         if (quantity < 1) {
//             await removeFromCart(artworkId);
//             return;
//         }

//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) return;

//         const { error } = await supabase
//             .from("cart")
//             .update({ quantity })
//             .eq("user_id", user.id)
//             .eq("artwork_id", artworkId);

//         if (error) throw error;
//         await fetchCart();
//     };

//     const clearCart = async () => {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) return;

//         const { error } = await supabase
//             .from("cart")
//             .delete()
//             .eq("user_id", user.id);

//         if (error) throw error;
//         setCart([]);
//     };

//     const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

//     return (
//         <CartContext.Provider
//             value={{
//                 cart,
//                 addToCart,
//                 removeFromCart,
//                 updateQuantity,
//                 clearCart,
//                 cartCount,
//                 isLoading
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// }

// export const useCart = () => {
//     const context = useContext(CartContext);
//     if (!context) {
//         throw new Error("useCart must be used within a CartProvider");
//     }
//     return context;
// };