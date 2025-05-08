"use client";
import React from 'react';
import { ColumnDef } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportDropdown } from '../Payout/Artist/PayoutHistory/ExportDropdown';
import { SaleWithArtwork } from '@/types/sale';
import Image from 'next/image';
import { format } from 'date-fns';
import { SaleFilter } from './saleFilter';

const statusVariant = {
    pending: 'secondary',
    completed: 'default',
    disputed: 'destructive',
    refunded: 'outline'
} as const;

const columns: ColumnDef<SaleWithArtwork>[] = [
    {
        id: 'select',
        header: '',
        accessor: () => '',
        width: '40px',
        cell: () => (
            <Checkbox
                checked={false}
                onCheckedChange={() => { }}
            />
        ),
    },
    {
        id: 'artwork',
        header: 'Artwork',
        accessor: (row) => row.artwork,
        cell: (artwork: SaleWithArtwork['artwork']) => (
            <div className="flex items-center gap-4">
                {artwork?.image_url && (
                    <Image
                        src={artwork.image_url}
                        alt={artwork.title || 'Artwork'}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                    />
                )}
                <span className="font-medium">{artwork?.title}</span>
            </div>
        ),
    },
    {
        id: 'sale_price',
        header: 'Sale Price',
        accessor: (row) => row.sale_price,
        cell: (value: number, row: SaleWithArtwork) => (
            <div className="font-medium">
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: row.currency,
                }).format(value)}
            </div>
        ),
    },
    {
        id: 'artist_payout_amount',
        header: 'Your Earnings',
        accessor: (row) => row.artist_payout_amount,
        cell: (value: number, row: SaleWithArtwork) => (
            <div className="font-medium">
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: row.currency,
                }).format(value)}
            </div>
        ),
    },
    {
        id: 'platform_fee',
        header: 'Platform Fee',
        accessor: (row) => row.platform_fee,
        cell: (value: number, row: SaleWithArtwork) => (
            <div className="font-medium">
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: row.currency,
                }).format(value)}
            </div>
        ),
    },
    {
        id: 'status',
        header: 'Status',
        accessor: (row) => row.status,
        cell: (value: keyof typeof statusVariant) => (
            <Badge variant={statusVariant[value]}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
            </Badge>
        ),
    },
    {
        id: 'sold_at',
        header: 'Date',
        accessor: (row) => row.sold_at,
        cell: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
];

interface SalesTableProps {
    sales: SaleWithArtwork[];
    loading?: boolean;
}

export const SalesTable = ({ sales, loading }: SalesTableProps) => {
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = React.useState<string | undefined>();
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>();
    const [amountRange, setAmountRange] = React.useState<{ min?: number; max?: number }>();

    const toggleRow = (id: string) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedRows(newSelection);
    };

    const toggleAll = () => {
        if (selectedRows.size === filteredSales.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(filteredSales.map(s => s.id)));
        }
    };

    const handleExport = () => {
        console.log('Exporting:', Array.from(selectedRows));
    };

    const clearFilters = () => {
        setStatusFilter(undefined);
        setDateRange(undefined);
        setAmountRange(undefined);
    };

    const hasActiveFilters = Boolean(
        statusFilter ||
        dateRange?.from ||
        dateRange?.to ||
        amountRange?.min !== undefined ||
        amountRange?.max !== undefined
    );

    const filteredSales = React.useMemo(() => {
        return sales.filter(sale => {
            if (statusFilter && statusFilter !== 'all' && sale.status !== statusFilter) {
                return false;
            }

            if (dateRange?.from && dateRange?.to) {
                const saleDate = new Date(sale.sold_at).getTime();
                const fromDate = dateRange.from.getTime();
                const toDate = dateRange.to.getTime();

                if (saleDate < fromDate || saleDate > toDate) {
                    return false;
                }
            }

            if (amountRange?.min !== undefined && sale.sale_price < amountRange.min) {
                return false;
            }
            if (amountRange?.max !== undefined && sale.sale_price > amountRange.max) {
                return false;
            }

            return true;
        });
    }, [sales, statusFilter, dateRange, amountRange]);

    if (loading && sales.length === 0) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <SaleFilter
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                amountRange={amountRange}
                setAmountRange={setAmountRange}
                clearFilters={clearFilters}
                filteredCount={filteredSales.length}
                hasActiveFilters={hasActiveFilters}
            />

            <div className="flex justify-end">
                <ExportDropdown onExport={handleExport} />
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.id} style={{ width: column.width }}>
                                    {column.id === 'select' ? (
                                        <Checkbox
                                            checked={selectedRows.size === filteredSales.length && filteredSales.length > 0}
                                            onCheckedChange={toggleAll}
                                        />
                                    ) : (
                                        column.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <TableRow key={sale.id}>
                                    {columns.map((column) => (
                                        <TableCell key={`${sale.id}-${column.id}`}>
                                            {column.id === 'select' ? (
                                                <Checkbox
                                                    checked={selectedRows.has(sale.id)}
                                                    onCheckedChange={() => toggleRow(sale.id)}
                                                />
                                            ) : column.cell ? (
                                                column.cell(column.accessor(sale), sale)
                                            ) : (
                                                column.accessor(sale)
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        {hasActiveFilters
                                            ? "No sales found matching your filters"
                                            : "No sales found"}
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};