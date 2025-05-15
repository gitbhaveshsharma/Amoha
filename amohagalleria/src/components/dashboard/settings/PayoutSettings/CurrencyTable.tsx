"use client";
import React, { useEffect } from "react";
import { useCurrencyStore } from "@/stores/currency/currencyStore";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash, MoreVertical } from "lucide-react";
import { Currency } from "@/types/currency";
import { toast } from "react-toastify";
import { AddCurrencyForm } from "./AddCurrencyForm";
import { EditCurrencyForm } from "./EditCurrencyForm";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CurrencyTable() {
    const {
        currencies,
        isLoading,
        error,
        fetchAllCurrencies,
        deleteCurrency,
    } = useCurrencyStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [editingCurrency, setEditingCurrency] = React.useState<Currency | null>(null);

    useEffect(() => {
        fetchAllCurrencies();
    }, [fetchAllCurrencies]);
    console.log("currencies", currencies);

    const handleDelete = async (code: string) => {
        try {
            await deleteCurrency(code);
            toast.success("Currency deleted successfully");
        } catch (error) {
            toast.error("Failed to delete currency");
            console.error("Error deleting currency:", error);
        }
    };

    // Function to determine currency status and styling based on is_active
    const getCurrencyStatusStyle = (currency: Currency) => {
        if (currency.is_active) {
            // Active currencies in green
            return {
                badgeVariant: "outline",
                borderColor: "border-green-300",
                textColor: "text-green-700",
                bgColor: "bg-green-50"
            };
        } else {
            // Inactive currencies in orange
            return {
                badgeVariant: "outline",
                borderColor: "border-orange-300",
                textColor: "text-orange-700",
                bgColor: "bg-orange-50"
            };
        }
    };

    if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Currency Settings</CardTitle>
                <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Currency
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {currencies.map((currency) => {
                            // Get styling based on currency status
                            // For now using a default style, but can be expanded based on currency properties
                            const style = getCurrencyStatusStyle(currency);

                            return (
                                <div
                                    key={currency.code}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg w-full sm:w-auto",
                                        style.borderColor,
                                        "border-2",
                                        style.bgColor
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge

                                            className={cn(
                                                "whitespace-nowrap",
                                                !currency.is_active ? "bg-orange-50 text-orange-700" :
                                                    style.textColor,
                                                currency.is_active && "bg-transparent"
                                            )}
                                        >
                                            {currency.code}
                                        </Badge>
                                    </div>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-2">
                                            <div className="flex flex-col space-y-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start"
                                                    onClick={() => setEditingCurrency(currency)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(currency.code)}
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <AddCurrencyForm
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />

            {editingCurrency && (
                <EditCurrencyForm
                    currency={editingCurrency}
                    onOpenChange={() => setEditingCurrency(null)}
                />
            )}
        </Card>
    );
}