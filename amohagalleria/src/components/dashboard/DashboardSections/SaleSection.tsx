import { useSaleStore } from '@/stores/sale/saleStore';
import { useSession } from '@/hooks/useSession';
import { useEffect } from 'react';
import { SalesTable } from '../sales/SalesTable';
import { SalesStats } from '../sales/SalesStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Card, CardContent } from '@/components/ui/card';

export function SaleSection() {
    const { session } = useSession();
    const { sales, loading, error, fetchSales, clearSales } = useSaleStore();

    useEffect(() => {
        if (session?.user.id) {
            fetchSales(session.user.id);
        } else {
            clearSales();
        }

        return () => {
            clearSales();
        };
    }, [session?.user.id, fetchSales, clearSales]);

    // Additional protection in render
    const filteredSales = sales.filter(sale =>
        sale.artwork?.user_id === session?.user.id
    );

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                </div>
            ) : (
                <>
                    <SalesStats sales={filteredSales} />
                    <Card>
                        <CardContent>
                            <SalesTable sales={filteredSales} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}