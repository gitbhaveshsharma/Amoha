import { create } from 'zustand';
import { SaleWithArtwork } from '@/types/sale';
import { saleService } from './saleService';

interface SaleState {
    sales: SaleWithArtwork[];
    loading: boolean;
    error: string | null;
    fetchSales: (artistId: string) => Promise<void>;
    clearSales: () => void;
}

export const useSaleStore = create<SaleState>((set) => ({
    sales: [],
    loading: false,
    error: null,
    fetchSales: async (artistId: string) => {
        if (!artistId) {
            set({ error: 'No artist ID provided', loading: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            const sales = await saleService.getSalesByArtist(artistId);
            set({ sales, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch sales',
                loading: false,
                sales: [] // Clear any previous data on error
            });
        }
    },
    clearSales: () => set({ sales: [], error: null, loading: false }),
}));