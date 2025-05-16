// src/services/userManagementService.ts
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/constants/roles";

export type User = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: Role | "admin"; // Dynamically include "admin" role
    created_at: string;
    is_active?: boolean;
};

export const UserManagementService = {
    async fetchAllUsers(): Promise<User[]> {
        const { data: profiles, error } = await supabase
            .from("profile")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return profiles.map(profile => ({
            ...profile,
            role: profile.role === "admin" ? "admin" : profile.role,
        })) as User[];
    },

    async updateUserRole(userId: string, role: Role | "admin"): Promise<void> {
        const { error } = await supabase
            .from("profile")
            .update({ role })
            .eq("user_id", userId);

        if (error) throw new Error(error.message);
    },

    async suspendUser(userId: string): Promise<void> {
        const { error } = await supabase
            .from("profile")
            .update({ is_active: false })
            .eq("user_id", userId);

        if (error) throw new Error(error.message);
    },

    async unsuspendUser(userId: string): Promise<void> {
        const { error } = await supabase
            .from("profile")
            .update({ is_active: true })
            .eq("user_id", userId);

        if (error) throw new Error(error.message);
    },
};
