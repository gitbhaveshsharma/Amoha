// pages/admin/support.tsx
import { useState, useEffect } from 'react'; // Add useEffect import
import { AdminTicketList } from './TicketList';
import { AdminTicketChatModal } from './AdminTicketChatModal';
import { AdminTicketDetail } from './TicketDetail';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';
import { useAdminSupportStore } from '@/stores/support/admin/adminSupportStore';
import { Ticket } from '@/types/support';

export default function AdminSupportPage() {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { tickets, loading, error, fetchTickets } = useAdminSupportStore();

    // Add this useEffect to load tickets on component mount
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]); // Add fetchTickets to dependency array

    const handleChatClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsChatOpen(true);
    };

    const handleDetailsClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsDetailsOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
    };

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Support Tickets</h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTickets}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-4">
                    <AdminTicketList
                        tickets={tickets}
                        loading={loading}
                        error={error}
                        onChatClick={handleChatClick}
                        onDetailsClick={handleDetailsClick}
                    />
                </div>

                {selectedTicket && (
                    <>
                        <AdminTicketChatModal
                            ticket={selectedTicket}
                            isOpen={isChatOpen}
                            onClose={handleCloseChat}
                        />

                        <AdminTicketDetail
                            ticket={selectedTicket}
                            isOpen={isDetailsOpen}
                            onClose={handleCloseDetails}
                        />
                    </>
                )}
            </div>
        </div>
    );
}