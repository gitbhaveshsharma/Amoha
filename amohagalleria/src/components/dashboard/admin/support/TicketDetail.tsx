// components/support/admin/AdminTicketDetail.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminTicketDetailProps, Ticket } from '@/types/support';
import { format } from 'date-fns';
import { User, Mail, Calendar, Clock, Tag, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { useAdminSupportStore } from '@/stores/support/admin/adminSupportStore';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

export function AdminTicketDetail({ ticket, isOpen, onClose }: AdminTicketDetailProps & { isOpen: boolean, onClose: () => void }) {
    const { updateStatus, assignAgent, agents, fetchAgents } = useAdminSupportStore();
    const [status, setStatus] = useState<Ticket['status']>(ticket.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingAgents, setIsLoadingAgents] = useState(false);
    const [attachments, setAttachments] = useState<{ id: string, file_url: string, created_at: string }[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);

    useEffect(() => {
        const fetchAttachments = async () => {
            if (!isOpen) return;

            setLoadingAttachments(true);
            try {
                const { data: attachmentsData } = await supabase
                    .from('ticket_attachments')
                    .select('id, file_url, created_at')
                    .eq('ticket_id', ticket.id);

                if (attachmentsData) {
                    setAttachments(
                        attachmentsData.map(att => ({
                            id: String(att.id),
                            file_url: String(att.file_url),
                            created_at: String(att.created_at),
                        }))
                    );
                }
            } catch (error) {
                console.error('Error fetching ticket attachments:', error);
            } finally {
                setLoadingAttachments(false);
            }
        };

        fetchAttachments();
    }, [ticket.id, isOpen]);

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

    // Filter attachments
    const imageAttachments = attachments
        .filter(att => att.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(att.file_url));

    const otherAttachments = attachments
        .filter(att => !imageAttachments.some(img => img.id === att.id));

    useEffect(() => {
        const loadAgents = async () => {
            setIsLoadingAgents(true);
            try {
                await fetchAgents();
            } finally {
                setIsLoadingAgents(false);
            }
        };
        loadAgents();
    }, [fetchAgents]);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await updateStatus(ticket.id, newStatus);
            setStatus(newStatus as Ticket['status']);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAssignAgent = async (agentId: string) => {
        setIsUpdating(true);
        try {
            await assignAgent(ticket.id, agentId === "unassigned" ? "" : agentId);
        } catch (error) {
            console.error('Failed to assign agent:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const statusVariant = {
        open: 'destructive',
        in_progress: 'secondary',
        resolved: 'default',
        closed: 'outline'
    }[status] as 'destructive' | 'outline' | 'default' | 'secondary';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[1200px] p-0 overflow-auto"
                style={{
                    height: 'auto',
                    minHeight: '50vh',
                    maxHeight: '95vh',
                }}
            >
                <DialogHeader className="sticky top-0 z-10 bg-background border-b px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg sm:text-xl font-semibold truncate">
                                {ticket.subject}
                            </DialogTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge variant={statusVariant} className="capitalize">
                                    {status.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-muted-foreground">#{ticket.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* User Info Section */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <div className="p-2 bg-background rounded-full">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="w-full">
                            <h3 className="font-medium">{ticket.user?.name || 'Unknown User'}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 break-all">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{ticket.user?.email || 'No email provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Description */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-medium">
                            <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>Description</span>
                        </h3>
                        <div className="text-sm text-muted-foreground pl-0 sm:pl-7">
                            <p className="whitespace-pre-line">{ticket.description}</p>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    {loadingAttachments && <p className="text-sm text-muted-foreground">Loading attachments...</p>}

                    {(imageAttachments.length > 0 || otherAttachments.length > 0) && (
                        <div className="space-y-2">
                            <h3 className="flex items-center gap-2 font-medium">
                                <FileText className="h-5 w-5 text-primary" />
                                <span>Attachments</span>
                            </h3>
                            <div className="pl-7">
                                {imageAttachments.length > 0 && (
                                    <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {imageAttachments.map(att => (
                                            <div key={att.id} className="border rounded overflow-hidden">
                                                <div className="aspect-square bg-muted/50 flex items-center justify-center">
                                                    <Image
                                                        src={`${supabase.storage.from('ticket-attachments').getPublicUrl(att.file_url).data.publicUrl}`}
                                                        alt="Attachment"
                                                        width={300}
                                                        height={300}
                                                        className="object-contain max-h-full max-w-full cursor-pointer hover:opacity-80"
                                                        onClick={() => window.open(`${supabase.storage.from('ticket-attachments').getPublicUrl(att.file_url).data.publicUrl}`, '_blank')}
                                                    />
                                                </div>
                                                <div className="p-2 text-xs truncate">
                                                    {att.file_url.split('/').pop()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {otherAttachments.length > 0 && (
                                    <div className="space-y-2">
                                        {otherAttachments.map(att => (
                                            <div key={att.id} className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <button
                                                    type="button"
                                                    onClick={() => downloadAttachment(att.file_url, att.file_url.split('/').pop() || 'file')}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    {att.file_url.split('/').pop() || 'Download file'}
                                                </button>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {format(new Date(att.created_at), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}



                    <Separator />

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="font-medium">{ticket.category?.name || 'Uncategorized'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="text-sm text-muted-foreground">Priority</p>
                                <p className="font-medium">{ticket.priority?.name || 'None'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">{format(new Date(ticket.created_at), 'MMM d, yyyy')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <p className="text-sm text-muted-foreground">Updated</p>
                                <p className="font-medium">{format(new Date(ticket.updated_at), 'MMM d, yyyy')}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Action Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                                disabled={isUpdating}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Assign Agent</label>
                            {isLoadingAgents ? (
                                <Skeleton className="h-10 w-full rounded-md" />
                            ) : (
                                <Select
                                    value={ticket.assignee_id || 'unassigned'}
                                    onValueChange={handleAssignAgent}
                                    disabled={isUpdating || agents.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={agents.length === 0 ? "No agents available" : "Select agent"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {agents.map(agent => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.name || agent.email || 'Unknown agent'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}