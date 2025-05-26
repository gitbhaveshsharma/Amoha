import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserManagement } from "@/components/dashboard/admin/UserManagement";

export function UserManagementSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <UserManagement />
            </CardContent>
        </Card>
    );
}
