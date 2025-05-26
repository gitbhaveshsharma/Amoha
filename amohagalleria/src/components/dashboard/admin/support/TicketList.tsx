// components/support/admin/AdminTicketList.tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { MessageSquare, User, Info } from 'lucide-react';
import { Ticket } from '@/types/support';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Import the Skeleton component

// Skeleton component for ticket card loading state
function TicketCardSkeleton() {
    return (
        <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-2 items-center">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-2 flex-grow">
                <div className="flex items-center space-x-3 mb-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>

                <div className="space-y-2 mb-3">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </CardContent>

            <CardFooter className="pt-2 space-x-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-16" />
            </CardFooter>
        </Card>
    );
}

interface AdminTicketListProps {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    onChatClick: (ticket: Ticket) => void;
    onDetailsClick: (ticket: Ticket) => void;
    onStatusChange: (ticketId: string, status: string) => Promise<void>;
    onAssignClick: (ticket: Ticket) => void;
    loadMore: () => void;
}

export function AdminTicketList({
    tickets,
    loading,
    error,
    hasMore,
    onChatClick,
    onDetailsClick,
    onStatusChange,
    loadMore
}: AdminTicketListProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (loading || !hasMore) return;

        const handleIntersect: IntersectionObserverCallback = (entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        };

        if (bottomRef.current) {
            observerRef.current = new IntersectionObserver(handleIntersect, {
                root: null,
                rootMargin: '100px',
                threshold: 0.1
            });

            observerRef.current.observe(bottomRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loading, hasMore, loadMore]);

    // Show skeleton cards when initial loading
    if (loading && tickets.length === 0) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, index) => (
                    <TicketCardSkeleton key={`skeleton-${index}`} />
                ))}
            </div>
        );
    }

    if (error) return (
        <div className="text-center py-8 text-red-500">
            Error: {error}
        </div>
    );

    if (tickets.length === 0 && !loading) return (
        <div className="text-center py-8">
            <p className="text-muted-foreground">No tickets found matching your filters</p>
        </div>
    );

    return (
        <div className="space-y-4">
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

                            <div className="flex flex-wrap gap-2 mb-2">
                                {ticket.priority && (
                                    <Badge variant="outline" className="capitalize">
                                        Priority: {ticket.priority.name.toLowerCase()}
                                    </Badge>
                                )}
                                {ticket.category && (
                                    <Badge variant="outline" className="capitalize">
                                        {ticket.category.name}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 space-x-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() => onChatClick(ticket)}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                            </Button>
                            {ticket.status === 'open' && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onStatusChange(ticket.id, 'in_progress')}
                                    disabled={loading}
                                >
                                    Start
                                </Button>
                            )}
                            {/* {ticket.status === 'in_progress' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onStatusChange(ticket.id, 'resolved')}
                                    disabled={loading}
                                >
                                    Resolve
                                </Button>
                            )} */}
                        </CardFooter>
                    </Card>
                ))}

                {/* Show skeleton cards for loading more */}
                {loading && tickets.length > 0 && (
                    <>
                        {Array(3).fill(0).map((_, index) => (
                            <TicketCardSkeleton key={`load-more-skeleton-${index}`} />
                        ))}
                    </>
                )}
            </div>

            <div ref={bottomRef} className="h-1" />

            {!hasMore && tickets.length > 0 && (
                <div className="text-center py-4 text-muted-foreground">
                    You&#39;ve reached the end of the list
                </div>
            )}
        </div>
    );
}