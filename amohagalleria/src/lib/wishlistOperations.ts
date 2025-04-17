// import { supabase } from "@/lib/supabase";
// import { getDeviceId } from "@/lib/deviceFingerprint";

// export const fetchUserWishlist = async (userId: string) => {
//     const { data, error } = await supabase
//         .from("wishlist")
//         .select("artwork_id")
//         .eq("user_id", userId)
//         .eq("status", "active");

//     if (error) throw error;
//     return data?.map(item => item.artwork_id) || [];
// };

// export const fetchGuestWishlist = async () => {
//     const deviceId = getDeviceId();
//     if (!deviceId) return [];

//     const response = await fetch('/api/wishlist/guest');
//     if (!response.ok) throw new Error('Failed to fetch guest wishlist');

//     const { wishlist } = await response.json();
//     return wishlist || [];
// };

// export const toggleUserWishlistItem = async (userId: string, artworkId: string) => {
//     // Check if item exists in wishlist
//     const { data: existing, error: fetchError } = await supabase
//         .from("wishlist")
//         .select()
//         .eq("user_id", userId)
//         .eq("artwork_id", artworkId)
//         .maybeSingle();

//     if (fetchError) throw fetchError;

//     if (existing) {
//         // Toggle status
//         const newStatus = existing.status === "active" ? "inactive" : "active";
//         const { error: updateError } = await supabase
//             .from("wishlist")
//             .update({ status: newStatus })
//             .eq("id", existing.id);

//         if (updateError) throw updateError;
//     } else {
//         // Add new item
//         const { error: insertError } = await supabase.from("wishlist").insert({
//             user_id: userId,
//             artwork_id: artworkId,
//             status: "active",
//             created_at: new Date().toISOString()
//         });

//         if (insertError) throw insertError;
//     }
// };

// export const toggleGuestWishlistItem = async (artworkId: string) => {
//     console.log('[WishlistContext] Handling guest wishlist toggle for:', artworkId);
//     const deviceId = getDeviceId();
//     if (!deviceId) throw new Error('Device ID not found');

//     const response = await fetch('/api/wishlist/guest', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ artworkId }),
//     });

//     if (!response.ok) throw new Error('Failed to update guest wishlist');
// };