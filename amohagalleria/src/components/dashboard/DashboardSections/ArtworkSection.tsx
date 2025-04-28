"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useArtworkStore } from "@/stores/artwork/artworkStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { EditArtworkModal } from "@/components/dashboard/EditArtworkModal";
import { ImageIcon, Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/dashboard/DeleteConfirmationModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Artwork } from "@/types";

const formatStatus = (status: string) => {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

export const ArtworkSection = () => {
    const { session } = useSession();
    const {
        artworks,
        loading,
        error,
        currentPage,
        itemsPerPage,
        fetchUserArtworks,
        deleteArtwork,
        setCurrentPage,
    } = useArtworkStore();

    const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            fetchUserArtworks(session.user.id);
        }
    }, [session?.user?.id, fetchUserArtworks]);

    const handleArtworkUpdated = () => {
        toast.success("Artwork updated successfully!");
        if (session?.user?.id) {
            fetchUserArtworks(session.user.id);
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteArtwork = async () => {
        if (!artworkToDelete) return;
        try {
            await deleteArtwork(artworkToDelete.id);
            toast.success("Artwork deleted successfully!");
        } catch {
            toast.error("Failed to delete artwork.");
        } finally {
            setIsDeleteModalOpen(false);
            setArtworkToDelete(null);
        }
    };

    const totalPages = Math.ceil(artworks.length / itemsPerPage);
    const currentArtworks = artworks.slice(
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

    if (loading && artworks.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 py-8">{error}</p>;
    }

    if (artworks.length === 0) {
        return <p className="text-center py-8">No artworks found.</p>;
    }

    function handleEditClick(artwork: Artwork): void {
        setIsEditModalOpen(true);
        setEditingArtwork(artwork);
    }

    return (
        <div className="space-y-6">
            {editingArtwork && (
                <EditArtworkModal
                    artwork={editingArtwork}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onArtworkUpdated={handleArtworkUpdated}
                />
            )}

            {artworkToDelete && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteArtwork}
                    artworkTitle={artworkToDelete.title}
                />
            )}

            <Card className="max-w-7xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">My Artworks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentArtworks.map((artwork) => (
                            <div key={artwork.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div key={artwork.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative">
                                        {artwork.image_url ? (
                                            <img
                                                src={artwork.image_url}
                                                alt={artwork.title}
                                                className="w-full h-48 object-cover"
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
                                                    onClick={() => handleEditClick(artwork)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-sm p-2 text-red-600 hover:text-red-800"
                                                    onClick={() => {
                                                        setArtworkToDelete(artwork);
                                                        setIsDeleteModalOpen(true);
                                                    }}
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
                                                    {new Date(artwork.date).getFullYear()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <p className="text-sm text-muted-foreground">
                                                Status: <span className="font-medium">{formatStatus(artwork.status)}</span>
                                            </p>
                                            {artwork.artist_price && (
                                                <p className="text-sm font-medium">
                                                    ${artwork.artist_price.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>                            </div>
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
        </div>
    );
};