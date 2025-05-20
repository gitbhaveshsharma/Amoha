// components/support/admin/AdminTicketList.tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { MessageSquare, User, Info } from 'lucide-react';
import { Ticket } from '@/types/support';
import Image from 'next/image';

interface AdminTicketListProps {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    onChatClick: (ticket: Ticket) => void;
    onDetailsClick: (ticket: Ticket) => void;
}

export function AdminTicketList({
    tickets,
    loading,
    error,
    onChatClick,
    onDetailsClick
}: AdminTicketListProps) {
    if (loading) return (
        <div className="flex justify-center items-center h-32">
            <div className="animate-pulse text-gray-500">Loading tickets...</div>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500">
            Error: {error}
        </div>
    );

    if (tickets.length === 0) return (
        <div className="text-center py-8">
            <p className="text-muted-foreground">No tickets found</p>
        </div>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-lg line-clamp-1">{ticket.subject}</CardTitle>
                            <div className="flex gap-2 items-center">
                                <Badge
                                    variant={
                                        ticket.status === 'open' ? 'default' :
                                            ticket.status === 'in_progress' ? 'secondary' :
                                                ticket.status === 'resolved' ? 'destructive' : 'outline'
                                    }
                                    className="shrink-0 capitalize"
                                >
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-accent"
                                    onClick={() => onDetailsClick(ticket)}
                                >
                                    <Info className="h-3 w-3 mr-1" />
                                    Details
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pb-2 flex-grow">
                        <div className="flex items-center space-x-3 mb-3">
                            {ticket.user?.avatar_url ? (
                                <div className="h-8 w-8 rounded-full overflow-hidden relative">
                                    <Image
                                        src={ticket.user.avatar_url}
                                        alt={ticket.user.name}
                                        width={32}
                                        height={32}
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                                    <User className="h-4 w-4 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <p className="font-medium">{ticket.user?.name || 'Unknown user'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm line-clamp-2 text-muted-foreground mb-3">
                            {ticket.description}
                        </p>
                    </CardContent>

                    <CardFooter className="pt-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => onChatClick(ticket)}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Open Chat
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}