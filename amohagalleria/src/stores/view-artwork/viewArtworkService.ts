// lib/services/artwork.service.ts
import { supabase } from '@/lib/supabase';
import { Artwork } from '@/types';
import { ProfileData } from '@/types/profile';

interface ArtworkDetailsResponse {
    artwork: Artwork;
    artist: ProfileData | null;
    images: string[];
}

export interface RelatedArtwork {
    id: string;
    title: string;
    image_url: string | null;
    art_category: string;
    artist_price: number | null;
    currency: string;
}

export const ArtworkService = {
    async getArtworkDetails(id: string): Promise<ArtworkDetailsResponse> {
        console.debug('getArtworkDetails called with id:', id);

        // Fetch artwork data
        const { data: artwork, error: artworkError } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', id)
            .single();

        console.debug('Artwork fetch result:', { artwork, artworkError });

        if (artworkError || !artwork) {
            console.error('Artwork fetch error:', artworkError);
            throw new Error(artworkError?.message || 'Artwork not found');
        }

        // Type the artwork data
        const typedArtwork = artwork as unknown as Artwork;
        console.debug('Typed artwork:', typedArtwork);

        // Fetch artist profile (only non-sensitive fields)
        const { data: artistProfile } = await supabase
            .from('profile')
            .select('id, name, bio, avatar_url, country, city')
            .eq('user_id', typedArtwork.user_id)
            .single();

        console.debug('Artist profile fetch result:', artistProfile);

        // Type the artist profile data
        const typedArtistProfile: ProfileData | null = artistProfile ? {
            id: artistProfile.id as string,
            user_id: typedArtwork.user_id as string,
            name: artistProfile.name as string,
            email: '', // This field is not selected, so we provide a default
            role: '', // This field is not selected, so we provide a default
            bio: artistProfile.bio as string,
            avatar_url: artistProfile.avatar_url as string,
            country: artistProfile.country as string,
            city: artistProfile.city as string,
            created_at: '' // This field is not selected, so we provide a default
        } : null;

        console.debug('Typed artist profile:', typedArtistProfile);

        // Get all artwork images (excluding null values)
        const images = [
            typedArtwork.image_url,
            typedArtwork.image_1_url,
            typedArtwork.image_2_url,
            typedArtwork.image_3_url,
            typedArtwork.image_4_url,
        ].filter((url): url is string => url !== null);

        console.debug('Artwork images:', images);

        return {
            artwork: typedArtwork,
            artist: typedArtistProfile,
            images,
        };
    },

    async getRelatedArtworks(artworkId: string, category: string): Promise<RelatedArtwork[]> {
        console.debug('getRelatedArtworks called with artworkId:', artworkId, 'category:', category);

        const { data, error } = await supabase
            .from('artworks')
            .select('id, title, image_url, art_category, artist_price, currency')
            .neq('id', artworkId)
            .eq('art_category', category)
            .limit(4);

        console.debug('Related artworks fetch result:', { data, error });

        if (error) {
            console.error('Error fetching related artworks:', error);
            return [];
        }

        // Type the returned data
        const typedRelatedArtworks: RelatedArtwork[] = data ? data.map(item => ({
            id: item.id as string,
            title: item.title as string,
            image_url: item.image_url as string | null,
            art_category: item.art_category as string,
            artist_price: item.artist_price as number | null,
            currency: item.currency as string
        })) : [];

        console.debug('Typed related artworks:', typedRelatedArtworks);

        return typedRelatedArtworks;
    },
}