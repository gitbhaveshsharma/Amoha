import { create } from "zustand";
import { ProfileService } from "./profileService";
import { ProfileData, UserData, ProfileState } from "@/types/profile";

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    userData: null,
    loading: false,
    error: null,

    fetchProfile: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const { profile, userData } = await ProfileService.fetchProfile(userId);
            set({ profile, userData, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch profile",
                loading: false
            });
            throw error; // Re-throw to allow handling in component
        }
    },

    updateProfile: async (updatedData: Partial<ProfileData>) => {
        set({ loading: true, error: null });
        try {
            const currentProfile = useProfileStore.getState().profile;
            if (!currentProfile) throw new Error("No profile loaded");

            const updatedProfile = await ProfileService.updateProfile(currentProfile.id, updatedData);
            set({ profile: updatedProfile, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to update profile",
                loading: false
            });
            throw error;
        }
    },

    updateUserData: async (updatedData: Partial<UserData>) => {
        set({ loading: true, error: null });
        try {
            const currentUserData = useProfileStore.getState().userData;
            if (!currentUserData) throw new Error("No user data loaded");

            const updatedUserData = await ProfileService.updateUserData(currentUserData.id, updatedData);
            set({ userData: updatedUserData, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to update user data",
                loading: false
            });
            throw error;
        }
    },

    uploadAvatar: async (file: File, userId: string) => {
        set({ loading: true, error: null });
        try {
            const avatarUrl = await ProfileService.uploadAvatar(file, userId);

            // Update the profile with the new avatar URL
            const currentProfile = useProfileStore.getState().profile;
            if (currentProfile) {
                const updatedProfile = await ProfileService.updateProfile(currentProfile.id, { avatar_url: avatarUrl });
                set({ profile: updatedProfile });
            }

            set({ loading: false });
            return avatarUrl;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to upload avatar",
                loading: false
            });
            throw error;
        }
    },
}));