import { create } from 'zustand';
import { AuthService } from './authService';
import type { AuthStore } from '@/types/auth';

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    isLoading: false,
    error: null,
    sessionChecked: false,
    hasUploadIntent: false,

    // Actions
    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setSessionChecked: (sessionChecked) => set({ sessionChecked }),
    setHasUploadIntent: (hasUploadIntent) => set({ hasUploadIntent }),
    clearError: () => set({ error: null }),

    checkSession: async () => {
        try {
            get().setIsLoading(true);
            const user = await AuthService.checkSession();
            get().setUser(user);
        } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            get().setSessionChecked(true);
            get().setIsLoading(false);
        }
    },

    sendOtp: async (email) => {
        try {
            get().setIsLoading(true);
            get().clearError();
            await AuthService.sendOtp(email);
        } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Failed to send OTP');
            throw error;
        } finally {
            get().setIsLoading(false);
        }
    },

    verifyOtp: async (email, otp) => {
        try {
            get().setIsLoading(true);
            get().clearError();
            const user = await AuthService.verifyOtp(email, otp);
            get().setUser(user);
        } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Failed to verify OTP');
            throw error;
        } finally {
            get().setIsLoading(false);
        }
    },

    completeProfileSetup: async (values) => {
        try {
            get().setIsLoading(true);
            get().clearError();
            const user = get().user;
            if (!user) throw new Error('User not found');
            await AuthService.completeProfileSetup(user.id, values);
        } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Failed to setup profile');
            throw error;
        } finally {
            get().setIsLoading(false);
        }
    },

    logout: async () => {
        try {
            get().setIsLoading(true);
            await AuthService.logout();
            get().setUser(null);
        } catch (error) {
            get().setError(error instanceof Error ? error.message : 'Failed to logout');
            throw error;
        } finally {
            get().setIsLoading(false);
        }
    },
}));