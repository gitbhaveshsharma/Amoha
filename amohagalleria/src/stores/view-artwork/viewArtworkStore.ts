import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Artwork } from '@/types';
import { ProfileData } from '@/types/profile';
import { ArtworkService, RelatedArtwork } from './viewArtworkService';

interface ArtworkState {
    artwork: Artwork | null;
    artist: ProfileData | null;
    images: string[];
    relatedArtworks: RelatedArtwork[];
    loading: boolean;
    error: string | null;
    fetchArtworkDetails: (id: string) => Promise<void>;
    fetchRelatedArtworks: (artworkId: string, category: string) => Promise<void>;
    clearArtworkDetails: () => void;
}

export const useArtworkStore = create<ArtworkState>()(
    devtools((set) => ({
        artwork: null,
        artist: null,
        images: [],
        relatedArtworks: [],
        loading: false,
        error: null,

        fetchArtworkDetails: async (id: string) => {
            set({ loading: true, error: null });
            try {
                const { artwork, artist, images } = await ArtworkService.getArtworkDetails(id);
                set({
                    artwork: artwork,
                    artist: artist,
                    images,
                    loading: false,
                });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to fetch artwork',
                    loading: false,
                });
            }
        },

        fetchRelatedArtworks: async (artworkId: string, category: string) => {
            try {
                const relatedArtworks = await ArtworkService.getRelatedArtworks(artworkId, category);
                set({ relatedArtworks });
            } catch (error) {
                console.error('Failed to fetch related artworks:', error);
            }
        },

        clearArtworkDetails: () => {
            set({
                artwork: null,
                artist: null,
                images: [],
                relatedArtworks: [],
                error: null,
            });
        },
    }))
);