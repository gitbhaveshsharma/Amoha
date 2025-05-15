//types/currency.ts
// First, let's define the possible currency codes as a type
export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY" | "CAD" | "AUD" | string; // string allows for other codes from DB

// Interface for the currency data from Supabase
export interface DBCurrency {
    code: string;
    name: string;
    symbol: string;
    decimal_digits: number;
    is_active: boolean; // Ensure this exists in the database model
    created_at?: string;
    updated_at?: string;
    created_by?: string | null;
}

// Interface for the frontend application
export interface Currency {
    symbol: string;
    code: string;
    name: string;
    decimal_digits: number;
    decimalDigits?: number; // Optional to match the schema
    is_active?: boolean; // Add is_active to the Currency interface
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
    decimalDigits: dbCurrency.decimal_digits,
    decimal_digits: dbCurrency.decimal_digits,
    is_active: dbCurrency.is_active // Map is_active correctly
});

// Utility function to convert app currency to DB currency
export const toDbCurrency = (currency: Currency): DBCurrency => ({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    decimal_digits: currency.decimalDigits ?? 0,
    is_active: currency.is_active ?? true, // Default to true if undefined
});
