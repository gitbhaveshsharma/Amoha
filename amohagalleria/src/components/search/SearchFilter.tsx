'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useFilterStore } from '@/stores/filter/filterStore';
import { useArtCategoryStore } from '@/stores/ArtCategory/artCategoryStore';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, Filter, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterOptions } from '@/types/filter';

interface SearchFilterProps {
    onFiltersChange: (filters: Partial<FilterOptions>) => void;
    onApplyFilters: () => void;
    currentFilters: Partial<FilterOptions>;
    isLoading?: boolean;
    className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
    onFiltersChange,
    onApplyFilters,
    currentFilters,
    isLoading = false,
    className
}) => {
    const {
        availableMediums,
        availableLocations,
        priceRange,
        fetchFilterOptions
    } = useFilterStore();

    const {
        categories: artCategories,
        isLoading: categoriesLoading,
        fetchCategories
    } = useArtCategoryStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState<Partial<FilterOptions>>(currentFilters);
    const [priceValues, setPriceValues] = useState<[number, number]>([0, 10000]);

    useEffect(() => {
        fetchFilterOptions();
        fetchCategories();
    }, [fetchFilterOptions, fetchCategories]);

    useEffect(() => {
        if (priceRange) {
            setPriceValues([
                currentFilters.min_price || priceRange.min,
                currentFilters.max_price || priceRange.max
            ]);
        }
    }, [priceRange, currentFilters.min_price, currentFilters.max_price]);

    useEffect(() => {
        setLocalFilters(currentFilters);
    }, [currentFilters]);

    const handleFilterChange = <K extends keyof FilterOptions>(
        key: K,
        value: FilterOptions[K]
    ) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleCategoryToggle = (category: string) => {
        const currentCategories = localFilters.categories || [];
        const newCategories = currentCategories.includes(category)
            ? currentCategories.filter(c => c !== category)
            : [...currentCategories, category];
        handleFilterChange('categories', newCategories);
    };

    const handleMediumToggle = (medium: string) => {
        const currentMediums = localFilters.mediums || [];
        const newMediums = currentMediums.includes(medium)
            ? currentMediums.filter(m => m !== medium)
            : [...currentMediums, medium];
        handleFilterChange('mediums', newMediums);
    };

    const handleLocationToggle = (location: string) => {
        const currentLocations = localFilters.locations || [];
        const newLocations = currentLocations.includes(location)
            ? currentLocations.filter(l => l !== location)
            : [...currentLocations, location];
        handleFilterChange('locations', newLocations);
    };

    const handlePriceChange = (values: number[]) => {
        setPriceValues([values[0], values[1]]);
        handleFilterChange('min_price', values[0]);
        handleFilterChange('max_price', values[1]);
    };

    const clearAllFilters = () => {
        const defaultFilters: Partial<FilterOptions> = {
            categories: [],
            mediums: [],
            min_price: null,
            max_price: null,
            locations: [],
            only_featured: false,
            sort_by: 'created_at_desc'
        };
        setLocalFilters(defaultFilters);
        onFiltersChange(defaultFilters);
        if (priceRange) {
            setPriceValues([priceRange.min, priceRange.max]);
        }
    };

    const hasActiveFilters = () => {
        return (
            (localFilters.categories && localFilters.categories.length > 0) ||
            (localFilters.mediums && localFilters.mediums.length > 0) ||
            (localFilters.locations && localFilters.locations.length > 0) ||
            localFilters.min_price !== null ||
            localFilters.max_price !== null ||
            localFilters.only_featured === true
        );
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (localFilters.categories && localFilters.categories.length > 0) count += localFilters.categories.length;
        if (localFilters.mediums && localFilters.mediums.length > 0) count += localFilters.mediums.length;
        if (localFilters.locations && localFilters.locations.length > 0) count += localFilters.locations.length;
        if (localFilters.min_price !== null || localFilters.max_price !== null) count += 1;
        if (localFilters.only_featured === true) count += 1;
        return count;
    };

    return (
        <div className={cn("bg-white rounded-lg border shadow-sm p-4", className)}>
            <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters {hasActiveFilters() && `(${getActiveFiltersCount()})`}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className={`${isExpanded ? 'block' : 'hidden'} lg:block space-y-6`}>
                {/* Active Filters */}
                {hasActiveFilters() && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Active Filters</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="text-xs h-6"
                            >
                                Clear all
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {localFilters.categories?.map((categorySlug) => {
                                const category = artCategories.find(cat => cat.slug === categorySlug);
                                return (
                                    <Badge
                                        key={`cat-${categorySlug}`}
                                        variant="secondary"
                                        className="flex items-center space-x-1"
                                    >
                                        <span>{category?.label || categorySlug}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-transparent"
                                            onClick={() => handleCategoryToggle(categorySlug)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                );
                            })}
                            {localFilters.mediums?.map((medium) => (
                                <Badge
                                    key={`med-${medium}`}
                                    variant="secondary"
                                    className="flex items-center space-x-1"
                                >
                                    <span>{medium}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => handleMediumToggle(medium)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                            {localFilters.locations?.map((location) => (
                                <Badge
                                    key={`loc-${location}`}
                                    variant="secondary"
                                    className="flex items-center space-x-1"
                                >
                                    <span>{location}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => handleLocationToggle(location)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                            {(localFilters.min_price !== null || localFilters.max_price !== null) && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>
                                        ${localFilters.min_price || 0} - ${localFilters.max_price || '∞'}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => {
                                            handleFilterChange('min_price', null);
                                            handleFilterChange('max_price', null);
                                            if (priceRange) {
                                                setPriceValues([priceRange.min, priceRange.max]);
                                            }
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {localFilters.only_featured && (
                                <Badge variant="secondary" className="flex items-center space-x-1">
                                    <span>Featured</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-transparent"
                                        onClick={() => handleFilterChange('only_featured', false)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <Button
                    onClick={onApplyFilters}
                    disabled={isLoading}
                    className="w-full mt-4"
                >
                    {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Apply Filters
                </Button>
                {/* Categories */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Art Categories</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {categoriesLoading ? (
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-gray-500">Loading categories...</span>
                            </div>
                        ) : (
                            artCategories.map((category) => (
                                <div key={category.slug} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category.slug}`}
                                        checked={localFilters.categories?.includes(category.slug) || false}
                                        onCheckedChange={() => handleCategoryToggle(category.slug)}
                                    />
                                    <Label
                                        htmlFor={`category-${category.slug}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {category.label}
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mediums */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Mediums</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableMediums.map((medium) => (
                            <div key={medium} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`medium-${medium}`}
                                    checked={localFilters.mediums?.includes(medium) || false}
                                    onCheckedChange={() => handleMediumToggle(medium)}
                                />
                                <Label
                                    htmlFor={`medium-${medium}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {medium}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Locations */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Locations</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableLocations.map((location) => (
                            <div key={location} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`location-${location}`}
                                    checked={localFilters.locations?.includes(location) || false}
                                    onCheckedChange={() => handleLocationToggle(location)}
                                />
                                <Label
                                    htmlFor={`location-${location}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {location}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                {priceRange && (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Price Range: ${priceValues[0].toLocaleString()} - ${priceValues[1].toLocaleString()}
                        </Label>
                        <Slider
                            value={priceValues}
                            onValueChange={handlePriceChange}
                            min={priceRange.min}
                            max={priceRange.max}
                            step={Math.max(1, Math.floor((priceRange.max - priceRange.min) / 100))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>${priceRange.min.toLocaleString()}</span>
                            <span>${priceRange.max.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Featured Only */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="featured-only"
                        checked={localFilters.only_featured || false}
                        onCheckedChange={(checked) => handleFilterChange('only_featured', checked as boolean)}
                    />
                    <Label htmlFor="featured-only" className="text-sm font-normal cursor-pointer">
                        Featured artworks only
                    </Label>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select
                        value={localFilters.sort_by || 'created_at_desc'}
                        onValueChange={(value) => handleFilterChange('sort_by', value as FilterOptions['sort_by'])}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at_desc">Newest First</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="featured">Featured First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


            </div>
        </div>
    );
};