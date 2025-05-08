'use client'
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Briefcase, Phone, Calendar, MapPin, User, Edit, Save, X, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProfileStore } from "@/stores/profile/profileStore";
import { ProfileData, UserData } from "@/types/profile";

interface EditableProfileCardProps {
    profile: ProfileData;
    userData: UserData;
    onCancel: () => void;
    onSave: () => void;
}

export function EditableProfileCard({ profile, userData, onCancel, onSave }: EditableProfileCardProps) {
    const { uploadAvatar, loading } = useProfileStore();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileData>({ ...profile });
    const [localUserData, setLocalUserData] = useState<UserData>({ ...userData });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const roleOptions = [
        { value: "artist", label: "Artist" },
        { value: "bidder", label: "Bidder" },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    const handleFieldEdit = (field: string) => {
        if (hasUnsavedChanges && currentField !== field) {
            setShowSaveDialog(true);
            return;
        }
        setCurrentField(field);
        setHasUnsavedChanges(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "phone") {
            setLocalUserData({ ...localUserData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setHasUnsavedChanges(true);
    };

    const handleRoleChange = (value: string) => {
        setFormData({ ...formData, role: value });
        setHasUnsavedChanges(true);
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        try {
            await uploadAvatar(file, profile.user_id);
            toast.success("Profile picture updated successfully");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error("Error updating profile picture");
        }
    };

    const handleSaveClick = () => {
        onSave();
        setHasUnsavedChanges(false);
        setCurrentField(null);
    };

    const handleCancelClick = () => {
        if (hasUnsavedChanges) {
            setShowCancelDialog(true);
        } else {
            onCancel();
            setCurrentField(null);
        }
    };

    const confirmCancel = () => {
        setFormData({ ...profile });
        setLocalUserData({ ...userData });
        setHasUnsavedChanges(false);
        onCancel();
        setCurrentField(null);
        setShowCancelDialog(false);
    };

    const renderEditableField = (field: string, value: string, isTextarea = false) => {
        if (currentField === field) {
            if (field === "role") {
                return (
                    <div className="flex items-start gap-2">
                        <Select
                            value={formData.role}
                            onValueChange={handleRoleChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-1 mt-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSaveClick}
                                disabled={!hasUnsavedChanges}
                                className="h-8 w-8"
                            >
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCancelClick}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex items-start gap-2">
                    <div className="relative flex-1">
                        {isTextarea ? (
                            <Textarea
                                name={field}
                                value={formData[field as keyof ProfileData] || ""}
                                onChange={handleInputChange}
                                className="min-h-[100px]"
                            />
                        ) : (
                            <Input
                                name={field}
                                value={
                                    field === "phone"
                                        ? localUserData.phone || ""
                                        : formData[field as keyof ProfileData] || ""
                                }
                                onChange={handleInputChange}
                            />
                        )}
                    </div>
                    <div className="flex gap-1 mt-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSaveClick}
                            disabled={!hasUnsavedChanges}
                            className="h-8 w-8"
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCancelClick}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-start justify-between group">
                <div>
                    <p className="text-sm">
                        {field === "phone"
                            ? localUserData.phone || "Not provided"
                            : value || "Not provided"}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFieldEdit(field)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
            {/* Left Column - Main Profile */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar
                                className="h-16 w-16 cursor-pointer border-2 border-primary/20 transition-transform group-hover:scale-105"
                                onClick={handleAvatarClick}
                            >
                                <AvatarImage src={formData.avatar_url} />
                                <AvatarFallback>
                                    {formData.name
                                        ? formData.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                        : "?"}
                                </AvatarFallback>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit className="h-5 w-5 text-white" />
                                </div>
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            {renderEditableField("name", formData.name)}
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveClick}
                                disabled={!hasUnsavedChanges || loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">Email</span>
                            </div>
                            <p className="font-medium">{profile.email}</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">Phone</span>
                            </div>
                            {renderEditableField("phone", localUserData.phone || "")}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Briefcase className="h-4 w-4" />
                                <span className="text-sm">Role</span>
                            </div>
                            {renderEditableField("role", formData.role)}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">Member Since</span>
                            </div>
                            <p className="font-medium">
                                {profile.created_at ? formatDate(profile.created_at) : "N/A"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Column - Additional Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <span>About</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">Address</span>
                        </div>
                        {renderEditableField("address", formData.address || "")}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Info className="h-4 w-4" />
                            <span className="text-sm">Bio</span>
                        </div>
                        {renderEditableField("bio", formData.bio || "", true)}
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Do you want to save them before editing another field?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveClick}>Save</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCancel}>
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}