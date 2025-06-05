// stores/searchStore.ts
import { create } from 'zustand';
import { SearchService } from './searchService';
import type { SearchState, SearchActions } from '@/types/search';
import type { FilterServiceOptions } from '@/types/filter';

interface SearchStore extends SearchState, SearchActions {
    // New properties for search + filter integration
    searchWithFilters: (query: string, filterOptions?: Omit<FilterServiceOptions, 'artwork_ids'>, page?: number) => Promise<void>;
    searchArtworkIds: string[]; // Store the IDs from search for filter integration
}

export const useSearchStore = create<SearchStore>((set, get) => ({
    // Initial state
    query: '',
    suggestions: [],
    searchResults: [],
    isLoadingSuggestions: false,
    isLoadingResults: false,
    showSuggestions: false,
    error: null,
    totalResults: 0,
    currentPage: 1,
    hasMore: false,
    searchByArtist: false, // Auto-detected artist search
    isArtistDetected: false, // New flag to indicate if artist was auto-detected
    searchArtworkIds: [], // New property for filter integration

    // Missing methods
    clearSuggestions: () => {
        set({ suggestions: [], showSuggestions: false });
    },
    clearSearch: () => {
        set({
            searchResults: [],
            totalResults: 0,
            currentPage: 1,
            hasMore: false,
            searchByArtist: false,
            isArtistDetected: false,
            searchArtworkIds: [],
            error: null,
            query: ''
        });
    },
    setShowSuggestions: (show: boolean) => {
        set({ showSuggestions: show });
    },
    clearError: () => {
        set({ error: null });
    },

    // Actions
    setQuery: (query: string) => {
        set({ query, error: null });
    },

    fetchSuggestions: async (query: string) => {
        if (!query || query.trim().length < 2) {
            set({ suggestions: [], isLoadingSuggestions: false, showSuggestions: false });
            return;
        }

        set({ isLoadingSuggestions: true, error: null });

        try {
            const suggestions = await SearchService.getSuggestions(query);
            set({
                suggestions,
                isLoadingSuggestions: false,
                showSuggestions: suggestions.length > 0
            });
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            set({
                error: 'Failed to fetch suggestions',
                isLoadingSuggestions: false,
                suggestions: [],
                showSuggestions: false
            });
        }
    },

    searchArtworks: async (query: string, page: number = 1) => {
        if (!query || query.trim().length < 2) {
            set({
                searchResults: [],
                isLoadingResults: false,
                totalResults: 0,
                currentPage: 1,
                hasMore: false,
                searchByArtist: false,
                isArtistDetected: false,
                searchArtworkIds: []
            });
            return;
        }

        set({ isLoadingResults: true, error: null });

        try {
            const { results, hasMore, total, isArtistSearch } = await SearchService.searchArtworks(
                query,
                page,
                20 // limit
            );

            const artworkIds: string[] = results.map((result: { id: string }) => result.id);

            if (page === 1) {
                // New search
                set({
                    searchResults: results,
                    totalResults: total,
                    currentPage: page,
                    hasMore,
                    searchByArtist: isArtistSearch || false,
                    isArtistDetected: isArtistSearch || false,
                    isLoadingResults: false,
                    searchArtworkIds: artworkIds
                });
            } else {
                // Pagination - append results and keep existing total
                const currentResults = get().searchResults;
                const currentTotal = get().totalResults;
                const currentArtworkIds = get().searchArtworkIds;

                set({
                    searchResults: [...currentResults, ...results],
                    currentPage: page,
                    hasMore,
                    totalResults: total > 0 ? total : currentTotal, // Preserve total from first page
                    isLoadingResults: false,
                    searchArtworkIds: [...currentArtworkIds, ...artworkIds]
                });
            }
        } catch (error) {
            console.error('Error searching artworks:', error);
            set({
                error: 'Failed to search artworks. Please try again.',
                isLoadingResults: false,
                searchResults: page === 1 ? [] : get().searchResults,
                totalResults: page === 1 ? 0 : get().totalResults,
                searchArtworkIds: page === 1 ? [] : get().searchArtworkIds
            });
        }
    },

    // New method for search with filters
    searchWithFilters: async (
        query: string,
        filterOptions: Omit<FilterServiceOptions, 'artwork_ids'> = {},
        page: number = 1
    ) => {
        if (!query || query.trim().length < 2) {
            set({
                searchResults: [],
                isLoadingResults: false,
                totalResults: 0,
                currentPage: 1,
                hasMore: false,
                searchByArtist: false,
                isArtistDetected: false,
                searchArtworkIds: []
            });
            return;
        }

        set({ isLoadingResults: true, error: null });

        try {
            const { results, hasMore, total, isArtistSearch, artworkIds } = await SearchService.searchAndFilter(
                query,
                filterOptions,
                page,
                20 // limit
            );

            if (page === 1) {
                // New search with filters
                set({
                    searchResults: results,
                    totalResults: total,
                    currentPage: page,
                    hasMore,
                    searchByArtist: isArtistSearch || false,
                    isArtistDetected: isArtistSearch || false,
                    isLoadingResults: false,
                    searchArtworkIds: artworkIds
                });
            } else {
                // Pagination - append results
                const currentResults = get().searchResults;
                const currentTotal = get().totalResults;

                set({
                    searchResults: [...currentResults, ...results],
                    currentPage: page,
                    hasMore,
                    totalResults: total > 0 ? total : currentTotal,
                    isLoadingResults: false
                });
            }
        } catch (error) {
            console.error('Error searching with filters:', error);
            set({
                error: 'Failed to search artworks with filters. Please try again.',
                isLoadingResults: false,
                searchResults: page === 1 ? [] : get().searchResults,
                totalResults: page === 1 ? 0 : get().totalResults,
                searchArtworkIds: page === 1 ? [] : get().searchArtworkIds
            });
        }
    },
}));