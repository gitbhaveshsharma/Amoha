import { useState, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Briefcase, Clock, Pencil, Check, X, Phone, Home, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/lib/supabase";

interface ProfileData {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    avatar_url?: string;
    user_id: string;
    bio?: string;
    address?: string;
    company?: string;
}

interface UserData {
    id: string;
    email: string;
    phone?: string;
}

interface ProfileCardProps {
    profile: ProfileData;
    onUpdate: (updatedProfile: ProfileData) => void;
}

export function ProfileCard({ profile, onUpdate }: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileData>(profile);
    const [userData, setUserData] = useState<UserData>({
        id: profile.user_id,
        email: profile.email,
        phone: "",
    });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleFieldEdit = (field: string) => {
        if (hasUnsavedChanges && currentField !== field) {
            setShowSaveDialog(true);
            return;
        }
        setCurrentField(field);
        setHasUnsavedChanges(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "phone") {
            setUserData({ ...userData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setHasUnsavedChanges(true);
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${profile.user_id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        setIsUploading(true);
        try {
            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

            const { data: updatedProfile, error: updateError } = await supabase
                .from("profile")
                .update({ avatar_url: publicUrl })
                .eq("id", profile.id)
                .select()
                .single();
            if (updateError) throw updateError;

            onUpdate(updatedProfile);
            setFormData(updatedProfile);
            toast.success("Profile picture updated successfully");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error("Error updating profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!profile.user_id) {
                throw new Error("No user ID found for profile update");
            }

            const { data: profileData, error: profileError } = await supabase
                .from("profile")
                .update({
                    name: formData.name,
                    bio: formData.bio,
                    address: formData.address,
                    company: formData.company,
                })
                .eq("id", profile.id)
                .select()
                .single();
            if (profileError) throw profileError;

            if (userData.phone) {
                const { error: userError } = await supabase
                    .from("users")
                    .update({ phone: userData.phone })
                    .eq("id", profile.user_id);
                if (userError) throw userError;
            }

            onUpdate(profileData);
            setIsEditing(false);
            setHasUnsavedChanges(false);
            setCurrentField(null);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error updating profile", {
                description: (error instanceof Error ? error.message : "Something went wrong"),
            });
        }
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setShowCancelDialog(true);
        } else {
            setIsEditing(false);
            setCurrentField(null);
        }
    };

    const confirmCancel = () => {
        setFormData(profile);
        setUserData({
            id: profile.user_id,
            email: profile.email,
            phone: userData.phone,
        });
        setHasUnsavedChanges(false);
        setIsEditing(false);
        setCurrentField(null);
        setShowCancelDialog(false);
    };

    const renderEditableField = (field: string, value: string) => {
        if (isEditing && currentField === field) {
            return (
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">

                        </div>
                        <Input
                            name={field}
                            value={
                                field === "phone"
                                    ? userData[field as keyof UserData] || ""
                                    : formData[field as keyof ProfileData] || ""
                            }
                            onChange={handleInputChange}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                    >
                        <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">
                        {field === "phone" ? userData[field] || "Not provided" : value || "Not provided"}
                    </p>
                </div>
                {isEditing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFieldEdit(field)}
                        className="text-muted-foreground hover:text-primary"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto p-4">
            {/* First Card: Personal Information */}
            <Card className="h-fit">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar
                                className="h-16 w-16 cursor-pointer border-2 border-primary/20"
                                onClick={handleAvatarClick}
                            >
                                <AvatarImage src={formData?.avatar_url} />
                                <AvatarFallback>
                                    {formData?.name
                                        ? formData.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                        : "U"}
                                </AvatarFallback>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Pencil className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </Avatar>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            {isEditing ? (
                                renderEditableField("name", formData.name)
                            ) : (
                                <>
                                    <h2 className="text-xl font-semibold">{formData.name}</h2>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                                        <span className="font-medium">{formData.role}</span>
                                        {formData.company && (
                                            <>
                                                <span className="hidden sm:inline text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">{formData.company}</span>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{profile.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            {isEditing ? (
                                renderEditableField("role", formData.role)
                            ) : (
                                <p className="font-medium">{formData.role}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            {renderEditableField("phone", userData.phone || "")}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Member Since</p>
                            <p className="font-medium">
                                {profile.created_at ? formatDate(profile.created_at) : "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        {!isEditing ? (
                            <Button variant="outline" size="sm" onClick={handleEditClick} className="gap-1.5 w-full">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Profile
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={handleCancel} className="w-full">
                                Cancel
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Second Card: About Information */}
            <Card className="h-fit">
                <CardHeader>
                    <h3 className="text-lg font-semibold">About</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.company && (
                        <div className="flex gap-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">Company</p>
                                {isEditing ? (
                                    renderEditableField("company", formData.company || "")
                                ) : (
                                    <p className="font-medium">{formData.company}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Home className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Address</p>
                            {renderEditableField("address", formData.address || "")}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Bio</p>
                            {renderEditableField("bio", formData.bio || "")}
                        </div>
                    </div>

                    {isEditing && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            className="w-full mt-2"
                            disabled={!hasUnsavedChanges}
                        >
                            Save Changes
                        </Button>
                    )}
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
                        <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
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