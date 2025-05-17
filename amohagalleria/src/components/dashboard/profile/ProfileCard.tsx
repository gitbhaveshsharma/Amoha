// components/ProfileCard.tsx
'use client'
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Mail, MapPin, User, Phone, Briefcase, Info, Calendar, Globe, Landmark, Building2, Hash, Home } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { EditableField } from "./EditableField";
import { useProfileStore } from "@/stores/profile/profileStore";
import { GENDER_OPTIONS } from "@/lib/constants/genderTypes";
import { ROLE_OPTIONS } from "@/lib/constants/roles";
import { ProfileData, UserData } from "@/types/profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Define ProfileCardProps interface
interface ProfileCardProps {
    initialData?: ProfileData;
    onUpdate?: (data: ProfileData) => void;
}

export function ProfileCard({ initialData }: ProfileCardProps) {
    const { profile, userData, loading, updateProfile, updateUserData, uploadAvatar } = useProfileStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileData | null>(null);
    const [localUserData, setLocalUserData] = useState<UserData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form data
    useEffect(() => {
        if (initialData && !formData) setFormData(initialData);
        else if (profile && !formData) setFormData(profile);
        if (userData && !localUserData) setLocalUserData(userData);
    }, [profile, userData, initialData, formData, localUserData]);

    const handleFieldChange = (field: string, value: string) => {
        if (field === "phone" && localUserData) {
            setLocalUserData({ ...localUserData, phone: value });
        } else if (formData) {
            setFormData({ ...formData, [field]: value });
        }
        setHasUnsavedChanges(true);
    };

    const handleFieldEdit = (field: string) => {
        setCurrentField(field);
    };

    const handleAvatarClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !profile) return;
        try {
            await uploadAvatar(e.target.files[0], profile.user_id);
            toast.success("Profile picture updated");
        } catch (error) {
            toast.error("Error updating profile picture");
            console.error("Error uploading avatar:", error);
        }
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setShowCancelDialog(true);
        } else {
            confirmCancel();
        }
    };

    const confirmCancel = () => {
        setIsEditing(false);
        setCurrentField(null);
        // Reset to original data
        if (profile) setFormData(profile);
        if (userData) setLocalUserData(userData);
        setHasUnsavedChanges(false);
        setShowCancelDialog(false);
    };

    const handleSave = async () => {
        if (!formData || !localUserData) return;

        try {
            const updates = [];
            if (JSON.stringify(formData) !== JSON.stringify(profile)) {
                updates.push(updateProfile(formData));
            }
            if (userData?.phone !== localUserData.phone) {
                updates.push(updateUserData({ phone: localUserData.phone }));
            }

            await Promise.all(updates);
            setIsEditing(false);
            setHasUnsavedChanges(false);
            setCurrentField(null);
            toast.success("Profile updated");
        } catch (error) {
            toast.error("Error updating profile");
            console.error("Error saving profile:", error);
        }
    };

    if (!formData || !localUserData) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <ProfileAvatar
                                avatarUrl={formData.avatar_url}
                                name={formData.name}
                                isEditing={isEditing}
                                loading={loading}
                                onAvatarClick={() => fileInputRef.current?.click()}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarClick}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="flex-1">
                                <EditableField
                                    field="name"
                                    value={formData.name}
                                    isEditing={isEditing}
                                    isActive={currentField === "name"}
                                    onChange={(value) => handleFieldChange("name", value)}
                                    onEdit={() => handleFieldEdit("name")}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                                {!isEditing && (
                                    <p className="text-muted-foreground capitalize">{formData.role}</p>
                                )}
                            </div>
                            {!isEditing ? (
                                <Button variant="outline" onClick={() => setIsEditing(true)} className="ml-auto">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="ml-auto flex gap-2">
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={!hasUnsavedChanges || loading}>
                                        {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProfileInfoCard
                            title="Contact Info"
                            icon={<Mail className="h-5 w-5" />}
                            fields={[
                                {
                                    name: "email",
                                    label: "Email",
                                    value: profile?.email || "",
                                    icon: <Mail className="h-4 w-4" />,
                                    editable: false // Make email non-editable
                                },
                                {
                                    name: "phone",
                                    label: "Phone",
                                    value: localUserData.phone || "",
                                    icon: <Phone className="h-4 w-4" />
                                },
                                {
                                    name: "role",
                                    label: "Role",
                                    value: formData.role,
                                    type: "select",
                                    options: ROLE_OPTIONS,
                                    icon: <Briefcase className="h-4 w-4" />
                                },
                                {
                                    name: "gender",
                                    label: "Gender",
                                    value: formData.gender || "",
                                    type: "select",
                                    options: GENDER_OPTIONS,
                                    icon: <User className="h-4 w-4" />
                                }
                            ]}
                            isEditing={isEditing}
                            activeField={currentField}
                            onFieldChange={handleFieldChange}
                            onFieldEdit={handleFieldEdit}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Additional Info Cards */}
            <div className="space-y-6">
                <ProfileInfoCard
                    title="About"
                    icon={<User className="h-5 w-5" />}
                    fields={[
                        {
                            name: "bio",
                            label: "Bio",
                            value: formData.bio || "",
                            type: "textarea",
                            icon: <Info className="h-4 w-4" />
                        },
                        {
                            name: "dateOfBirth",
                            label: "Date of Birth",
                            value: formData.date_of_birth || "",
                            icon: <Calendar className="h-4 w-4" />
                        }
                    ]}
                    isEditing={isEditing}
                    activeField={currentField}
                    onFieldChange={handleFieldChange}
                    onFieldEdit={handleFieldEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

                <ProfileInfoCard
                    title="Location"
                    icon={<MapPin className="h-5 w-5" />}
                    fields={[
                        {
                            name: "country",
                            label: "Country",
                            value: formData.country || "",
                            icon: <Globe className="h-4 w-4" />  // Represents global/whole country
                        },
                        {
                            name: "state",
                            label: "State",
                            value: formData.state || "",
                            icon: <Landmark className="h-4 w-4" />  // Represents regional government
                        },
                        {
                            name: "city",
                            label: "City",
                            value: formData.city || "",
                            icon: <Building2 className="h-4 w-4" />  // Represents urban area
                        },
                        {
                            name: "postalCode",
                            label: "Postal Code",
                            value: formData.postal_code || "",
                            icon: <Hash className="h-4 w-4" />  // Represents numbers/code
                        },
                        {
                            name: "address",
                            label: "Address",
                            value: formData.address || "",
                            icon: <Home className="h-4 w-4" />  // Represents specific location
                        }
                    ]}
                    isEditing={isEditing}
                    activeField={currentField}
                    onFieldChange={handleFieldChange}
                    onFieldEdit={handleFieldEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>

            {/* Dialogs */}
            <SaveChangesDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                onSave={handleSave}
            />

            <DiscardChangesDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                onConfirm={confirmCancel}
            />
        </div>
    );
}

// Additional helper components
function ProfileSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-4">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-48" />
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SaveChangesDialog({ open, onOpenChange, onSave }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Changes</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to save these changes to your profile?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => { onSave(); onOpenChange(false); }}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DiscardChangesDialog({ open, onOpenChange, onConfirm }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discard Changes</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to discard your changes? All unsaved changes will be lost.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Discard Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}