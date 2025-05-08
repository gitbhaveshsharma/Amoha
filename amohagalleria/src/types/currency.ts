// First, let's define the possible currency codes as a type
export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD" | string; // string allows for other codes from DB

// Interface for the currency data from Supabase
export interface DBCurrency {
    code: string;
    name: string;
    symbol: string;
    decimal_digits: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
}

// Interface for the frontend application
export interface Currency {
    code: CurrencyCode;
    name: string;
    symbol: string;
    decimalDigits: number;
}

// Helper type for the currencies record
export type CurrenciesRecord = Record<CurrencyCode, Currency>;

// Default currency code
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

// Utility function to safely convert DB currency to app currency
export const toAppCurrency = (dbCurrency: DBCurrency): Currency => ({
    code: dbCurrency.code,
    name: dbCurrency.name,
    symbol: dbCurrency.symbol,
    decimalDigits: dbCurrency.decimal_digits
});