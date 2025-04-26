import React from "react";
import { DisplayBalance } from "./DisplayBalance";
import { PaymentMethodList } from "./PaymentMethodList";
import { Card } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";

export const ArtistPayoutSection = () => {
    const { session } = useSession();
    const user = session?.user;

    if (!user) {
        return null;
    }

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold">Payout Dashboard</h2>

            <DisplayBalance />

            <Card className="p-6">
                <PaymentMethodList />
            </Card>
        </section>
    );
};