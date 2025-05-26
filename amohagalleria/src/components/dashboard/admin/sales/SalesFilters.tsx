// components/admin/sales/SalesFilters.tsx
"use client";

import React from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, Filter } from 'lucide-react';
import { useSalesStore } from '@/stores/sale/admin/adminSaleStore';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const SalesFilters = () => {
    const {
        filters,
        setFilters,
    } = useSalesStore();

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: filters.date_from ? new Date(filters.date_from) : undefined,
        to: filters.date_to ? new Date(filters.date_to) : undefined,
    });

    // Check if any filters are applied
    const hasFilters = React.useMemo(() => {
        return (
            filters.date_from ||
            filters.date_to ||
            filters.status ||
            filters.group_by_period ||
            filters.artist_id ||
            filters.buyer_id ||
            filters.country
        );
    }, [filters]);

    const handleDateChange = (range: DateRange | undefined) => {
        setDateRange(range);
        setFilters({
            ...filters,
            date_from: range?.from?.toISOString(),
            date_to: range?.to?.toISOString(),
        });
    };

    const handleStatusChange = (value: string) => {
        setFilters({ ...filters, status: value === 'all' ? undefined : value });
    };

    const handleGroupByChange = (value: string) => {
        setFilters({
            ...filters,
            group_by_period: value === 'none' ? undefined : value as 'day' | 'week' | 'month' | 'year'
        });
    };

    const resetFilters = () => {
        setDateRange(undefined);
        setFilters({
            date_from: undefined,
            date_to: undefined,
            status: undefined,
            group_by_period: undefined,
            artist_id: undefined,
            buyer_id: undefined,
            country: undefined
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h1 className="text-lg font-semibold">
                        Sales Analytics
                    </h1>
                </div>

                {/* Filters in a single row */}
                <div className="flex flex-wrap items-end gap-3">
                    {/* Date Range Picker */}
                    <div className="min-w-[250px]">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "MMM dd, y")} -{" "}
                                                {format(dateRange.to, "MMM dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "MMM dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={handleDateChange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Status Filter */}
                    <div className="min-w-[200px]">
                        <Select
                            onValueChange={handleStatusChange}
                            value={filters.status || 'all'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Time Grouping Filter */}
                    <div className="min-w-[180px]">
                        <Select
                            onValueChange={handleGroupByChange}
                            value={filters.group_by_period || 'none'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Group by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Grouping</SelectItem>
                                <SelectItem value="day">Daily</SelectItem>
                                <SelectItem value="week">Weekly</SelectItem>
                                <SelectItem value="month">Monthly</SelectItem>
                                <SelectItem value="year">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Apply/Reset Buttons */}
                    <div className="flex gap-2 ml-auto">
                        {hasFilters && (
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="whitespace-nowrap"
                            >
                                Reset Filters
                            </Button>
                        )}
                        <Button
                            onClick={() => setFilters(filters)}
                            className="whitespace-nowrap"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};