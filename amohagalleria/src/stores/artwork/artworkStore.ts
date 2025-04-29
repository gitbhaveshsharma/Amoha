import { create } from 'zustand';
import { artworkService } from './artworkService';
import { Artwork, ArtworkUpdate } from '@/types';

interface ArtworkState {
    artworks: Artwork[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    itemsPerPage: number;

    // Actions
    fetchUserArtworks: (userId: string) => Promise<void>;
    updateArtwork: (artworkId: string, updateData: ArtworkUpdate) => Promise<void>;
    deleteArtwork: (artworkId: string) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useArtworkStore = create<ArtworkState>((set) => ({
    artworks: [],
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 8,

    // Fetch artworks for a specific user
    fetchUserArtworks: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const fetchedArtworks = await artworkService.getUserArtworks(userId);
            set({
                artworks: fetchedArtworks, // Replace instead of merge
                loading: false
            });
        } catch (err) {
            console.error('Error in fetchUserArtworks:', err);
            set({ error: 'Failed to fetch artworks', loading: false });
        }
    },

    // Update an artwork
    updateArtwork: async (artworkId: string, updateData: ArtworkUpdate) => {
        set({ loading: true, error: null });
        try {
            const updatedArtwork = await artworkService.updateArtwork(artworkId, updateData);
            set((state) => ({
                artworks: state.artworks.map((artwork) =>
                    artwork.id === artworkId ? updatedArtwork : artwork
                ),
                loading: false,
            }));
        } catch (err) {
            console.error('Error in updateArtwork:', err);
            set({ error: 'Failed to update artwork', loading: false });
        }
    },

    // Delete an artwork
    deleteArtwork: async (artworkId: string) => {
        set({ loading: true, error: null });
        try {
            await artworkService.deleteArtwork(artworkId);
            set((state) => ({
                artworks: state.artworks.filter((artwork) => artwork.id !== artworkId),
                loading: false,
            }));
        } catch (err) {
            console.error('Error in deleteArtwork:', err);
            set({ error: 'Failed to delete artwork', loading: false });
        }
    },

    // Set current page for pagination
    setCurrentPage: (page: number) => set({ currentPage: page }),
}));