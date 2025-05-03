"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SaleWithArtwork } from '@/types/sale';

interface SalesStatsProps {
    sales: SaleWithArtwork[];
}

export function SalesStats({ sales }: SalesStatsProps) {
    const totalSales = sales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalEarnings = sales.reduce((sum, sale) => sum + sale.artist_payout_amount, 0);
    const completedSales = sales.filter((sale) => sale.status === 'completed').length;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: sales[0]?.currency || 'USD',
                        }).format(totalSales)}
                    </div>
                    <p className="text-xs text-muted-foreground">From {sales.length} transactions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                    >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="4" y="8" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: sales[0]?.currency || 'USD',
                        }).format(totalEarnings)}
                    </div>
                    <p className="text-xs text-muted-foreground">After fees and deductions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                    >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completedSales}</div>
                    <p className="text-xs text-muted-foreground">Ready for payout</p>
                </CardContent>
            </Card>
        </div>
    );
}