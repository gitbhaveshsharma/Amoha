import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export const PayPalForm = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="details.email"
                render={({ field }) => (
                    <FormItem>
                        <Label>PayPal Email</Label>
                        <FormControl>
                            <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <p className="text-sm text-muted-foreground">
                We will send payments to this PayPal email address
            </p>
        </div>
    );
};