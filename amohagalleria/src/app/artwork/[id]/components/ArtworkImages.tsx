"use client"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, Maximize2, Download } from "lucide-react"

interface ArtworkImagesProps {
    images: string[]
    title: string
}

export default function ArtworkImages({ images, title }: ArtworkImagesProps) {
    const [selectedImage, setSelectedImage] = useState(0)

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group shadow-2xl">
                {images.length > 0 ? (
                    <>
                        <Image
                            src={images[selectedImage] || "/placeholder.svg"}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                        />

                        {/* Image Controls Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12 rounded-full shadow-lg"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12 rounded-full shadow-lg"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg">
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {selectedImage + 1} / {images.length}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground">No image available</span>
                    </div>
                )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${selectedImage === index
                                ? "ring-2 ring-primary shadow-lg scale-105"
                                : "ring-1 ring-border hover:ring-primary/50 hover:scale-102"
                                }`}
                        >
                            <Image
                                src={image || "/placeholder.svg"}
                                alt={`${title} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            {selectedImage === index && <div className="absolute inset-0 bg-primary/20" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
