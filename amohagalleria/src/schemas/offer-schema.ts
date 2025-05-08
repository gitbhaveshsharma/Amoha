import { z } from "zod";

export const createOfferSchema = (
    isAuction: boolean,
    currentPrice: number,
    highestBid: number | null,
    minOfferPercentage: number = 0.8, // Default value
    bidIncrementPercentage: number = 0.05 // Default value
) => {
    // Validate required numeric inputs
    if (typeof currentPrice !== 'number' || isNaN(currentPrice) || currentPrice < 0) {
        throw new Error("currentPrice must be a valid non-negative number");
    }

    if (typeof minOfferPercentage !== 'number' || isNaN(minOfferPercentage) || minOfferPercentage <= 0) {
        throw new Error("minOfferPercentage must be a valid positive number");
    }

    if (typeof bidIncrementPercentage !== 'number' || isNaN(bidIncrementPercentage) || bidIncrementPercentage <= 0) {
        throw new Error("bidIncrementPercentage must be a valid positive number");
    }

    const currentHighest = highestBid ?? currentPrice;
    const minAmount = isAuction
        ? currentHighest * (1 + bidIncrementPercentage)
        : currentPrice * minOfferPercentage;

    return z.object({
        amount: z
            .number({
                required_error: "Amount is required", // Ensures the field is required
                invalid_type_error: "Amount must be a number",
            })
            .nonnegative("Amount cannot be negative")
            .positive("Amount must be greater than zero")
            .min(minAmount, {
                message: isAuction
                    ? `Bid must be at least $${minAmount.toFixed(2)} (${(
                        bidIncrementPercentage * 100
                    ).toFixed(0)}% above current highest)`
                    : `Offer must be at least $${minAmount.toFixed(2)} (${(
                        minOfferPercentage * 100
                    ).toFixed(0)}% of price)`,
            }),
        message: z
            .string()
            .max(500, "Message must be less than 500 characters")
            .optional()
            .transform((val) => val?.trim() || "") // Ensure empty or whitespace becomes empty string
            .refine((val) => /^[a-zA-Z0-9\s]*$/.test(val), {
                message: "Message must not contain symbols",
            }),
    }).superRefine((data, ctx) => {
        // Optional: Additional custom validations can go here
        if (isNaN(data.amount)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Amount is not a valid number",
                path: ["amount"],
            });
        }
    });
};
