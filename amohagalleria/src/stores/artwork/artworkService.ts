import { supabase } from '@/lib/supabase';
import { Artwork, ArtworkUpdate } from '@/types';

export const artworkService = {

    // Get all artworks (admin only)
    async getAllArtworks(): Promise<Artwork[]> {
        const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch artworks: ${error.message}`);
        return (data as unknown as Artwork[]) || [];
    },

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


    // Update artwork status (admin only)
    async updateArtworkStatus(artworkId: string, status: string): Promise<Artwork> {
        const { data, error } = await supabase
            .from('artworks')
            .update({ status })
            .eq('id', artworkId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update status: ${error.message}`);
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
    },
    // Get filtered artworks (admin only)
    async getFilteredArtworks(filters: {
        status?: string;
        minPrice?: number;
        maxPrice?: number;
        startDate?: string;
        endDate?: string;
        category?: string;
    }): Promise<Artwork[]> {
        let query = supabase.from('artworks').select('*'); if (filters.status) query = query.eq('status', filters.status);
        if (filters.minPrice) query = query.gte('artist_price', filters.minPrice);
        if (filters.maxPrice) query = query.lte('artist_price', filters.maxPrice);
        if (filters.startDate) query = query.gte('created_at', filters.startDate);
        if (filters.endDate) query = query.lte('created_at', filters.endDate);
        if (filters.category && filters.category !== 'all') query = query.eq('art_category', filters.category);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch filtered artworks: ${error.message}`);
        return (data as unknown as Artwork[]) || [];
    },

    // Get unique artwork categories
    async getArtworkCategories(): Promise<string[]> {
        const { data, error } = await supabase
            .from('artworks')
            .select('art_category')
            .neq('art_category', null);

        if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

        const categories = new Set((data as { art_category: string }[]).map((item) => item.art_category));
        return Array.from(categories);
    }
};