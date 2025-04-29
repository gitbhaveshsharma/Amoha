import { supabase } from "@/lib/supabase";
import { PaymentMethod } from "@/types";

export const PayoutRequestService = {
    fetchPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    },

    submitPayoutRequest: async (
        artistId: string,
        amount: number,
        paymentMethodId: string
    ): Promise<void> => {
        const { error } = await supabase
            .from('payout_requests')
            .insert({
                artist_id: artistId,
                amount,
                payment_method_id: paymentMethodId,
                status: 'pending'
            });

        if (error) {
            throw new Error(error.message);
        }
    }
};