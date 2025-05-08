// src/constants/paymentMethods.ts
// Deep freeze utility function
function deepFreeze<T>(obj: T): T {
    Object.freeze(obj);
    if (obj === undefined || obj === null) return obj;

    Object.getOwnPropertyNames(obj).forEach((prop) => {
        if (
            obj[prop as keyof T] !== null &&
            (typeof obj[prop as keyof T] === "object" ||
                typeof obj[prop as keyof T] === "function") &&
            !Object.isFrozen(obj[prop as keyof T])
        ) {
            deepFreeze(obj[prop as keyof T]);
        }
    });

    return obj;
}

// Create immutable payment method types
const _PAYMENT_METHOD_TYPES = {
    BANK_ACCOUNT: 'bank_account',
    PAYPAL: 'paypal',
    STRIPE: 'stripe',
} as const;

// Freeze the object recursively
export const PAYMENT_METHOD_TYPES = deepFreeze(_PAYMENT_METHOD_TYPES);

// Derive types from the frozen object
export type PaymentMethodType = keyof typeof PAYMENT_METHOD_TYPES;
export type PaymentMethodValue = typeof PAYMENT_METHOD_TYPES[PaymentMethodType];

// Create and freeze options
export const PAYMENT_METHOD_OPTIONS = deepFreeze([
    {
        value: PAYMENT_METHOD_TYPES.BANK_ACCOUNT,
        label: 'Bank Account',
        icon: '🏦',
        schema: 'bankAccountSchema' as const,
    },
    {
        value: PAYMENT_METHOD_TYPES.PAYPAL,
        label: 'PayPal',
        icon: '🔵',
        schema: 'paypalSchema' as const,
    },
    {
        value: PAYMENT_METHOD_TYPES.STRIPE,
        label: 'Credit/Debit Card',
        icon: '💳',
        schema: 'stripeSchema' as const,
    },
]);

// Runtime validation function
export function isValidPaymentMethod(value: unknown): value is PaymentMethodValue {
    return Object.values(PAYMENT_METHOD_TYPES).includes(value as PaymentMethodValue);
}

// Get label for a payment method
export function getPaymentMethodLabel(value: PaymentMethodValue): string {
    const option = PAYMENT_METHOD_OPTIONS.find(opt => opt.value === value);
    return option?.label || 'Unknown';
}

// Get schema name for a payment method
export function getPaymentMethodSchema(value: PaymentMethodValue): string {
    const option = PAYMENT_METHOD_OPTIONS.find(opt => opt.value === value);
    return option?.schema || '';
}