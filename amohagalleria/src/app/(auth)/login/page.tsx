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
import { useAuthStore } from "@/stores/auth/authStore";
import { useUploadStore } from "@/stores/upload/uploadStore";
import { AuthService } from "@/stores/auth/authService";
import { isClient } from "@/lib/supabase"; // Import the isClient helper
import {
    loginFormSchema,
    LoginFormValues,
    signupFormSchema,
    SignupFormValues,
    OtpFormValues,
} from "@/schemas/auth";

export default function AuthPage() {
    const router = useRouter();
    const {
        user,
        isLoading,
        error,
        sessionChecked,
        checkSession,
        sendOtp,
        verifyOtp,
        completeProfileSetup,
        clearError,
    } = useAuthStore();
    const { openUploadModal } = useUploadStore();

    const [isLogin, setIsLogin] = useState(true);
    const [showOtpCard, setShowOtpCard] = useState(false);
    const [otpTimer, setOtpTimer] = useState(30);
    const [isProfileSetup, setIsProfileSetup] = useState(false);
    const [hasUploadIntent, setHasUploadIntent] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: { email: "" },
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const signupForm = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: { name: "", role: undefined, email: "" },
        mode: "onChange",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        const uploadIntent = sessionStorage.getItem("uploadIntent");
        if (uploadIntent === "true") {
            setHasUploadIntent(true);
        }
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    useEffect(() => {
        if (user && sessionChecked) {
            handleUserRedirect();
        }
    }, [user, sessionChecked]);

    const handleUserRedirect = async () => {
        if (!user) return;

        try {
            const profileExists = await AuthService.checkProfileExists(user.id);

            if (!profileExists) {
                signupForm.setValue("email", user.email || "");
                setIsProfileSetup(true);
                setIsLogin(false);
                return;
            }

            if (hasUploadIntent) {
                handleUploadIntent();
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get("redirect") || "/dashboard";
                window.location.href = redirectUrl;
            }
        } catch (error) {
            toast.error("Failed to determine user state");
            console.error("Redirect error:", error);
        }
    };

    const handleUploadIntent = () => {
        const originalPath = sessionStorage.getItem("originalPath");

        // Clean up session storage
        sessionStorage.removeItem("uploadIntent");
        sessionStorage.removeItem("originalPath");

        // Open upload modal
        openUploadModal();

        // Redirect to original path or home
        if (originalPath && originalPath !== "/login") {
            router.push(originalPath);
        } else {
            router.push("/");
        }
    };

    const handleSendOtp = async (formData: LoginFormValues) => {
        try {
            await sendOtp(formData.email);
            setShowOtpCard(true);
            startOtpTimer();
            toast.success("OTP sent successfully!");
        } catch (error) {
            console.error("OTP send error:", error);
            if (error instanceof Error) {
                if (error.message.includes("rate limit")) {
                    toast.error("Too many attempts. Please try again later.");
                } else {
                    toast.error("Failed to send OTP. Please try again.");
                }
            }
        }
    };

    const handleOtpSubmit = async (values: OtpFormValues) => {
        try {
            await verifyOtp(loginForm.getValues("email"), values.otp);
            toast.success("OTP verified successfully!");

            // Handle redirection after OTP verification
            if (hasUploadIntent) {
                handleUploadIntent();
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get("redirect") || "/dashboard";
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error("OTP verification error:", error);
            if (error instanceof Error) {
                if (error.message.includes("invalid OTP")) {
                    toast.error("Invalid OTP. Please check and try again.");
                } else {
                    toast.error("Failed to verify OTP.");
                }
            }
        }
    };

    const handleSignupSubmit = async (data: SignupFormValues) => {
        try {
            await completeProfileSetup(data);
            toast.success("Profile setup completed successfully!");

            // Handle redirection after profile setup
            if (hasUploadIntent) {
                handleUploadIntent();
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get("redirect") || "/dashboard";
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error("Profile setup error:", error);
            if (error instanceof Error) {
                if (error.message.includes("duplicate")) {
                    toast.error("This email is already registered.");
                } else {
                    toast.error("Failed to complete profile setup.");
                }
            }
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setShowOtpCard(false);
        setOtpTimer(30);
        setIsProfileSetup(false);
        loginForm.reset();
        signupForm.reset();
    };

    const startOtpTimer = () => {
        setOtpTimer(30);
        const timer = setInterval(() => {
            setOtpTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resendOtp = async () => {
        const email = loginForm.getValues("email");
        if (!email) return;

        try {
            await sendOtp(email);
            startOtpTimer();
            toast.success("OTP resent successfully");
        } catch (error) {
            toast.error("Failed to resend OTP");
            console.error("Resend OTP error:", error);
        }
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
                theme="light"
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
                                <form onSubmit={loginForm.handleSubmit(handleSendOtp)} className="space-y-4">
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="m@example.com"
                                                            className="pl-10"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                loginForm.trigger("email");
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="min-h-[20px] block text-sm text-destructive">
                                                    {fieldState.error?.message}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading || !loginForm.formState.isValid}
                                    >
                                        {isLoading ? "Sending..." : "Get OTP"}
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
                        onOtpSubmit={handleOtpSubmit}
                        isSubmitting={isLoading}
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
                        onSignupSubmit={handleSignupSubmit}
                        isSubmitting={isLoading}
                        toggleAuthMode={toggleAuthMode}
                        isProfileSetup={isProfileSetup}
                    />
                </div>
            </div>
        </div>
    );
}