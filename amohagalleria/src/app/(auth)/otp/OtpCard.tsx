"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const otpFormSchema = z.object({
    otp: z.string().length(6, {
        message: "OTP must be exactly 6 digits.",
    }),
})

export default function OtpCard({ onOtpSubmit, isSubmitting, resendOtp, otpTimer, setShowOtpCard, setShowPasswordCard }: any) {
    const otpForm = useForm<z.infer<typeof otpFormSchema>>({
        resolver: zodResolver(otpFormSchema),
        defaultValues: {
            otp: "",
        },
    })

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-primary/10">
                        <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path d="M12 0a12 12 0 100 24 12 12 0 000-24z" />
                        </svg>
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Enter OTP</CardTitle>
                <CardDescription className="text-center">Please enter the OTP sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                        <FormField
                            control={otpForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OTP</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter OTP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="text-center text-sm">
                            {otpTimer > 0 ? (
                                <span>Resend OTP in {otpTimer} seconds</span>
                            ) : (
                                <button
                                    onClick={resendOtp}
                                    className="text-primary font-medium hover:underline focus:outline-none cursor-pointer"
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Verifying OTP...
                                </span>
                            ) : (
                                "Verify OTP"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                    <button
                        onClick={() => {
                            setShowOtpCard(false);
                            setShowPasswordCard(true);
                        }}
                        className="text-primary font-medium hover:underline focus:outline-none cursor-pointer"
                    >
                        Login with another way
                    </button>
                </div>
            </CardFooter>
        </Card>
    )
}
