// components/profile/ProfileAvatar.tsx
'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";

interface ProfileAvatarProps {
    avatarUrl?: string;
    name: string;
    isEditing: boolean;
    loading: boolean;
    onAvatarClick: () => void;
}

export function ProfileAvatar({
    avatarUrl,
    name,
    isEditing,
    loading,
    onAvatarClick
}: ProfileAvatarProps) {
    return (
        <div className="relative group">
            <Avatar
                className="h-16 w-16 cursor-pointer border-2 border-primary/20 transition-transform group-hover:scale-105"
                onClick={onAvatarClick}
            >
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                    {name
                        ? name.split(" ").map(n => n[0]).join("")
                        : "?"}
                </AvatarFallback>
                {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="h-5 w-5 text-white" />
                    </div>
                )}
            </Avatar>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
}