// src/schemas/auth/otp.ts
import { z } from "zod";

export const otpFormSchema = z.object({
    otp: z.string()
        .min(1, { message: "OTP is required" })
        .length(6, {
            message: "OTP must be exactly 6 digits.",
        })
        .refine(
            (value) => /^\d+$/.test(value),
            {
                message: "OTP must contain only numeric digits.",
            }
        )
        .refine(
            (value) => {
                // Check for sequential patterns (e.g., 123456, 654321)
                const sequentialUp = '123456';
                const sequentialDown = '654321';
                if (value === sequentialUp || value === sequentialDown) {
                    return false;
                }
                return true;
            },
            {
                message: "OTP cannot be a simple sequential pattern.",
            }
        )
        .refine(
            (value) => {
                // Check for repeating digits (e.g., 111111, 222222)
                return !/^(\d)\1{5}$/.test(value);
            },
            {
                message: "OTP cannot be all repeating digits.",
            }
        )
        .refine(
            (value) => {
                // Check for common weak patterns (e.g., 121212, 123123)
                const firstThree = value.slice(0, 3);
                const lastThree = value.slice(3);
                return firstThree !== lastThree;
            },
            {
                message: "OTP cannot be a repeating pattern.",
            }
        )
        .transform((value) => value.trim()), //  
});

export type OtpFormValues = z.infer<typeof otpFormSchema>;