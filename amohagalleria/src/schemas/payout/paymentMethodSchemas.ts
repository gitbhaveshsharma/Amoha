// Updated payment method schema with stricter validation
import { z } from "zod";
import { PAYMENT_METHOD_TYPES } from "@/lib/constants/paymentMethods";

// Common validation functions
const validateNoSpecialChars = (value: string) => /^[a-zA-Z0-9\s\-\.]*$/.test(value);
const validateNoWhitespace = (value: string) => !/\s/.test(value);

// Base schema with improved validation
export const paymentMethodBaseSchema = z.object({
    method_type: z.union([
        z.literal(PAYMENT_METHOD_TYPES.BANK_ACCOUNT),
        z.literal(PAYMENT_METHOD_TYPES.PAYPAL),
        z.literal(PAYMENT_METHOD_TYPES.STRIPE),
    ]),
    is_default: z.boolean(),
    // Added metadata for tracking
    metadata: z.object({
        created_at: z.date().optional(),
        last_updated: z.date().optional(),
        verified: z.boolean(),
    }).optional(),
});

// Enhanced bank account schema with account number verification
export const bankAccountSchema = z.object({
    account_name: z.string()
        .min(2, "Account name must be at least 2 characters")
        .max(100, "Account name must be less than 100 characters")
        .refine(validateNoSpecialChars, "Special characters are not allowed"),
    account_number: z.string()
        .min(5, "Account number must be at least 5 digits")
        .max(20, "Account number must be less than 20 digits")
        .regex(/^[0-9]+$/, "Account number must contain only digits"),
    account_number_confirmation: z.string(),
    routing_number: z.string()
        .length(9, "Routing number must be exactly 9 digits")
        .regex(/^[0-9]+$/, "Routing number must contain only digits")
        .refine(val => {
            // Basic ABA routing number validation
            const digits = val.split('').map(Number);
            const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                7 * (digits[1] + digits[4] + digits[7]) +
                (digits[2] + digits[5] + digits[8])) % 10;
            return checksum === 0;
        }, "Invalid routing number"),
    bank_name: z.string()
        .min(2, "Bank name must be at least 2 characters")
        .max(100, "Bank name must be less than 100 characters")
        .refine(validateNoSpecialChars, "Special characters are not allowed"),
}).refine(data => data.account_number === data.account_number_confirmation, {
    message: "Account numbers do not match",
    path: ["account_number_confirmation"],
});

// Enhanced PayPal schema with additional checks
export const paypalSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .endsWith("@paypal.com", "Must be a PayPal email address")
        .max(254, "Email must be less than 254 characters")
        .refine(validateNoWhitespace, "Email cannot contain spaces")
        .transform(val => val.toLowerCase()),
});

// Enhanced Stripe schema with Luhn validation
export const stripeSchema = z.object({
    card_number: z.string()
        .min(13, "Card number must be at least 13 digits")
        .max(19, "Card number must be at most 19 digits")
        .regex(/^[0-9]+$/, "Card number must contain only digits")
        .refine(val => {
            // Luhn algorithm validation
            let sum = 0;
            for (let i = 0; i < val.length; i++) {
                let digit = parseInt(val[i]);
                if ((val.length - i) % 2 === 0) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
            }
            return sum % 10 === 0;
        }, "Invalid card number"),
    expiry: z.string()
        .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiry date format (MM/YY)")
        .refine(val => {
            const [month, year] = val.split('/');
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;

            const expiryYear = parseInt(year, 10);
            const expiryMonth = parseInt(month, 10);

            return expiryYear > currentYear ||
                (expiryYear === currentYear && expiryMonth >= currentMonth);
        }, "Card has expired"),
    cvc: z.string()
        .min(3, "CVC must be at least 3 digits")
        .max(4, "CVC must be at most 4 digits")
        .regex(/^[0-9]+$/, "CVC must contain only digits"),
    card_name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .refine(validateNoSpecialChars, "Special characters are not allowed"),
});

// Main payment method schema with discriminated union
export const paymentMethodSchema = paymentMethodBaseSchema.and(
    z.discriminatedUnion("method_type", [
        z.object({
            method_type: z.literal(PAYMENT_METHOD_TYPES.BANK_ACCOUNT),
            details: bankAccountSchema,
        }),
        z.object({
            method_type: z.literal(PAYMENT_METHOD_TYPES.PAYPAL),
            details: paypalSchema,
        }),
        z.object({
            method_type: z.literal(PAYMENT_METHOD_TYPES.STRIPE),
            details: stripeSchema,
        }),
    ])
);