// components/support/admin/AdminSupportChat.tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Paperclip, SendHorizontal, X } from 'lucide-react';
import { AdminSupportChatProps } from '@/types/support';
import { useAdminChatStore } from '@/stores/support/admin/adminChatStore';

export function AdminSupportChat({ ticketId }: AdminSupportChatProps) {
    const { session } = useSession();
    const {
        messages,
        isLoading,
        isSubmitting,
        currentFile,
        fetchMessages,
        sendMessage,
        setFile,
        clearMessages
    } = useAdminChatStore();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!ticketId) return;

        fetchMessages(ticketId);

        // Set up realtime subscription
        const channel = supabase
            .channel(`ticket_${ticketId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'ticket_threads',
                filter: `ticket_id=eq.${ticketId}`
            }, (payload) => {
                if (payload.new.messages) {
                    useAdminChatStore.setState({ messages: payload.new.messages });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            clearMessages();
        };
    }, [ticketId, fetchMessages, clearMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !session?.user?.id) return;

        await sendMessage({
            ticketId,
            userId: session.user.id,
            content: newMessage,
            file: currentFile
        });

        setNewMessage('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="border rounded-lg h-[500px] flex flex-col">
            <div className="border-b p-4">
                <h3 className="font-medium">Ticket Conversation</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        No messages yet
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`flex ${message.author_ref.startsWith('agent_') ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs rounded-lg p-3 ${message.author_ref.startsWith('agent_') ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium">
                                        {message.author_ref.startsWith('user_') ? 'Customer' : 'Support Agent'}
                                    </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-80 mt-1">
                                    {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                                </p>
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        {message.attachments.map(attachment => (
                                            <a key={attachment.id}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs flex items-center underline">
                                                <Paperclip className="h-3 w-3 mr-1" />
                                                {attachment.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
                <div className="flex flex-col gap-2">
                    {currentFile && (
                        <div className="flex items-center gap-2 bg-muted p-2 rounded">
                            <span className="text-xs truncate max-w-[200px]">{currentFile.name}</span>
                            <button
                                onClick={handleRemoveFile}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <label className="cursor-pointer">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button variant="ghost" size="sm" type="button">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </label>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type your message..."
                            className="flex-1"
                            disabled={isSubmitting}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSubmitting}>
                            <SendHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}