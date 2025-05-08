// src/components/PaymentMethodModal/StripeForm.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

export const StripeForm = () => {
    const { control } = useFormContext();

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="details.card_name"
                render={({ field }) => (
                    <FormItem>
                        <Label>Name on Card</Label>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="John Doe"
                                autoComplete="cc-name"
                                pattern="[a-zA-Z\s\-]*"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="details.card_number"
                render={({ field }) => (
                    <FormItem>
                        <Label>Card Number</Label>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="4242 4242 4242 4242"
                                autoComplete="cc-number"
                                inputMode="numeric"
                                pattern="[0-9\s]*"
                                onChange={(e) => {
                                    // Format with spaces every 4 digits
                                    const value = e.target.value.replace(/\s/g, '');
                                    if (/^\d*$/.test(value)) {
                                        field.onChange(value.match(/.{1,4}/g)?.join(' ') || value);
                                    }
                                }}
                            />
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
                                <Input
                                    {...field}
                                    placeholder="MM/YY"
                                    autoComplete="cc-exp"
                                    inputMode="numeric"
                                    maxLength={5}
                                    onChange={(e) => {
                                        // Auto-format expiry date
                                        let value = e.target.value.replace(/\D/g, '');
                                        if (value.length > 2) {
                                            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                                        }
                                        field.onChange(value);
                                    }}
                                />
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
                                <Input
                                    {...field}
                                    placeholder="123"
                                    type="password"
                                    autoComplete="cc-csc"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Card className="bg-muted/50">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                        For security, we don&apos;t store your card details.
                        They are processed directly by our payment processor.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};