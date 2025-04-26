import React from 'react';
import { useBalanceDisplayStore } from '@/stores/Payout/artist/balance/balanceDisplayStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';


export const DisplayBalance = () => {
    const { balance, loading, error, fetchBalance } = useBalanceDisplayStore();

    React.useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    if (loading) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                        ${balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-muted-foreground">USD</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    Ready for withdrawal
                </p>
            </CardContent>
        </Card>
    );
};