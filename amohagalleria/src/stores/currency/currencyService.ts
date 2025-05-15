// services/CurrencyService.ts
import { supabase } from '@/lib/supabase';
import { Currency, DBCurrency, toAppCurrency } from "@/types/currency";

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

    return (data as DBCurrency[]).map(toAppCurrency);
  },

  async fetchAllCurrencies(): Promise<Currency[]> {
    // Admin function that fetches all currencies regardless of active status
    const { data, error } = await supabase
      .from('currencies')
      .select('code, name, symbol, decimal_digits, is_active, created_at, updated_at, created_by')
      .order('code', { ascending: true });

    if (error) {
      console.error('Error fetching all currencies:', error);
      throw error;
    }
    console.log('Fetched all currencies at servise:', data); // Debug log
    return (data as DBCurrency[]).map(toAppCurrency);
  },

  async addCurrency(currency: Currency): Promise<void> {
    const { error } = await supabase
      .from('currencies')
      .insert({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        decimal_digits: currency.decimalDigits,
        is_active: true
      });

    if (error) {
      console.error('Error adding currency:', error);
      throw error;
    }
  },

  async updateCurrency(code: string, updates: Partial<Currency>): Promise<void> {
    const dbUpdates: Partial<DBCurrency> = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.symbol) dbUpdates.symbol = updates.symbol;
    if (updates.decimalDigits !== undefined) dbUpdates.decimal_digits = updates.decimalDigits;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

    console.log("Updating currency with payload:", dbUpdates); // Debug log

    const { error } = await supabase
      .from('currencies')
      .update(dbUpdates)
      .eq('code', code);

    if (error) {
      console.error('Error updating currency:', error); // Debug log
      throw error;
    }
  },

  async toggleCurrencyStatus(code: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('currencies')
      .update({ is_active: isActive })
      .eq('code', code);

    if (error) {
      console.error(`Error toggling currency status for ${code}:`, error);
      throw error;
    }
  },

  async getCurrencyByCode(code: string): Promise<Currency | undefined> {
    const { data, error } = await supabase
      .from('currencies')
      .select('code, name, symbol, decimal_digits, is_active, created_at, updated_at, created_by')
      .eq('code', code)
      .single();

    if (error) {
      console.error(`Error fetching currency ${code}:`, error);
      return undefined;
    }

    return toAppCurrency(data as DBCurrency);
  },

  async deleteCurrency(code: string): Promise<void> {
    const { error } = await supabase
      .from('currencies')
      .delete()
      .eq('code', code);

    if (error) {
      console.error(`Error deleting currency ${code}:`, error);
      throw error;
    }
  }
};