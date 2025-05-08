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

        // Validate or cast the data to Artwork[]
        return (data as unknown as Artwork[]) || [];
    },

    // Update an artwork
    async updateArtwork(artworkId: string, updateData: ArtworkUpdate): Promise<Artwork> {
        const dataToUpdate = { ...updateData };

        // Handle image upload if a new image is provided
        if (dataToUpdate.image instanceof File) {
            const imageFile = dataToUpdate.image;
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `artwork-uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('artwork-uploads')
                .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

            if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from('artwork-uploads')
                .getPublicUrl(filePath);

            dataToUpdate.image_url = publicUrl;
            delete dataToUpdate.image; // Remove the file object from the update payload
        }

        // Ensure artist_price is a number
        if (typeof dataToUpdate.artist_price === 'string') {
            dataToUpdate.artist_price = parseFloat(dataToUpdate.artist_price);
        }

        // Update the artwork in the database
        const { data, error } = await supabase
            .from('artworks')
            .update(dataToUpdate)
            .eq('id', artworkId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update artwork: ${error.message}`);

        if (!data) throw new Error('Artwork not found after update');
        return (data as unknown as Artwork[]) || [];
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
    },
    // Fetch artworks by a list of IDs
    async getArtworksByIds(artworkIds: string[]): Promise<Artwork[]> {
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .in('id', artworkIds);

        if (error) {
            throw new Error(`Failed to fetch artworks by IDs: ${error.message}`);
        }

        // Validate or cast the data to Artwork[]
        return (data as unknown as Artwork[]) || [];
    }
};