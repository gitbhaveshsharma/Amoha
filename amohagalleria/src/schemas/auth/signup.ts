// src/schemas/auth/signup.ts
import { z } from "zod";

export const signupFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    role: z.string().min(2, {
        message: "Role must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;