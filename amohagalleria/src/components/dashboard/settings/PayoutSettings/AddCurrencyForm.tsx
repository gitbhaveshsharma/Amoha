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
import { currencySchema } from "@/schemas/payout/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddCurrencyFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddCurrencyForm({ open, onOpenChange }: AddCurrencyFormProps) {
    const { addCurrency } = useCurrencyStore();
    const form = useForm<Currency>({
        resolver: zodResolver(currencySchema),
        defaultValues: {
            code: "",
            name: "",
            symbol: "",
            decimal_digits: 2,
            is_active: true,
        },
    });

    const onSubmit = async (values: Currency) => {
        try {
            await addCurrency(values);
            toast.success("Currency added successfully");
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast.error("Failed to add currency");
            console.error("Error adding currency:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Currency</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Code (3 letters)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="USD, EUR, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="US Dollar" {...field} />
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
                                        <Input placeholder="$" {...field} />
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}