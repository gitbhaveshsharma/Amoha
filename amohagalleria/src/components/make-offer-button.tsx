// components/make-offer-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MakeOfferButtonProps } from "@/types";
import { useOffer } from "@/context/offer-context";

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
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [highestBid, setHighestBid] = useState<number | null>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch the highest bid for the artwork
    const fetchHighestBid = async () => {
        const { data } = await supabase
            .from("bids")
            .select("amount")
            .eq("artwork_id", artworkId)
            .order("amount", { ascending: false })
            .limit(1)
            .maybeSingle();

        return data?.amount || currentPrice;
    };

    // Handle dialog open/close
    const handleOpenChange = async (open: boolean) => {
        setOpen(open);
        if (open) {
            const currentHighest = await fetchHighestBid();
            setHighestBid(currentHighest);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount)) {
            toast.error("Please enter a valid amount");
            return;
        }

        const currentHighestBid = highestBid || currentPrice;
        const minBidAmount = currentHighestBid * (1 + bidIncrementPercentage);

        if (numericAmount < minBidAmount) {
            toast.error(
                `Your ${isAuction ? "bid" : "offer"} must be at least $${minBidAmount.toFixed(2)}`
            );
            return;
        }

        if (!isAuction && numericAmount < currentPrice * minOfferPercentage) {
            toast.error(
                `Offer must be at least $${(currentPrice * minOfferPercentage).toFixed(2)} (${minOfferPercentage * 100}% of price)`
            );
            return;
        }

        setIsSubmitting(true);
        const success = await effectiveMakeOffer({
            artworkId,
            artistId,
            amount: numericAmount,
            message,
            isAuction,
            currentPrice,
        });
        setIsSubmitting(false);
        if (success) {
            setOpen(false);
            router.refresh();
        }
    };

    return (
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            {isAuction ? "Bid Amount" : "Offer Amount"}
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                $
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                min={
                                    highestBid
                                        ? highestBid * (1 + bidIncrementPercentage)
                                        : currentPrice
                                }
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8"
                                placeholder={
                                    highestBid
                                        ? `Minimum: $${(
                                            highestBid *
                                            (1 + bidIncrementPercentage)
                                        ).toFixed(2)}`
                                        : `Starting at: $${currentPrice.toFixed(2)}`
                                }
                                required
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {highestBid
                                ? `Current highest bid: $${highestBid.toFixed(2)}`
                                : `Starting price: $${currentPrice.toFixed(2)}`}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Input
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={
                                isAuction
                                    ? "Add a note to the artist..."
                                    : "Tell the artist why you're interested..."
                            }
                        />
                    </div>

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
            </DialogContent>
        </Dialog>
    );
}