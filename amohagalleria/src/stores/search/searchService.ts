// services/searchService.ts
import { supabase } from "@/lib/supabase";
import type { SearchSuggestion, SearchResult } from "@/types/search";

export class SearchService {
    static async getSuggestions(query: string): Promise<SearchSuggestion[]> {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            const { data, error } = await supabase.rpc('get_artwork_suggestions', {
                input_text: query.trim()
            });

            if (error) {
                console.error('Error fetching suggestions:', error);
                throw new Error('Failed to fetch suggestions');
            } return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Search service error:', error);
            throw error;
        }
    }

    static async searchArtworks(
        query: string,
        page: number = 1,
        limit: number = 20,
        searchByArtist: boolean = false
    ): Promise<{ results: SearchResult[]; hasMore: boolean; total: number; isArtistSearch: boolean }> {
        try {
            if (!query || query.trim().length < 2) {
                return { results: [], hasMore: false, total: 0, isArtistSearch: false };
            }

            const offset = (page - 1) * limit;

            // First, try to check if this query matches any artist names
            let isArtistSearch = searchByArtist;
            if (!searchByArtist) {
                // Check if query looks like an artist name by checking if it matches any artists
                const { data: artistCheck, error: artistError } = await supabase
                    .from('profile')
                    .select('user_id')
                    .eq('role', 'artist')
                    .ilike('name', `%${query.trim()}%`)
                    .limit(1);

                if (!artistError && artistCheck && artistCheck.length > 0) {
                    isArtistSearch = true;
                }
            } const { data, error } = await supabase.rpc('search_artworks', {
                search_query: query.trim(),
                limit_count: limit + 1, // Fetch one extra to check if there are more
                offset_count: offset,
                search_by_artist: isArtistSearch
            });

            if (error) {
                console.error('Error searching artworks:', error);
                throw new Error('Failed to search artworks');
            }

            const results: SearchResult[] = Array.isArray(data) ? data : [];
            const hasMore = results.length > limit;

            // Remove the extra item if it exists
            if (hasMore) {
                results.pop();
            }

            // Get total count for better UX (only on first page to avoid extra calls)
            let totalCount = 0;
            if (page === 1 && results.length > 0) {
                // For first page, estimate total from the search results
                // This is a simplified approach - you could implement a separate count function
                totalCount = hasMore ? results.length + 1 : results.length; // At least this many

                // Try to get a more accurate count
                try {
                    const { count, error: countError } = await supabase.rpc('count_search_artworks', {
                        search_query: query.trim(),
                        search_by_artist: isArtistSearch
                    });

                    if (!countError && count !== null) {
                        totalCount = count;
                    }
                } catch (countErr) {
                    // If count fails, use the estimated count
                    console.warn('Could not get exact count:', countErr);
                }
            } else if (page === 1) {
                totalCount = 0; // No results found
            }

            return {
                results,
                hasMore,
                total: totalCount,
                isArtistSearch
            };
        } catch (error) {
            console.error('Search service error:', error);
            throw error;
        }
    }


    static async getPopularSearchTerms(): Promise<string[]> {
        try {
            // Get popular categories and mediums as search suggestions
            const { data: categories, error: catError } = await supabase
                .from('artwork')
                .select('art_category')
                .eq('status', 'active')
                .not('art_category', 'is', null);

            const { data: mediums, error: medError } = await supabase
                .from('artwork')
                .select('medium')
                .eq('status', 'active')
                .not('medium', 'is', null);

            if (catError || medError) {
                console.error('Error fetching popular terms:', catError || medError);
                return [];
            }

            const categoryCount = new Map<string, number>();
            const mediumCount = new Map<string, number>();

            categories?.forEach(item => {
                const category = typeof item.art_category === "string" ? item.art_category : String(item.art_category);
                if (category && category !== "null" && category !== "[object Object]") {
                    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
                }
            });

            mediums?.forEach(item => {
                const medium = typeof item.medium === "string" ? item.medium : String(item.medium);
                if (medium && medium !== "null" && medium !== "[object Object]") {
                    mediumCount.set(medium, (mediumCount.get(medium) || 0) + 1);
                }
            });

            const popularTerms = [
                ...Array.from(categoryCount.entries()),
                ...Array.from(mediumCount.entries())
            ]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([term]) => term);

            return popularTerms;
        } catch (error) {
            console.error('Error fetching popular search terms:', error);
            return [];
        }
    }
}