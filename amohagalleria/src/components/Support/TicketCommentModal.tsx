// components/support/TicketCommentModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { useSupportStore } from '@/stores/support/userSupportStore';
import { Comment } from '@/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { useSession } from '@/hooks/useSession';

interface TicketCommentModalProps {
    ticketId: string;
    isOpen: boolean;
    onClose: () => void;
    ticketSubject: string;
}

export function TicketCommentModal({ ticketId, isOpen, onClose, ticketSubject }: TicketCommentModalProps) {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { session } = useSession();
    const { addTicketComment } = useSupportStore();

    // Fetch initial comments when modal opens
    useEffect(() => {
        if (!isOpen) {
            setComments([]);
            setHasMore(true);
            return;
        }

        const fetchInitialComments = async () => {
            setLoading(true);
            try {
                const { data: commentsData, error } = await supabase
                    .from('ticket_comments')
                    .select('*')
                    .eq('ticket_id', ticketId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;

                if (commentsData) {
                    setComments(commentsData.reverse()); // Reverse to show oldest first
                    setHasMore(commentsData.length === 10);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialComments();
    }, [ticketId, isOpen]);

    // Lazy load more comments when scrolling
    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - scrollTop <= clientHeight * 1.2;

        if (isNearBottom && !isFetching && hasMore) {
            setIsFetching(true);
            try {
                const { data: newComments, error } = await supabase
                    .from('ticket_comments')
                    .select('*')
                    .eq('ticket_id', ticketId)
                    .order('created_at', { ascending: false })
                    .range(comments.length, comments.length + 9);

                if (error) throw error;

                if (newComments && newComments.length > 0) {
                    setComments(prev => [...newComments.reverse(), ...prev]);
                    setHasMore(newComments.length === 10);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('Error loading more comments:', error);
            } finally {
                setIsFetching(false);
            }
        }
    };

    const handleAddComment = async () => {
        if (!session?.user?.id || !comment.trim()) return;

        const commentData: Omit<Comment, 'id' | 'created_at'> = {
            ticket_id: ticketId,
            user_id: session.user.id,
            message: comment,
            is_internal: false,
        };

        try {
            setLoading(true);
            await addTicketComment(commentData);
            setComment('');

            // Refresh comments with the new one
            const { data: newComments, error } = await supabase
                .from('ticket_comments')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (newComments) {
                setComments(newComments.reverse());
                setHasMore(newComments.length === 10);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Comments for: {ticketSubject}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col space-y-4 h-[65vh]">
                    {/* Comments List with lazy loading */}
                    <div
                        className="flex-grow space-y-4 overflow-y-auto"
                        onScroll={handleScroll}
                    >
                        {loading && comments.length === 0 ? (
                            <p>Loading comments...</p>
                        ) : (
                            <>
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className={`p-3 rounded-lg ${comment.user_id === session?.user?.id
                                            ? 'bg-blue-100 self-end'
                                            : 'bg-gray-100 self-start'
                                            }`}
                                    >
                                        <p className="font-medium">
                                            {comment.user_id === session?.user?.id ? 'You' : 'Support Team'}
                                        </p>
                                        <p className="mt-1 whitespace-pre-line">{comment.message}</p>
                                        <span className="text-xs text-gray-500 block text-right">
                                            {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                    </div>
                                ))}
                                {isFetching && <p>Loading more comments...</p>}
                                {!hasMore && comments.length > 0 && (
                                    <p className="text-center text-sm text-gray-500">No more comments to load</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col space-y-2">
                        <Textarea
                            placeholder="Type your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                            disabled={loading}
                        />
                        <Button
                            onClick={handleAddComment}
                            disabled={loading || !comment.trim()}
                        >
                            {loading ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}