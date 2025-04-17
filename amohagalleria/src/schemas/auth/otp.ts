// src/schemas/auth/otp.ts
import { z } from "zod";

export const otpFormSchema = z.object({
    otp: z.string().length(6, {
        message: "OTP must be exactly 6 digits.",
    }),
});

export type OtpFormValues = z.infer<typeof otpFormSchema>;