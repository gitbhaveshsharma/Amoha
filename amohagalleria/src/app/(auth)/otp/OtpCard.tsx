"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { otpFormSchema } from "@/schemas/auth"
import { useEffect, useState } from "react"

type OtpFormValues = z.infer<typeof otpFormSchema>

interface OtpCardProps {
    onOtpSubmit: (values: OtpFormValues) => void
    isSubmitting: boolean
    resendOtp: () => void
    otpTimer: number
    setShowOtpCard?: (show: boolean) => void
    setShowPasswordCard?: (show: boolean) => void
    email?: string
}
export default function OtpCard({
    onOtpSubmit,
    isSubmitting,
    resendOtp,
    otpTimer,
    email
}: OtpCardProps) {
    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpFormSchema),
        defaultValues: {
            otp: "",
        },
        mode: "onChange",
    })

    const [inputValue, setInputValue] = useState<string>("")
    const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (/^\d*$/.test(value) && value.length <= 6) {
            setInputValue(value)
            form.setValue("otp", value, { shouldValidate: true })
        }
    }

    useEffect(() => {
        if (inputValue.length === 6 && form.formState.isValid && !autoSubmitTriggered) {
            setAutoSubmitTriggered(true)
            const timer = setTimeout(() => {
                form.handleSubmit(onOtpSubmit)()
            }, 100) // Small delay to ensure the 6th digit is visible
            return () => clearTimeout(timer)
        } else if (inputValue.length < 6) {
            setAutoSubmitTriggered(false)
        }
    }, [inputValue, form.formState.isValid, form, onOtpSubmit, autoSubmitTriggered])

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
                <CardDescription className="text-center">
                    Please enter the 6-digit OTP sent to {email || "your email"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onOtpSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>OTP Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123456"
                                            {...field}
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            maxLength={6}
                                            autoComplete="one-time-code"
                                            inputMode="numeric"
                                        />
                                    </FormControl>
                                    <FormMessage className="min-h-[20px] block">
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <div className="text-center text-sm">
                            {otpTimer > 0 ? (
                                <span>Resend OTP in {otpTimer} seconds</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    className="text-primary font-medium hover:underline focus:outline-none cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || !form.formState.isValid}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
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
                                    Verifying...
                                </span>
                            ) : (
                                "Verify OTP"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}