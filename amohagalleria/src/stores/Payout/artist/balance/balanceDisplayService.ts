import { supabase } from "@/lib/supabase";

export const BalanceDisplayService = {
    fetchBalance: async (): Promise<number> => {
        // We'll use the existing Supabase function
        const { data, error } = await supabase
            .rpc('get_artist_available_balance');

        if (error) {
            throw new Error(error.message);
        }

        return Number(data) || 0;
    }
};