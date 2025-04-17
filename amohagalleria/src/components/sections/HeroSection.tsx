// src/components/sections/HeroSection.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
// import { useRouter } from 'next/navigation';
// import { MakeOfferButton } from "@/components/make-offer-button";
import { WishlistButton } from "@/components/WishlistButton";
import { AddToCartButton } from "../addToCartButton";

interface Artwork {
    id: string;
    title: string;
    image_url: string;
    artist_price: number;
    description: string;
    artist_id: string;
}

const HomeSection = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    // const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: artworksData, error } = await supabase
                    .from("artworks")
                    .select("id, title, image_url, artist_price, description, artist_id")
                    .eq("status", "pending_review");

                if (error) throw error;

                setArtworks(artworksData || []);
            } catch (error) {
                console.error("Failed to load artworks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-12">Loading artworks...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Featured Artworks</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {artworks.map((artwork) => (
                    <div
                        key={artwork.id}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    // onClick={() => router.push(`/artworks/${artwork.id}`)}
                    >
                        <div className="relative aspect-square">
                            <Image
                                src={artwork.image_url}
                                alt={artwork.title}
                                fill
                                className="object-cover"
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
                                    <WishlistButton artworkId={artwork.id} />
                                    <AddToCartButton artworkId={artwork.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeSection;