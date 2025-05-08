// src/schemas/auth/login.ts
import { z } from "zod";

export const loginFormSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .max(254, { message: "Email must be at most 254 characters long" })
        .email({
            message: "Please enter a valid email address.",
        })
        .refine(
            (email) => {
                const [domain] = email.split('@');

                // Common invalid patterns
                const invalidPatterns = [
                    /\.{2,}/,                         // Multiple consecutive dots
                    /[ \t<>()\[\]\\,:;"]/,            // Invalid special characters
                    /^\.|\.$/,                        // Starts or ends with dot
                    /@\.|\.@/,                        // @ adjacent to dot
                    /^\-|\-$/,                        // Starts or ends with hyphen
                    /\-\-/,                           // Consecutive hyphens
                    /@[^.]*$/,                        // No dot in domain part
                    /@.*\s/,                          // Whitespace after @
                    /^(mailto:|bcc:|cc:|to:)/i,       // Email header injections
                ];

                if (invalidPatterns.some(pattern => pattern.test(email))) {
                    return false;
                }

                // Check for disposable/temporary emails
                const disposableDomains = [
                    'temp-mail.org', 'mailinator.com', 'guerrillamail.com',
                    '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
                ];
                if (disposableDomains.some(d => domain.includes(d))) {
                    return false;
                }

                // Check for common typos in popular domains
                const commonTypos = {
                    'gmail.com': ['gmai.com', 'gmail.con', 'gmial.com', 'gmal.com'],
                    'yahoo.com': ['yaho.com', 'yahoo.con', 'yaoo.com'],
                    'outlook.com': ['outlok.com', 'outlook.con', 'otlook.com']
                };

                for (const [, typos] of Object.entries(commonTypos)) {
                    if (typos.some(typo => domain === typo)) {
                        return false;
                    }
                }

                return true;
            },
            {
                message: "Email contains invalid characters, patterns, or uses a temporary service",
            }
        )
        .transform((email) => {
            // Normalize email but preserve the local part case (some providers are case-sensitive)
            const [local, domain] = email.split('@');
            return `${local.trim()}@${domain.toLowerCase().trim()}`;
        }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;