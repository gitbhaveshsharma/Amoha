import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePaymentMethodStore } from "@/stores/Payout/artist/paymentMethods/paymentMethodStore";
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
import { paymentMethodSchemas, PaymentMethod } from "@/types";

const formSchema = z.object({
    method_type: z.enum(['bank_account', 'paypal', 'stripe']),
    is_default: z.boolean().default(false),
    details: z.union([
        paymentMethodSchemas.bank_account,
        paymentMethodSchemas.paypal,
        paymentMethodSchemas.stripe
    ])
});

type FormValues = z.infer<typeof formSchema>;


export const AddPaymentMethodModal = () => {
    const [open, setOpen] = React.useState(false);
    const { loading, error, addPaymentMethod } = usePaymentMethodStore();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            method_type: 'bank_account',
            is_default: false as boolean,
            details: {
                account_name: '',
                account_number: '',
                routing_number: '',
                bank_name: ''
            }
        }
    });

    const methodType = form.watch("method_type");

    const onSubmit = async (values: FormValues) => {
        await addPaymentMethod({
            method_type: values.method_type,
            details: values.details,
            is_default: values.is_default ?? false,
            is_verified: false
        });

        if (!error) {
            setOpen(false);
            form.reset();
        }
    };

    const renderForm = () => {
        switch (methodType) {
            case 'bank_account':
                return <BankAccountForm />;
            case 'paypal':
                return <PayPalForm />;
            case 'stripe':
                return <StripeForm />;
            default:
                return null;
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
                    <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FormValues>)} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Payment Method Type</Label>
                                <Select
                                    onValueChange={(value: string) => {
                                        const paymentMethod = value as unknown as PaymentMethod;
                                        form.setValue("method_type", paymentMethod as unknown as "bank_account" | "paypal" | "stripe");
                                        form.setValue("method_type", value as "bank_account" | "paypal" | "stripe");
                                    }}
                                    value={methodType}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_account">Bank Account</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="stripe">Credit/Debit Card</SelectItem>
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
                                {loading ? (
                                    <>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Payment Method'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};