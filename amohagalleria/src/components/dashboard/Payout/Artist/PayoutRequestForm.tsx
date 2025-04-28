import React from 'react';
import { usePayoutRequestStore } from '@/stores/Payout/artist/request/payoutRequestStore';
import { useBalanceDisplayStore } from '@/stores/Payout/artist/balance/balanceDisplayStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
} from 'lucide-react';
import { PaymentMethod } from '@/types';

export const PayoutRequestForm = () => {
    const {
        amount,
        paymentMethodId,
        paymentMethods,
        loading,
        submitting,
        error,
        success,
        setAmount,
        setPaymentMethodId,
        fetchPaymentMethods,
        submitRequest
    } = usePayoutRequestStore();

    const { balance } = useBalanceDisplayStore();

    React.useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitRequest();
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Request Payout</h3>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Payout request submitted successfully!
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                            id="amount"
                            type="number"
                            value={amount || ''}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="pl-8"
                            min="10"
                            max={balance || undefined}
                            step="0.01"
                            placeholder="Enter amount"
                            required
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Available: ${balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                        value={paymentMethodId}
                        onValueChange={setPaymentMethodId}
                        disabled={loading || paymentMethods.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={loading ? "Loading..." : "Select payment method"} />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentMethods.map((method: PaymentMethod) => (
                                <SelectItem key={method.id} value={method.id}>
                                    {method.method_type} •••• {method.details.last4 || ''}
                                    {method.is_default && ' (Default)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {paymentMethods.length === 0 && !loading && (
                        <p className="text-sm text-destructive">
                            No payment methods found. Please add one first.
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={submitting || !amount || !paymentMethodId || paymentMethods.length === 0}
                    className="w-full"
                >
                    {submitting ? (
                        <>
                            Processing...
                        </>
                    ) : (
                        'Request Payout'
                    )}
                </Button>
            </form>
        </div>
    );
};