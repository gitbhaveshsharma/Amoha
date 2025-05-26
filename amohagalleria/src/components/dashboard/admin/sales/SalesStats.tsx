// components/admin/sales/SalesStats.tsx
"use client";

import React from 'react';
import { SalesSummary } from '@/types/sale';
import { DollarSign, TrendingUp, Users, Globe, Clock, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const formatPercentage = (value: number) => {
    if (typeof value === 'number' && !isNaN(value)) {
        return `${value.toFixed(1)}%`;
    }
    return '0.0%';
};

const getTimePeriodLabel = (period: string, groupBy: string = 'year') => {
    const date = new Date(period);
    switch (groupBy) {
        case 'day':
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'week':
            return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        case 'month':
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        case 'year':
        default:
            return date.toLocaleDateString('en-US', { year: 'numeric' });
    }
};

export const SalesStats: React.FC<{ summary: SalesSummary }> = ({ summary }) => {
    const hasTimeData = summary.time_periods && summary.time_periods.length > 0;

    const stats = [
        {
            title: 'Total Sales',
            value: formatCurrency(summary.total_sales || 0),
            icon: DollarSign,
            description: 'Gross revenue from all sales',
        },
        {
            title: 'Revenue After Fees',
            value: formatCurrency(summary.revenue_after_fees || 0),
            icon: TrendingUp,
            description: 'Net revenue after platform fees and taxes',
        },
        {
            title: 'Artist Payouts',
            value: formatCurrency(summary.artist_payouts || 0),
            icon: Users,
            description: 'Total paid to artists',
        },
        {
            title: 'Conversion Rate',
            value: formatPercentage(summary.conversion_rate || 0),
            icon: Globe,
            description: 'Completed sales percentage',
        },
    ];

    // Prepare chart data only if we have time periods
    const chartData = hasTimeData ? summary.time_periods?.map((period, index) => {
        const prevPeriod = index > 0 ? summary.time_periods[index - 1] : null;
        const change = prevPeriod
            ? ((period.total_sales - prevPeriod.total_sales) / prevPeriod.total_sales) * 100
            : 0;

        return {
            name: getTimePeriodLabel(period.period, summary.group_by_period),
            sales: period.total_sales,
            payout: period.artist_payouts,
            change,
            count: period.count,
        };
    }) || [] : [];

    return (
        <div className="space-y-6">
            {/* Always show the main stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Show chart and time breakdown only if we have time periods data */}
            {hasTimeData && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            <CardTitle>Sales Trend</CardTitle>
                        </div>
                        <CardDescription>
                            Sales performance over selected time period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value))}
                                    />
                                    <Bar
                                        dataKey="sales"
                                        name="Total Sales"
                                        fill="#8884d8"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4 mt-6">
                            {chartData.map((period, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                {period.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {period.count} {period.count === 1 ? 'sale' : 'sales'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {formatCurrency(period.sales)}
                                        </div>
                                        <div className={`text-xs flex items-center justify-end ${period.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {period.change >= 0 ? (
                                                <ArrowUp className="h-3 w-3 mr-1" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3 mr-1" />
                                            )}
                                            {Math.abs(period.change).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show additional data if available */}
            {summary.sales_by_region && summary.sales_by_region.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sales by Region</CardTitle>
                        <CardDescription>
                            Top performing regions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {summary.sales_by_region.map((region, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="font-medium">{region.country}</span>
                                    <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(region.amount)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {region.count} {region.count === 1 ? 'sale' : 'sales'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {summary.top_selling_artworks && summary.top_selling_artworks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Artworks</CardTitle>
                        <CardDescription>
                            Best performing artworks by sales count
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {summary.top_selling_artworks.map((artwork, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="font-medium truncate">{artwork.title}</span>
                                    <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(artwork.revenue)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {artwork.count} {artwork.count === 1 ? 'sale' : 'sales'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};