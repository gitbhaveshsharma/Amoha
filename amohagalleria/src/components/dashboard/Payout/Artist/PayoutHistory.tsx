import React from 'react';
import { PayoutHistoryFilters } from './PayoutHistory/PayoutHistoryFilters';
import { PayoutHistoryTable } from './PayoutHistory/PayoutHistoryTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { usePayoutHistoryStore } from '@/stores/Payout/artist/history/payoutHistoryStore';

export const PayoutHistory = () => {
    const { fetchPayoutHistory } = usePayoutHistoryStore();

    React.useEffect(() => {
        fetchPayoutHistory();
    }, [fetchPayoutHistory]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <PayoutHistoryFilters />
                <PayoutHistoryTable />
            </CardContent>
        </Card>
    );
};