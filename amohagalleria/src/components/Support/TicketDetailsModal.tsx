// components/support/TicketDetailsModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket } from '@/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface TicketDetailsModalProps {
    ticketId: string;
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket;
}

export function TicketDetailsModal({ ticketId, isOpen, onClose, ticket }: TicketDetailsModalProps) {
    const [attachments, setAttachments] = useState<{ id: string, file_url: string, created_at: string }[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchTicketDetails = async () => {
            setLoading(true);
            try {
                // Fetch attachments
                const { data: attachmentsData } = await supabase
                    .from('ticket_attachments')
                    .select('id, file_url, created_at')
                    .eq('ticket_id', ticketId);

                if (attachmentsData) setAttachments(attachmentsData);
            } catch (error) {
                console.error('Error fetching ticket details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketDetails();
    }, [ticketId, isOpen]);

    const downloadAttachment = async (fileUrl: string, fileName: string) => {
        try {
            const { data, error } = await supabase
                .storage
                .from('ticket-attachments')
                .download(fileUrl);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || 'attachment';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Ticket Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto p-4">
                    <div>
                        <h3 className="font-medium">Subject</h3>
                        <p>{ticket.subject}</p>
                    </div>

                    <div>
                        <h3 className="font-medium">Description</h3>
                        <p className="whitespace-pre-line">{ticket.description}</p>
                    </div>

                    <div>
                        <h3 className="font-medium">Status</h3>
                        <p className="capitalize">{ticket.status}</p>
                    </div>

                    {loading && <p>Loading attachments...</p>}

                    {attachments.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Attachments</h3>
                            <div className="space-y-2">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center p-2 border rounded">
                                        <button
                                            type="button"
                                            onClick={() => downloadAttachment(attachment.file_url, attachment.file_url.split('/').pop() || 'file')}
                                            className="text-blue-500 hover:underline"
                                        >
                                            {attachment.file_url.split('/').pop()}
                                        </button>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {format(new Date(attachment.created_at), 'MMM dd, yyyy HH:mm')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

