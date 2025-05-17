// src/components/admin/UserManagement.tsx
import { useEffect } from "react";
import { useUserManagementStore } from "@/stores/admin/userManagement/userManagementStore";
import { UsersTable } from "./UsersTable";
import { Skeleton } from "@/components/ui/skeleton";

export function UserManagement() {
    const { users, loading, error, fetchUsers } = useUserManagementStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div>
            <div className="flex flex-row items-center justify-between">
                {/* Add any header content here if needed */}
            </div>
            <div>
                {error ? (
                    <div className="text-destructive mb-4">{error}</div>
                ) : null}
                {loading && !users.length ? (
                    <div className="py-8">
                        <Skeleton className="h-6 w-full mb-4" />
                        <Skeleton className="h-6 w-full mb-4" />
                        <Skeleton className="h-6 w-full mb-4" />
                    </div>
                ) : (
                    <UsersTable />
                )}
            </div>
        </div>
    );
}
