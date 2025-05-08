// // constants/artCategory.ts
// import { useArtCategoryStore } from '@/stores/ArtCategory/artCategoryStore';

// // Helper function to format categories for dropdowns
// export const getArtCategoryOptions = () => {
//     const categories = useArtCategoryStore.getState().categories;
//     return categories
//         .filter((cat) => !cat.is_banned)
//         .map((cat) => ({
//             value: cat.slug,
//             label: cat.label,
//         }));
// };

// // Type derived from database schema
// export type ArtCategorySlug = ReturnType<typeof getArtCategoryOptions>[number]['value'];