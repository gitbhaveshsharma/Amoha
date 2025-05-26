export interface ProfileData {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: string;
    bio?: string;
    address?: string;
    avatar_url?: string;
    created_at: string;
    gender?: string;
    pronouns?: string[];
    date_of_birth?: string;
    country?: string;
    state?: string;
    city?: string;
    postal_code?: string;
    phone_number?: string;
    updated_at?: string;
}

export interface UserData {
    id: string;
    email?: string | null;
    phone?: string | null;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    created_at?: string;
}

export interface ProfileState {
    profile: ProfileData | null;
    userData: UserData | null;
    loading: boolean;
    error: string | null;
    fetchProfile: (userId: string) => Promise<void>;
    updateProfile: (data: Partial<ProfileData>) => Promise<void>;
    updateUserData: (data: Partial<UserData>) => Promise<void>;
    uploadAvatar: (file: File, userId: string) => Promise<string>;
    isAdmin: () => boolean;
    isArtist: () => boolean;
}