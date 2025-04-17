// src/components/AuthPage.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, Mail } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SignupCard from "../profile-setup/ProfileSetup";
import OtpCard from "../otp/OtpCard";
import { migrateGuestWishlist } from '@/lib/wishlistMigration';
import { migrateGuestCart } from '@/lib/cartMigration';

import { supabase } from "@/lib/supabase";
import {
    loginFormSchema, LoginFormValues,
    signupFormSchema, SignupFormValues,
    OtpFormValues
} from "@/schemas/auth";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtpCard, setShowOtpCard] = useState(false);
    const [otpTimer, setOtpTimer] = useState(30);
    const [isProfileSetup, setIsProfileSetup] = useState(false);
    const router = useRouter();

    // Check for existing session on component mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (profile) {
                    window.location.href = '/dashboard';
                } else {
                    setIsProfileSetup(true);
                    setIsLogin(false);
                }
            }
        };
        checkSession();
    }, []);

    // Login form
    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
        },
    });

    // Signup form
    const signupForm = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            name: "",
            role: "",
            email: "",
        },
    });

    async function onOtpSubmit(values: OtpFormValues) {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: loginForm.getValues("email"),
                token: values.otp,
                type: 'email',
            });

            if (error) throw error;

            toast.success("OTP verified successfully!");
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (!currentSession) {
                throw new Error('Session not established after login');
            }

            // // Migrate guest wishlist to user wishlist
            // await migrateGuestWishlist(currentSession.user.id);
            // Migrate both wishlist and cart
            await Promise.all([
                migrateGuestWishlist(currentSession.user.id),
                migrateGuestCart(currentSession.user.id)
            ]);
            // Refresh both stores
            // await Promise.all([
            //     useWishlistStore.getState().fetchWishlist(),
            //     useCartStore.getState().fetchCart()
            // ]);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { data: profile } = await supabase
                .from('profile')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                window.location.href = '/dashboard';
            } else {
                signupForm.setValue('email', loginForm.getValues('email'));
                setIsProfileSetup(true);
                setIsLogin(false);
            }
        } catch (error: any) {
            console.error("Error during OTP verification:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Handle signup form submission
    const onSignupSubmit = async (data: SignupFormValues) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const { error: profileError } = await supabase.from('profile').insert({
                user_id: user.id,
                name: data.name,
                email: data.email,
                role: data.role,
            });

            if (profileError) throw profileError;

            toast.success("Profile setup completed successfully!");
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Error during profile setup:", error);
            toast.error("Profile setup failed: " + (error.message || "An unexpected error occurred"));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle between login and signup
    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setShowOtpCard(false);
        setOtpTimer(30);
        setIsProfileSetup(false);
    };

    // Send OTP and show OTP card
    async function sendOtp() {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: loginForm.getValues("email"),
            });

            if (error) throw error;

            toast.success("OTP sent successfully! Check your email.");
            setShowOtpCard(true);
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Resend OTP
    const resendOtp = async () => {
        setOtpTimer(30);
        await sendOtp();
    };

    return (
        <div className="flex justify-center px-4 py-12 min-h-screen bg-gray-50">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="w-full max-w-md mx-auto relative">
                {/* Login Card */}
                <div
                    className={`absolute w-full transition-all duration-500 ease-in-out transform ${isLogin && !showOtpCard ? "translate-x-0 opacity-100 z-10" : "-translate-x-full opacity-0 -z-10"
                        }`}
                >
                    <Card className="w-full shadow-lg">
                        <CardHeader className="space-y-1">
                            <div className="flex justify-center mb-2">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <KeyRound className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                            <CardDescription className="text-center">
                                Enter your email to receive an OTP
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...loginForm}>
                                <form className="space-y-4">
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="m@example.com" className="pl-10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" className="w-full" onClick={sendOtp}>
                                        Get OTP
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* OTP Card */}
                <div
                    className={`absolute w-full transition-all duration-500 ease-in-out transform ${showOtpCard ? "translate-x-0 opacity-100 z-10" : "-translate-x-full opacity-0 -z-10"
                        }`}
                >
                    <OtpCard
                        onOtpSubmit={onOtpSubmit}
                        isSubmitting={isSubmitting}
                        resendOtp={resendOtp}
                        otpTimer={otpTimer}
                        setShowOtpCard={setShowOtpCard}
                        email={loginForm.getValues("email")}
                    />
                </div>

                {/* Signup Card */}
                <div
                    className={`absolute w-full transition-all duration-500 ease-in-out transform ${!isLogin || isProfileSetup ? "translate-x-0 opacity-100 z-10" : "-translate-x-full opacity-0 -z-10"
                        }`}
                >
                    <SignupCard
                        signupForm={signupForm}
                        onSignupSubmit={onSignupSubmit}
                        isSubmitting={isSubmitting}
                        toggleAuthMode={toggleAuthMode}
                        isProfileSetup={isProfileSetup}
                    />
                </div>
            </div>
        </div>
    );
}