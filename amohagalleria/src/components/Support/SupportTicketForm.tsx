// components/Support/SupportTicketForm.tsx
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupportStore } from '@/stores/support/userSupportStore';
import { Omit, Ticket } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function SupportTicketForm() {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [priorities, setPriorities] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { createNewTicket, fetchUserTickets } = useSupportStore();

    useEffect(() => {
        const fetchCategoriesAndPriorities = async () => {
            setLoading(true);
            try {
                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('ticket_categories')
                    .select('id, name');

                // Fetch priorities
                const { data: prioritiesData, error: prioritiesError } = await supabase
                    .from('ticket_priorities')
                    .select('id, name');

                if (categoriesError || prioritiesError) {
                    throw categoriesError || prioritiesError;
                }

                if (categoriesData) setCategories(categoriesData as { id: string; name: string }[]);
                if (prioritiesData) setPriorities(prioritiesData as { id: string; name: string }[]);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load form data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoriesAndPriorities();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            toast.error('You must be logged in to submit a ticket');
            return;
        }

        setLoading(true);

        try {
            const ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at'> = {
                user_id: user.id,
                category_id: categoryId,
                priority_id: priorityId,
                subject,
                description,
                status: 'open',
            };

            // First create the ticket
            const newTicket = await createNewTicket(ticketData);

            // Then upload attachments if any
            if (attachments.length > 0) {
                for (const file of attachments) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${newTicket.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `ticket-attachments/${fileName}`;

                    // Upload to Supabase storage
                    const { error: uploadError } = await supabase
                        .storage
                        .from('ticket-attachments')
                        .upload(filePath, file);

                    if (uploadError) {
                        throw uploadError;
                    }

                    // Save attachment record
                    const { error: attachmentError } = await supabase
                        .from('ticket_attachments')
                        .insert([{
                            ticket_id: newTicket.id,
                            file_url: filePath,
                            uploaded_by: user.id
                        }]);

                    if (attachmentError) {
                        throw attachmentError;
                    }
                }
            }

            // Refresh the ticket list
            await fetchUserTickets(user.id);

            // Reset form
            setSubject('');
            setDescription('');
            setCategoryId('');
            setPriorityId('');
            setAttachments([]);
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Show success message
            toast.success('Ticket submitted successfully!', {
                autoClose: 3000,
            });

        } catch (error) {
            console.error('Error in form submission:', error);
            toast.error('Failed to submit ticket. Please try again.', {
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Select value={categoryId} onValueChange={setCategoryId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <Select value={priorityId} onValueChange={setPriorityId} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {priorities.map((priority) => (
                                <SelectItem key={priority.id} value={priority.id}>
                                    {priority.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                    placeholder="Describe your issue in detail"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px]"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Attachments</label>
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="cursor-pointer"
                />
                {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
        </form>
    );
}