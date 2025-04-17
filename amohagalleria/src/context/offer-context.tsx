// context/offer-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { MakeOffer } from "@/types";

interface OfferContextType {
    makeOffer: (offer: MakeOffer) => Promise<boolean>;
    isLoading: boolean;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

export function OfferProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const makeOffer = async ({
        artworkId,
        artistId,
        amount,
        message = "",
        isAuction = false,
    }: MakeOffer): Promise<boolean> => {
        setIsLoading(true);

        try {
            // Check authentication
            const { data: { session }, error: authError } = await supabase.auth.getSession();

            if (authError || !session) {
                toast.error("Please login to make an offer");
                router.push("/auth/login"); // Use your existing auth route
                return false;
            }

            // Validate not bidding on own artwork
            if (session.user.id === artistId) {
                toast.error("You cannot bid on your own artwork");
                return false;
            }

            // Save to database
            const { error: dbError } = await supabase
                .from("bids")
                .insert({
                    artwork_id: artworkId,
                    bidder_id: session.user.id,
                    amount,
                    message: message.trim() || null,
                    status: "pending"
                });

            if (dbError) throw dbError;

            toast.success(
                isAuction
                    ? "Your bid has been placed!"
                    : "Your offer has been submitted to the artist"
            );
            return true;
        } catch (err: any) {
            console.error("Offer error:", err);
            toast.error(err.message || "Failed to submit offer");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <OfferContext.Provider value={{ makeOffer, isLoading }}>
            {children}
        </OfferContext.Provider>
    );
}

export const useOffer = () => {
    const context = useContext(OfferContext);
    if (!context) {
        throw new Error("useOffer must be used within an OfferProvider");
    }
    return context;
};