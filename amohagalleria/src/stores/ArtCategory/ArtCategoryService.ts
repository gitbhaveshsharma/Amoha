// services/ArtCategoryService.ts
import { supabase } from '@/lib/supabase';
import type {
    ArtCategory,
    ArtCategoryInsert,
    ArtCategoryUpdate,
    ArtCategorySlug,
} from '@/types/artCategory';

export class ArtCategoryService {
    static async getAll(): Promise<ArtCategory[]> {
        console.log('Fetching all art categories...');
        const { data, error } = await supabase
            .from('art_categories')
            .select('*')
            .order('label', { ascending: true });

        if (error) {
            console.error('Error fetching art categories:', error);
            throw error;
        }

        // console.log('Fetched art categories:', data);
        return (data as ArtCategory[]) || [];
    }

    static async getBySlug(slug: ArtCategorySlug): Promise<ArtCategory | null> {
        console.log(`Fetching art category with slug: ${slug}`);
        const { data, error } = await supabase
            .from('art_categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching art category ${slug}:`, error);
            return null;
        }

        // console.log(`Fetched art category with slug ${slug}:`, data);
        return data as ArtCategory;
    }

    static async create(category: ArtCategoryInsert): Promise<ArtCategory> {
        console.log('Creating new art category:', category);
        const { data, error } = await supabase
            .from('art_categories')
            .insert(category)
            .select()
            .single();

        if (error) {
            console.error('Error creating art category:', error);
            throw error;
        }

        // console.log('Created art category:', data);
        return data as ArtCategory;
    }

    static async update(
        slug: ArtCategorySlug,
        updates: ArtCategoryUpdate
    ): Promise<ArtCategory | null> {
        console.log(`Updating art category with slug: ${slug}`, updates);
        const { data, error } = await supabase
            .from('art_categories')
            .update(updates)
            .eq('slug', slug)
            .select()
            .single();

        if (error) {
            console.error(`Error updating art category ${slug}:`, error);
            return null;
        }

        // console.log(`Updated art category with slug ${slug}:`, data);
        return data as ArtCategory;
    }

    static async delete(slug: ArtCategorySlug): Promise<boolean> {
        console.log(`Deleting art category with slug: ${slug}`);
        const { error } = await supabase
            .from('art_categories')
            .delete()
            .eq('slug', slug);

        if (error) {
            console.error(`Error deleting art category ${slug}:`, error);
            return false;
        }

        // console.log(`Deleted art category with slug ${slug}`);
        return true;
    }
}

