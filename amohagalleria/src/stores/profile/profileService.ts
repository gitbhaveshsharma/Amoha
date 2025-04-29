import { supabase } from "@/lib/supabase";
import { ProfileData, UserData } from "@/types/profile";

export const ProfileService = {
    fetchProfile: async (userId: string) => {
        // Get user data from auth.getUser() instead of querying the users table directly
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error("Error fetching auth user:", userError);
            throw new Error(userError.message);
        }

        // Get profile data from the profile table
        const { data: profileData, error: profileError } = await supabase
            .from("profile")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (profileError) {
            console.error("Error fetching profile data:", profileError);
            throw new Error(profileError.message);
        }

        return {
            profile: profileData as ProfileData,
            userData: {
                id: userData.user.id,
                email: userData.user.email,
                phone: userData.user.phone,
                // Include any other user properties you need
            } as UserData,
        };
    },

    updateProfile: async (profileId: string, data: Partial<ProfileData>) => {
        const { data: updatedProfile, error } = await supabase
            .from("profile")
            .update(data)
            .eq("id", profileId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return updatedProfile as ProfileData;
    },

    updateUserData: async (userId: string, data: Partial<UserData>) => {
        // For email updates, use the auth API
        if (data.email) {
            const { error } = await supabase.auth.updateUser({
                email: data.email,
            });

            if (error) throw new Error(error.message);
        }

        // For phone updates, use the auth API
        if (data.phone) {
            const { error } = await supabase.auth.updateUser({
                phone: data.phone,
            });

            if (error) throw new Error(error.message);
        }

        // Get updated user data
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) throw new Error(userError.message);

        return {
            id: userData.user.id,
            email: userData.user.email,
            phone: userData.user.phone,
            // Include any other user properties
        } as UserData;
    },

    uploadAvatar: async (file: File, userId: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw new Error(uploadError.message);

        // Get public URL
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};