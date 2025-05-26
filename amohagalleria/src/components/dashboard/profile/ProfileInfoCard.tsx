// components/profile/ProfileInfoCard.tsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { EditableField } from "./EditableField";

interface ProfileInfoCardProps {
    title: string;
    icon: React.ReactNode;
    fields: Array<{
        name: string;
        label: string;
        value: string;
        type?: 'text' | 'textarea' | 'select';
        options?: Array<{ value: string; label: string }>;
        icon?: React.ReactNode;
        editable?: boolean;
    }>;
    isEditing: boolean;
    activeField: string | null;
    onFieldChange: (field: string, value: string) => void;
    onFieldEdit: (field: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function ProfileInfoCard({
    title,
    icon,
    fields,
    isEditing,
    activeField,
    onFieldChange,
    onFieldEdit,
    onSave,
    onCancel
}: ProfileInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            {field.icon || <Info className="h-4 w-4" />}
                            <span className="text-sm">{field.label}</span>
                        </div>
                        <EditableField
                            field={field.name}
                            value={field.value}
                            type={field.type}
                            options={field.options}
                            isEditing={isEditing && field.editable !== false}
                            isActive={activeField === field.name}
                            onChange={(value) => onFieldChange(field.name, value)}
                            onEdit={() => onFieldEdit(field.name)}
                            onSave={onSave}
                            onCancel={onCancel}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}