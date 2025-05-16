// src/stores/useUserManagementStore.ts
import { create } from "zustand";
import { UserManagementService, type User } from "./userManagementService";
import type { Role } from "@/lib/constants/roles";

type UserManagementState = {
    users: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    updateUserRole: (userId: string, role: Role) => Promise<void>;
    suspendUser: (userId: string) => Promise<void>;
    unsuspendUser: (userId: string) => Promise<void>;
    createUser: (email: string, role: Role, name: string) => Promise<void>;
    clearError: () => void;
};

export const useUserManagementStore = create<UserManagementState>((set) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const users = await UserManagementService.fetchAllUsers();
            set({ users, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch users",
                loading: false,
            });
        }
    },

    updateUserRole: async (userId, role) => {
        set({ loading: true, error: null });
        try {
            await UserManagementService.updateUserRole(userId, role);
            set((state) => ({
                users: state.users.map((user) =>
                    user.user_id === userId ? { ...user, role } : user
                ),
                loading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to update role",
                loading: false,
            });
        }
    },

    suspendUser: async (userId) => {
        set({ loading: true, error: null });
        try {
            await UserManagementService.suspendUser(userId);
            set((state) => ({
                users: state.users.map((user) =>
                    user.user_id === userId ? { ...user, is_active: false } : user
                ),
                loading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to suspend user",
                loading: false,
            });
        }
    },

    unsuspendUser: async (userId) => {
        set({ loading: true, error: null });
        try {
            await UserManagementService.unsuspendUser(userId);
            set((state) => ({
                users: state.users.map((user) =>
                    user.user_id === userId ? { ...user, is_active: true } : user
                ),
                loading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to unsuspend user",
                loading: false,
            });
        }
    },

    createUser: async (email, role, name) => {
        set({ loading: true, error: null });
        try {
            // await UserManagementService.createUser(email, role, name);
            // Refresh the user list after creation
            const users = await UserManagementService.fetchAllUsers();
            set({ users, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to create user",
                loading: false,
            });
        }
    },

    clearError: () => set({ error: null }),

}));