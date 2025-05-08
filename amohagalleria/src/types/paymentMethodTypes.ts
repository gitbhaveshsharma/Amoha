// src/types/paymentMethodTypes.ts
import { PAYMENT_METHOD_TYPES } from "@/lib/constants/paymentMethods";

export type BankAccountDetails = {
    account_name: string;
    account_number: string;
    routing_number: string;
    bank_name: string;
};

export type PayPalDetails = {
    email: string;
};

export type StripeDetails = {
    card_number: string;
    expiry: string;
    cvc: string;
};

export type PaymentMethodDetails =
    | { method_type: typeof PAYMENT_METHOD_TYPES.BANK_ACCOUNT; details: BankAccountDetails }
    | { method_type: typeof PAYMENT_METHOD_TYPES.PAYPAL; details: PayPalDetails }
    | { method_type: typeof PAYMENT_METHOD_TYPES.STRIPE; details: StripeDetails };

export type PaymentMethodFormValues = {
    method_type: typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];
    is_default: boolean;
} & PaymentMethodDetails;