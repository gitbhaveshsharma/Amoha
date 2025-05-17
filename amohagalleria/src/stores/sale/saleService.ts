import { supabase } from '@/lib/supabase';
import { SaleWithArtwork } from '@/types/sale';
import { Artwork } from '@/types';

export const saleService = {
    async getSalesByArtist(artistId: string): Promise<SaleWithArtwork[]> {
        // First get all artworks belonging to this artist
        const { data: artworks, error: artworksError } = await supabase
            .from('artworks')
            .select('id')
            .eq('user_id', artistId);

        if (artworksError) {
            throw new Error(artworksError.message);
        }

        if (!artworks || artworks.length === 0) {
            return [];
        }

        const artworkIds = artworks.map(artwork => artwork.id);

        // Then get sales for these artworks with proper join
        const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('*')
            .in('artwork_id', artworkIds)
            .order('sold_at', { ascending: false }) as { data: { artwork_id: string }[] | null, error: Error | null };

        if (salesError) {
            throw new Error(salesError.message);
        }

        // Fetch associated artwork details separately
        const sales = await Promise.all(
            (salesData || []).map(async (sale) => {
                const { data: artwork, error: artworkError } = await supabase
                    .from('artworks')
                    .select('id, title, user_id, image_url')
                    .eq('id', sale.artwork_id)
                    .single();

                if (artworkError || !artwork) {
                    console.error(`Error fetching artwork for sale with artwork_id ${sale.artwork_id}:`, artworkError?.message || 'Artwork not found');
                    return null;
                }

                // Ensure artwork belongs to the artist (just in case)
                if ((artwork as Artwork).user_id !== artistId) {
                    return null;
                }

                return {
                    ...sale,
                    artwork: {
                        id: artwork.id,
                        title: artwork.title,
                        user_id: artwork.user_id,
                        image_url: artwork.image_url
                    } as Pick<Artwork, 'id' | 'title' | 'user_id' | 'image_url'>
                } as SaleWithArtwork;
            })
        );

        // Filter out any nulls from errors
        return sales.filter((sale): sale is SaleWithArtwork => sale !== null);
    }
};
