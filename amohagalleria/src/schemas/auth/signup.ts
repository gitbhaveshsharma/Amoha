import { z } from "zod";

// ===== Existing Role Definitions (unchanged) =====
export const ROLE_VALUES = ["bidder", "artist"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const ROLE_OPTIONS = ROLE_VALUES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
})) satisfies ReadonlyArray<{ value: Role; label: string }>;

const roleEnum = z.enum(ROLE_VALUES, {
    errorMap: () => ({ message: "Please select a valid role" }),
});

// ===== New Gender Definitions =====
export const GENDER_VALUES = [
    'male',
    'female',
    'non_binary',
    'genderqueer',
    'genderfluid',
    'agender',
    'bigender',
    'two_spirit',
    'transgender_male',
    'transgender_female',
    'intersex',
    'prefer_not_to_say',
    'other'
] as const;

export type Gender = (typeof GENDER_VALUES)[number];

const genderEnum = z.enum(GENDER_VALUES, {
    errorMap: () => ({ message: "Please select a valid gender identity" }),
}).optional();

// ===== SQL Injection Protection Utilities =====
const sqlSafeString = (fieldName: string) =>
    z.string()
        .trim()
        .max(255)
        .refine(val => !/[;'"\\\-\-]|(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/i.test(val), {
            message: `${fieldName} contains invalid characters`
        })
        .refine(val => !/^\s*$/.test(val), {
            message: `${fieldName} cannot be empty or whitespace`
        })

const sqlSafeText = (fieldName: string) =>
    z.string()
        .max(5000)
        .refine(val => !/[;'"\\\-\-]|(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/i.test(val), {
            message: `${fieldName} contains invalid characters`
        });

const sqlSafeArray = (fieldName: string, maxLength: number) =>
    z.array(sqlSafeString(fieldName))
        .max(maxLength)
        .refine(arr => !arr.some(item => item.includes(';')), {
            message: `${fieldName} contains invalid characters`
        });

// ===== Updated Signup Schema =====
export const signupFormSchema = z.object({
    // Existing fields with SQL injection protection
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .refine((val: string): boolean => /^[a-zA-Z\s'-]+$/.test(val), {
            message: "Name can only contain letters, spaces, hyphens, and apostrophes",
        })
        .pipe(sqlSafeString("Name")),

    role: roleEnum,

    email: z.string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email address" })
        .max(254)
        .transform((val: string): string => val.toLowerCase().trim())
        .refine((val: string): boolean => !/[;'"\\]/.test(val), {
            message: "Email contains invalid characters"
        }),

    // New profile fields with SQL injection protection
    bio: sqlSafeText("Bio").optional(),

    phoneNumber: z.string()
        .regex(/^\+?[0-9\s\-()]{6,20}$/, {
            message: "Please enter a valid phone number"
        })
        .refine(val => !/[;'"\\]/.test(val), {
            message: "Phone number contains invalid characters"
        })
        .optional(),

    gender: genderEnum,

    pronouns: sqlSafeArray("Pronouns", 3).optional(),

    dateOfBirth: z.date()
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 13)), {
            message: "You must be at least 13 years old"
        })
        .optional(),

    country: sqlSafeString("Country").optional(),
    state: sqlSafeString("State").optional(),
    city: sqlSafeString("City").optional(),
    postalCode: sqlSafeString("Postal code").optional(),

    address: sqlSafeText("Address")
        .refine(val => !/(ALTER|CREATE|DELETE|DROP|EXEC|INSERT|SELECT|UPDATE)/i.test(val), {
            message: "Address contains invalid content"
        })
        .optional(),

    avatarUrl: z.string()
        .url({ message: "Invalid avatar URL" })
        .refine(val => {
            try {
                new URL(val);
                return !/[;'"\\]/.test(val);
            } catch {
                return false;
            }
        }, {
            message: "Invalid URL format"
        })
        .optional(),

    preferredLanguages: sqlSafeArray("Preferred languages", 5).optional(),
    accessibilityNeeds: sqlSafeArray("Accessibility needs", 10).optional(),
    culturalIdentity: sqlSafeArray("Cultural identity", 5).optional(),
    termsAccepted: z.boolean().optional().default(true)

});

// ===== Profile Update Schema =====
export const profileUpdateSchema = signupFormSchema
    .omit({ role: true, email: true, termsAccepted: true })
    .extend({
        // Additional security for updates
        deviceId: sqlSafeString("Device ID").optional(),
        lastActiveAt: z.date().optional()
    });

export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;