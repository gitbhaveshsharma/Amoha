import { supabase } from '@/lib/supabase';
import { migrateGuestWishlist } from '@/lib/wishlistMigration';
import { migrateGuestCart } from '@/lib/cartMigration';
import { migrateGuestNotificationPreferences } from '@/lib/notificationMigration';
import { SignupFormValues, } from "@/schemas/auth";
import { User } from "@supabase/supabase-js";

export const AuthService = {
    async checkSession(): Promise<User | null> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session?.user ?? null;
        } catch (error) {
            console.error('Session check error:', error);
            throw new Error('Failed to check session');
        }
    },

    async sendOtp(email: string): Promise<void> {
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
        } catch (error) {
            console.error('OTP send error:', error);
            throw new Error('Failed to send OTP');
        }
    },

    async verifyOtp(email: string, otp: string): Promise<User> {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (error) throw error;
            if (!data.session) throw new Error('Session not established');

            // Migrate guest data
            await Promise.all([
                migrateGuestWishlist(data.session.user.id),
                migrateGuestCart(data.session.user.id),
                migrateGuestNotificationPreferences(data.session.user.id)
            ]);

            return data.session.user;
        } catch (error) {
            console.error('OTP verification error:', error);
            throw new Error('Failed to verify OTP');
        }
    },

    async checkProfileExists(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('profile')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return !!data;
        } catch (error) {
            console.error('Profile check error:', error);
            throw new Error('Failed to check profile');
        }
    },

    async completeProfileSetup(userId: string, values: SignupFormValues): Promise<void> {
        try {
            const { error } = await supabase.from('profile').insert({
                user_id: userId,
                name: values.name,
                email: values.email,
                role: values.role,
            });

            if (error) throw error;
        } catch (error) {
            console.error('Profile setup error:', error);
            throw new Error('Failed to complete profile setup');
        }
    },

    async logout(): Promise<void> {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Failed to logout');
        }
    },
};