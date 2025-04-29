import React from "react";
import { DisplayBalance } from "./DisplayBalance";
import { PaymentMethodList } from "./PaymentMethodList";
import { PayoutHistory } from "./PayoutHistory";
import { Card } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { PayoutRequestForm } from "./PayoutRequestForm";

export const ArtistPayoutSection = () => {
    const { session } = useSession();
    const user = session?.user;

    if (!user) {
        return null;
    }

    return (
        <section className="space-y-6">

            {/* First Row - Three Cards in a row */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                    <DisplayBalance />
                </Card>

                <Card className="p-6">
                    <PayoutRequestForm />
                </Card>

                <Card className="p-6">
                    <PaymentMethodList />
                </Card>
            </div>

            {/* Second Row - Single Full-width Card */}
            <div className="grid gap-6">

                <PayoutHistory />
            </div>
        </section>
    );
};