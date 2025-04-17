// // app/artworks/[id]/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import Image from "next/image";
// import { Button } from "@/components/ui/Button";
// import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/context/cart-context";
// import { MakeOfferButton } from "@/components/make-offer-button";
// import { toast } from "react-toastify";

// interface Artwork {
//     id: string;
//     title: string;
//     image_url: string;
//     artist_price: number;
//     description: string;
//     artist_id: string;
//     artist: {
//         name: string;
//         bio?: string;
//     };
//     category: string;
//     medium: string;
//     dimensions: string;
//     created_at: string;
// }

// export default function ArtworkPage({ params }: { params: { id: string } }) {
//     const [artwork, setArtwork] = useState<Artwork | null>(null);
//     const [relatedArtworks, setRelatedArtworks] = useState<Artwork[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [wishlisted, setWishlisted] = useState(false);
//     const router = useRouter();
//     const { addToCart } = useCart();

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // Fetch artwork details
//                 const { data: artworkData, error: artworkError } = await supabase
//                     .from("artworks")
//                     .select(`*, artist:profile(name, bio)`)
//                     .eq("id", params.id)
//                     .single();

//                 if (artworkError) throw artworkError;
//                 setArtwork(artworkData);

//                 // Fetch related artworks (same category or same artist)
//                 const { data: relatedData, error: relatedError } = await supabase
//                     .from("artworks")
//                     .select(`*, artist:profile(name)`)
//                     .or(`category.eq.${artworkData.category},artist_id.eq.${artworkData.artist_id}`)
//                     .neq("id", params.id)
//                     .limit(4);

//                 if (relatedError) throw relatedError;
//                 setRelatedArtworks(relatedData || []);

//                 // Check wishlist status
//                 const { data: { user } } = await supabase.auth.getUser();
//                 if (user) {
//                     const { data: wishlistData } = await supabase
//                         .from("wishlist")
//                         .select()
//                         .eq("user_id", user.id)
//                         .eq("artwork_id", params.id)
//                         .single();
//                     setWishlisted(!!wishlistData);
//                 }
//             } catch (error) {
//                 console.error("Error fetching artwork:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [params.id]);

//     const handleAddToCart = async () => {
//         if (!artwork) return;
//         try {
//             await addToCart(artwork.id);
//             toast.success("Added to cart");
//         } catch (error) {
//             toast.error("Failed to add to cart");
//         }
//     };

//     const handleWishlist = async () => {
//         const { data: { user } } = await supabase.auth.getUser();
//         if (!user) {
//             toast.error("Please login to add to wishlist");
//             return;
//         }

//         try {
//             if (wishlisted) {
//                 await supabase
//                     .from("wishlist")
//                     .delete()
//                     .eq("user_id", user.id)
//                     .eq("artwork_id", params.id);
//                 toast.success("Removed from wishlist");
//             } else {
//                 await supabase
//                     .from("wishlist")
//                     .upsert({
//                         user_id: user.id,
//                         artwork_id: params.id,
//                         created_at: new Date().toISOString()
//                     });
//                 toast.success("Added to wishlist");
//             }
//             setWishlisted(!wishlisted);
//         } catch (error) {
//             toast.error("Failed to update wishlist");
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//             </div>
//         );
//     }

//     if (!artwork) {
//         return (
//             <div className="text-center py-12">
//                 <h2 className="text-xl font-semibold">Artwork not found</h2>
//                 <Button className="mt-4" onClick={() => router.back()}>
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Go Back
//                 </Button>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <Button variant="ghost" onClick={() => router.back()} className="mb-6">
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to Gallery
//             </Button>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
//                 {/* Artwork Image */}
//                 <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
//                     <Image
//                         src={artwork.image_url}
//                         alt={artwork.title}
//                         fill
//                         className="object-cover"
//                         priority
//                     />
//                 </div>

//                 {/* Artwork Details */}
//                 <div className="space-y-6">
//                     <div>
//                         <h1 className="text-3xl font-bold">{artwork.title}</h1>
//                         <p className="text-muted-foreground">by {artwork.artist.name}</p>
//                     </div>

//                     <div className="text-2xl font-semibold">
//                         ${artwork.artist_price.toFixed(2)}
//                     </div>

//                     <div className="flex gap-4">
//                         <Button
//                             size="lg"
//                             className="flex-1"
//                             onClick={handleAddToCart}
//                         >
//                             <ShoppingCart className="mr-2 h-4 w-4" />
//                             Add to Cart
//                         </Button>
//                         <Button
//                             variant="outline"
//                             size="lg"
//                             className="flex-1"
//                             onClick={handleWishlist}
//                         >
//                             <Heart className={`mr-2 h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
//                             {wishlisted ? "Wishlisted" : "Wishlist"}
//                         </Button>
//                     </div>

//                     <MakeOfferButton
//                         artworkId={artwork.id}
//                         artistId={artwork.artist_id}
//                         currentPrice={artwork.artist_price}
//                         className="w-full"
//                         size="lg"
//                     />

//                     <div className="space-y-4">
//                         <div>
//                             <h3 className="font-semibold">Description</h3>
//                             <p className="text-muted-foreground">{artwork.description}</p>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <h3 className="font-semibold">Category</h3>
//                                 <p className="text-muted-foreground capitalize">{artwork.category}</p>
//                             </div>
//                             <div>
//                                 <h3 className="font-semibold">Medium</h3>
//                                 <p className="text-muted-foreground">{artwork.medium}</p>
//                             </div>
//                             <div>
//                                 <h3 className="font-semibold">Dimensions</h3>
//                                 <p className="text-muted-foreground">{artwork.dimensions}</p>
//                             </div>
//                             <div>
//                                 <h3 className="font-semibold">Year</h3>
//                                 <p className="text-muted-foreground">
//                                     {new Date(artwork.created_at).getFullYear()}
//                                 </p>
//                             </div>
//                         </div>

//                         {artwork.artist.bio && (
//                             <div>
//                                 <h3 className="font-semibold">About the Artist</h3>
//                                 <p className="text-muted-foreground">{artwork.artist.bio}</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Related Artworks */}
//             {relatedArtworks.length > 0 && (
//                 <div className="mt-12">
//                     <h2 className="text-2xl font-bold mb-6">Related Artworks</h2>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                         {relatedArtworks.map((artwork) => (
//                             <div
//                                 key={artwork.id}
//                                 className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
//                                 onClick={() => router.push(`/artworks/${artwork.id}`)}
//                             >
//                                 <div className="relative aspect-square">
//                                     <Image
//                                         src={artwork.image_url}
//                                         alt={artwork.title}
//                                         fill
//                                         className="object-cover"
//                                     />
//                                 </div>
//                                 <div className="p-4">
//                                     <h3 className="font-medium">{artwork.title}</h3>
//                                     <p className="text-muted-foreground text-sm">
//                                         by {artwork.artist.name}
//                                     </p>
//                                     <p className="font-semibold mt-2">
//                                         ${artwork.artist_price.toFixed(2)}
//                                     </p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }