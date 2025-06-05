// services/filterService.ts
import { supabase } from "@/lib/supabase";
import type { FilteredArtwork, FilterServiceOptions } from "@/types/filter";

export class FilterService {
    static async filterArtworks(options: FilterServiceOptions = {}): Promise<{
        results: FilteredArtwork[];
        hasMore: boolean;
        total: number;
    }> {
        try {
            const {
                artwork_ids,
                categories = [],
                mediums = [],
                status_filter = 'listed',
                min_price,
                max_price,
                artist_ids = [],
                artist_name_filter,
                min_year,
                max_year,
                min_width_cm,
                max_width_cm,
                min_height_cm,
                max_height_cm,
                locations = [],
                only_featured = false,
                only_trending = false,
                sort_by = 'created_at_desc',
                limit_count = 20,
                offset_count = 0
            } = options;

            // Clean and validate arrays - remove empty strings and null values
            const cleanCategories = categories.filter(cat => cat && cat.trim().length > 0);
            const cleanMediums = mediums.filter(med => med && med.trim().length > 0);
            const cleanLocations = locations.filter(loc => loc && loc.trim().length > 0);
            const cleanArtistIds = artist_ids.filter(id => id && id.trim().length > 0);
            const cleanArtworkIds = artwork_ids?.filter(id => id && id.trim().length > 0);

            console.log('Filter parameters:', {
                categories: cleanCategories,
                mediums: cleanMediums,
                status_filter,
                min_price,
                max_price,
                locations: cleanLocations,
                only_featured,
                sort_by
            });

            const { data, error } = await supabase.rpc('filter_artworks', {
                artwork_ids: cleanArtworkIds && cleanArtworkIds.length > 0 ? cleanArtworkIds : null,
                categories: cleanCategories.length > 0 ? cleanCategories : null,
                mediums: cleanMediums.length > 0 ? cleanMediums : null,
                status_filter,
                min_price,
                max_price,
                artist_ids: cleanArtistIds.length > 0 ? cleanArtistIds : null,
                artist_name_filter: artist_name_filter?.trim() || null,
                min_year,
                max_year,
                min_width_cm,
                max_width_cm,
                min_height_cm,
                max_height_cm,
                locations: cleanLocations.length > 0 ? cleanLocations : null,
                only_featured,
                only_trending,
                sort_by,
                limit_count: limit_count + 1, // Fetch one extra to check if there are more
                offset_count
            });

            if (error) {
                console.error('Error filtering artworks:', error);
                throw new Error(`Failed to filter artworks: ${error.message}`);
            }

            // console.log('Raw results count:', data?.length || 0);

            const results: FilteredArtwork[] = Array.isArray(data) ? data : [];
            const hasMore = results.length > limit_count;

            // Remove the extra item if it exists
            if (hasMore) {
                results.pop();
            }

            // Get total count for the first page only to avoid performance issues
            let totalCount = 0;
            if (offset_count === 0 && results.length > 0) {
                try {
                    // For total count, we'll make a simplified query without limit/offset
                    const { data: countData, error: countError } = await supabase.rpc('filter_artworks', {
                        artwork_ids: cleanArtworkIds && cleanArtworkIds.length > 0 ? cleanArtworkIds : null,
                        categories: cleanCategories.length > 0 ? cleanCategories : null,
                        mediums: cleanMediums.length > 0 ? cleanMediums : null,
                        status_filter,
                        min_price,
                        max_price,
                        artist_ids: cleanArtistIds.length > 0 ? cleanArtistIds : null,
                        artist_name_filter: artist_name_filter?.trim() || null,
                        min_year,
                        max_year,
                        min_width_cm,
                        max_width_cm,
                        min_height_cm,
                        max_height_cm,
                        locations: cleanLocations.length > 0 ? cleanLocations : null,
                        only_featured,
                        only_trending,
                        sort_by,
                        limit_count: null, // Get all for count
                        offset_count: 0
                    });

                    if (!countError && Array.isArray(countData)) {
                        totalCount = countData.length;
                    } else {
                        // Fallback estimation
                        totalCount = hasMore ? results.length + 1 : results.length;
                    }
                } catch (countErr) {
                    console.warn('Could not get exact count:', countErr);
                    totalCount = hasMore ? results.length + 1 : results.length;
                }
            } else if (offset_count === 0) {
                totalCount = 0;
            }

            console.log('Final results:', {
                count: results.length,
                hasMore,
                total: totalCount
            });

            return {
                results,
                hasMore,
                total: totalCount
            };
        } catch (error) {
            console.error('Filter service error:', error);
            throw error;
        }
    }

