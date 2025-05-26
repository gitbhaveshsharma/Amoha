// services/homeService.ts
import { supabase } from '@/lib/supabase';
import { Artwork } from '@/types';

export interface PaginatedResponse {
    data: Artwork[];
    totalCount: number;
    hasMore: boolean;
}

export interface HomeServiceParams {
    page?: number;
    limit?: number;
    seed?: string;
}

export class HomeService {
    // Get featured artworks
    static async getFeaturedArtworks(): Promise<Artwork[]> {
        try {
            const { data, error } = await supabase
                .from('artworks')
                .select('*')
                .eq('is_featured', true)
                .eq('status', 'listed')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return (data as unknown as Artwork[]) || [];
        } catch (error) {
            console.error('Error fetching featured artworks:', error);
            return [];
        }
    }

    // Get newest artworks with pagination
    static async getNewestArtworks(params: HomeServiceParams = {}): Promise<PaginatedResponse> {
        const { page = 1, limit = 20 } = params;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        try {
            // Get total count
            const { count } = await supabase
                .from('artworks')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'listed');

            // Get paginated data
            const { data, error } = await supabase
                .from('artworks')
                .select('*')
                .eq('status', 'listed')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return {
                data: (data as unknown as Artwork[]) || [],
                totalCount: count || 0,
                hasMore: (count || 0) > to + 1
            };
        } catch (error) {
            console.error('Error fetching newest artworks:', error);
            return {
                data: [],
                totalCount: 0,
                hasMore: false
            };
        }
    }

    // Get random artworks with seeded shuffle for consistency
    static async getRandomArtworks(params: HomeServiceParams = {}): Promise<Artwork[]> {
        const { limit = 20, seed = 'default' } = params;

        try {
            // First get all listed artworks
            const { data: allArtworks, error } = await supabase
                .from('artworks')
                .select('*')
                .eq('status', 'listed');

            if (error) throw error;
            if (!allArtworks) return [];

            // Seeded shuffle for consistency
            const shuffled = this.seededShuffle(allArtworks as unknown as Artwork[], seed);
            return shuffled.slice(0, limit);
        } catch (error) {
            console.error('Error fetching random artworks:', error);
            return [];
        }
    }

    // Get artworks by category
    static async getArtworksByCategory(category: string, limit: number = 12): Promise<Artwork[]> {
        try {
            const { data, error } = await supabase
                .from('artworks')
                .select('*')
                .eq('art_category', category)
                .eq('status', 'listed')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data as unknown as Artwork[]) || [];
        } catch (error) {
            console.error(`Error fetching ${category} artworks:`, error);
            return [];
        }
    }

    // Get all available categories
    static async getArtworkCategories(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('artworks')
                .select('art_category')
                .eq('status', 'listed')
                .not('art_category', 'is', null);

            if (error) throw error;

            // Get unique categories
            const categories = [...new Set(data?.map(item => item.art_category) || [])];
            return categories.filter(Boolean) as string[];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Get home page data (all sections at once)
    static async getHomePageData(params: HomeServiceParams = {}) {
        try {
            const [
                featuredArtworks,
                newestArtworks,
                randomArtworks,
                categories
            ] = await Promise.all([
                this.getFeaturedArtworks(),
                this.getNewestArtworks({ ...params, limit: 20 }),
                this.getRandomArtworks({ ...params, limit: 16 }),
                this.getArtworkCategories()
            ]);

            // Get artworks for top 4 categories
            const categoryArtworks: Record<string, Artwork[]> = {};
            const topCategories = categories.slice(0, 4);

            for (const category of topCategories) {
                categoryArtworks[category] = await this.getArtworksByCategory(category, 8);
            }

            return {
                featured: featuredArtworks,
                newest: newestArtworks,
                random: randomArtworks,
                categories: topCategories,
                categoryArtworks
            };
        } catch (error) {
            console.error('Error fetching home page data:', error);
            return {
                featured: [],
                newest: { data: [], totalCount: 0, hasMore: false },
                random: [],
                categories: [],
                categoryArtworks: {}
            };
        }
    }

    // Seeded shuffle algorithm for consistent randomization
    private static seededShuffle<T>(array: T[], seed: string): T[] {
        const seedNum = this.hashCode(seed);
        let currentIndex = array.length;
        let randomIndex: number;

        // Create a simple pseudo-random number generator
        const random = this.seededRandom(seedNum);

        while (currentIndex !== 0) {
            randomIndex = Math.floor(random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex]
            ];
        }

        return array;
    }

    // Simple hash function for seed
    private static hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Seeded random number generator
    private static seededRandom(seed: number) {
        let x = Math.sin(seed) * 10000;
        return function () {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        };
    }
}