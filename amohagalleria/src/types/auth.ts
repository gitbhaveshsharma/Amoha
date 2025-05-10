import { User } from "@supabase/supabase-js";
import { SignupFormValues } from "@/schemas/auth/signup";

export interface AuthStore {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    sessionChecked: boolean;
    hasUploadIntent: boolean;
    profileExists: boolean | null;

    setUser: (user: User | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setSessionChecked: (sessionChecked: boolean) => void;
    setHasUploadIntent: (hasUploadIntent: boolean) => void;
    setProfileExists: (profileExists: boolean | null) => void;
    clearError: () => void;

    checkSession: () => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<User>;
    completeProfileSetup: (values: SignupFormValues) => Promise<void>;
    logout: () => Promise<void>;
}