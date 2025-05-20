// components/support/SupportTicketList.tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useSupportStore } from '@/stores/support/userSupportStore';
import { useEffect, useState } from 'react';
import { Ticket, Comment } from '@/types/support';
import { TicketDetailsModal } from './TicketDetailsModal';
import { SupportChatModal } from './SupportChatModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { MessageSquare, ChevronRight, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export function SupportTicketList() {
    const { tickets, fetchUserTickets, loading, error } = useSupportStore();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [recentComments, setRecentComments] = useState<Record<string, Comment[]>>({});
    const [selectedTicketForChat, setSelectedTicketForChat] = useState<Ticket | null>(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
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
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'resolved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Clock className="w-4 h-4 text-blue-500" />;
        }
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-9 w-24" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error loading tickets</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchUserTickets(session?.user?.id || '')}>
                Retry
            </Button>
        </div>
    );

    return (
        <div className="space-y-4">
            {tickets.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No support tickets yet</h3>
                    <p className="text-sm text-muted-foreground">
                        When you create a support request, it will appear here.
                    </p>
                </div>
            ) : (
                <>
                    {tickets.map((ticket: Ticket) => (
                        <Card
                            key={ticket.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleTicketClick(ticket)}
                        >
                            <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1">
                                        {getStatusIcon(ticket.status)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg flex items-center">
                                            {ticket.subject}
                                            <ChevronRight className="w-4 h-4 ml-1 text-muted-foreground" />
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Created: {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        ticket.status === 'open' ? 'default' :
                                            ticket.status === 'resolved' ? 'default' : 'secondary'
                                    }
                                    className="capitalize"
                                >
                                    {ticket.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>

                                {/* Show recent comment if exists */}
                                {recentComments[ticket.id]?.length > 0 && (
                                    <div className="mt-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={recentComments[ticket.id][0].user_avatar} />
                                                <AvatarFallback>
                                                    {recentComments[ticket.id][0].user_name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-xs font-medium">
                                                {recentComments[ticket.id][0].user_name || 'User'} replied
                                            </p>
                                        </div>
                                        <p className="text-sm line-clamp-2">
                                            {recentComments[ticket.id][0].message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(recentComments[ticket.id][0].created_at), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between items-center border-t pt-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTicketForChat(ticket);
                                        setIsChatModalOpen(true);
                                    }}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chat
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                    {recentComments[ticket.id]?.length || 0} {recentComments[ticket.id]?.length === 1 ? 'reply' : 'replies'}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}

                    {selectedTicket && (
                        <TicketDetailsModal
                            ticketId={selectedTicket.id}
                            isOpen={!!selectedTicket}
                            onClose={() => setSelectedTicket(null)}
                            ticket={selectedTicket}
                        />
                    )}

                    {selectedTicketForChat && (
                        <SupportChatModal
                            ticketId={selectedTicketForChat.id}
                            isOpen={isChatModalOpen}
                            onClose={() => setIsChatModalOpen(false)}
                            ticketSubject={selectedTicketForChat.subject}
                        />
                    )}
                </>
            )}
        </div>
    );
}