// src/schemas/auth/login.ts
import { z } from "zod";

export const loginFormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;