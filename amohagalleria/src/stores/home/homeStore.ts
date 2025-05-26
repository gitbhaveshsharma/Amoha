// stores/homeStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { HomeService, PaginatedResponse } from './homeService';
import { Artwork } from '@/types';

export interface HomeState {
    // Featured section
    featuredArtworks: Artwork[];
    featuredLoading: boolean;
    featuredError: string | null;

    // Newest section
    newestArtworks: Artwork[];
    newestLoading: boolean;
    newestError: string | null;
    loadMoreNewest: () => Promise<void>;
    newestPagination: {
        currentPage: number;
        totalCount: number;
        hasMore: boolean;
    };

    // Random section
    randomArtworks: Artwork[];
    randomLoading: boolean;
    randomError: string | null;
    randomSeed: string;

    // Categories section
    categories: string[];
    categoryArtworks: Record<string, Artwork[]>;
    categoriesLoading: boolean;
    categoriesError: string | null;

    // General loading state
    isInitialLoading: boolean;
    lastUpdated: Date | null;

    // Actions
    fetchFeaturedArtworks: () => Promise<void>;
    fetchNewestArtworks: (page?: number, append?: boolean) => Promise<void>;
    fetchRandomArtworks: (newSeed?: boolean) => Promise<void>;
    fetchCategoriesAndArtworks: () => Promise<void>;
    fetchHomePageData: () => Promise<void>;
    refreshRandomSeed: () => void;
    resetStore: () => void;
}

const initialState = {
    // Featured
    featuredArtworks: [],
    featuredLoading: false,
    featuredError: null,

    // Newest
    newestArtworks: [],
    newestLoading: false,
    newestError: null,
    newestPagination: {
        currentPage: 1,
        totalCount: 0,
        hasMore: false,
    },

    // Random
    randomArtworks: [],
    randomLoading: false,
    randomError: null,
    randomSeed: `seed-${Date.now()}`,

    // Categories
    categories: [],
    categoryArtworks: {},
    categoriesLoading: false,
    categoriesError: null,

    // General
    isInitialLoading: false,
    lastUpdated: null,
};

export const useHomeStore = create<HomeState>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Fetch featured artworks
            fetchFeaturedArtworks: async () => {
                set({ featuredLoading: true, featuredError: null });

                try {
                    const artworks = await HomeService.getFeaturedArtworks();
                    set({
                        featuredArtworks: artworks,
                        featuredLoading: false,
                        lastUpdated: new Date(),
                    });
                } catch (error) {
                    set({
                        featuredLoading: false,
                        featuredError: error instanceof Error ? error.message : 'Failed to fetch featured artworks',
                    });
                }
            },

            // Fetch newest artworks with pagination
            fetchNewestArtworks: async (page = 1, append = false) => {
                set({ newestLoading: true, newestError: null });

                try {
                    const response: PaginatedResponse = await HomeService.getNewestArtworks({
                        page,
                        limit: 20,
                    });

                    set((state) => ({
                        newestArtworks: append
                            ? [...state.newestArtworks, ...response.data]
                            : response.data,
                        newestPagination: {
                            currentPage: page,
                            totalCount: response.totalCount,
                            hasMore: response.hasMore,
                        },
                        newestLoading: false,
                        lastUpdated: new Date(),
                    }));
                } catch (error) {
                    set({
                        newestLoading: false,
                        newestError: error instanceof Error ? error.message : 'Failed to fetch newest artworks',
                    });
                }
            },

            // Fetch random artworks
            fetchRandomArtworks: async (newSeed = false) => {
                set({ randomLoading: true, randomError: null });

                try {
                    const state = get();
                    const seed = newSeed ? `seed-${Date.now()}` : state.randomSeed;

                    const artworks = await HomeService.getRandomArtworks({
                        limit: 16,
                        seed,
                    });

                    set({
                        randomArtworks: artworks,
                        randomSeed: seed,
                        randomLoading: false,
                        lastUpdated: new Date(),
                    });
                } catch (error) {
                    set({
                        randomLoading: false,
                        randomError: error instanceof Error ? error.message : 'Failed to fetch random artworks',
                    });
                }
            },

            // Fetch categories and their artworks
            fetchCategoriesAndArtworks: async () => {
                set({ categoriesLoading: true, categoriesError: null });

                try {
                    const categories = await HomeService.getArtworkCategories();
                    const topCategories = categories.slice(0, 4);

                    // Fetch artworks for each category
                    const categoryPromises = topCategories.map(async (category) => {
                        const artworks = await HomeService.getArtworksByCategory(category, 8);
                        return { category, artworks };
                    });

                    const categoryResults = await Promise.all(categoryPromises);

                    const categoryArtworks: Record<string, Artwork[]> = {};
                    categoryResults.forEach(({ category, artworks }) => {
                        categoryArtworks[category] = artworks;
                    });

                    set({
                        categories: topCategories,
                        categoryArtworks,
                        categoriesLoading: false,
                        lastUpdated: new Date(),
                    });
                } catch (error) {
                    set({
                        categoriesLoading: false,
                        categoriesError: error instanceof Error ? error.message : 'Failed to fetch categories',
                    });
                }
            },

            // Fetch all home page data at once
            fetchHomePageData: async () => {
                set({ isInitialLoading: true });

                try {
                    const state = get();
                    const homeData = await HomeService.getHomePageData({
                        page: 1,
                        limit: 20,
                        seed: state.randomSeed,
                    });

                    set({
                        featuredArtworks: homeData.featured,
                        newestArtworks: homeData.newest.data,
                        newestPagination: {
                            currentPage: 1,
                            totalCount: homeData.newest.totalCount,
                            hasMore: homeData.newest.hasMore,
                        },
                        randomArtworks: homeData.random,
                        categories: homeData.categories,
                        categoryArtworks: homeData.categoryArtworks,
                        isInitialLoading: false,
                        lastUpdated: new Date(),
                        featuredError: null,
                        newestError: null,
                        randomError: null,
                        categoriesError: null,
                    });
                } catch (error) {
                    set({
                        isInitialLoading: false,
                        featuredError: error instanceof Error ? error.message : 'Failed to fetch home data',
                        newestError: error instanceof Error ? error.message : 'Failed to fetch home data',
                        randomError: error instanceof Error ? error.message : 'Failed to fetch home data',
                        categoriesError: error instanceof Error ? error.message : 'Failed to fetch home data',
                    });
                }
            },

            // Load more newest artworks (infinite scroll)
            loadMoreNewest: async () => {
                const state = get();
                if (state.newestLoading || !state.newestPagination.hasMore) return;

                const nextPage = state.newestPagination.currentPage + 1;
                await state.fetchNewestArtworks(nextPage, true);
            },

            // Refresh random seed for new random artworks
            refreshRandomSeed: () => {
                const newSeed = `seed-${Date.now()}`;
                set({ randomSeed: newSeed });
                get().fetchRandomArtworks(false);
            },

            // Reset store to initial state
            resetStore: () => {
                set({
                    ...initialState,
                    randomSeed: `seed-${Date.now()}`,
                });
            },
        }),
        {
            name: 'home-store',
        }
    )
);