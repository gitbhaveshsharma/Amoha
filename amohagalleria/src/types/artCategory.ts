// types/artCategory.ts
export type ArtCategory = {
    id: string;
    slug: string;
    label: string;
    is_banned: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    banned_by: string | null;
    banned_at: string | null;
};

export type ArtCategoryInsert = Omit<
    ArtCategory,
    'id' | 'created_at' | 'updated_at' | 'banned_by' | 'banned_at'
>;

export type ArtCategoryUpdate = Partial<
    Omit<ArtCategory, 'id' | 'created_at' | 'updated_at' | 'created_by'>
>;

export type ArtCategorySlug = ArtCategory['slug'];