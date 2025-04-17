// src/components/ArtworkGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Session } from "@supabase/supabase-js";

interface Artwork {
    id: string;
    title: string;
    description: string;
    image_url: string;
    artist_price: number;
    status: string;
    created_at: string;


}

export const ArtworkGrid = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [wishlist, setWishlist] = useState<string[]>([]);

    useEffect(() => {
        // Fetch session and artworks
        const fetchData = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            setSession(sessionData.session);

            const { data: artworksData, error } = await supabase
                .from("artworks")
                .select("*")
                .eq("status", "pending_review");

            if (error) {
                toast.error("Failed to load artworks");
                console.error(error);
            } else {
                setArtworks(artworksData || []);
            }

            // If logged in, fetch user's wishlist
            if (sessionData.session) {
                const { data: wishlistData } = await supabase
                    .from("wishlist")
                    .select("artwork_id")
                    .eq("user_id", sessionData.session.user.id)
                    .eq("status", "active");

                setWishlist(wishlistData?.map(item => item.artwork_id) || []);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const handleWishlist = async (artworkId: string) => {
        if (!session) {
            // For non-logged in users, use session storage
            const localWishlist = JSON.parse(sessionStorage.getItem("wishlist") || "[]");
            const newWishlist = localWishlist.includes(artworkId)
                ? localWishlist.filter((id: string) => id !== artworkId)
                : [...localWishlist, artworkId];

            sessionStorage.setItem("wishlist", JSON.stringify(newWishlist));
            setWishlist(newWishlist);
            toast.success(newWishlist.includes(artworkId) ? "Added to wishlist" : "Removed from wishlist");
            return;
        }

        // For logged in users, update database
        try {
            if (wishlist.includes(artworkId)) {
                // Remove from wishlist
                const { error } = await supabase
                    .from("wishlist")
                    .update({ status: "inactive" })
                    .eq("user_id", session.user.id)
                    .eq("artwork_id", artworkId);

                if (error) throw error;
                setWishlist(wishlist.filter(id => id !== artworkId));
                toast.success("Removed from wishlist");
            } else {
                // Add to wishlist
                const { error } = await supabase
                    .from("wishlist")
                    .upsert({
                        user_id: session.user.id,
                        artwork_id: artworkId,
                        status: "active"
                    });

                if (error) throw error;
                setWishlist([...wishlist, artworkId]);
                toast.success("Added to wishlist");
            }
        } catch (error) {
            console.error("Wishlist error:", error);
            toast.error("Failed to update wishlist");
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading artworks...</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {artworks.map((artwork) => (
                <div key={artwork.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                        <Image
                            src={artwork.image_url}
                            alt={artwork.title}
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover"
                        />
                    </div>
                    <div className="p-4 space-y-2">
                        <h3 className="text-lg font-semibold">{artwork.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {artwork.description}
                        </p>
                        <div className="flex justify-between items-center pt-2">
                            <p className="text-sm font-medium">
                                ${artwork.artist_price.toFixed(2)}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleWishlist(artwork.id)}
                                    aria-label={wishlist.includes(artwork.id) ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart
                                        className={`h-5 w-5 ${wishlist.includes(artwork.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                    />
                                </Button>
                                <Button variant="outline" size="sm">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Make Offer
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};