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
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { UserFilter } from "./UserFilter";
import { Button } from "@/components/ui/Button";

export function UsersTable() {
    const { users, loading, error, fetchUsers, fetchFilteredUsers, filters, resetFilters } = useUserManagementStore();
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    const ROLE_OPTIONS = [
        { value: "admin", label: "Administrator" },
        { value: "artist", label: "Artist" },
        { value: "bidder", label: "Bidder" },
    ];

    useEffect(() => {
        if (Object.values(filters).some(val => val !== null && val !== '')) {
            fetchFilteredUsers();
        } else {
            fetchUsers();
        }
    }, [filters, fetchUsers, fetchFilteredUsers]);

    useEffect(() => {
        if (inView && users.length >= page * itemsPerPage) {
            setPage((prev) => prev + 1);
        }
    }, [inView, users.length, page]);

    const visibleUsers = users.slice(0, page * itemsPerPage);

    if (loading && users.length === 0) {
        return (
            <div className="space-y-4">
                <UserFilter />
                <div className="rounded-md border">
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
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <UserFilter />
                <p className="text-center text-red-500 py-8">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <UserFilter />

            <div className="rounded-md border">
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
                        {visibleUsers.length > 0 ? (
                            visibleUsers.map((user) => (
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <p className="text-muted-foreground">
                                            No users found matching your filters
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {visibleUsers.length > 0 && <div ref={ref} className="h-4" />}
        </div>
    );
}