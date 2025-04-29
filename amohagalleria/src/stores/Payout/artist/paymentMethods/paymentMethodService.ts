import { supabase } from "@/lib/supabase";
import { PaymentMethod } from "@/types";

export const PaymentMethodService = {
    async fetchPaymentMethods(userId: string): Promise<PaymentMethod[]> {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async addPaymentMethod(
        userId: string,
        method: Omit<PaymentMethod, 'id' | 'created_at'>
    ): Promise<void> {
        const { error } = await supabase
            .from('payment_methods')
            .insert({
                ...method,
                user_id: userId
            });

        if (error) throw new Error(error.message);
    },

    async setDefaultMethod(userId: string, methodId: string): Promise<void> {
        // First reset all defaults
        await supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('user_id', userId);

        // Then set the new default
        const { error } = await supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', methodId);

        if (error) throw new Error(error.message);
    },

    async deleteMethod(methodId: string): Promise<void> {
        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', methodId);

        if (error) throw new Error(error.message);
    }
};