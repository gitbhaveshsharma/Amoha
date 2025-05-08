// src/components/PaymentMethodModal/AddPaymentMethodModal.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BankAccountForm } from "./PaymentMethodModal/BankAccountForm";
import { PayPalForm } from "./PaymentMethodModal/PayPalForm";
import { StripeForm } from "./PaymentMethodModal/StripeForm";
import { PAYMENT_METHOD_TYPES, PAYMENT_METHOD_OPTIONS, isValidPaymentMethod } from "@/lib/constants/paymentMethods";
import { paymentMethodSchema } from "@/schemas/payout/paymentMethodSchemas";
import { usePaymentMethodStore } from "@/stores/Payout/artist/paymentMethods/paymentMethodStore";
import type { z } from "zod";
type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

export const AddPaymentMethodModal = () => {
    const [open, setOpen] = React.useState(false);
    const { loading, error, addPaymentMethod } = usePaymentMethodStore();

    const form = useForm<PaymentMethodFormValues>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            method_type: PAYMENT_METHOD_TYPES.BANK_ACCOUNT,
            is_default: false,
            details: {
                account_name: "",
                account_number: "",
                routing_number: "",
                bank_name: ""
            }
        }
    });

    const methodType = form.watch("method_type");

    const onSubmit = async (data: PaymentMethodFormValues) => {
        try {
            await addPaymentMethod({
                method_type: data.method_type,
                details: data.details as PaymentMethodFormValues["details"],
                is_default: data.is_default,
                is_verified: false
            });

            if (!error) {
                setOpen(false);
                form.reset();
            }
        } catch (err) {
            console.error("Failed to add payment method:", err);
        }
    };

    const renderForm = () => {
        switch (methodType) {
            case PAYMENT_METHOD_TYPES.BANK_ACCOUNT:
                return <BankAccountForm />;
            case PAYMENT_METHOD_TYPES.PAYPAL:
                return <PayPalForm />;
            case PAYMENT_METHOD_TYPES.STRIPE:
                return <StripeForm />;
            default:
                return null;
        }
    };

    const handleMethodTypeChange = (value: string) => {
        if (!isValidPaymentMethod(value)) return;

        // Type assertion is safe here because we've validated with isValidPaymentMethod
        const methodType = value as typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];

        // Reset form with new method type and appropriate empty details
        const newValues = {
            method_type: methodType,
            is_default: form.getValues("is_default"),
            details: getDefaultDetails(methodType),
        } as PaymentMethodFormValues;

        form.reset(newValues);
    };

    const getDefaultDetails = (methodType: typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES]) => {
        switch (methodType) {
            case PAYMENT_METHOD_TYPES.BANK_ACCOUNT:
                return {
                    account_name: "",
                    account_number: "",
                    routing_number: "",
                    bank_name: ""
                };
            case PAYMENT_METHOD_TYPES.PAYPAL:
                return { email: "" };
            case PAYMENT_METHOD_TYPES.STRIPE:
                return {
                    card_number: "",
                    expiry: "",
                    cvc: ""
                };
            default:
                throw new Error(`Unknown payment method type: ${methodType}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Add Payment Method
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Payment Method Type</Label>
                                <Select
                                    onValueChange={handleMethodTypeChange}
                                    value={methodType}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <span>{option.icon}</span>
                                                    <span>{option.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {renderForm()}

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="default-method"
                                    {...form.register("is_default")}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor="default-method">Set as default payment method</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Payment Method'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};