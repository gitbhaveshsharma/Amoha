import { create } from 'zustand';
import { PaymentMethodStore } from '@/types';
import { PaymentMethodService } from './paymentMethodService';
import { supabase } from '@/lib/supabase'; // Import supabase directly instead of using useSession

export const usePaymentMethodStore = create<PaymentMethodStore>((set) => ({
    paymentMethods: [],
    loading: false,
    error: null,
    success: false,

    fetchPaymentMethods: async () => {
        set({ loading: true, error: null });
        try {
            // Get the current user directly from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ loading: false, error: 'User not authenticated' });
                return;
            }

            const paymentMethods = await PaymentMethodService.fetchPaymentMethods(user.id);
            set({ paymentMethods, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
                loading: false
            });
        }
    },

    addPaymentMethod: async (method) => {
        set({ loading: true, error: null, success: false });
        try {
            // Get the current user directly from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ loading: false, error: 'User not authenticated' });
                return;
            }

            await PaymentMethodService.addPaymentMethod(user.id, method);
            set({ success: true, loading: false });
            // Refresh the list
            usePaymentMethodStore.getState().fetchPaymentMethods();
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to add payment method',
                loading: false
            });
        }
    },

    setDefaultMethod: async (id) => {
        set({ loading: true, error: null });
        try {
            // Get the current user directly from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ loading: false, error: 'User not authenticated' });
                return;
            }

            await PaymentMethodService.setDefaultMethod(user.id, id);
            // Refresh the list
            usePaymentMethodStore.getState().fetchPaymentMethods();
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to set default method',
                loading: false
            });
        }
    },

    deleteMethod: async (id) => {
        set({ loading: true, error: null });
        try {
            await PaymentMethodService.deleteMethod(id);
            // Refresh the list
            usePaymentMethodStore.getState().fetchPaymentMethods();
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to delete payment method',
                loading: false
            });
        }
    },

    reset: () => set({
        paymentMethods: [],
        loading: false,
        error: null,
        success: false
    })
}));