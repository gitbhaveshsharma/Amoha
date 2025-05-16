// src/components/admin/UserManagement.tsx
import { useEffect } from "react";
import { useUserManagementStore } from "@/stores/admin/userManagement/userManagementStore";
import { UsersTable } from "./UsersTable";
import { AddUserDialog } from "./AddUserDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function UserManagement() {
    const { users, loading, error, fetchUsers } = useUserManagementStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <AddUserDialog>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </AddUserDialog>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="text-destructive mb-4">{error}</div>
                ) : null}
                {loading && !users.length ? (
                    <div className="flex justify-center py-8">Loading users...</div>
                ) : (
                    <UsersTable />
                )}
            </CardContent>
        </Card>
    );
}