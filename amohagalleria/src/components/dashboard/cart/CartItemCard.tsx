// components/dashboard/CartItemCard.tsx
"use client";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { Artwork } from "@/types";
import { MakeOfferButton } from "@/components/make-offer-button";
import { useOffer } from "@/context/offer-context";
import { ShoppingCart, Loader2 } from "lucide-react";
interface CartItemCardProps {
    artwork: Artwork;
    onRemove: () => void;
    isRemoving: boolean;
}

export function CartItemCard({ artwork, onRemove, isRemoving }: CartItemCardProps) {
    const { makeOffer, isLoading: isOfferLoading } = useOffer();

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="relative aspect-square">
                <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    layout="fill"
                    objectFit="cover"
                />
            </div>

            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg truncate">{artwork.title}</h3>
                    <p className="font-bold text-primary">${artwork.artist_price.toLocaleString()}</p>
                </div>

                {artwork.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {artwork.description}
                    </p>
                )}

                <div className="mt-auto flex gap-2">

                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={onRemove}
                        disabled={isRemoving}
                    >
                        {isRemoving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        {isRemoving ? "Removing..." : "Remove"}
                    </Button>
                    <MakeOfferButton
                        artworkId={artwork.id}
                        artistId={artwork.user_id}
                        currentPrice={artwork.artist_price}
                        makeOffer={makeOffer}
                        isLoading={isOfferLoading}
                        size="sm"
                        amount={artwork.artist_price}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
}
