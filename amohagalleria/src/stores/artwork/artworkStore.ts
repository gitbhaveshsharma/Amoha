import { create } from 'zustand';
import { artworkService } from './artworkService';
import { Artwork, ArtworkUpdate } from '@/types';

interface ArtworkState {
    artworks: Artwork[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    itemsPerPage: number;
    totalCount: number;
}

interface ArtworkActions {
    fetchUserArtworks: (userId: string) => Promise<void>;
    fetchArtworksByIds: (artworkIds: string[]) => Promise<void>;
    updateArtwork: (artworkId: string, updateData: ArtworkUpdate) => Promise<Artwork | undefined>;
    deleteArtwork: (artworkId: string) => Promise<void>;
    setCurrentPage: (page: number) => void;
    reset: () => void;
}

const initialState: ArtworkState = {
    artworks: [],
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 8,
    totalCount: 0,
};

export const useArtworkStore = create<ArtworkState & ArtworkActions>((set, get) => ({
    ...initialState,

    fetchUserArtworks: async (userId: string) => {
        if (get().loading) return;

        set({ loading: true, error: null });
        try {
            const fetchedArtworks: Artwork[] = await artworkService.getUserArtworks(userId);
            set({
                artworks: fetchedArtworks,
                totalCount: fetchedArtworks.length,
                loading: false,
            });
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch artworks';
            set({ error, loading: false });
            throw err;
        }
    },

    fetchArtworksByIds: async (artworkIds: string[]) => {
        if (get().loading) return;

        set({ loading: true, error: null });
        try {
            const fetchedArtworks: Artwork[] = await artworkService.getArtworksByIds(artworkIds);
            set({
                artworks: fetchedArtworks,
                loading: false,
            });
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to fetch artworks by IDs';
            set({ error, loading: false });
            throw err;
        }
    },

    updateArtwork: async (artworkId: string, updateData: ArtworkUpdate) => {
        set({ loading: true, error: null });
        try {
            const updatedArtwork = await artworkService.updateArtwork(artworkId, updateData);
            set((state) => ({
                artworks: state.artworks.map((artwork) =>
                    artwork.id === artworkId ? (updatedArtwork as Artwork) : artwork
                ),
                loading: false,
            }));
            return updatedArtwork;
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to update artwork';
            set({ error, loading: false });
            throw err;
        }
    },

    deleteArtwork: async (artworkId: string) => {
        set({ loading: true, error: null });
        try {
            await artworkService.deleteArtwork(artworkId);
            set((state) => ({
                artworks: state.artworks.filter((artwork) => artwork.id !== artworkId),
                totalCount: state.totalCount - 1,
                loading: false,
            }));
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to delete artwork';
            set({ error, loading: false });
            throw err;
        }
    },

    setCurrentPage: (page: number) => {
        if (page < 1 || page > Math.ceil(get().totalCount / get().itemsPerPage)) return;
        set({ currentPage: page });
    },

    reset: () => set(initialState),
}));