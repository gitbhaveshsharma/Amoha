"use client"

import type React from "react"
import { useState } from "react"
import { useHomeStore } from "@/stores/home/homeStore"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Heart, Share2, Eye, Star, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const HeroSection: React.FC = () => {
    const { featuredArtworks, featuredLoading } = useHomeStore()
    const heroArtwork = featuredArtworks[0]
    const [isLiked, setIsLiked] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    if (featuredLoading) {
        return (
            <section className="mb-12">
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div className="p-8 space-y-6">
                                <Skeleton className="h-6 w-32 rounded-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/5" />
                                <div className="flex gap-3 pt-4">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-6 w-32 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Skeleton className="h-12 w-32" />
                                    <Skeleton className="h-12 w-32" />
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="w-full aspect-[4/3] bg-muted rounded-lg">
                                    <Skeleton className="w-full h-full" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        )
    }

    if (!heroArtwork) return null

    return (
        <section className="mb-12">
            <Card className="overflow-hidden border shadow-sm">
                <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div className="p-8 space-y-6">
                            {/* Featured Badge */}
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Featured Artwork
                            </Badge>

                            {/* Title */}
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                                {heroArtwork.title}
                            </h1>

                            {/* Description */}
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {heroArtwork.description ||
                                    "A stunning piece of art from our collection that captures the essence of creativity and imagination."}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline" className="text-sm">
                                    {heroArtwork.art_category || "Contemporary Art"}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    {heroArtwork.medium || "Mixed Media"}
                                </Badge>
                                {heroArtwork.artist_price && (
                                    <Badge variant="outline" className="text-sm font-semibold">
                                        {heroArtwork.currency || "$"} {heroArtwork.artist_price.toLocaleString()}
                                    </Badge>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "h-4 w-4",
                                                    i < 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">4.8</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Eye className="h-4 w-4" />
                                    <span>{Math.floor(Math.random() * 2000) + 500} views</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button size="lg" className="group">
                                    View Artwork
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className={cn(
                                            "transition-colors",
                                            isLiked ? "bg-red-50 border-red-200 text-red-600" : "hover:bg-muted"
                                        )}
                                        onClick={() => setIsLiked(!isLiked)}
                                    >
                                        <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
                                        {isLiked ? "Liked" : "Like"}
                                    </Button>

                                    <Button variant="outline" size="lg">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Image Container */}
                        <div className="p-8">
                            {/* Fixed aspect ratio container */}
                            <div className="w-full aspect-[4/3] relative bg-muted rounded-lg overflow-hidden border">
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                                        <div className="text-muted-foreground">Loading...</div>
                                    </div>
                                )}

                                {heroArtwork.image_url && (
                                    <Image
                                        src={heroArtwork.image_url || "/placeholder.svg"}
                                        alt={heroArtwork.title}
                                        fill
                                        priority
                                        className={cn(
                                            "object-cover transition-opacity duration-300",
                                            imageLoaded ? "opacity-100" : "opacity-0"
                                        )}
                                        onLoad={() => setImageLoaded(true)}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                )}

                                {/* Image overlay on hover */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                                    <div className="text-white">
                                        <p className="font-medium">{heroArtwork.title}</p>
                                        <p className="text-sm text-white/80">{heroArtwork.art_category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Image status badges */}
                            <div className="flex gap-2 mt-4 justify-center">
                                <Badge variant="outline" className="text-xs">
                                    Original
                                </Badge>
                                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                    Available
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}