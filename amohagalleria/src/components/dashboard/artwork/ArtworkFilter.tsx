// components/dashboard/ArtworkFilter.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useArtworkStore } from '@/stores/artwork/artworkStore';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'listed', label: 'Listed' },
    { value: 'rejected', label: 'Rejected' },
];

export const ArtworkFilter = () => {
    const {
        filters,
        setFilters,
        resetFilters,
        loading,
    } = useArtworkStore();

    const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
        setFilters({
            [field]: date ? format(date, 'yyyy-MM-dd') : null,
        });
    };

    const handleStatusChange = (value: string) => {
        setFilters({
            status: value === 'all' ? '' : value
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    disabled={loading}
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={handleStatusChange}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice || ''}
                            onChange={(e) => setFilters({ minPrice: Number(e.target.value) || null })}
                            disabled={loading}
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice || ''}
                            onChange={(e) => setFilters({ maxPrice: Number(e.target.value) || null })}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !filters.startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'Start date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                                    onSelect={(date) => handleDateChange('startDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !filters.endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'End date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                                    onSelect={(date) => handleDateChange('endDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );
};
