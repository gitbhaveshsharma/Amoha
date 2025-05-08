"use client"

import { ArrowRight, User, Lock } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { SignupFormValues } from "@/schemas/auth/signup"
import { ROLE_VALUES } from "@/lib/constants/roles"

interface SignupCardProps {
    signupForm: UseFormReturn<SignupFormValues>
    onSignupSubmit: (values: SignupFormValues) => void
    isSubmitting: boolean
    toggleAuthMode: () => void
    isProfileSetup?: boolean
}

export default function SignupCard({
    signupForm,
    onSignupSubmit,
    isSubmitting,
    toggleAuthMode,
    isProfileSetup
}: SignupCardProps) {
    const { control, formState, watch } = signupForm
    const emailValue = watch("email")

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                    {isProfileSetup ? "Complete Your Profile" : "Create an Account"}
                </CardTitle>
                <CardDescription className="text-center">
                    {isProfileSetup
                        ? "Just a few more details to get started"
                        : "Enter your details to create your account"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="John Doe"
                                                className="pl-10"
                                                autoComplete="name"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="email"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={emailValue}
                                                readOnly
                                                className={cn(
                                                    "pl-10 bg-muted/50",
                                                    "cursor-not-allowed opacity-100" // Make it clear it's not editable
                                                )}
                                                tabIndex={-1} // Prevent keyboard focus
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isSubmitting}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLE_VALUES.map((value) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                    disabled={isSubmitting}
                                                >
                                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || !formState.isValid}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    {isProfileSetup ? "Saving..." : "Creating account..."}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    {isProfileSetup ? "Complete Setup" : "Create Account"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>

            {!isProfileSetup && (
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <button
                            onClick={toggleAuthMode}
                            className="text-primary font-medium hover:underline focus:outline-none"
                            type="button"
                            disabled={isSubmitting}
                        >
                            Login
                        </button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
