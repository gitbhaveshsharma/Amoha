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
    categories: string[];
    filters: {
        status: string;
        minPrice: number | null;
        maxPrice: number | null;
        startDate: string | null;
        endDate: string | null;
        category: string;
    };
}

interface ArtworkActions {
    // Fetch methods
    fetchUserArtworks: (userId: string) => Promise<void>;
    fetchAllArtworks: () => Promise<void>;
    fetchFilteredArtworks: (filters: Partial<ArtworkState['filters']>) => Promise<void>;
    fetchArtworkCategories: () => Promise<void>;

    // CRUD operations
    updateArtwork: (artworkId: string, updateData: ArtworkUpdate) => Promise<Artwork | undefined>;
    updateArtworkStatus: (artworkId: string, status: string) => Promise<void>;
    deleteArtwork: (artworkId: string) => Promise<void>;

    // Utility methods
    setCurrentPage: (page: number) => void;
    setFilters: (filters: Partial<ArtworkState['filters']>) => void;
    resetFilters: () => void;
    reset: () => void;
}

const initialState: ArtworkState = {
    artworks: [],
    loading: false,
    error: null,
    currentPage: 1,
    itemsPerPage: 10,
    totalCount: 0,
    categories: [],
    filters: {
        status: '',
        minPrice: null,
        maxPrice: null,
        startDate: null,
        endDate: null,
        category: ''
    }
};

export const useArtworkStore = create<ArtworkState & ArtworkActions>((set, get) => ({
    ...initialState,

    // Fetch all artworks (admin)
    fetchAllArtworks: async () => {
        set({ loading: true, error: null });
        try {
            const artworks = await artworkService.getAllArtworks();
            set({ artworks, totalCount: artworks.length, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch artworks', loading: false });
        }
    },

    // Fetch user-specific artworks
    fetchUserArtworks: async (userId) => {
        set({ loading: true, error: null });
        try {
            const artworks = await artworkService.getUserArtworks(userId);
            set({ artworks, totalCount: artworks.length, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch user artworks', loading: false });
        }
    },

    // Fetch with filters
    fetchFilteredArtworks: async (filters) => {
        set({ loading: true, error: null });
        try {
            const sanitizedFilters = Object.fromEntries(
                Object.entries(filters).filter(([value]) => value !== null)
            );
            const artworks = await artworkService.getFilteredArtworks(sanitizedFilters);
            set({ artworks, totalCount: artworks.length, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch filtered artworks', loading: false });
        }
    },

    // Fetch categories
    fetchArtworkCategories: async () => {
        set({ loading: true, error: null });
        try {
            const categories = await artworkService.getArtworkCategories();
            set({ categories, loading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch categories', loading: false });
        }
    },

    // Update artwork
    updateArtwork: async (artworkId, updateData) => {
        set({ loading: true, error: null });
        try {
            const updatedArtwork = await artworkService.updateArtwork(artworkId, updateData);
            set(state => ({
                artworks: state.artworks.map(a => a.id === artworkId ? updatedArtwork : a),
                loading: false
            }));
            return updatedArtwork;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update artwork', loading: false });
        }
    },

    // Update status
    updateArtworkStatus: async (artworkId, status) => {
        set({ loading: true, error: null });
        try {
            const updatedArtwork = await artworkService.updateArtworkStatus(artworkId, status);
            set(state => ({
                artworks: state.artworks.map(a => a.id === artworkId ? updatedArtwork : a),
                loading: false
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update status', loading: false });
        }
    },

    // Delete artwork
    deleteArtwork: async (artworkId) => {
        set({ loading: true, error: null });
        try {
            await artworkService.deleteArtwork(artworkId);
            set(state => ({
                artworks: state.artworks.filter(a => a.id !== artworkId),
                totalCount: state.totalCount - 1,
                loading: false
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete artwork', loading: false });
        }
    },

    // Pagination
    setCurrentPage: (page) => {
        if (page < 1 || page > Math.ceil(get().totalCount / get().itemsPerPage)) return;
        set({ currentPage: page });
    },

    // Filters
    setFilters: (filters) => {
        set(state => ({
            filters: { ...state.filters, ...filters },
            currentPage: 1
        }));
        get().fetchFilteredArtworks({ ...get().filters, ...filters });
    },

    resetFilters: () => {
        set({ filters: initialState.filters, currentPage: 1 });
        get().fetchAllArtworks();
    },

    // Reset store
    reset: () => set(initialState)
}));