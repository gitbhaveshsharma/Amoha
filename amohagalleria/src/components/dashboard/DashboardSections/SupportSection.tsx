import { SupportTicketForm } from "@/components/Support/SupportTicketForm";
import { SupportTicketList } from "@/components/Support/SupportTicketList";
import { Card, CardTitle } from "@/components/ui/card";

export function SupportSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            {/* Left Side: Ticket Form */}
            <div className="space-y-4">
                <Card className="p-6">
                    <CardTitle className="text-xl ">Create a Support Ticket</CardTitle>
                    <SupportTicketForm />
                </Card>
            </div>

            {/* Right Side: Ticket List */}
            <div className="space-y-4">
                <Card className="p-6">
                    <CardTitle className="text-xl ">Your Tickets</CardTitle>
                    <SupportTicketList />
                </Card>
            </div>
        </div >
    );
}
