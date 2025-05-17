// components/dashboard/ArtworkGrid.tsx
"use client";

import { Artwork } from "@/types";
import { Button } from "@/components/ui/Button";
import { ImageIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useArtworkStore } from "@/stores/artwork/artworkStore";
import Image from "next/image";

interface ArtworkGridProps {
    artworks: Artwork[];
    currentPage: number;
    totalPages: number;
    onEdit: (artwork: Artwork) => void;
    onDelete: (artwork: Artwork) => void;
    onPageChange: (page: number) => void;
}

const formatStatus = (status: string) => {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export const ArtworkGrid = ({
    artworks,
    currentPage,
    totalPages,
    onEdit,
    onDelete,
    onPageChange,
}: ArtworkGridProps) => {
    const { resetFilters } = useArtworkStore();

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="space-y-6">
            {artworks.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {artworks.map((artwork) => (
                            <div
                                key={artwork.id}
                                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative">
                                    {artwork.image_url ? (
                                        <Image
                                            src={artwork.image_url}
                                            alt={artwork.title}
                                            className="w-full h-48 object-cover"
                                            width={400}
                                            height={192}
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                        {artwork.art_category}
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold line-clamp-1">{artwork.title}</h3>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-sm p-2"
                                                onClick={() => onEdit(artwork)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-sm p-2 text-red-600 hover:text-red-800"
                                                onClick={() => onDelete(artwork)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {artwork.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1 pt-1">
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                            {artwork.medium}
                                        </span>
                                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                            {artwork.dimensions}
                                        </span>
                                        {artwork.date && (
                                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                {format(new Date(artwork.date), "yyyy")}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <p className="text-sm text-muted-foreground">
                                            Status:{" "}
                                            <span className="font-medium">{formatStatus(artwork.status)}</span>
                                        </p>
                                        {artwork.artist_price && (
                                            <p className="text-sm font-medium">
                                                ${artwork.artist_price.toFixed(2)}
                                            </p>
                                        )}
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
                                    onClick={() => onPageChange(page)}
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
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <p className="text-muted-foreground">
                        No artworks found matching your filters
                    </p>
                    <Button
                        variant="outline"
                        onClick={resetFilters}
                    >
                        Clear filters
                    </Button>
                </div>
            )}
        </div>
    );
};