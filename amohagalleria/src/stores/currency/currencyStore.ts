import { create } from 'zustand';
import { Currency, CurrencyCode } from '@/types/currency';
import { CurrencyService } from './currencyService';

interface CurrencyState {
    currencies: Currency[];
    isLoading: boolean;
    error: string | null;
    fetchCurrencies: () => Promise<void>;
    getCurrencyByCode: (code: CurrencyCode) => Currency | undefined;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
    currencies: [],
    isLoading: false,
    error: null,

    fetchCurrencies: async () => {
        if (get().currencies.length > 0) return; // Skip if already loaded

        set({ isLoading: true, error: null });
        try {
            const currencies = await CurrencyService.fetchCurrencies();
            set({ currencies, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to load currencies', isLoading: false });
        }
    },

    getCurrencyByCode: (code: CurrencyCode) => {
        return get().currencies.find(c => c.code === code);
    }
}));