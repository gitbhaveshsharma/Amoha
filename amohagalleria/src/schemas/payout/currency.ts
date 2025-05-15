// validators/currencyValidator.ts
import { z } from "zod";

// For creating new currencies
export const currencySchema = z.object({
    code: z.string().length(3, "Currency code must be 3 characters"),
    name: z.string().min(1, "Name is required"),
    symbol: z.string().min(1, "Symbol is required"),
    decimal_digits: z.number(), // Ensure this matches the type
    decimalDigits: z.number().optional(),
    is_active: z.boolean().default(true),
});

// For updating currencies
export const currencyUpdateSchema = currencySchema.omit({ code: true }).partial();