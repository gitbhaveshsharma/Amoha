import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Paperclip, SendHorizonal, X, Download, FileIcon } from 'lucide-react';
import { useSupportChatStore } from '@/stores/support/chatStore';
import { ChatMessage as Message, ChatAttachment, SupportChatModalProps } from '@/types/support';

export function SupportChatModal({
    ticketId,
    isOpen,
    onClose,
    ticketSubject,
}: SupportChatModalProps) {
    const { session } = useSession();
    const {
        messages,
        isLoading,
        isSubmitting,
        currentFile,
        fetchMessages,
        sendMessage,
        setFile,
        clearMessages,
    } = useSupportChatStore();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen || !ticketId) return;

        fetchMessages(ticketId);

        const channel = supabase
            .channel(`ticket_${ticketId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'ticket_threads',
                    filter: `ticket_id=eq.${ticketId}`,
                },
                (payload) => {
                    useSupportChatStore.setState({ messages: payload.new.messages || [] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            clearMessages();
        };
    }, [isOpen, ticketId, fetchMessages, clearMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !session?.user?.id) return;

        await sendMessage({
            ticketId,
            userId: session.user.id,
            content: newMessage,
            file: currentFile,
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getMessageKey = (message: Message, index: number) => {
        return `message-${message.id}-${index}`;
    }; const getAttachmentKey = (attachment: ChatAttachment, index: number) => {
        return `attachment-${attachment.id}-${index}`;
    };

    const isImageAttachment = (attachment: ChatAttachment): boolean => {
        return attachment.type.startsWith('image/');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border dark:border-gray-700">
                <div className="border-b dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {ticketSubject}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Ticket ID: {ticketId}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-pulse text-gray-500 dark:text-gray-400">
                                Loading messages...
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-center p-8">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 mb-3">
                                <Paperclip className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h4 className="text-gray-500 dark:text-gray-400 font-medium">
                                No messages yet
                            </h4>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Start the conversation by sending a message
                            </p>
                        </div>
                    ) : (
                        (Array.isArray(messages) ? messages : []).map((message: Message, messageIndex: number) => (
                            <div
                                key={getMessageKey(message, messageIndex)}
                                className={`flex ${message.author_ref === `user_${session?.user?.id}` ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs md:max-w-md rounded-xl p-3 ${message.author_ref === `user_${session?.user?.id}`
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'}`}
                                >
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {message.author_ref.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className={`text-xs ${message.author_ref === `user_${session?.user?.id}` ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-sm">{message.content}</p>                                    {message.attachments?.map((attachment: ChatAttachment, attachmentIndex: number) => (
                                        <div key={getAttachmentKey(attachment, attachmentIndex)} className="mt-2">
                                            {isImageAttachment(attachment) ? (
                                                <div className="mt-2">
                                                    <img
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="rounded-md max-h-48 object-contain"
                                                    />
                                                    <a
                                                        href={attachment.url}
                                                        download={attachment.name}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`text-xs flex items-center mt-1 ${message.author_ref === `user_${session?.user?.id}`
                                                            ? 'text-primary-foreground/80 hover:text-primary-foreground'
                                                            : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'}`}
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Download
                                                    </a>
                                                </div>
                                            ) : (
                                                <a
                                                    href={attachment.url}
                                                    download={attachment.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`text-sm flex items-center ${message.author_ref === `user_${session?.user?.id}`
                                                        ? 'text-primary-foreground/80 hover:text-primary-foreground'
                                                        : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'}`}
                                                >
                                                    <FileIcon className="h-3 w-3 mr-1" />
                                                    {attachment.name}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
                    <div className="flex items-center space-x-2">
                        <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />
                        </label>
                        {currentFile && (
                            <div className="flex items-center space-x-1 bg-white dark:bg-gray-600 px-2 py-1 rounded-md border dark:border-gray-500">
                                <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                                    {currentFile.name}
                                </span>
                                <button
                                    onClick={handleRemoveFile}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="flex-1 border-0 bg-white dark:bg-gray-600 focus-visible:ring-1"
                            disabled={isSubmitting}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={isSubmitting || !newMessage.trim()}
                            size="sm"
                            className="rounded-full h-10 w-10 p-0"
                        >
                            {!isSubmitting ? (
                                <SendHorizonal className="h-5 w-5" />
                            ) : (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}