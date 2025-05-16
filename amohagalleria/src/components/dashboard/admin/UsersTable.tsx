// src/components/admin/UsersTable.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useUserManagementStore } from "@/stores/admin/userManagement/userManagementStore";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./UserActions";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function UsersTable() {
    const { users, loading } = useUserManagementStore();

    // Define ROLE_OPTIONS locally
    const ROLE_OPTIONS = [
        { value: "admin", label: "Administrator" },
        { value: "artist", label: "Artist" },
        { value: "bidder", label: "Bidder" },
    ];

    if (loading && users.length === 0) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <Badge variant="outline">
                                {ROLE_OPTIONS.find(r => r.value === user.role)?.label}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            {user.is_active ? (
                                <Badge
                                    variant="outline"
                                    className="border-green-300 text-green-700 bg-green-50"
                                >
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    Suspended
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell>
                            {format(new Date(user.created_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                            <UserActions user={user} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}