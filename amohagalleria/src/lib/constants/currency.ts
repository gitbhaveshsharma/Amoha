// // lib/constants/currency.ts
// export const CURRENCY_CODES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"] as const;
// export type CurrencyCode = typeof CURRENCY_CODES[number];

// export interface Currency {
//     code: CurrencyCode;
//     name: string;
//     symbol: string;
//     decimalDigits: number;
// }

// export const CURRENCIES: Record<CurrencyCode, Currency> = {
//     USD: { code: "USD", name: "US Dollar", symbol: "$", decimalDigits: 2 },
//     EUR: { code: "EUR", name: "Euro", symbol: "€", decimalDigits: 2 },
//     GBP: { code: "GBP", name: "British Pound", symbol: "£", decimalDigits: 2 },
//     INR: { code: "INR", name: "Indian Rupee", symbol: "₹", decimalDigits: 2 },
//     JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", decimalDigits: 0 },
//     CAD: { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimalDigits: 2 },
//     AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", decimalDigits: 2 },
// };

// export const DEFAULT_CURRENCY: CurrencyCode = "USD";