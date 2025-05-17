// components/profile/EditableField.tsx
'use client'
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { Save, X, Edit } from "lucide-react";

interface EditableFieldProps {
    field: string;
    value: string;
    type?: 'text' | 'textarea' | 'select';
    options?: Array<{ value: string; label: string }>;
    isEditing: boolean;
    isActive: boolean;
    onChange: (value: string) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export function EditableField({
    field,
    value,
    type = 'text',
    options = [],
    isEditing,
    isActive,
    onChange,
    onEdit,
    onSave,
    onCancel
}: EditableFieldProps) {
    if (isEditing && isActive) {
        if (type === 'select') {
            return (
                <div className="flex items-start gap-2">
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={`Select ${field}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex gap-1 mt-1">
                        <Button variant="outline" size="icon" onClick={onSave} className="h-8 w-8">
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={onCancel} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            );
        }

        const InputComponent = type === 'textarea' ? Textarea : Input;

        return (
            <div className="flex items-start gap-2">
                <div className="relative flex-1">
                    <InputComponent
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={type === 'textarea' ? "min-h-[100px]" : ""}
                    />
                </div>
                <div className="flex gap-1 mt-1">
                    <Button variant="outline" size="icon" onClick={onSave} className="h-8 w-8">
                        <Save className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={onCancel} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start justify-between group">
            <div>
                <p className="text-sm">{value || "Not provided"}</p>
            </div>
            {isEditing && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Edit className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}