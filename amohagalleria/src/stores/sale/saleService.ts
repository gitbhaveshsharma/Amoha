import { supabase } from '@/lib/supabase';
import { SaleWithArtwork } from '@/types/sale';

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

        // Then get sales only for these artworks
        const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select(`
        *,
        artwork:artwork_id (
          id,
          title,
          user_id,
          image_url
        )
      `)
            .in('artwork_id', artworkIds)
            .order('sold_at', { ascending: false });

        if (salesError) {
            throw new Error(salesError.message);
        }

        // Double-check ownership (just in case)
        const filteredSales = sales.filter(sale =>
            sale.artwork?.user_id === artistId
        ) as SaleWithArtwork[];

        return filteredSales;
    },
};