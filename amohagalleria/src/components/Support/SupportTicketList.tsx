// components/support/SupportTicketList.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useSupportStore } from '@/stores/support/userSupportStore';
import { useEffect, useState } from 'react';
import { Ticket } from '@/types';
import { TicketDetailsModal } from './TicketDetailsModal';
import { TicketCommentModal } from './TicketCommentModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';

import { Comment } from '@/types';

export function SupportTicketList() {
    const { tickets, fetchUserTickets, loading, error } = useSupportStore();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedTicketForComments, setSelectedTicketForComments] = useState<Ticket | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [recentComments, setRecentComments] = useState<Record<string, Comment[]>>({});
    const { session } = useSession();

    useEffect(() => {
        if (session?.user?.id) {
            fetchUserTickets(session.user.id);
        }
    }, [session?.user?.id, fetchUserTickets]);

    useEffect(() => {
        const fetchRecentComments = async () => {
            if (!tickets.length) return;

            const { data: commentsData } = await supabase
                .from('ticket_comments')
                .select('*')
                .in('ticket_id', tickets.map(t => t.id))
                .order('created_at', { ascending: false });

            if (commentsData) {
                const commentsByTicket: Record<string, Comment[]> = {};
                tickets.forEach(ticket => {
                    const ticketComments = commentsData
                        .filter(c => c.ticket_id === ticket.id)
                        .slice(0, 1); // Get only the most recent comment
                    commentsByTicket[ticket.id] = ticketComments;
                });
                setRecentComments(commentsByTicket);
            }
        };

        fetchRecentComments();
    }, [tickets]);

    const handleTicketClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsDetailsModalOpen(true);
    };

    const handleCommentClick = (ticket: Ticket) => {
        setSelectedTicketForComments(ticket);
        setIsCommentModalOpen(true);
    };

    if (loading && tickets.length === 0) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="space-y-4">
            {tickets.length === 0 && !loading ? (
                <p>No tickets found.</p>
            ) : (
                <>
                    {tickets.map((ticket: Ticket) => (
                        <Card
                            key={ticket.id}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            <CardHeader
                                className="flex flex-row justify-between items-start space-y-0 pb-2 cursor-pointer"
                                onClick={() => handleTicketClick(ticket)}
                            >
                                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                                <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                                    {ticket.status}
                                </Badge>
                            </CardHeader>
                            <CardContent
                                className="cursor-pointer"
                                onClick={() => handleTicketClick(ticket)}
                            >
                                <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Created: {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                                </p>

                                {/* Show recent comment if exists */}
                                {recentComments[ticket.id]?.length > 0 && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded">
                                        <p className="text-xs font-medium">Latest Comment:</p>
                                        <p className="text-sm line-clamp-2">
                                            {recentComments[ticket.id][0].message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(recentComments[ticket.id][0].created_at), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCommentClick(ticket)}
                                >
                                    Post Comment
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {selectedTicket && (
                        <TicketDetailsModal
                            ticketId={selectedTicket.id}
                            isOpen={isDetailsModalOpen}
                            onClose={() => setIsDetailsModalOpen(false)}
                            ticket={selectedTicket}
                        />
                    )}

                    {selectedTicketForComments && (
                        <TicketCommentModal
                            ticketId={selectedTicketForComments.id}
                            isOpen={isCommentModalOpen}
                            onClose={() => setIsCommentModalOpen(false)}
                            ticketSubject={selectedTicketForComments.subject}
                        />
                    )}
                </>
            )}
        </div>
    );
}