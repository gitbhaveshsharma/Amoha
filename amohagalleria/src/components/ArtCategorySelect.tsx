// components/ArtCategorySelect.tsx
"use client";

import { useEffect } from "react";
import { useArtCategoryStore } from "@/stores/ArtCategory/artCategoryStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { ArtCategorySlug } from "@/types/artCategory";
import { ArtworkFormValues } from "@/schemas/artwork";

interface ArtCategorySelectProps {
    field: ControllerRenderProps<ArtworkFormValues, "art_category">;
    disabled?: boolean;
}
export const ArtCategorySelect = ({ field, disabled }: ArtCategorySelectProps) => {
    const { categories, isLoading, error, fetchCategories } = useArtCategoryStore();
    const filteredCategories = categories.filter(cat => !cat.is_banned);

    // Add useEffect to fetch categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // // Debug logs
    // console.log('Categories:', categories);
    // console.log('Filtered Categories:', filteredCategories);
    // console.log('Loading:', isLoading);
    // console.log('Error:', error);

    return (
        <Select
            onValueChange={(value: ArtCategorySlug) => field.onChange(value)}
            value={field.value}
            disabled={disabled || isLoading || !!error}
        >
            <SelectTrigger className="w-full">
                {isLoading ? (
                    <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading categories...
                    </div>
                ) : error ? (
                    "Error loading categories"
                ) : (
                    <SelectValue placeholder="Select a category" />
                )}
            </SelectTrigger>
            <SelectContent>
                {filteredCategories.map((category) => (
                    <SelectItem
                        key={category.slug}
                        value={category.slug}
                    >
                        {category.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};