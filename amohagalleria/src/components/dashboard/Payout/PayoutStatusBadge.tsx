import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PayoutStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';

interface PayoutStatusBadgeProps {
    status: PayoutStatus;
    className?: string;
}

const statusConfig = {
    pending: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        text: 'Pending',
        spin: false,
    },
    processing: {
        icon: Loader2,
        color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        text: 'Processing',
        spin: true,
    },
    completed: {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 hover:bg-green-100',
        text: 'Completed',
        spin: false,
    },
    failed: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 hover:bg-red-100',
        text: 'Failed',
        spin: false,
    },
    cancelled: {
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        text: 'Cancelled',
        spin: false,
    },
};

export const PayoutStatusBadge: React.FC<PayoutStatusBadgeProps> = ({
    status,
    className,
}) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge
            className={cn(
                'inline-flex items-center gap-1.5 capitalize',
                config.color,
                className
            )}
        >
            <Icon
                className={cn(
                    'h-3.5 w-3.5',
                    config.spin && 'animate-spin'
                )}
            />
            {config.text}
        </Badge>
    );
};