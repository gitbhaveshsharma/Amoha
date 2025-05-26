// components/ArtCategorySelect.tsx
"use client";

import { useEffect, useState } from "react";
import { useArtCategoryStore } from "@/stores/ArtCategory/artCategoryStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { ArtCategorySlug } from "@/types/artCategory";
import { ArtworkFormValues } from "@/schemas/artwork";

interface ArtCategorySelectProps {
    field: ControllerRenderProps<ArtworkFormValues, "art_category">;
    disabled?: boolean;
    artworkId?: string; // Add artworkId to force re-render
}

export const ArtCategorySelect = ({ field, disabled, artworkId }: ArtCategorySelectProps) => {
    const { categories, isLoading, error, fetchCategories } = useArtCategoryStore();
    const [internalValue, setInternalValue] = useState<ArtCategorySlug | "">("");
    const filteredCategories = categories.filter(cat => !cat.is_banned);

    // Load categories on mount and when artwork changes
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories, artworkId]); // Add artworkId to dependencies

    // Synchronize internal state with form state
    useEffect(() => {
        if (field.value && filteredCategories.length > 0) {
            const isValidValue = filteredCategories.some(cat => cat.slug === field.value);
            if (isValidValue) {
                setInternalValue(field.value);
            } else {
                setInternalValue("");
                field.onChange("");
            }
        } else {
            setInternalValue("");
        }
    }, [field.value, filteredCategories]);

    const handleValueChange = (value: ArtCategorySlug) => {
        setInternalValue(value);
        field.onChange(value);
    };

    return (
        <Select
            onValueChange={handleValueChange}
            value={internalValue}
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