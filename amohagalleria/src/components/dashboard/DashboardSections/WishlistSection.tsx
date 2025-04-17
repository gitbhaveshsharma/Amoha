"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface WishlistItem {
    id: string;
    artwork_id: string;
    artwork: {
        id: string;
        title: string;
        image_url: string;
        artist_price: number;
        description: string;
        status: string;
        medium: string;
        dimensions: string;
        date: string;
        art_category: string;
    };
}

const WishlistSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-[70%]" />
                            <Skeleton className="h-6 w-[25%]" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-5 w-16 rounded-full" />
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                        <div className="flex justify-between pt-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export function WishlistSection() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    toast.error("Please login to view your wishlist");
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("wishlist")
                    .select(`
            id,
            artwork_id,
            artwork:artworks (
              id,
              title,
              image_url,
              artist_price,
              description,
              medium,
              dimensions,
              date,
              art_category,
              art_location
            )
          `)
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .order("created_at", { ascending: false });

                if (error) throw error;

                setWishlist(data || []);
            } catch (error: any) {
                console.error("Error fetching wishlist:", error);
                toast.error("Failed to load wishlist");
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (wishlistId: string) => {
        try {
            const { error } = await supabase
                .from("wishlist")
                .update({
                    status: "inactive",
                    updated_at: new Date().toISOString()
                })
                .eq("id", wishlistId);

            if (error) throw error;

            setWishlist(wishlist.filter(item => item.id !== wishlistId));
            toast.success("Removed from wishlist");
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            toast.error("Failed to remove from wishlist");
        }
    };

    const handleMakeOffer = (artworkId: string) => {
        toast.info("Make offer functionality coming soon!");
    };

    const totalPages = Math.ceil(wishlist.length / itemsPerPage);
    const currentItems = wishlist.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                    <WishlistSkeleton />
                </CardContent>
            </Card>
        );
    }

    if (wishlist.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Wishlist</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <p>Your wishlist is empty</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Add artworks to your wishlist to see them here
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentItems.map((item) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative aspect-square">
                                <Image
                                    src={item.artwork.image_url}
                                    alt={item.artwork.title}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        console.error("Image load error:", e);
                                        (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                                    }}
                                />
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{item.artwork.title}</h3>
                                    <p className="text-sm font-medium">
                                        ${item.artwork.artist_price.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    {item.artwork.medium && (
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                            {item.artwork.medium}
                                        </span>
                                    )}
                                    {item.artwork.dimensions && (
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                            {item.artwork.dimensions}
                                        </span>
                                    )}
                                    {item.artwork.date && (
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                            {new Date(item.artwork.date).getFullYear()}
                                        </span>
                                    )}
                                    {item.artwork.art_category && (
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                            {item.artwork.art_category.replace('_', ' ')}
                                        </span>
                                    )}

                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.artwork.description}
                                </p>

                                <div className="flex justify-between items-center pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMakeOffer(item.artwork.id)}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Make Offer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 className="h-5 w-5 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}