// components/bids/BidFilters.tsx
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function BidFilters({
    searchTerm,
    statusFilter,
    sortOption,
    onSearchChange,
    onStatusChange,
    onSortChange,
}: {
    searchTerm: string;
    statusFilter: string;
    sortOption: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSortChange: (value: string) => void;
}) {
    return (
        <Card>
            <CardContent className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bids..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                {/* Filters */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="withdrawn">withdrawn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Select value={sortOption} onValueChange={onSortChange}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="highest">Highest Bid</SelectItem>
                            <SelectItem value="lowest">Lowest Bid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}