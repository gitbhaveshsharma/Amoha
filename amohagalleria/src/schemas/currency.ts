import { z } from "zod";

export const currencySchema = z.object({
    symbol: z.string(),
    code: z.string(),
    name: z.string(),
    decimal_digits: z.number(),
    decimalDigits: z.number().optional(),
    is_active: z.boolean().optional(),
});
