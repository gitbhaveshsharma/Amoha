// components/dashboard/ArtworkSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useArtworkStore } from "@/stores/artwork/artworkStore";
import { useProfileStore } from "@/stores/profile/profileStore";
import { useUploadStore } from "@/stores/upload/uploadStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { EditArtworkModal } from "@/components/dashboard/EditArtworkModal";
import { Plus } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/dashboard/DeleteConfirmationModal";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadModal } from "@/components/UploadModal";
import { ArtworkGrid } from "@/components/dashboard/artwork/ArtworkGrid";
import { ArtworkTable } from "@/components/dashboard/artwork/ArtworkTable";
import { Artwork } from "@/types";

export const ArtworkSection = () => {
    const { session } = useSession();
    const { openUploadModal } = useUploadStore();
    const { isAdmin } = useProfileStore();
    const {
        artworks,
        loading,
        error,
        currentPage,
        itemsPerPage,
        fetchUserArtworks,
        fetchAllArtworks,
        deleteArtwork,
        setCurrentPage,
    } = useArtworkStore();

    const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            if (isAdmin()) {
                fetchAllArtworks();
            } else {
                fetchUserArtworks(session.user.id);
            }
        }
    }, [session?.user?.id, isAdmin, fetchUserArtworks, fetchAllArtworks]);

    const handleArtworkUpdated = () => {
        toast.success("Artwork updated successfully!");
        if (session?.user?.id) {
            if (isAdmin()) {
                fetchAllArtworks();
            } else {
                fetchUserArtworks(session.user.id);
            }
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

            <UploadModal />

            <Card className="mx-auto">
                <CardHeader className="flex flex-row justify-between items-center">
                    {!isAdmin() && (
                        <Button onClick={() => openUploadModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Artwork
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isAdmin() ? (
                        <ArtworkTable />
                    ) : (
                        <ArtworkGrid
                            artworks={currentArtworks}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onEdit={(artwork) => {
                                setEditingArtwork(artwork);
                                setIsEditModalOpen(true);
                            }}
                            onDelete={(artwork) => {
                                setArtworkToDelete(artwork);
                                setIsDeleteModalOpen(true);
                            }}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};