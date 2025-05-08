
import { supabase } from '@/lib/supabase';
import { Currency, CurrencyCode, DBCurrency, toAppCurrency } from "@/types/currency";

export const CurrencyService = {
  async fetchCurrencies(): Promise<Currency[]> {
    const { data, error } = await supabase
      .from('currencies')
      .select('code, name, symbol, decimal_digits')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }

    // Type assertion and conversion
    return (data as DBCurrency[]).map(toAppCurrency);
  },

  async getCurrencyByCode(code: CurrencyCode): Promise<Currency | undefined> {
    const { data, error } = await supabase
      .from('currencies')
      .select('code, name, symbol, decimal_digits')
      .eq('code', code)
      .single();

    if (error) {
      console.error(`Error fetching currency ${code}:`, error);
      return undefined;
    }

    return toAppCurrency(data as DBCurrency);
  }
};