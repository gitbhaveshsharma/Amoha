import React from "react";
import { usePaymentMethodStore } from "@/stores/Payout/artist/paymentMethods/paymentMethodStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import { Ban, CreditCard, DollarSign } from "lucide-react";

export const PaymentMethodList = () => {
    const {
        paymentMethods,
        loading,
        error,
        setDefaultMethod,
        deleteMethod,
        fetchPaymentMethods
    } = usePaymentMethodStore();

    React.useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    if (loading && paymentMethods.length === 0) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                <AddPaymentMethodModal />
            </div>

            {error && (
                <div className="text-destructive">
                    <p>Error loading payment methods: {error}</p>
                    <Button variant="outline" onClick={fetchPaymentMethods}>
                        Retry
                    </Button>
                </div>
            )}

            {paymentMethods.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">No payment methods found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <Card key={method.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                                <div className="flex items-center space-x-3">
                                    {method.method_type === 'bank_account' && (
                                        <Ban className="h-6 w-6 text-muted-foreground" />
                                    )}
                                    {method.method_type === 'paypal' && (
                                        <DollarSign className="h-6 w-6 text-muted-foreground" />
                                    )}
                                    {method.method_type === 'stripe' && (
                                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                                    )}
                                    <div>
                                        <p className="font-medium capitalize">
                                            {method.method_type.replace('_', ' ')}
                                            {method.is_default && (
                                                <Badge variant="secondary" className="ml-2">Default</Badge>
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {method.method_type === 'paypal'
                                                ? method.details.email
                                                : `•••• ${method.details.last4}`}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex justify-end space-x-2">
                                {!method.is_default && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDefaultMethod(method.id)}
                                        >
                                            Set Default
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteMethod(method.id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};