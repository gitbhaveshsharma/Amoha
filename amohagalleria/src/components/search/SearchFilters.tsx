'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const ORIENTATIONS = [
    { id: 'landscape', name: 'Landscape' },
    { id: 'portrait', name: 'Portrait' },
    { id: 'square', name: 'Square' },
];

const SIZES = [
    { id: 'small', name: 'Small (under 50cm)' },
    { id: 'medium', name: 'Medium (50-100cm)' },
    { id: 'large', name: 'Large (over 100cm)' },
];

const MEDIUMS = [
    { id: 'painting', name: 'Painting' },
    { id: 'photography', name: 'Photography' },
    { id: 'sculpture', name: 'Sculpture' },
    { id: 'digital', name: 'Digital Art' },
    { id: 'print', name: 'Print' },
    { id: 'drawing', name: 'Drawing' },
];

export const SearchFilters: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

    // Get current filters from URL
    const currentFilters = {
        medium: searchParams.getAll('medium'),
        priceRange: searchParams.get('priceRange')?.split('-') || ['0', '10000'],
        artist: searchParams.getAll('artist'),
        size: searchParams.getAll('size'),
        orientation: searchParams.getAll('orientation'),
    };

    const handleFilterChange = (filterType: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValues = params.getAll(filterType);

        if (currentValues.includes(value)) {
            // Remove filter if it exists
            params.delete(filterType);
            currentValues
                .filter((v) => v !== value)
                .forEach((v) => params.append(filterType, v));
        } else {
            // Add filter
            params.append(filterType, value);
        }

        // Reset to first page when filters change
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePriceChange = (values: number[]) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('priceRange', `${values[0]}-${values[1]}`);
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearAllFilters = () => {
        const params = new URLSearchParams();
        params.set('q', searchParams.get('q') || '');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
                <Button
                    variant="outline"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    className="w-full flex items-center justify-between"
                >
                    <span>Filters</span>
                    <SlidersHorizontal size={16} />
                </Button>
            </div>

            {/* Filters - hidden on mobile unless toggled */}
            <div
                className={`${isMobileFiltersOpen ? 'block' : 'hidden'} lg:block space-y-6`}
            >
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Filters</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        disabled={
                            !currentFilters.medium.length &&
                            !currentFilters.artist.length &&
                            !currentFilters.size.length &&
                            !currentFilters.orientation.length &&
                            (currentFilters.priceRange[0] !== '0' ||
                                currentFilters.priceRange[1] !== '10000')
                        }
                    >
                        Clear all
                    </Button>
                </div>

                {/* Medium Filter */}
                <Accordion type="multiple" defaultValue={['medium']}>
                    <AccordionItem value="medium">
                        <AccordionTrigger>Medium</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {MEDIUMS.map((medium) => (
                                    <div
                                        key={medium.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`medium-${medium.id}`}
                                            checked={currentFilters.medium.includes(
                                                medium.id
                                            )}
                                            onCheckedChange={() =>
                                                handleFilterChange(
                                                    'medium',
                                                    medium.id
                                                )
                                            }
                                        />
                                        <Label htmlFor={`medium-${medium.id}`}>
                                            {medium.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Price Filter */}
                    <AccordionItem value="price">
                        <AccordionTrigger>Price Range</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <Slider
                                    min={0}
                                    max={10000}
                                    step={100}
                                    value={[
                                        parseInt(currentFilters.priceRange[0]),
                                        parseInt(currentFilters.priceRange[1]),
                                    ]}
                                    onValueChange={handlePriceChange}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>
                                        ${parseInt(currentFilters.priceRange[0])}
                                    </span>
                                    <span>
                                        ${parseInt(currentFilters.priceRange[1])}
                                    </span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Size Filter */}
                    <AccordionItem value="size">
                        <AccordionTrigger>Size</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {SIZES.map((size) => (
                                    <div
                                        key={size.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`size-${size.id}`}
                                            checked={currentFilters.size.includes(
                                                size.id
                                            )}
                                            onCheckedChange={() =>
                                                handleFilterChange(
                                                    'size',
                                                    size.id
                                                )
                                            }
                                        />
                                        <Label htmlFor={`size-${size.id}`}>
                                            {size.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Orientation Filter */}
                    <AccordionItem value="orientation">
                        <AccordionTrigger>Orientation</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2">
                                {ORIENTATIONS.map((orientation) => (
                                    <div
                                        key={orientation.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`orientation-${orientation.id}`}
                                            checked={currentFilters.orientation.includes(
                                                orientation.id
                                            )}
                                            onCheckedChange={() =>
                                                handleFilterChange(
                                                    'orientation',
                                                    orientation.id
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`orientation-${orientation.id}`}
                                        >
                                            {orientation.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};