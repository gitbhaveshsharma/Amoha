import { z } from "zod";

// Define roles as constant tuple
export const ROLE_VALUES = ["bidder", "artist"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const ROLE_OPTIONS = ROLE_VALUES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
})) satisfies ReadonlyArray<{ value: Role; label: string }>;

// Create Zod enum for role
const roleEnum = z.enum(ROLE_VALUES, {
    errorMap: () => ({ message: "Please select a valid role" }),
});

// Signup form schema
export const signupFormSchema = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name must be at most 50 characters" })
        .refine((val) => /^[a-zA-Z\s'-]+$/.test(val), {
            message: "Name can only contain letters, spaces, hyphens, and apostrophes",
        })
        .refine((val) => !/\d/.test(val), {
            message: "Name cannot contain numbers",
        })
        .transform((val) => val.trim().replace(/\s+/g, ' ')),

    role: roleEnum,

    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email address" })
        .max(254, { message: "Email must be at most 254 characters" })
        .refine((email) => {
            const parts = email.split('@');
            const local = parts[0];
            const domain = parts[1];

            return Boolean(
                local &&
                domain &&
                !/\.{2,}/.test(local) &&
                !/^\.|\.$/.test(local) &&
                domain.includes('.')
            );
        }, {
            message: "Email contains invalid formatting",
        })
        .transform((val) => val.toLowerCase().trim()),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;