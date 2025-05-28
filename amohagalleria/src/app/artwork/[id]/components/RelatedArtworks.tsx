"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import type { RelatedArtwork } from "@/stores/view-artwork/viewArtworkService"
import { Heart, Eye, ChevronRight } from "lucide-react"

interface RelatedArtworksProps {
    artworks: RelatedArtwork[]
}

export default function RelatedArtworks({ artworks }: RelatedArtworksProps) {
    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold">You Might Also Like</h2>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Discover similar artworks from our collection
                    </p>
                </div>
                <Button variant="outline" className="hidden md:flex">
                    View All
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {artworks.map((artwork, index) => (
                    <Link
                        key={artwork.id}
                        href={`/artwork/${artwork.id}`}
                        className="block overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 cursor-pointer hover:border-primary/30 border border-gray-200 rounded-lg"
                    >
                        <div className="space-y-3 p-3">
                            {/* Image Container */}
                            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                                {artwork.image_url ? (
                                    <>
                                        <Image
                                            src={artwork.image_url || "/placeholder.svg"}
                                            alt={artwork.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                                            {/* Quick Actions */}
                                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full shadow-lg"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                    }}
                                                >
                                                    <Heart className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full shadow-lg"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Featured Badge */}
                                        {index === 0 && (
                                            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                                                Featured
                                            </Badge>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <span className="text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>

                            {/* Artwork Info */}
                            <div className="space-y-2 p-2">
                                <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors duration-200 line-clamp-1">
                                    {artwork.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm md:text-base font-bold text-primary">
                                        {artwork.currency} {artwork.artist_price?.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                                        <Eye className="h-3 w-3" />
                                        <span>{Math.floor(Math.random() * 1000) + 100}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Mobile View All Button */}
            <div className="md:hidden">
                <Button variant="outline" className="w-full">
                    View All Artworks
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}