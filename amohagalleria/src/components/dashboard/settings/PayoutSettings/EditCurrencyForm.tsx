"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Currency } from "@/types/currency";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { toast } from "react-toastify";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { currencyUpdateSchema } from "@/schemas/payout/currency";
import { Switch } from "@/components/ui/switch";

interface EditCurrencyFormProps {
    currency: Currency;
    onOpenChange: (open: boolean) => void;
}

export function EditCurrencyForm({
    currency,
    onOpenChange,
}: EditCurrencyFormProps) {
    const { updateCurrency, fetchAllCurrencies } = useCurrencyStore();

    const form = useForm<Partial<Currency>>({
        resolver: zodResolver(currencyUpdateSchema),
        defaultValues: {
            name: currency.name,
            symbol: currency.symbol,
            decimalDigits: currency.decimalDigits,
            is_active: currency.is_active,
        },
    });

    const onSubmit = async (values: Partial<Currency>) => {
        try {
            await updateCurrency(currency.code, values);
            await fetchAllCurrencies(); // Refresh the list after update
            toast.success("Currency updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update currency");
            console.error("Error updating currency:", error);
        }
    };

    return (
        <Dialog open={!!currency} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Currency ({currency.code})</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symbol</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="decimalDigits"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Decimal Digits</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Active Status
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            {field.value ? "Currency is active" : "Currency is inactive"}
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}