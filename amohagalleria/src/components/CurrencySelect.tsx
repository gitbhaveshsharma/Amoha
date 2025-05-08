"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { useEffect } from "react";
import { CurrencyCode } from "@/types/currency";
interface CurrencySelectProps {
    value: CurrencyCode;
    onChange: (value: CurrencyCode) => void;
    name: string;
    control?: any;
    label?: string;
    className?: string;
    onValueChange?: (value: string) => void;
}

export function CurrencySelect({
    name,
    control,
    className = "",
    onValueChange,
}: CurrencySelectProps) {
    const { currencies, isLoading, error, fetchCurrencies } = useCurrencyStore();

    // Fetch currencies when component mounts
    useEffect(() => {
        fetchCurrencies();
    }, [fetchCurrencies]);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <div className={`space-y-2 ${className}`}>
                    <Select
                        onValueChange={(value: string) => {
                            field.onChange(value);
                            onValueChange?.(value);
                        }}
                        value={field.value}
                        defaultValue={field.value}
                    >
                        <SelectTrigger className={fieldState.error ? "border-destructive" : ""}>
                            <SelectValue placeholder={isLoading ? "Loading..." : "Select currency"} />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading && (
                                <SelectItem value="loading" disabled>
                                    Loading currencies...
                                </SelectItem>
                            )}
                            {error && (
                                <SelectItem value="error" disabled>
                                    Failed to load currencies
                                </SelectItem>
                            )}
                            {currencies.map((currency) => (
                                <SelectItem
                                    key={currency.code}
                                    value={currency.code}
                                    className="flex items-center gap-2"
                                >
                                    <span className="font-medium">{currency.code}</span>
                                    <span className="text-muted-foreground">- {currency.name}</span>
                                    <span className="ml-2">{currency.symbol}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {fieldState.error && (
                        <p className="text-sm font-medium text-destructive">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}