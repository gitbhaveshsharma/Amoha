import { User } from "@supabase/supabase-js";
import { SignupFormValues, } from "@/schemas/auth";

export type AuthState = {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    sessionChecked: boolean;
    hasUploadIntent: boolean;
};

export type AuthActions = {
    setUser: (user: User | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setSessionChecked: (checked: boolean) => void;
    setHasUploadIntent: (hasIntent: boolean) => void;
    clearError: () => void;
    checkSession: () => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    completeProfileSetup: (values: SignupFormValues) => Promise<void>;
    logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

// Re-export your schema types
export type { LoginFormValues, SignupFormValues, OtpFormValues } from "@/schemas/auth";

// Ensure SignupFormValues is defined in "@/schemas/auth" or imported correctly.