// components/dashboard/ArtworkTable.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useProfileStore } from "@/stores/profile/profileStore";
import { useArtworkStore } from "@/stores/artwork/artworkStore";
import { toast } from "react-toastify";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditArtworkModal } from "@/components/dashboard/EditArtworkModal";
import { DeleteConfirmationModal } from "@/components/dashboard/DeleteConfirmationModal";
import { useInView } from "react-intersection-observer";
import { Artwork } from "@/types";
import { format } from "date-fns";
import { ArtworkFilter } from "./ArtworkFilter";
import { Badge } from "@/components/ui/badge";
import { ProfileData } from "@/types/profile";
import Image from "next/image";

// Add a type for artist profile cache
interface ArtistProfiles {
    [userId: string]: ProfileData | null;
}

const statusOptions = [
    { value: "pending_review", label: "Pending Review" },
    { value: "listed", label: "Listed" },
    { value: "rejected", label: "Rejected" },
];

export const ArtworkTable = () => {
    const { session } = useSession();
    const { isAdmin, fetchProfile, profile } = useProfileStore();
    const {
        artworks,
        loading,
        error,
        fetchAllArtworks,
        fetchFilteredArtworks,
        updateArtworkStatus,
        deleteArtwork,
        filters,
    } = useArtworkStore();

    const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
    const [page, setPage] = useState(1);
    const [artistProfiles, setArtistProfiles] = useState<ArtistProfiles>({});
    const itemsPerPage = 10;

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    useEffect(() => {
        if (session?.user?.id && !profile) {
            fetchProfile(session.user.id);
        }
    }, [session, fetchProfile, profile]);

    useEffect(() => {
        if (isAdmin()) {
            if (Object.values(filters).some(val => val !== null && val !== '')) {
                fetchFilteredArtworks(filters);
            } else {
                fetchAllArtworks();
            }
        }
    }, [isAdmin, filters, fetchAllArtworks, fetchFilteredArtworks]);

    useEffect(() => {
        if (inView && artworks.length >= page * itemsPerPage) {
            setPage((prev) => prev + 1);
        }
    }, [inView, artworks.length, page]);

    // New effect to fetch artist profiles when artworks change
    useEffect(() => {
        const fetchArtistProfiles = async () => {
            const uniqueArtistIds = [...new Set(artworks.map(artwork => artwork.user_id))];

            // Only fetch profiles that we don't have already
            const artistIdsToFetch = uniqueArtistIds.filter(id => !artistProfiles[id]);

            if (artistIdsToFetch.length === 0) return;

            const profileService = await import('@/stores/profile/profileService').then(m => m.ProfileService);

            const newProfiles: ArtistProfiles = { ...artistProfiles };

            // Fetch each artist profile
            await Promise.all(artistIdsToFetch.map(async (artistId) => {
                try {
                    const { profile } = await profileService.fetchProfile(artistId);
                    newProfiles[artistId] = profile;
                } catch (error) {
                    console.error(`Failed to fetch profile for artist ${artistId}:`, error);
                    newProfiles[artistId] = null; // Mark as failed to prevent repeated fetches
                }
            }));

            setArtistProfiles(newProfiles);
        };

        if (artworks.length > 0) {
            fetchArtistProfiles();
        }
    }, [artworks]);

    const handleStatusChange = async (artworkId: string, newStatus: string) => {
        try {
            await updateArtworkStatus(artworkId, newStatus);
            toast.success(`Artwork status updated to ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            toast.error("Failed to update artwork status");
            console.error("Error updating artwork status:", error);
        }
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

    const handleArtworkUpdated = () => {
        toast.success("Artwork updated successfully!");
        if (Object.values(filters).some(val => val !== null && val !== '')) {
            fetchFilteredArtworks(filters);
        } else {
            fetchAllArtworks();
        }
        setIsEditModalOpen(false);
    };

    const visibleArtworks = artworks.slice(0, page * itemsPerPage);

    if (loading && artworks.length === 0) {
        return (
            <div className="space-y-4">
                <ArtworkFilter />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-12 w-12 rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <ArtworkFilter />
                <p className="text-center text-red-500 py-8">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ArtworkFilter />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Artist</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleArtworks.length > 0 ? (
                            visibleArtworks.map((artwork) => (
                                <TableRow key={artwork.id}>
                                    <TableCell>
                                        {artwork.image_url ? (
                                            <Image
                                                src={artwork.image_url}
                                                alt={artwork.title}
                                                className="h-12 w-12 object-cover rounded"
                                                width={48}
                                                height={48}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{artwork.title}</TableCell>
                                    <TableCell>
                                        {artistProfiles[artwork.user_id]?.name || artwork.user_id}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{artwork.art_category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {artwork.artist_price ? `$${artwork.artist_price.toFixed(2)}` : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={artwork.status}
                                            onValueChange={(value) => handleStatusChange(artwork.id, value)}
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`h-2 w-2 rounded-full ${option.value === 'pending_review' ? 'bg-yellow-500' :
                                                                option.value === 'listed' ? 'bg-green-500' : 'bg-red-500'
                                                                }`} />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {artwork.created_at ? format(new Date(artwork.created_at), 'MMM dd, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingArtwork(artwork);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setArtworkToDelete(artwork);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <p className="text-muted-foreground">
                                            No artworks found matching your filters
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => useArtworkStore.getState().resetFilters()}
                                        >
                                            Clear filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {visibleArtworks.length > 0 && <div ref={ref} className="h-4" />}

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
        </div>
    );
};