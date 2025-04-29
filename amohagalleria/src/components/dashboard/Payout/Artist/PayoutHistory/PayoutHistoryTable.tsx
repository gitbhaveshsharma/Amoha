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
import { usePayoutHistoryStore } from '@/stores/Payout/artist/history/payoutHistoryStore';
import { ExportDropdown } from './ExportDropdown';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { PayoutRequest } from '@/types'; // Make sure this type is properly defined

// Define the status variant mapping with proper types
const statusVariant = {
    pending: 'secondary',
    processing: 'default',
    completed: 'default', // Adjusted to match the accepted types
    failed: 'destructive',
    cancelled: 'outline'
} as const;

// Define columns with proper typing
const columns: ColumnDef<PayoutRequest>[] = [
    {
        id: 'select',
        header: '',
        accessor: () => '',
        width: '40px',
        cell: () => (
            <Checkbox
                checked={false} // This will be handled by the parent component
                onCheckedChange={() => { }} // This will be handled by the parent component
            />
        ),
    },
    {
        id: 'id',
        header: 'Payout ID',
        accessor: (row) => row.id,
        width: '200px',
        cell: (value: string) => <span className="font-mono text-sm">{value.slice(0, 8)}...</span>,
    },
    {
        id: 'amount',
        header: 'Amount',
        accessor: (row) => row.amount,
        cell: (value: number, row: PayoutRequest) => (
            <div className="font-medium">
                {row.currency} {value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
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
        id: 'created_at',
        header: 'Request Date',
        accessor: (row) => row.created_at,
        cell: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
        id: 'processed_at',
        header: 'Processed Date',
        accessor: (row) => row.processed_at,
        cell: (value: string | null) => value ? format(new Date(value), 'MMM dd, yyyy') : '-',
    },
];

export const PayoutHistoryTable = () => {
    const { filteredPayouts, loading, exportToExcel } = usePayoutHistoryStore();
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

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
        if (selectedRows.size === filteredPayouts.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(filteredPayouts.map(p => p.id)));
        }
    };

    const handleExport = () => {
        if (selectedRows.size > 0) {
            exportToExcel(Array.from(selectedRows));
        } else {
            exportToExcel(filteredPayouts.map(p => p.id));
        }
    };

    if (loading && filteredPayouts.length === 0) {
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
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    {filteredPayouts.length} payouts found
                </div>
                <ExportDropdown onExport={handleExport} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.id} style={{ width: column.width }}>
                                    {column.id === 'select' ? (
                                        <Checkbox
                                            checked={selectedRows.size === filteredPayouts.length && filteredPayouts.length > 0}
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
                        {filteredPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                                {columns.map((column) => (
                                    <TableCell key={`${payout.id}-${column.id}`}>
                                        {column.id === 'select' ? (
                                            <Checkbox
                                                checked={selectedRows.has(payout.id)}
                                                onCheckedChange={() => toggleRow(payout.id)}
                                            />
                                        ) : column.cell ? (
                                            column.cell(column.accessor(payout), payout)
                                        ) : (
                                            column.accessor(payout)
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {filteredPayouts.length === 0 && !loading && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No payouts found matching your filters</p>
                </div>
            )}
        </div>
    );
};