    static async getFilterOptions(): Promise<{
        categories: string[];
        mediums: string[];
        locations: string[];
        priceRange: { min: number; max: number } | null;
    }> {
        try {
            const [categoriesResult, mediumsResult, locationsResult, priceResult] = await Promise.all([
                // Get unique categories
                supabase
                    .from('artworks')
                    .select('art_category')
                    .in('status', ['active', 'listed']) // Include both active and listed
                    .not('art_category', 'is', null),

                // Get unique mediums
                supabase
                    .from('artworks')
                    .select('medium')
                    .in('status', ['active', 'listed'])
                    .not('medium', 'is', null),

                // Get unique locations
                supabase
                    .from('artworks')
                    .select('art_location')
                    .in('status', ['active', 'listed'])
                    .not('art_location', 'is', null),

                // Get price range
                supabase
                    .from('artworks')
                    .select('artist_price')
                    .in('status', ['active', 'listed'])
                    .not('artist_price', 'is', null)
                    .order('artist_price', { ascending: true })
            ]);

            // Process categories with trimming and deduplication
            const categorySet = new Set<string>();
            categoriesResult.data?.forEach(item => {
                if (item.art_category && typeof item.art_category === 'string') {
                    const trimmed = item.art_category.trim();
                    if (trimmed.length > 0) {
                        categorySet.add(trimmed);
                    }
                }
            });

            // Process mediums with trimming and deduplication
            const mediumSet = new Set<string>();
            mediumsResult.data?.forEach(item => {
                if (item.medium && typeof item.medium === 'string') {
                    const trimmed = item.medium.trim();
                    if (trimmed.length > 0) {
                        mediumSet.add(trimmed);
                    }
                }
            });

            // Process locations with trimming and deduplication
            const locationSet = new Set<string>();
            locationsResult.data?.forEach(item => {
                if (item.art_location && typeof item.art_location === 'string') {
                    const trimmed = item.art_location.trim();
                    if (trimmed.length > 0) {
                        locationSet.add(trimmed);
                    }
                }
            });

            // Process price range
            let priceRange: { min: number; max: number } | null = null;
            if (priceResult.data && priceResult.data.length > 0) {
                const prices = priceResult.data
                    .map(item => item.artist_price)
                    .filter((price): price is number => typeof price === 'number' && !isNaN(price) && price > 0);

                if (prices.length > 0) {
                    priceRange = {
                        min: Math.min(...prices),
                        max: Math.max(...prices)
                    };
                }
            }

            console.log('Filter options loaded:', {
                categories: Array.from(categorySet).length,
                mediums: Array.from(mediumSet).length,
                locations: Array.from(locationSet).length,
                priceRange
            });

            return {
                categories: Array.from(categorySet).sort(),
                mediums: Array.from(mediumSet).sort(),
                locations: Array.from(locationSet).sort(),
                priceRange
            };
        } catch (error) {
            console.error('Error fetching filter options:', error);
            throw new Error('Failed to fetch filter options');
        }
    }

    static async getArtistsByName(query: string): Promise<Array<{ id: string; name: string; avatar_url: string }>> {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            const { data, error } = await supabase
                .from('profile')
                .select('user_id, name, avatar_url')
                .eq('role', 'artist')
                .ilike('name', `%${query.trim()}%`)
                .limit(10);

            if (error) {
                console.error('Error fetching artists:', error);
                throw new Error('Failed to fetch artists');
            }

            return (data || []).map(artist => ({
                id: String(artist.user_id),
                name: String(artist.name || ''),
                avatar_url: String(artist.avatar_url || '')
            }));
        } catch (error) {
            console.error('Error in getArtistsByName:', error);
            throw error;
        }
    }

    // Debug function to test filters
    static async debugFilters(): Promise<void> {
        try {
            // Test basic query
            console.log('Testing basic filter...');
            const basicResult = await supabase.rpc('filter_artworks', {
                status_filter: 'active',
                limit_count: 5
            });
            console.log('Basic filter result:', basicResult);

            // Test category filter
            console.log('Testing category filter...');
            const categoryResult = await supabase.rpc('filter_artworks', {
                categories: ['Painting'],
                status_filter: 'active',
                limit_count: 5
            });
            console.log('Category filter result:', categoryResult);

            // Get all available categories
            console.log('Getting all categories...');
            const allCategories = await supabase
                .from('artworks')
                .select('art_category')
                .not('art_category', 'is', null);
            console.log('All categories in DB:', allCategories.data?.map(item => item.art_category));

        } catch (error) {
            console.error('Debug error:', error);
        }
    }
}