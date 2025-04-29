import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkUpdate } from '@/types';

export const artworkService = {
    // Fetch artworks for a specific user
    async getUserArtworks(userId: string): Promise<Artwork[]> {
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch artworks: ${error.message}`);
        }

        return data as Artwork[];
    },

    // Update an artwork
    async updateArtwork(artworkId: string, updateData: ArtworkUpdate): Promise<Artwork> {
        const { data, error } = await supabase
            .from('artworks')
            .update(updateData)
            .eq('id', artworkId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update artwork: ${error.message}`);
        }

        return data as Artwork;
    },

    // Delete an artwork
    async deleteArtwork(artworkId: string): Promise<void> {
        const { error } = await supabase
            .from('artworks')
            .delete()
            .eq('id', artworkId);

        if (error) {
            throw new Error(`Failed to delete artwork: ${error.message}`);
        }
    }
};