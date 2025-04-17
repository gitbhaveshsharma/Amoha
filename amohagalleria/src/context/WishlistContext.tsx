// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { getDeviceId } from "@/lib/deviceFingerprint";

// type WishlistItem = {
//     artwork_id: string;
//     status: 'active' | 'removed';
//     updated_at: string;
// };

// type WishlistContextType = {
//     wishlist: string[]; // Just artwork_ids for simplicity
//     addToWishlist: (artworkId: string) => Promise<void>;
//     removeFromWishlist: (artworkId: string) => Promise<void>;
//     clearWishlist: () => Promise<void>;
//     isLoading: boolean;
//     refreshWishlist: () => Promise<void>;
//     isInWishlist: (artworkId: string) => boolean;
// };

// const WishlistContext = createContext<WishlistContextType>({
//     wishlist: [],
//     addToWishlist: async () => { },
//     removeFromWishlist: async () => { },
//     clearWishlist: async () => { },
//     isLoading: true,
//     refreshWishlist: async () => { },
//     isInWishlist: () => false,
// });

// export function WishlistProvider({ children }: { children: React.ReactNode }) {
//     const [wishlist, setWishlist] = useState<string[]>([]);
//     const [isLoading, setIsLoading] = useState(true);

//     const isInWishlist = (artworkId: string) => {
//         return wishlist.includes(artworkId);
//     };

//     const fetchWishlist = async () => {
//         setIsLoading(true);
//         try {
//             const deviceId = await getDeviceId();
//             if (!deviceId) {
//                 setWishlist([]);
//                 return;
//             }

//             const response = await fetch('/api/wishlist/guest', {
//                 headers: {
//                     'device-id': deviceId
//                 }
//             });

//             if (!response.ok) throw new Error('Failed to fetch wishlist');

//             const { wishlist } = await response.json();
//             setWishlist(wishlist.map((item: WishlistItem) => item.artwork_id) || []);
//         } catch (error) {
//             console.error("Failed to load wishlist:", error);
//             toast.error("Failed to load wishlist");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const addToWishlist = async (artworkId: string) => {
//         try {
//             const deviceId = await getDeviceId();
//             if (!deviceId) throw new Error('Device ID not found');

//             // Optimistic update
//             setWishlist(prev => [...prev, artworkId]);

//             const response = await fetch('/api/wishlist/guest', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'device-id': deviceId
//                 },
//                 body: JSON.stringify({
//                     action: 'ADD',
//                     artworkId
//                 }),
//             });

//             if (!response.ok) throw new Error('Failed to add to wishlist');

//             toast.success("Added to wishlist");
//         } catch (error) {
//             console.error("Failed to add to wishlist:", error);
//             toast.error("Failed to add to wishlist");
//             await fetchWishlist();
//         }
//     };

//     const removeFromWishlist = async (artworkId: string) => {
//         try {
//             const deviceId = await getDeviceId();
//             if (!deviceId) throw new Error('Device ID not found');

//             // Optimistic update
//             setWishlist(prev => prev.filter(id => id !== artworkId));

//             const response = await fetch('/api/wishlist/guest', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'device-id': deviceId
//                 },
//                 body: JSON.stringify({
//                     action: 'REMOVE',
//                     artworkId
//                 }),
//             });

//             if (!response.ok) throw new Error('Failed to remove from wishlist');

//             toast.success("Removed from wishlist");
//         } catch (error) {
//             console.error("Failed to remove from wishlist:", error);
//             toast.error("Failed to remove from wishlist");
//             await fetchWishlist();
//         }
//     };

//     const clearWishlist = async () => {
//         try {
//             const deviceId = await getDeviceId();
//             if (!deviceId) throw new Error('Device ID not found');

//             // Optimistic update
//             setWishlist([]);

//             const response = await fetch('/api/wishlist/guest', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'device-id': deviceId
//                 },
//                 body: JSON.stringify({
//                     action: 'CLEAR'
//                 }),
//             });

//             if (!response.ok) throw new Error('Failed to clear wishlist');

//             toast.success("Wishlist cleared");
//         } catch (error) {
//             console.error("Failed to clear wishlist:", error);
//             toast.error("Failed to clear wishlist");
//             await fetchWishlist();
//         }
//     };

//     useEffect(() => {
//         fetchWishlist();
//     }, []);

//     return (
//         <WishlistContext.Provider value={{
//             wishlist,
//             addToWishlist,
//             removeFromWishlist,
//             clearWishlist,
//             isLoading,
//             refreshWishlist: fetchWishlist,
//             isInWishlist,
//         }}>
//             {children}
//         </WishlistContext.Provider>
//     );
// }

// export const useWishlist = () => {
//     const context = useContext(WishlistContext);
//     if (!context) {
//         throw new Error('useWishlist must be used within a WishlistProvider');
//     }
//     return context;
// };
