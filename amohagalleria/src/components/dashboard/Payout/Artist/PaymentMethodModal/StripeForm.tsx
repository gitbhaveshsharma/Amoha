import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export const StripeForm = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="details.card_number"
                render={({ field }) => (
                    <FormItem>
                        <Label>Card Number</Label>
                        <FormControl>
                            <Input {...field} placeholder="4242 4242 4242 4242" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="details.expiry"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Expiry Date</Label>
                            <FormControl>
                                <Input {...field} placeholder="MM/YY" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="details.cvc"
                    render={({ field }) => (
                        <FormItem>
                            <Label>CVC</Label>
                            <FormControl>
                                <Input {...field} placeholder="123" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};