// components/dashboard/CartFilters.tsx
"use client";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CartFiltersProps {
    searchQuery: string;
    sortOption: string;
    onSearchChange: (value: string) => void;
    onSortChange: (value: string) => void;
}

export function CartFilters({
    searchQuery,
    sortOption,
    onSearchChange,
    onSortChange,
}: CartFiltersProps) {
    return (
        <Card>
            <CardContent className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 ">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search artworks..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                {/* Sort Filter */}
                <div className="flex items-center gap-4">
                    <Select value={sortOption} onValueChange={onSortChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a-z">A to Z</SelectItem>
                            <SelectItem value="z-a">Z to A</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}