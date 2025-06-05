// types/search.ts
export interface SearchSuggestion {
    suggestion: string;
    similarity_score: number;
    artwork_count: number;
    suggestion_type?: string;
}

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    image_1_url: string | null;
    image_2_url: string | null;
    image_3_url: string | null;
    image_4_url: string | null;
    status: string;
    dimensions: string;
    date: string;
    art_category: string;
    medium: string;
    art_location: string;
    artist_price: number | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    currency: string;
    is_featured: boolean;
    similarity_score: number;
    artist_name?: string;
    artist_avatar?: string;
}

export interface SearchState {
    query: string;
    suggestions: SearchSuggestion[];
    searchResults: SearchResult[];
    isLoadingSuggestions: boolean;
    isLoadingResults: boolean;
    showSuggestions: boolean;
    error: string | null;
    totalResults: number; currentPage: number;
    hasMore: boolean;
    searchByArtist: boolean;
    isArtistDetected: boolean;
}

export interface SearchFilters {
    medium?: string[];
    priceRange?: [number, number];
    size?: string[];
    orientation?: string[];
    art_category?: string[];
    currency?: string[];
    art_location?: string[];
    is_featured?: boolean;
}

export interface SearchActions {
    setQuery: (query: string) => void;
    fetchSuggestions: (query: string) => Promise<void>;
    searchArtworks: (query: string, page?: number, filters?: SearchFilters) => Promise<void>;
    clearSuggestions: () => void; clearSearch: () => void;
    setShowSuggestions: (show: boolean) => void;
    clearError: () => void;
}