"use client"

import type { Artwork } from "@/types"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, MessageSquare, Eye, Star } from "lucide-react"
import { useState } from "react"
import { MakeOfferButton } from "@/components/make-offer-button"
import { useOffer } from "@/context/offer-context";

interface ArtworkDetailsProps {
    artwork: Artwork
}

export default function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
    const [isLiked, setIsLiked] = useState(false)
    const { makeOffer, isLoading } = useOffer();
    const [viewCount] = useState(1247)
    const [rating] = useState(4.8)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            {artwork.title}
                        </h1>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm font-medium">
                                {artwork.art_category}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                <span>{viewCount.toLocaleString()} views</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Price</p>
                            <span className="text-3xl font-bold text-primary">
                                {artwork.currency} {artwork.artist_price?.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Availability</p>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                Available
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <MakeOfferButton
                    artworkId={artwork.id}
                    artistId={artwork.user_id}
                    currentPrice={artwork.artist_price || 0}
                    size="lg"
                    className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    makeOffer={makeOffer}
                    isLoading={isLoading}
                    amount={artwork.artist_price || 0}
                />
                <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-4 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                    onClick={() => setIsLiked(!isLiked)}
                >
                    <Heart className={`h-5 w-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                >
                    <Share2 className="h-5 w-5" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-4 hover:bg-green-50 hover:border-green-200 transition-all duration-200"
                >
                    <MessageSquare className="h-5 w-5" />
                </Button>
            </div>

            {/* Description */}
            <div className="space-y-4 p-6 bg-muted/30 rounded-xl">
                <h3 className="text-xl font-semibold">About This Artwork</h3>
                <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
            </div>

            {/* Details */}
            <div className="space-y-4 p-6 border rounded-xl">
                <h3 className="text-xl font-semibold">Artwork Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                            <p className="font-medium">{artwork.dimensions}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Medium</p>
                            <p className="font-medium">{artwork.medium}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Year Created</p>
                            <p className="font-medium">{artwork.date}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Location</p>
                            <p className="font-medium">{artwork.art_location}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}