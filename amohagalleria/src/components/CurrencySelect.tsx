"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { useEffect, useState } from "react";
import { CurrencyCode } from "@/types/currency";
import { Loader2 } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { ArtworkFormValues } from "@/schemas/artwork";

interface CurrencySelectProps {
    field: ControllerRenderProps<ArtworkFormValues, "currency">;
    disabled?: boolean;
    artworkId?: string;
}

export const CurrencySelect = ({ field, disabled, artworkId }: CurrencySelectProps) => {
    const { currencies, isLoading, error, fetchCurrencies } = useCurrencyStore();
    const [internalValue, setInternalValue] = useState<CurrencyCode>("USD"); // Default to USD

    // Load currencies on mount and when artwork changes
    useEffect(() => {
        fetchCurrencies();
    }, [fetchCurrencies, artworkId]);

    // Synchronize internal state with form state
    useEffect(() => {
        if (field.value && currencies.length > 0) {
            const isValidValue = currencies.some(c => c.code === field.value);
            if (isValidValue) {
                setInternalValue(field.value);
            } else {
                // If invalid value, default to USD
                setInternalValue("USD");
                field.onChange("USD");
            }
        } else if (currencies.length > 0) {
            // If no value set, default to USD
            setInternalValue("USD");
            field.onChange("USD");
        }
    }, [field.value, currencies]);

    const handleValueChange = (value: CurrencyCode) => {
        setInternalValue(value);
        field.onChange(value);
    };

    return (
        <Select
            onValueChange={handleValueChange}
            value={internalValue}
            disabled={disabled || isLoading || !!error}
        >
            <SelectTrigger className="w-full">
                {isLoading ? (
                    <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading currencies...
                    </div>
                ) : error ? (
                    "Error loading currencies"
                ) : (
                    <SelectValue placeholder="Select currency" />
                )}
            </SelectTrigger>
            <SelectContent>
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
    );
};