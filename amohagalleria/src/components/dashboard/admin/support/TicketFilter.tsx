// components/support/admin/TicketFilter.tsx
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
import { useAdminSupportStore } from '@/stores/support/admin/adminSupportStore';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TicketFilters } from '@/types/support';
import { useState, useEffect } from 'react';

interface TicketFilterProps {
    filters: TicketFilters;
    onFilterChange: (newFilters: Partial<TicketFilters>) => void;
    loading: boolean;
}

const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

export const TicketFilter = ({ filters, onFilterChange, loading }: TicketFilterProps) => {
    const {
        agents,
        resetFilters,
        fetchFilteredTickets
    } = useAdminSupportStore();

    // State for the search input with debounce
    const [searchInput, setSearchInput] = useState(filters.search || '');

    // Debounce logic for search
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            // Only update filters if the search value has actually changed
            if (searchInput !== filters.search) {
                const newFilters = { ...filters, search: searchInput, page: 1 };
                onFilterChange(newFilters);
            }
        }, 500); // 500ms debounce delay

        // Cleanup the timer on component unmount or when search changes
        return () => clearTimeout(debounceTimer);
    }, [searchInput, filters, onFilterChange]);

    const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
        const newFilters = {
            ...filters,
            [field]: date ? format(date, 'yyyy-MM-dd') : ''
        };
        onFilterChange(newFilters);
    };

    const handleFilterChange = (key: keyof TicketFilters, value: string) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        setSearchInput(''); // Clear the search input state
        resetFilters();
        fetchFilteredTickets();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ticket Filters</h3>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                >
                    Reset Filters
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Status Filter */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-full">
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

                {/* Assignee Filter */}
                <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select
                        value={filters.assignee || 'all'}
                        onValueChange={(value) => handleFilterChange('assignee', value === 'all' ? '' : value)}
                        disabled={loading}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Agents</SelectItem>
                            {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Search Filter */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label>Search</Label>
                    <Input
                        placeholder="Search tickets..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        disabled={loading}
                        className="w-full"
                    />
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
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
                                    {filters.startDate ? format(new Date(filters.startDate), 'PPP') : 'Start'}
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
                                    {filters.endDate ? format(new Date(filters.endDate), 'PPP') : 'End'}
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
