// components/admin/sales/AdminSales.tsx
"use client";

import React, { useEffect } from 'react';
import { useSalesStore } from '@/stores/sale/admin/adminSaleStore';
import { SalesStats } from './SalesStats';
import { SalesFilters } from './SalesFilters';
import { SalesTable } from './SalesTable';
import { Skeleton } from '@/components/ui/skeleton';

const AdminSales = () => {
    const {
        summary,
        loading,
        error,
        fetchSummary
    } = useSalesStore();

    useEffect(() => {
        fetchSummary();
    }, []);

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading sales data: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SalesFilters />

            {loading && !summary ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            ) : (
                <SalesStats summary={summary || {
                    total_sales: 0,
                    revenue_after_fees: 0,
                    artist_payouts: 0,
                    conversion_rate: 0,
                    time_periods: [],
                    taxes_collected: 0,
                    sales_by_region: [],
                    top_selling_artworks: [],
                    total_artworks_sold: 0,
                    group_by_period: 'year',

                }} />
            )}
            {loading && (
                <div className="p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-full mt-2" />
                </div>
            )}
            <SalesTable />
        </div>
    );
};

export default AdminSales;