// stores/currency/currencyStore.ts
import { create } from 'zustand';
import { Currency, CurrencyCode } from '@/types/currency';
import { CurrencyService } from './currencyService';

interface CurrencyState {
    currencies: Currency[];
    isLoading: boolean;
    error: string | null;
    fetchCurrencies: () => Promise<void>;
    fetchAllCurrencies: () => Promise<void>;
    addCurrency: (currency: Currency) => Promise<void>;
    getCurrencyByCode: (code: CurrencyCode) => Currency | undefined;
    updateCurrency: (code: string, updates: Partial<Currency>) => Promise<void>;
    deleteCurrency: (code: string) => Promise<void>;
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
            console.error('Error fetching currencies:', error);
        }
    },

    addCurrency: async (currency: Currency) => {
        set({ isLoading: true, error: null });
        try {
            await CurrencyService.addCurrency(currency);
            // Refresh the list after adding
            await get().fetchAllCurrencies();
            set({ isLoading: false });
        } catch (error) {
            set({ error: 'Failed to add currency', isLoading: false });
            console.error('Error adding currency:', error);
        }
    },

    fetchAllCurrencies: async () => {
        set({ isLoading: true, error: null });
        try {
            const currencies = await CurrencyService.fetchAllCurrencies(); // Already fetches is_active
            console.log('Fetched all currencies:', currencies); // Debug log to verify is_active
            set({ currencies, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to load all currencies', isLoading: false });
            console.error('Error fetching all currencies:', error);
        }
    },

    getCurrencyByCode: (code: CurrencyCode) => {
        return get().currencies.find(c => c.code === code);
    },

    deleteCurrency: async (code: string) => {
        try {
            await CurrencyService.deleteCurrency(code);
            set((state) => ({
                currencies: state.currencies.filter((c) => c.code !== code),
            }));
        } catch (error) {
            console.error('Error deleting currency:', error);
            throw error;
        }
    },

    //update currency
    updateCurrency: async (code: string, updates: Partial<Currency>) => {
        try {
            await CurrencyService.updateCurrency(code, updates);
            // Refresh the list after update
            await get().fetchAllCurrencies();
        } catch (error) {
            console.error('Error updating currency:', error);
            throw error;
        }
    }

}));