// types/filter.ts
export interface FilterOptions {
    // Basic filters
    categories: string[];
    mediums: string[];
    status_filter: 'active' | 'listed' | 'active,listed';

    // Price range
    min_price: number | null;
    max_price: number | null;

    // Artist filters
    artist_ids: string[];
    artist_name_filter: string | null;

    // Date range
    min_year: number | null;
    max_year: number | null;

    // Dimensions
    min_width_cm: number | null;
    max_width_cm: number | null;
    min_height_cm: number | null;
    max_height_cm: number | null;

    // Location
    locations: string[];

    // Featured/trending
    only_featured: boolean;
    only_trending: boolean;

    // Sorting
    sort_by: 'created_at_desc' | 'price_asc' | 'price_desc' | 'featured' | 'trending';

    // Pagination
    limit_count: number;
    offset_count: number;
}

export interface FilterState {
    filters: FilterOptions;
    filteredResults: FilteredArtwork[];
    isLoading: boolean;
    error: string | null;
    totalResults: number;
    currentPage: number;
    hasMore: boolean;
    availableCategories: string[];
    availableMediums: string[];
    availableLocations: string[];
    priceRange: { min: number; max: number } | null;
}

export interface FilterActions {
    setFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
    setFilters: (filters: Partial<FilterOptions>) => void;
    applyFilters: (artworkIds?: string[]) => Promise<void>;
    loadMoreResults: () => Promise<void>;
    clearFilters: () => void;
    resetFilter: <K extends keyof FilterOptions>(key: K) => void;
    fetchFilterOptions: () => Promise<void>;
}

export interface FilteredArtwork {
    id: string;
    title: string;
    description: string;
    medium: string;
    dimensions: string;
    date: string;
    art_location: string;
    artist_price: number;
    user_id: string;
    image_url: string;
    status: string;
    created_at: string;
    updated_at: string;
    currency: string;
    art_category: string;
    is_featured: boolean;
    image_1_url: string;
    image_2_url: string;
    image_3_url: string;
    image_4_url: string;
    artist_name: string;
    artist_avatar: string;
    view_count: number;
    like_count: number;
}

export interface FilterServiceOptions extends Partial<FilterOptions> {
    artwork_ids?: string[];
}