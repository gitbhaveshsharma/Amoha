import { useEffect, useState } from "react";
import { useProfileStore } from "@/stores/profile/profileStore";
import { useSession } from "@/hooks/useSession";
import { ProfileCard } from "../profile/ProfileCard";
import { toast } from "sonner";
import { ProfileData } from "@/types/profile"; // Add import for ProfileData type

interface ProfileSectionProps {

    profile?: ProfileData | null;
    onProfileUpdate?: (updatedProfile: ProfileData) => void;
}

export function ProfileSection({ profile, onProfileUpdate }: ProfileSectionProps = {}) {
    const { session } = useSession();
    const { fetchProfile, loading, error } = useProfileStore();
    const [fetchAttempted, setFetchAttempted] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (session?.user.id) {
                try {
                    await fetchProfile(session.user.id);
                } catch (err) {
                    console.error("Error fetching profile:", err);

                    // If we have a passed profile prop, use it as fallback
                    if (profile) {
                        toast.info("Using cached profile data");
                    } else {
                        toast.error("Failed to load profile", {
                            description: err instanceof Error ? err.message : "Unknown error",
                        });
                    }
                } finally {
                    setFetchAttempted(true);
                }
            }
        };

        loadProfile();
    }, [session?.user.id, fetchProfile, profile]);

    // If we're loading and haven't attempted a fetch yet
    if (loading && !fetchAttempted) {
        return <div className="flex justify-center items-center h-64">Loading profile...</div>;
    }

    // If there's an error but we have a profile prop, use that
    if (error && profile) {
        return <ProfileCard initialData={profile} onUpdate={onProfileUpdate} />;
    }

    // If there's an error and no profile prop
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return <ProfileCard onUpdate={onProfileUpdate} />;
}