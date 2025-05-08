// components/make-offer-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MakeOfferButtonProps } from "@/types";
import { useOffer } from "@/context/offer-context";
import { createOfferSchema } from "@/schemas/offer-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function MakeOfferButton({
    artworkId,
    artistId,
    currentPrice,
    isAuction = false,
    minOfferPercentage = 0.8,
    bidIncrementPercentage = 0.05,
    variant = "default",
    size = "default",
    className = "",
    makeOffer, // Optional prop
}: MakeOfferButtonProps) {
    const { makeOffer: contextMakeOffer } = useOffer();
    const effectiveMakeOffer = makeOffer || contextMakeOffer;
    const [open, setOpen] = useState(false);
    const [highestBid, setHighestBid] = useState<number | null>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(
            createOfferSchema(
                isAuction,
                currentPrice,
                highestBid,
                minOfferPercentage,
                bidIncrementPercentage
            )
        ),
        defaultValues: {
            amount: highestBid
                ? highestBid * (1 + bidIncrementPercentage)
                : currentPrice * minOfferPercentage,
            message: "",
        },
    });

    // Fetch the highest bid for the artwork
    const fetchHighestBid = async () => {
        const { data } = await supabase
            .from("bids")
            .select("amount")
            .eq("artwork_id", artworkId)
            .order("amount", { ascending: false })
            .limit(1)
            .maybeSingle();

        return typeof data?.amount === "number" ? data.amount : currentPrice;
    };

    // Handle dialog open/close
    const handleOpenChange = async (open: boolean) => {
        setOpen(open);
        if (open) {
            const currentHighest = await fetchHighestBid();
            setHighestBid(currentHighest);
            form.reset({
                amount: isAuction
                    ? currentHighest * (1 + bidIncrementPercentage)
                    : currentPrice * minOfferPercentage,
                message: "",
            });
        }
    };

    // Handle form submission
    const onSubmit = async (values: { amount: number; message?: string }) => {
        try {
            setIsSubmitting(true);
            const success = await effectiveMakeOffer({
                artworkId,
                artistId,
                amount: values.amount,
                message: values.message,
                isAuction,
                currentPrice,
            });

            if (success) {
                toast.success(
                    isAuction
                        ? `Your bid of $${values.amount.toFixed(2)} was placed successfully!`
                        : `Your offer of $${values.amount.toFixed(2)} was submitted successfully!`
                );
                setOpen(false);
                router.refresh();
            }
        } catch (error) {
            toast.error(
                isAuction
                    ? "Failed to place bid. Please try again."
                    : "Failed to submit offer. Please try again."
            );
            console.error("Error making offer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        className={className}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isAuction ? "Place Bid" : "Make Offer"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isAuction ? "Place Your Bid" : "Make an Offer"}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {isAuction ? "Bid Amount" : "Offer Amount"}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    $
                                                </span>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        field.onChange(isNaN(value) ? "" : value);
                                                    }}
                                                    className="pl-8"
                                                    placeholder={
                                                        highestBid
                                                            ? `Minimum: $${(
                                                                highestBid *
                                                                (1 + bidIncrementPercentage)
                                                            ).toFixed(2)}`
                                                            : `Starting at: $${currentPrice.toFixed(2)}`
                                                    }
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        <p className="text-sm text-muted-foreground">
                                            {highestBid
                                                ? `Current highest bid: $${highestBid.toFixed(2)}`
                                                : `Starting price: $${currentPrice.toFixed(2)}`}
                                        </p>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder={
                                                    isAuction
                                                        ? "Add a note to the artist..."
                                                        : "Tell the artist why you're interested..."
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : isAuction ? (
                                        "Place Bid"
                                    ) : (
                                        "Submit Offer"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}