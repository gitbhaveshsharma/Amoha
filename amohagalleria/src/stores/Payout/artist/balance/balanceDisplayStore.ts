import { create } from 'zustand';
import { BalanceDisplayStore } from '@/types';
import { BalanceDisplayService } from './balanceDisplayService';

export const useBalanceDisplayStore = create<BalanceDisplayStore>((set) => ({
    balance: null,
    loading: false,
    error: null,

    fetchBalance: async () => {
        set({ loading: true, error: null });
        try {
            const balance = await BalanceDisplayService.fetchBalance();
            set({ balance, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch balance',
                loading: false
            });
        }
    },

    reset: () => set({ balance: null, loading: false, error: null })
}));