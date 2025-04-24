import { SupportTicketForm } from "@/components/Support/SupportTicketForm";
import { SupportTicketList } from "@/components/Support/SupportTicketList";

export function SupportSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
            {/* Left Side: Ticket Form */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Raise a New Ticket</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                    <SupportTicketForm />
                </div>
            </div>

            {/* Right Side: Ticket List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Your Tickets</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                    <SupportTicketList />
                </div>
            </div>
        </div>
    )
}