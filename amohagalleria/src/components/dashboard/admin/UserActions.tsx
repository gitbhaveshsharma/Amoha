// src/components/admin/UserActions.tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import { MoreHorizontal } from "lucide-react";
import { ROLE_OPTIONS } from "@/lib/constants/roles";
import { useUserManagementStore } from "@/stores/admin/userManagement/userManagementStore";
import type { User } from "@/stores/admin/userManagement/userManagementService";

import { toast } from "react-toastify";

type UserActionsProps = {
    user: User;
};
export function UserActions({ user }: UserActionsProps) {
    const { updateUserRole, suspendUser, unsuspendUser } = useUserManagementStore();

    const handleRoleChange = async (role: "artist" | "bidder") => {
        if (role !== user.role) {
            try {
                await updateUserRole(user.user_id, role);
                toast.success(`Role updated to ${role}`);
            } catch (error) {
                toast.error("Failed to update role");
                console.error("Error updating role:", error);
            }
        }
    };

    const handleSuspend = async () => {
        try {
            await suspendUser(user.user_id);
            toast.success("User suspended successfully");
        } catch (error) {
            toast.error("Failed to suspend user");
            console.error("Error suspending user:", error);
        }
    };

    const handleUnsuspend = async () => {
        try {
            await unsuspendUser(user.user_id);
            toast.success("User unsuspended successfully");
        } catch (error) {
            toast.error("Failed to unsuspend user");
            console.error("Error unsuspending user:", error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="px-2 py-1 text-sm font-medium">Change Role</div>
                {ROLE_OPTIONS.filter((option) => option.value !== user.role).map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => handleRoleChange(option.value)}
                        className={user.role === option.value ? "bg-accent" : ""}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
                <div className="px-2 py-1 text-sm font-medium">Account Status</div>
                {user.is_active ? (
                    <DropdownMenuItem
                        onSelect={handleSuspend}
                        className="text-destructive"
                    >
                        Suspend User
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onSelect={handleUnsuspend}>
                        Unsuspend User
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
