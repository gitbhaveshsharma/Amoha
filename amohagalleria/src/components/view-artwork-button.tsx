// components/artwork/view-artwork-button.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';

interface ViewArtworkButtonProps {
    id: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ViewArtworkButton = ({
    id,
    className = '',
    variant = 'default',
    size = 'default',
}: ViewArtworkButtonProps) => {
    return (
        <Button
            asChild
            variant={variant}
            size={size}
            className={`group ${className}`}
        >
            <Link href={`/artwork/${id}`}>
                View Details
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </Button>
    );
};