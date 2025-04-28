import React from 'react';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExportFormat } from '@/types';

interface ExportDropdownProps {
    onExport: (format: ExportFormat) => void;
}

export const ExportDropdown = ({ onExport }: ExportDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('excel')}>
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                    CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                    JSON (.json)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};