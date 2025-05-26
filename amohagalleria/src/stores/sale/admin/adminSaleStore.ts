// stores/salesStore.ts
import { create } from 'zustand';
import {
    fetchSalesSummary,
    fetchSales,
    updateSaleStatus,
    initiateRefund,
    fetchSaleDetails
} from './adminSaleService';
import {
    SalesSummary,
    SalesFilterParams,
    AdminSale,
} from '@/types/sale';

interface SalesState {
    summary: SalesSummary | null;
    sales: AdminSale[];
    loading: boolean;
    error: string | null;
    filters: SalesFilterParams;
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        limit: number;
    };
    selectedSale: AdminSale | null;
    fetchSummary: (params?: SalesFilterParams) => Promise<void>;
    fetchSales: (params?: SalesFilterParams, page?: number) => Promise<void>;
    fetchSaleDetails: (saleId: string) => Promise<void>;
    updateSaleStatus: (saleId: string, status: 'pending' | 'completed' | 'disputed' | 'refunded') => Promise<void>;
    initiateRefund: (saleId: string) => Promise<void>;
    setFilters: (filters: SalesFilterParams) => void;
    resetFilters: () => void;
    setPage: (page: number) => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
    summary: null,
    sales: [],
    loading: false,
    error: null,
    filters: {},
    pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        limit: 20
    },
    selectedSale: null,

    fetchSummary: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const combinedFilters = { ...get().filters, ...params };
            const summary = await fetchSalesSummary(combinedFilters);
            set({
                summary,
                filters: combinedFilters,
                loading: false
            });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch summary',
                loading: false
            });
        }
    },

    fetchSales: async (params = {}, page = 1) => {
        set({ loading: true, error: null });
        try {
            const combinedFilters = { ...get().filters, ...params };
            const { data, pagination } = await fetchSales(
                combinedFilters,
                page,
                get().pagination.limit
            );
            set({
                sales: data,
                filters: combinedFilters,
                pagination,
                loading: false
            });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch sales',
                loading: false
            });
        }
    },

    fetchSaleDetails: async (saleId: string) => {
        set({ loading: true, error: null });
        try {
            const sale = await fetchSaleDetails(saleId);
            set({
                selectedSale: sale,
                loading: false
            });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch sale details',
                loading: false
            });
        }
    },

    updateSaleStatus: async (saleId: string, status: 'pending' | 'completed' | 'disputed' | 'refunded') => {
        set({ loading: true, error: null });
        try {
            await updateSaleStatus(saleId, status);
            // Refresh the sales list and summary after update
            await Promise.all([
                get().fetchSales(),
                get().fetchSummary()
            ]);
            set({ loading: false });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update status',
                loading: false
            });
        }
    },

    initiateRefund: async (saleId: string) => {
        set({ loading: true, error: null });
        try {
            await initiateRefund(saleId);
            // Refresh the sales list and summary after refund
            await Promise.all([
                get().fetchSales(),
                get().fetchSummary()
            ]);
            set({ loading: false });
        } catch (error: unknown) {
            set({
                error: error instanceof Error ? error.message : 'Failed to initiate refund',
                loading: false
            });
        }
    },

    setFilters: (filters) => {
        set({ filters });
        // Reset to first page when filters change
        set({ pagination: { ...get().pagination, current_page: 1 } });
        // Fetch both summary and sales data with new filters
        Promise.all([
            get().fetchSummary(),
            get().fetchSales()
        ]);
    },

    resetFilters: () => {
        set({
            filters: {},
            pagination: { ...get().pagination, current_page: 1 }
        });
        Promise.all([
            get().fetchSummary(),
            get().fetchSales()
        ]);
    },

    setPage: (page) => {
        set({
            pagination: { ...get().pagination, current_page: page }
        });
        get().fetchSales({}, page);
    },
}));