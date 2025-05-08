// stores/artCategoryStore.ts
import { create } from 'zustand';
import { ArtCategoryService } from './ArtCategoryService';
import type { ArtCategory, ArtCategoryInsert, ArtCategoryUpdate } from '@/types/artCategory';

type ArtCategoryState = {
    categories: ArtCategory[];
    isLoading: boolean;
    error: string | null;
};

type ArtCategoryActions = {
    fetchCategories: () => Promise<void>;
    getCategoryBySlug: (slug: string) => ArtCategory | undefined;
    addCategory: (category: ArtCategoryInsert) => Promise<void>;
    updateCategory: (slug: string, updates: ArtCategoryUpdate) => Promise<void>;
    deleteCategory: (slug: string) => Promise<void>;
};

const initialState: ArtCategoryState = {
    categories: [],
    isLoading: false,
    error: null,
};

export const useArtCategoryStore = create<ArtCategoryState & ArtCategoryActions>((set, get) => ({
    ...initialState,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const categories = await ArtCategoryService.getAll();
            set({ categories, isLoading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch categories', isLoading: false });
        }
    },

    getCategoryBySlug: (slug) => {
        return get().categories.find((cat) => cat.slug === slug);
    },

    addCategory: async (category) => {
        set({ isLoading: true });
        try {
            const newCategory = await ArtCategoryService.create(category);
            set((state) => ({
                categories: [...state.categories, newCategory],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add category', isLoading: false });
            throw error;
        }
    },

    updateCategory: async (slug, updates) => {
        set({ isLoading: true });
        try {
            const updatedCategory = await ArtCategoryService.update(slug, updates);
            if (updatedCategory) {
                set((state) => ({
                    categories: state.categories.map((cat) =>
                        cat.slug === slug ? { ...cat, ...updatedCategory } : cat
                    ),
                    isLoading: false,
                }));
            }
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update category', isLoading: false });
            throw error;
        }
    },

    deleteCategory: async (slug) => {
        set({ isLoading: true });
        try {
            const success = await ArtCategoryService.delete(slug);
            if (success) {
                set((state) => ({
                    categories: state.categories.filter((cat) => cat.slug !== slug),
                    isLoading: false,
                }));
            }
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete category', isLoading: false });
            throw error;
        }
    },
}));