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
import { usePayoutHistoryStore } from '@/stores/Payout/artist/history/payoutHistoryStore';

export const PayoutHistoryFilters = () => {
    const { filters, applyFilters, clearFilters } = usePayoutHistoryStore();

    const [dateRange, setDateRange] = React.useState<{
        from?: Date;
        to?: Date;
    } | undefined>(filters.dateRange);

    const [amountRange, setAmountRange] = React.useState<{
        min: number;
        max: number;
    } | undefined>(filters.amountRange);

    const [status, setStatus] = React.useState(filters.status);

    const handleApply = () => {
        applyFilters({
            status,
            dateRange: dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined,
            amountRange
        });
    };

    const handleClear = () => {
        setDateRange(undefined);
        setAmountRange(undefined);
        setStatus(undefined);
        clearFilters();
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as "pending" | "processing" | "completed" | "failed" | "cancelled" | "all" | undefined)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                                selected={dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined}
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
                                ...(amountRange || { min: 0, max: Infinity }),
                                min: Number(e.target.value)
                            })}
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            value={amountRange?.max || ''}
                            onChange={(e) => setAmountRange({
                                ...(amountRange || { min: 0, max: Infinity }),
                                max: Number(e.target.value)
                            })}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={handleClear}>
                                Clear
                            </Button>
                            <Button onClick={handleApply}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};