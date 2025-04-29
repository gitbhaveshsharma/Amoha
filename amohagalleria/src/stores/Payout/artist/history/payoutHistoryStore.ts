import { create } from 'zustand';
import { PayoutHistoryStore } from '@/types';
import { PayoutHistoryService } from './payoutHistoryService';
import { supabase } from '@/lib/supabase'; // Import supabase directly instead of using useSession
export const usePayoutHistoryStore = create<PayoutHistoryStore>((set, get) => ({
    payouts: [],
    filteredPayouts: [],
    loading: false,
    error: null,
    filters: {},

    fetchPayoutHistory: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ loading: false, error: 'User not authenticated' });
            return;
        }

        set({ loading: true, error: null });
        try {
            const payouts = await PayoutHistoryService.fetchPayoutHistory(user.id);
            set({
                payouts,
                filteredPayouts: payouts,
                loading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch payout history',
                loading: false
            });
        }
    },

    applyFilters: (filters) => {
        const { payouts } = get();

        let filtered = [...payouts];

        // Status filter
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        // Date range filter
        if (filters.dateRange) {
            filtered = filtered.filter(p => {
                const payoutDate = new Date(p.created_at);
                return payoutDate >= filters.dateRange!.from &&
                    payoutDate <= filters.dateRange!.to;
            });
        }

        // Amount range filter
        if (filters.amountRange) {
            filtered = filtered.filter(p =>
                p.amount >= filters.amountRange!.min &&
                p.amount <= filters.amountRange!.max
            );
        }

        set({
            filteredPayouts: filtered,
            filters
        });
    },

    clearFilters: () => {
        const { payouts } = get();
        set({
            filteredPayouts: payouts,
            filters: {}
        });
    },

    exportToExcel: async (payoutIds) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ error: 'User not authenticated' });
            return;
        }
        try {
            await PayoutHistoryService.exportPayouts(user.id, payoutIds, 'excel');
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to export payouts'
            });
        }
    }
}));