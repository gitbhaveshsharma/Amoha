"use client"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Loader2 } from "lucide-react"

interface ArtworkImagesProps {
    images: string[]
    title: string
}

export default function ArtworkImages({ images, title }: ArtworkImagesProps) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [zoomLevel, setZoomLevel] = useState(100)
    const [isZooming, setIsZooming] = useState(false)
    const [position, setPosition] = useState({ x: 50, y: 50 })
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const zoomIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % images.length)
        resetZoom()
    }

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
        resetZoom()
    }

    const resetZoom = () => {
        setZoomLevel(100)
        setPosition({ x: 50, y: 50 })
    }

    const handleZoom = (direction: 'in' | 'out') => {
        if (zoomIntervalRef.current) {
            clearInterval(zoomIntervalRef.current as unknown as number)
        }

        setIsZooming(true)

        zoomIntervalRef.current = setInterval(() => {
            setZoomLevel(prev => {
                const step = direction === 'in' ? 5 : -5
                const newZoom = prev + step

                if (direction === 'in' && newZoom >= 150) {
                    clearInterval(zoomIntervalRef.current!)
                    setIsZooming(false)
                    return 150
                }
                if (direction === 'out' && newZoom <= 100) {
                    clearInterval(zoomIntervalRef.current!)
                    setIsZooming(false)
                    return 100
                }

                return newZoom
            })
        }, 50)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (zoomLevel <= 100) return

        const container = imageContainerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        if (zoomLevel > 100) {
            setPosition({ x: 50, y: 50 })
        }
    }

    useEffect(() => {
        return () => {
            if (zoomIntervalRef.current) {
                clearInterval(zoomIntervalRef.current)
            }
        }
    }, [])

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div
                ref={imageContainerRef}
                className={`relative aspect-square bg-muted rounded-2xl overflow-hidden group shadow-2xl ${zoomLevel > 100 ? 'cursor-move' : 'cursor-default'}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {images.length > 0 ? (
                    <>
                        <div
                            className="w-full h-full transition-transform duration-300"
                            style={{
                                transform: zoomLevel > 100
                                    ? `scale(${zoomLevel / 100}) translate(${(50 - position.x) * (zoomLevel / 100 - 1)}%, ${(50 - position.y) * (zoomLevel / 100 - 1)}%)`
                                    : 'scale(1)',
                                transition: isZooming ? 'none' : 'transform 300ms ease' // Disable transition during active zooming
                            }}
                        >
                            <Image
                                src={images[selectedImage] || "/placeholder.svg"}
                                alt={title}
                                fill
                                className="object-cover"
                                style={{
                                    transform: zoomLevel <= 100 ? 'scale(1)' : 'none',
                                }}
                                priority
                            />
                        </div>

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
                                        disabled={isZooming}
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 h-12 w-12 rounded-full shadow-lg"
                                        onClick={nextImage}
                                        disabled={isZooming}
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-lg"
                                    onClick={() => handleZoom('in')}
                                    onMouseUp={() => setIsZooming(false)}
                                    onMouseLeave={() => setIsZooming(false)}
                                    disabled={zoomLevel >= 150 || isZooming}
                                >
                                    {isZooming && zoomLevel < 150 ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ZoomIn className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-lg"
                                    onClick={() => handleZoom('out')}
                                    onMouseUp={() => setIsZooming(false)}
                                    onMouseLeave={() => setIsZooming(false)}
                                    disabled={zoomLevel <= 100 || isZooming}
                                >
                                    {isZooming && zoomLevel > 100 ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ZoomOut className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-lg"
                                    disabled={isZooming}
                                >
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

                        {/* Zoom Level Indicator */}
                        {zoomLevel > 100 && (
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {zoomLevel}%
                                {isZooming && <Loader2 className="ml-1 h-3 w-3 inline animate-spin" />}
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
                            onClick={() => {
                                setSelectedImage(index)
                                resetZoom()
                            }}
                            disabled={isZooming}
                            className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${selectedImage === index
                                ? "ring-2 ring-primary shadow-lg scale-105"
                                : "ring-1 ring-border hover:ring-primary/50 hover:scale-102"
                                } ${isZooming ? 'opacity-70' : ''}`}
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