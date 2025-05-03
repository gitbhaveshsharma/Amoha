"use client";
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

interface SaleFilterProps {
    statusFilter: string | undefined;
    setStatusFilter: (value: string | undefined) => void;
    dateRange: { from?: Date; to?: Date } | undefined;
    setDateRange: (value: { from?: Date; to?: Date } | undefined) => void;
    amountRange: { min?: number; max?: number } | undefined;
    setAmountRange: (value: { min?: number; max?: number } | undefined) => void;
    clearFilters: () => void;
    filteredCount: number;
    hasActiveFilters: boolean;
}

export const SaleFilter = ({
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    amountRange,
    setAmountRange,
    clearFilters,
    filteredCount,
    hasActiveFilters,
}: SaleFilterProps) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-lg font-semibold">Sales History </h2>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </Button>
                    )}
                    <div className="text-sm text-muted-foreground">
                        {filteredCount} sales found
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="disputed">Disputed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                                            {format(dateRange.to, 'MMM dd, yyyy')}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'MMM dd, yyyy')
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                // selected={dateRange?.from ? dateRange : undefined}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label>Amount Range</Label>
                    <div className="flex space-x-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={amountRange?.min || ''}
                            onChange={(e) => setAmountRange({
                                ...amountRange,
                                min: e.target.value ? Number(e.target.value) : undefined
                            })}
                            className="flex-1"
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            value={amountRange?.max || ''}
                            onChange={(e) => setAmountRange({
                                ...amountRange,
                                max: e.target.value ? Number(e.target.value) : undefined
                            })}
                            className="flex-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};