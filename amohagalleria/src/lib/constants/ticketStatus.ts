// lib/constants/ticketStatus.ts
export const TICKET_STATUS_VALUES = ["open", "in_progress", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUS_VALUES)[number];

export const TICKET_STATUS_OPTIONS = TICKET_STATUS_VALUES.map((value) => ({
    value,
    label: value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
})) satisfies ReadonlyArray<{ value: TicketStatus; label: string }>;

export const TICKET_STATUS_VARIANTS: Record<TicketStatus, 'destructive' | 'outline' | 'default' | 'secondary'> = {
    open: 'destructive',
    in_progress: 'secondary',
    resolved: 'default',
    closed: 'outline'
};