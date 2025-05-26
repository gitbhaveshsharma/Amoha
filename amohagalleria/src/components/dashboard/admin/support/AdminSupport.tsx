// pages/admin/support.tsx
import { useState, useEffect } from 'react';
import { AdminTicketList } from './TicketList';
import { AdminTicketChatModal } from './AdminSupportChatModal';
import { AdminTicketDetail } from './TicketDetail';
// import { Button } from '@/components/ui/Button';
// import { RefreshCw } from 'lucide-react';
import { useAdminSupportStore } from '@/stores/support/admin/adminSupportStore';
import { Ticket } from '@/types/support';
import { TicketFilter } from './TicketFilter';

export default function AdminSupportPage() {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const {
        tickets,
        loading,
        error,
        fetchFilteredTickets,
        filters,
        setFilters,
        fetchAgents,
        fetchPriorities,
        fetchCategories
    } = useAdminSupportStore();

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchFilteredTickets(),
                fetchAgents(),
                fetchPriorities(),
                fetchCategories()
            ]);
        };
        loadData();
    }, [fetchFilteredTickets, fetchAgents, fetchPriorities, fetchCategories]);

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
        setSelectedTicket(null);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedTicket(null);
    };

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        setFilters(newFilters);
        fetchFilteredTickets(newFilters);
    };



    // const handleRefresh = () => {
    //     fetchFilteredTickets();
    // };

    return (
        <div className=" mx-auto">
            <div className="flex flex-col gap-4">
                {/* <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Support Tickets</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="gap-2"
                            disabled={loading}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div> */}

                <div className="bg-card rounded-lg border shadow-sm p-4 space-y-6">
                    <TicketFilter
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        loading={loading}
                    />
                    <AdminTicketList
                        tickets={tickets}
                        loading={loading}
                        error={error}
                        onChatClick={handleChatClick}
                        onDetailsClick={handleDetailsClick}
                        hasMore={false}
                        onStatusChange={() => fetchFilteredTickets()}
                        onAssignClick={() => { }}
                        loadMore={() => { }}
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