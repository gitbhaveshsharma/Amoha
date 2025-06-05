// stores/filterStore.ts
import { create } from 'zustand';
import { FilterService } from './filterService';
import type { FilterState, FilterActions, FilterOptions } from '@/types/filter';

interface FilterStore extends FilterState, FilterActions { }

const defaultFilters: FilterOptions = {
    categories: [],
    mediums: [],
    status_filter: 'active',
    min_price: null,
    max_price: null,
    artist_ids: [],
    artist_name_filter: null,
    min_year: null,
    max_year: null,
    min_width_cm: null,
    max_width_cm: null,
    min_height_cm: null,
    max_height_cm: null,
    locations: [],
    only_featured: false,
    only_trending: false,
    sort_by: 'created_at_desc',
    limit_count: 20,
    offset_count: 0
};

export const useFilterStore = create<FilterStore>((set, get) => ({
    // Initial state
    filters: { ...defaultFilters },
    filteredResults: [],
    isLoading: false,
    error: null,
    totalResults: 0,
    currentPage: 1,
    hasMore: false,
    availableCategories: [],
    availableMediums: [],
    availableLocations: [],
    priceRange: null,

    // Actions
    setFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
        set(state => ({
            filters: {
                ...state.filters,
                [key]: value,
                // Reset pagination when filter changes
                offset_count: 0
            },
            currentPage: 1,
            error: null
        }));
    },

    setFilters: (newFilters: Partial<FilterOptions>) => {
        set(state => ({
            filters: {
                ...state.filters,
                ...newFilters,
                // Reset pagination when filters change
                offset_count: 0
            },
            currentPage: 1,
            error: null
        }));
    },

    applyFilters: async (artworkIds?: string[]) => {
        const state = get();

        set({ isLoading: true, error: null });

        try {
            const filterOptions = {
                ...state.filters,
                artwork_ids: artworkIds,
                offset_count: 0 // Always start from beginning when applying new filters
            };

            const { results, hasMore, total } = await FilterService.filterArtworks(filterOptions);

            set({
                filteredResults: results,
                totalResults: total,
                currentPage: 1,
                hasMore,
                isLoading: false,
                filters: {
                    ...state.filters,
                    offset_count: 0
                }
            });
        } catch (error) {
            console.error('Error applying filters:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to apply filters',
                isLoading: false,
                filteredResults: [],
                totalResults: 0,
                hasMore: false
            });
        }
    },

    loadMoreResults: async () => {
        const state = get();

        if (state.isLoading || !state.hasMore) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const nextPage = state.currentPage + 1;
            const offset = (nextPage - 1) * state.filters.limit_count;

            const filterOptions = {
                ...state.filters,
                offset_count: offset
            };

            const { results, hasMore } = await FilterService.filterArtworks(filterOptions);

            set({
                filteredResults: [...state.filteredResults, ...results],
                currentPage: nextPage,
                hasMore,
                isLoading: false,
                filters: {
                    ...state.filters,
                    offset_count: offset
                }
            });
        } catch (error) {
            console.error('Error loading more results:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to load more results',
                isLoading: false
            });
        }
    },

    clearFilters: () => {
        set({
            filters: { ...defaultFilters },
            filteredResults: [],
            isLoading: false,
            error: null,
            totalResults: 0,
            currentPage: 1,
            hasMore: false
        });
    },

    resetFilter: <K extends keyof FilterOptions>(key: K) => {
        set(state => ({
            filters: {
                ...state.filters,
                [key]: defaultFilters[key],
                // Reset pagination when filter changes
                offset_count: 0
            },
            currentPage: 1,
            error: null
        }));
    },

    fetchFilterOptions: async () => {
        try {
            const { categories, mediums, locations, priceRange } = await FilterService.getFilterOptions();

            set({
                availableCategories: categories,
                availableMediums: mediums,
                availableLocations: locations,
                priceRange
            });
        } catch (error) {
            console.error('Error fetching filter options:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch filter options'
            });
        }
    }
}));