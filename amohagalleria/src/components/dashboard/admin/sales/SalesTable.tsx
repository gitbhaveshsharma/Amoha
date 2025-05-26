// components/admin/sales/SalesTable.tsx
"use client";
import React from 'react';
import { useSalesStore } from '@/stores/sale/admin/adminSaleStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
// import the correct pagination component
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminSale } from '@/types/sale';

export const SalesTable = () => {
    const {
        sales,
        loading,
        pagination,
        selectedSale,
        fetchSales,
        fetchSaleDetails,
        updateSaleStatus,
        initiateRefund,
        setPage,
    } = useSalesStore();

    const [actionType, setActionType] = React.useState<'status' | 'refund' | null>(null);
    const [newStatus, setNewStatus] = React.useState<'pending' | 'completed' | 'disputed' | 'refunded'>('pending');
    const [processingSaleId, setProcessingSaleId] = React.useState<string | null>(null);

    const handleStatusUpdate = async () => {
        if (!selectedSale) return;
        setProcessingSaleId(selectedSale.id);
        try {
            await updateSaleStatus(selectedSale.id, newStatus);
            setActionType(null);
        } finally {
            setProcessingSaleId(null);
        }
    };

    const handleRefund = async () => {
        if (!selectedSale) return;
        setProcessingSaleId(selectedSale.id);
        try {
            await initiateRefund(selectedSale.id);
            setActionType(null);
        } finally {
            setProcessingSaleId(null);
        }
    };

    const openStatusDialog = (sale: AdminSale, status: 'pending' | 'completed' | 'disputed' | 'refunded') => {
        fetchSaleDetails(sale.id);
        setNewStatus(status);
        setActionType('status');
    };

    const openRefundDialog = (sale: AdminSale) => {
        fetchSaleDetails(sale.id);
        setActionType('refund');
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'disputed':
                return 'destructive';
            case 'refunded':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    if (loading && sales.length === 0) {
        return (
            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sale ID</TableHead>
                                <TableHead>Artwork</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Buyer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    if (sales.length === 0) {
        return (
            <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">No sales found</p>
                <Button variant="outline" onClick={() => fetchSales()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Sales History</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSales()}
                        disabled={loading}
                    >
                        {loading ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Refresh
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sale ID</TableHead>
                                <TableHead>Artwork</TableHead>
                                <TableHead>Artist</TableHead>
                                <TableHead>Buyer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-mono text-sm">
                                        {sale.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{sale.artwork?.title || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ID: {sale.artwork_id.slice(0, 8)}...
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{sale.artist?.name || 'Unknown Artist'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {sale.artist?.email || ''}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{sale.buyer?.name || 'Unknown Buyer'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {sale.buyer?.email || ''}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">
                                                {formatCurrency(sale.sale_price)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Artist: {formatCurrency(sale.artist_payout_amount)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(sale.status)}>
                                            {sale.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatDate(sale.sold_at)}
                                    </TableCell>
                                    <TableCell>
                                        {sale.shipping_country || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    disabled={processingSaleId === sale.id}
                                                >
                                                    <span className="sr-only">Open menu</span>
                                                    {processingSaleId === sale.id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => fetchSaleDetails(sale.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {sale.status !== 'completed' && (
                                                    <DropdownMenuItem onClick={() => openStatusDialog(sale, 'completed')}>
                                                        Mark as Completed
                                                    </DropdownMenuItem>
                                                )}
                                                {sale.status !== 'disputed' && (
                                                    <DropdownMenuItem onClick={() => openStatusDialog(sale, 'disputed')}>
                                                        Mark as Disputed
                                                    </DropdownMenuItem>
                                                )}
                                                {sale.status !== 'pending' && (
                                                    <DropdownMenuItem onClick={() => openStatusDialog(sale, 'pending')}>
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                )}
                                                {sale.status !== 'refunded' && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openRefundDialog(sale)}
                                                            className="text-destructive"
                                                        >
                                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                                            Initiate Refund
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {pagination.total_pages > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Status Update Dialog */}
            <AlertDialog open={actionType === 'status'} onOpenChange={(open) => !open && setActionType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update Sale Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the status of sale {selectedSale?.id.slice(0, 8)}... to &quot;{newStatus}&quot;?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleStatusUpdate}
                            disabled={processingSaleId === selectedSale?.id}
                        >
                            {processingSaleId === selectedSale?.id ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Update Status
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Refund Dialog */}
            <AlertDialog open={actionType === 'refund'} onOpenChange={(open) => !open && setActionType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Initiate Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to initiate a refund for sale {selectedSale?.id.slice(0, 8)}...?
                            This action will process a refund of {selectedSale && formatCurrency(selectedSale.sale_price)} and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRefund}
                            className="bg-destructive text-destructive-foreground"
                            disabled={processingSaleId === selectedSale?.id}
                        >
                            {processingSaleId === selectedSale?.id ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <AlertTriangle className="mr-2 h-4 w-4" />
                            )}
                            Initiate Refund
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};