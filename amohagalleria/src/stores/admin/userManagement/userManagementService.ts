// src/services/userManagementService.ts
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/constants/roles";

export type User = {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: Role | "admin";
    created_at: string;
    is_active?: boolean;
};

export type UserFilters = {
    role?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
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

    async fetchFilteredUsers(filters: UserFilters): Promise<User[]> {
        let query = supabase
            .from("profile")
            .select("*")
            .order("created_at", { ascending: false });

        if (filters.role) query = query.eq("role", filters.role);
        if (filters.status) {
            if (filters.status === 'active') {
                query = query.eq("is_active", true);
            } else if (filters.status === 'suspended') {
                query = query.eq("is_active", false);
            }
        }
        if (filters.startDate) query = query.gte("created_at", filters.startDate);
        if (filters.endDate) query = query.lte("created_at", filters.endDate);
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        const { data: profiles, error } = await query;

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