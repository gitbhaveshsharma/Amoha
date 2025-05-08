// src/types/auth/otp.ts
import { OtpFormValues } from "@/schemas/auth/otp";
export interface OtpCardProps {
    onOtpSubmit: (values: OtpFormValues) => void;
    isSubmitting: boolean;
    resendOtp: () => void;
    otpTimer: number;
}