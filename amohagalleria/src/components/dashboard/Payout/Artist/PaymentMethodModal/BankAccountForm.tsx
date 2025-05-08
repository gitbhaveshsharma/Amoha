// src/components/PaymentMethodModal/BankAccountForm.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export const BankAccountForm = () => {
    const { control, watch } = useFormContext();
    const accountNumber = watch("details.account_number");

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="details.account_name"
                render={({ field }) => (
                    <FormItem>
                        <Label>Account Holder Name</Label>
                        <FormControl>
                            <Input 
                                {...field} 
                                placeholder="John Doe" 
                                autoComplete="off"
                                pattern="[a-zA-Z0-9\s\-\.]*"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="details.account_number"
                render={({ field }) => (
                    <FormItem>
                        <Label>Account Number</Label>
                        <FormControl>
                            <Input 
                                {...field} 
                                placeholder="123456789" 
                                type="password"
                                autoComplete="off"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="details.account_number_confirmation"
                render={({ field }) => (
                    <FormItem>
                        <Label>Confirm Account Number</Label>
                        <FormControl>
                            <Input 
                                {...field} 
                                placeholder="123456789" 
                                type="password"
                                autoComplete="off"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="details.routing_number"
                render={({ field }) => (
                    <FormItem>
                        <Label>Routing Number</Label>
                        <FormControl>
                            <Input 
                                {...field} 
                                placeholder="091000019" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={9}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="details.bank_name"
                render={({ field }) => (
                    <FormItem>
                        <Label>Bank Name</Label>
                        <FormControl>
                            <Input 
                                {...field} 
                                placeholder="Chase Bank" 
                                autoComplete="off"
                                pattern="[a-zA-Z0-9\s\-\.]*"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};