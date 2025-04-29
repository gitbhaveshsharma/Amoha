import { create } from 'zustand';
import { PayoutRequestStore } from '@/types';
import { PayoutRequestService } from './payoutRequestService';
import { useBalanceDisplayStore } from '../balance/balanceDisplayStore';
import { supabase } from '@/lib/supabase';

export const usePayoutRequestStore = create<PayoutRequestStore>((set, get) => ({
    amount: 0,
    paymentMethodId: '',
    availableBalance: 0,
    paymentMethods: [],
    loading: false,
    submitting: false,
    error: null,
    success: false,

    setAmount: (amount) => {
        const availableBalance = get().availableBalance;
        set({
            amount: Math.min(amount, availableBalance),
            success: false
        });
    },

    setPaymentMethodId: (paymentMethodId) => set({
        paymentMethodId,
        success: false
    }),

    fetchPaymentMethods: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ loading: false, error: 'User not authenticated' });
            return;
        }

        set({ loading: true, error: null });
        try {
            const paymentMethods = await PayoutRequestService.fetchPaymentMethods(user.id);
            const defaultMethod = paymentMethods.find(m => m.is_default);

            set({
                paymentMethods,
                paymentMethodId: defaultMethod?.id || '',
                loading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
                loading: false
            });
        }
    },

    submitRequest: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ submitting: false, error: 'User not authenticated' });
            return;
        }
        const { amount, paymentMethodId } = get();

        if (!user || !amount || !paymentMethodId) return;

        set({ submitting: true, error: null });
        try {
            await PayoutRequestService.submitPayoutRequest(
                user.id,
                amount,
                paymentMethodId
            );

            set({
                success: true,
                submitting: false,
                amount: 0
            });

            // Refresh balance after successful payout
            useBalanceDisplayStore.getState().fetchBalance();
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to submit payout request',
                submitting: false
            });
        }
    },

    reset: () => set({
        amount: 0,
        paymentMethodId: '',
        error: null,
        success: false
    })
}));